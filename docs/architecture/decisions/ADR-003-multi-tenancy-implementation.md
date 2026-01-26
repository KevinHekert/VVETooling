# ADR-003: Multi-Tenancy Implementation

## Status
**ACCEPTED** ✅

## Context

VVE Tooling is een multi-tenant SaaS applicatie waarbij elke VVE een aparte tenant is. Absolute data isolation tussen tenants is **non-negotiable** vanwege:

### Security & Privacy Requirements
- **Financiële data**: Bankrekeningen, transacties, persoonlijke informatie
- **AVG/GDPR compliance**: Cross-tenant data leaks zijn onacceptabel
- **Trust**: Penningmeesters nemen persoonlijk risico, vertrouwen is kritiek
- **Reputatie risico**: Één data leak kan product doden

### Functionele Requirements
- **Tenant Isolation**: Data van VVE A mag NOOIT zichtbaar zijn voor VVE B
- **Performance**: <100ms database queries ondanks multi-tenancy filtering
- **Scalability**: 500-5000 VVE's (MVP - Jaar 3)
- **User Multi-Tenancy**: Users kunnen lid zijn van meerdere VVE's (penningmeester kan meerdere VVE's beheren)

### Niet-Functionele Requirements
- **Zero cross-tenant leaks**: Geen enkele query mag cross-tenant data returnen
- **Performance**: Multi-tenancy filtering mag niet >10ms overhead hebben
- **Maintainability**: Developers moeten niet manueel tenant filtering toevoegen aan elke query
- **Auditability**: Alle data access moet traceable zijn naar tenant

---

## Decision

We kiezen voor **PostgreSQL Row-Level Security (RLS)** als primary enforcement mechanism, gecombineerd met **application-level tenant context** voor defense-in-depth.

### Architectuur: Shared Database + Row-Level Security

```
┌─────────────────────────────────────────────────────────┐
│               APPLICATION LAYER                         │
│  (Node.js + Express)                                    │
│                                                         │
│  ┌──────────────────────────────────────────┐          │
│  │  1. Request komt binnen                  │          │
│  │  Authorization: Bearer {JWT}             │          │
│  │  x-tenant-id: vve-123                    │          │
│  └──────────────┬───────────────────────────┘          │
│                 │                                       │
│  ┌──────────────▼───────────────────────────┐          │
│  │  2. JWT verification + User lookup       │          │
│  │  → Verify user is member of vve-123      │          │
│  └──────────────┬───────────────────────────┘          │
│                 │                                       │
│  ┌──────────────▼───────────────────────────┐          │
│  │  3. Set tenant context in database       │          │
│  │  SET LOCAL app.current_tenant_id = 'vve-123';│      │
│  └──────────────┬───────────────────────────┘          │
│                 │                                       │
│  ┌──────────────▼───────────────────────────┐          │
│  │  4. Execute business logic               │          │
│  │  SELECT * FROM transactions WHERE id = $1 │          │
│  └──────────────┬───────────────────────────┘          │
└─────────────────┼───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│           POSTGRESQL + ROW-LEVEL SECURITY               │
│                                                         │
│  ┌──────────────────────────────────────────┐          │
│  │  5. RLS Policy Automatically Applied     │          │
│  │                                          │          │
│  │  Policy: tenant_isolation_policy         │          │
│  │  USING (tenant_id = current_setting(     │          │
│  │         'app.current_tenant_id')::uuid)  │          │
│  └──────────────┬───────────────────────────┘          │
│                 │                                       │
│  ┌──────────────▼───────────────────────────┐          │
│  │  6. Query Automatically Filtered         │          │
│  │  SELECT * FROM transactions              │          │
│  │  WHERE id = $1                           │          │
│  │  AND tenant_id = 'vve-123'  ← Added by RLS│         │
│  └──────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────┘
```

---

### Implementation Details

#### 1. Database Schema Design

**Tenant ID on Every Table:**
```sql
-- All tables hebben tenant_id column
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,  -- VVE ID
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign key naar tenants table
  FOREIGN KEY (tenant_id) REFERENCES vves(id) ON DELETE CASCADE
);

-- Index voor performance (tenant_id + andere commonly filtered columns)
CREATE INDEX idx_transactions_tenant_date 
  ON transactions(tenant_id, date DESC);

CREATE INDEX idx_transactions_tenant_id 
  ON transactions(tenant_id, id);
```

**Alle data tables volgen dit pattern:**
```sql
-- VVE's table (tenants)
CREATE TABLE vves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Apartments (within VVE)
CREATE TABLE apartments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES vves(id) ON DELETE CASCADE,
  unit_number VARCHAR(50) NOT NULL,
  ownership_percentage DECIMAL(5, 2),
  UNIQUE(tenant_id, unit_number)
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES vves(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES vves(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  period_from DATE,
  period_to DATE,
  generated_at TIMESTAMP DEFAULT NOW(),
  file_path TEXT
);
```

---

#### 2. PostgreSQL Row-Level Security Policies

**Enable RLS on All Tables:**
```sql
-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy (applies to all operations: SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY tenant_isolation_policy ON transactions
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_policy ON apartments
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_policy ON documents
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_policy ON reports
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
```

**How RLS Works:**
```sql
-- Application sets tenant context
SET LOCAL app.current_tenant_id = '550e8400-e29b-41d4-a716-446655440000';

-- Developer writes simple query (no tenant filtering)
SELECT * FROM transactions WHERE date > '2026-01-01';

-- PostgreSQL automatically adds tenant filter (RLS policy applied)
-- Actual executed query:
SELECT * FROM transactions 
WHERE date > '2026-01-01' 
AND tenant_id = '550e8400-e29b-41d4-a716-446655440000';

-- Cross-tenant query attempt FAILS (returns 0 rows)
SET LOCAL app.current_tenant_id = 'vve-aaa';
SELECT * FROM transactions WHERE tenant_id = 'vve-bbb';
-- Returns: 0 rows (RLS policy blocks it)
```

**RLS Policy for INSERT:**
```sql
-- For INSERT operations, ensure tenant_id matches context
CREATE POLICY tenant_isolation_insert_policy ON transactions
  FOR INSERT
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

-- Prevents accidental cross-tenant inserts:
SET LOCAL app.current_tenant_id = 'vve-aaa';
INSERT INTO transactions (tenant_id, date, amount, description)
VALUES ('vve-bbb', '2026-01-26', 100, 'Test');
-- ERROR: new row violates row-level security policy
```

---

#### 3. Application-Level Tenant Context

**Database Connection with Tenant Context:**
```typescript
// lib/database.ts
import { Pool, PoolClient } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Max connections in pool
  idleTimeoutMillis: 30000,
});

// Tenant-aware database client
export class TenantDatabaseClient {
  private client: PoolClient | null = null;
  private tenantId: string;
  
  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }
  
  // Acquire connection and set tenant context
  async connect(): Promise<void> {
    this.client = await pool.connect();
    
    // SET LOCAL is transaction-scoped (automatically resets after transaction)
    await this.client.query(
      'SET LOCAL app.current_tenant_id = $1',
      [this.tenantId]
    );
  }
  
  // Execute query (tenant context already set)
  async query(sql: string, params?: any[]): Promise<any> {
    if (!this.client) {
      throw new Error('Database client not connected');
    }
    return this.client.query(sql, params);
  }
  
  // Release connection back to pool
  async release(): Promise<void> {
    if (this.client) {
      this.client.release();
      this.client = null;
    }
  }
  
  // Transaction support
  async transaction<T>(callback: (client: this) => Promise<T>): Promise<T> {
    await this.connect();
    try {
      await this.query('BEGIN');
      const result = await callback(this);
      await this.query('COMMIT');
      return result;
    } catch (error) {
      await this.query('ROLLBACK');
      throw error;
    } finally {
      await this.release();
    }
  }
}

// Factory function
export function getTenantDatabase(tenantId: string): TenantDatabaseClient {
  return new TenantDatabaseClient(tenantId);
}
```

**Express Middleware:**
```typescript
// middleware/tenant-context.ts
import { Request, Response, NextFunction } from 'express';
import { getTenantDatabase } from '../lib/database';

interface TenantRequest extends Request {
  tenantId?: string;
  db?: TenantDatabaseClient;
}

export const setTenantContext = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
) => {
  // Tenant ID from header (set by authentication middleware)
  const tenantId = req.headers['x-tenant-id'] as string;
  
  if (!tenantId) {
    return res.status(400).json({ 
      error: 'Missing x-tenant-id header' 
    });
  }
  
  // Validate tenant ID format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(tenantId)) {
    return res.status(400).json({ 
      error: 'Invalid tenant ID format' 
    });
  }
  
  // Attach tenant-aware database client to request
  req.tenantId = tenantId;
  req.db = getTenantDatabase(tenantId);
  
  next();
};
```

**Usage in Route Handlers:**
```typescript
// routes/transactions.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/auth';
import { setTenantContext } from '../middleware/tenant-context';

const router = Router();

// All routes require authentication + tenant context
router.use(authenticate);
router.use(setTenantContext);

// Get transactions (RLS automatically filters by tenant)
router.get('/vves/:vveId/transactions', 
  authorize('transactions', 'read'),
  async (req, res) => {
    const { vveId } = req.params;
    const { date_from, date_to } = req.query;
    
    // Verify vveId matches tenant context (defense in depth)
    if (vveId !== req.tenantId) {
      return res.status(403).json({ 
        error: 'VVE ID does not match tenant context' 
      });
    }
    
    try {
      const db = req.db!;
      await db.connect();
      
      // Simple query - NO manual tenant filtering needed!
      // RLS policy automatically adds: AND tenant_id = current_tenant_id
      let query = 'SELECT * FROM transactions WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;
      
      if (date_from) {
        query += ` AND date >= $${paramIndex++}`;
        params.push(date_from);
      }
      
      if (date_to) {
        query += ` AND date <= $${paramIndex++}`;
        params.push(date_to);
      }
      
      query += ' ORDER BY date DESC LIMIT 100';
      
      const result = await db.query(query, params);
      
      res.json({
        data: result.rows,
        meta: { count: result.rows.length }
      });
      
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Database error' });
    } finally {
      await req.db!.release();
    }
  }
);

// Create transaction
router.post('/vves/:vveId/transactions',
  authorize('transactions', 'create'),
  async (req, res) => {
    const { vveId } = req.params;
    const { date, description, amount, type, category } = req.body;
    
    // Verify vveId matches tenant context
    if (vveId !== req.tenantId) {
      return res.status(403).json({ 
        error: 'VVE ID does not match tenant context' 
      });
    }
    
    try {
      const db = req.db!;
      await db.connect();
      
      // Insert with explicit tenant_id
      // RLS INSERT policy will verify tenant_id matches current_setting
      const result = await db.query(
        `INSERT INTO transactions 
         (tenant_id, date, description, amount, type, category, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [vveId, date, description, amount, type, category, req.user.userId]
      );
      
      res.status(201).json({
        data: result.rows[0]
      });
      
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Database error' });
    } finally {
      await req.db!.release();
    }
  }
);

export default router;
```

---

#### 4. Prisma ORM Integration

**Prisma Schema:**
```prisma
// schema.prisma
model Transaction {
  id          String   @id @default(uuid())
  tenantId    String   @map("tenant_id") // Maps to tenant_id column
  date        DateTime
  description String
  amount      Decimal  @db.Decimal(10, 2)
  type        String
  category    String?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  // Relation to tenant
  tenant      VVE      @relation(fields: [tenantId], references: [id])
  
  @@index([tenantId, date])
  @@map("transactions")
}

model VVE {
  id           String        @id @default(uuid())
  name         String
  address      String?
  createdAt    DateTime      @default(now()) @map("created_at")
  
  // Relations
  transactions Transaction[]
  apartments   Apartment[]
  documents    Document[]
  
  @@map("vves")
}
```

**Prisma Client with RLS:**
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

export function getTenantPrismaClient(tenantId: string) {
  // Create Prisma client instance
  const prisma = new PrismaClient();
  
  // Extend Prisma client with tenant context middleware
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, model, args, query }) {
          // Set tenant context before query
          await prisma.$executeRawUnsafe(
            `SET LOCAL app.current_tenant_id = '${tenantId}'`
          );
          
          // Execute original query (RLS will apply)
          return query(args);
        },
      },
    },
  });
}

// Usage in routes:
const prisma = getTenantPrismaClient(req.tenantId);

// Simple query - RLS automatically filters
const transactions = await prisma.transaction.findMany({
  where: {
    date: {
      gte: new Date('2026-01-01'),
    },
  },
  orderBy: {
    date: 'desc',
  },
});
```

---

#### 5. Multi-VVE User Support

**User kan lid zijn van meerdere VVE's:**
```sql
-- VVE Memberships (many-to-many)
CREATE TABLE vve_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vve_id UUID NOT NULL REFERENCES vves(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- 'penningmeester', 'bestuurslid', 'bewoner'
  status VARCHAR(50) DEFAULT 'active',
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, vve_id)
);

-- No RLS on vve_memberships (user needs to see all their memberships)
-- But queries should filter by user_id
```

**Frontend VVE Switcher:**
```typescript
// User kan wisselen tussen VVE's
const UserVVESwitcher = () => {
  const { user } = useAuth();
  const { currentVVE, switchVVE, availableVVEs } = useVVEContext();
  
  // Fetch user's VVE memberships
  useEffect(() => {
    fetch(`/api/users/${user.id}/vves`)
      .then(res => res.json())
      .then(data => {
        // Set available VVEs
        setAvailableVVEs(data.vves);
        // Set first VVE as current if none selected
        if (!currentVVE && data.vves.length > 0) {
          switchVVE(data.vves[0].id);
        }
      });
  }, [user.id]);
  
  return (
    <Select value={currentVVE?.id} onChange={(e) => switchVVE(e.target.value)}>
      {availableVVEs.map(vve => (
        <option key={vve.id} value={vve.id}>
          {vve.name} ({vve.role})
        </option>
      ))}
    </Select>
  );
};
```

---

### Defense in Depth: Multiple Layers

**Layer 1: Application Verification**
- Verify user is member of tenant (vve_memberships table)
- Verify VVE ID in URL matches x-tenant-id header

**Layer 2: PostgreSQL RLS**
- Automatic filtering on ALL queries
- Cannot be bypassed (even with SQL injection)

**Layer 3: Database User Permissions**
- Application database user heeft NO permission om RLS uit te zetten
- Only superuser kan RLS disablen

**Layer 4: Audit Logging**
- All tenant context switches logged
- All cross-tenant access attempts logged (security monitoring)

---

## Consequences

### Positieve Gevolgen

✅ **Bank-Level Security:**
- PostgreSQL RLS is database-level enforcement (cannot be bypassed)
- Even SQL injection cannot read cross-tenant data
- Defense in depth (multiple layers)

✅ **Developer Productivity:**
- Developers write simple queries WITHOUT manual tenant filtering
- RLS policies automatically applied
- Less room for human error (forgot to add WHERE tenant_id = ?)

✅ **Performance:**
- RLS overhead is minimal (<5ms)
- Proper indexing (tenant_id + other columns) ensures fast queries
- Query planner uses indexes efficiently

✅ **Auditability:**
- All queries automatically scoped to tenant
- Audit logs show tenant context for every operation
- Easy to trace data access patterns

✅ **Compliance:**
- AVG/GDPR: Absolute data isolation
- Audit trail: Who accessed what data when
- Data retention: Per-tenant deletion straightforward

---

### Negatieve Gevolgen

⚠️ **PostgreSQL Dependency:**
- RLS is PostgreSQL-specific feature
- Migration naar andere database (MySQL, MongoDB) vereist re-implementation
- **Mitigatie**: PostgreSQL is gekozen voor long-term
- **Acceptatie**: Database lock-in is acceptabel

⚠️ **Query Performance Overhead:**
- RLS adds ~2-5ms overhead per query
- Extra WHERE clause on every query
- **Mitigatie**: Proper indexing (tenant_id indexed on all tables)
- **Acceptatie**: <5ms is within performance budget

⚠️ **Complexity voor Bulk Operations:**
- Reporting across ALL tenants vereist special handling
- Superuser queries needed (bypass RLS)
- **Mitigatie**: Separate reporting database role
- **Acceptatie**: Cross-tenant reporting is rare use case

⚠️ **Testing Complexity:**
- Tests moeten tenant context correct setup
- **Mitigatie**: Test helpers voor tenant setup
- **Acceptatie**: Proper testing is critical

---

### Risico's

**Risico 1: Developer Forgets Tenant Context**
- Impact: Runtime error (query fails zonder tenant context)
- **Likelihood**: Low (middleware enforces tenant context)
- **Mitigatie**: 
  - Middleware validates x-tenant-id header
  - Runtime error immediately visible in development
  - Integration tests catch missing tenant context
- **Acceptabel**: Ja, fail-fast is gewenst

**Risico 2: Performance Degradation at Scale**
- Impact: Slow queries bij 10K+ tenants
- **Likelihood**: Low (met proper indexing)
- **Mitigatie**: 
  - Tenant_id as first column in compound indexes
  - Regular query performance monitoring
  - Database connection pooling
- **Acceptabel**: Ja, mitigaties zijn proven

**Risico 3: RLS Policy Misconfiguration**
- Impact: Cross-tenant data leak
- **Likelihood**: Low (policies are simple and well-tested)
- **Mitigatie**: 
  - Integration tests validate RLS policies
  - Regular security audits
  - Code review for any RLS policy changes
- **Acceptabel**: Ja, testing prevents misconfigurations

---

## Alternatives Considered

### Alternative 1: Separate Database per Tenant

**Architectuur:**
- Elke VVE heeft eigen database
- Application routes requests naar correcte database

**Pro's:**
- ✅ Absolute data isolation (physically separate)
- ✅ Easy tenant deletion (drop database)
- ✅ Per-tenant backups straightforward

**Con's:**
- ❌ Operational complexity: Manage 5000+ databases
- ❌ Schema migrations: Must apply to ALL databases
- ❌ Database connection pooling: Need pool per database
- ❌ Cross-tenant reporting impossible
- ❌ Cost: Database resources per tenant (expensive at scale)

**Why Rejected:**
- Operational overhead te hoog voor MVP
- Cost model niet schaalbaar (database resources expensive)
- Schema migration complexity
- Cross-tenant analytics onmogelijk

---

### Alternative 2: Separate Schema per Tenant (PostgreSQL Schemas)

**Architectuur:**
- One database, multiple schemas (schema = namespace)
- Each tenant has own schema: `tenant_vve123.transactions`

**Pro's:**
- ✅ Logical data isolation
- ✅ Single database (easier operations)
- ✅ Per-tenant backups possible (pg_dump per schema)

**Con's:**
- ⚠️ Query complexity: Must prefix table names (`tenant_vve123.transactions`)
- ⚠️ ORM support: Most ORMs assume single schema
- ⚠️ Connection pooling: Need to set search_path per connection
- ⚠️ Schema migrations: Must apply to ALL schemas

**Why Rejected:**
- ORM support is poor (Prisma, TypeORM assume single schema)
- Query complexity higher than RLS approach
- Same migration complexity as separate databases

---

### Alternative 3: Application-Level Filtering (No RLS)

**Architectuur:**
- Developers manually add `WHERE tenant_id = ?` to every query
- No database-level enforcement

**Pro's:**
- ✅ Database-agnostic (works with any database)
- ✅ No RLS performance overhead
- ✅ Simple to understand

**Con's:**
- ❌ Human error risk: Forget WHERE clause = data leak
- ❌ Security through discipline (not enforcement)
- ❌ Code reviews must catch every missing tenant filter
- ❌ SQL injection can bypass application filtering

**Why Rejected:**
- Security risk te hoog (één mistake = data leak)
- Niet bank-level security
- Code review burden te hoog

---

### Alternative 4: Hybrid (RLS + Application-Level)

**Architectuur:**
- Use RLS for enforcement
- ALSO manually add tenant_id to WHERE clauses (belt and suspenders)

**Pro's:**
- ✅ Maximum security (double check)
- ✅ Explicit in code (clear tenant filtering)

**Con's:**
- ⚠️ Code duplication (filtering in code AND database)
- ⚠️ Performance: Double filtering (application + RLS)
- ⚠️ Maintenance: Must maintain both filters

**Why Considered but Rejected:**
- Code duplication zonder significant security benefit
- RLS alone is sufficient (database-level enforcement)

---

## Implementation Plan

### Phase 1: Database Setup (Week 1)
- [ ] Add tenant_id to all tables
- [ ] Create compound indexes (tenant_id + other columns)
- [ ] Enable RLS on all tables
- [ ] Create RLS policies (tenant_isolation_policy)
- [ ] Create database migration scripts

### Phase 2: Application Layer (Week 2-3)
- [ ] TenantDatabaseClient class
- [ ] Tenant context middleware
- [ ] Update all route handlers to use tenant context
- [ ] Prisma client extension for RLS

### Phase 3: Testing (Week 4)
- [ ] Integration tests: Verify RLS policies work
- [ ] Negative tests: Attempt cross-tenant access (should fail)
- [ ] Performance tests: Measure RLS overhead
- [ ] Load tests: 1000 tenants concurrent queries

### Phase 4: Monitoring & Audit (Week 5)
- [ ] Audit logging for tenant context switches
- [ ] CloudWatch alarms for cross-tenant access attempts
- [ ] Dashboard: Queries per tenant
- [ ] Security documentation

---

## Metrics & Monitoring

### Key Metrics
- **Cross-Tenant Access Attempts**: Should be 0
- **RLS Query Overhead**: Target <5ms average
- **Tenant Context Errors**: Missing x-tenant-id header
- **Database Connection Pool Utilization**: Monitor for bottlenecks

### Alarms
- **Cross-Tenant Access Detected**: Immediate alert (security incident)
- **Missing Tenant Context**: >10 errors in 5 minuten
- **Slow Tenant Queries**: p95 >100ms (indexing issue?)

### Dashboards
- Queries per tenant (distribution)
- RLS overhead per query type
- Tenant context errors over time
- Database connection pool metrics

---

## References

- [PostgreSQL Row-Level Security Documentation](https://www.postgresql.org/docs/15/ddl-rowsecurity.html)
- [Multi-Tenancy Best Practices](https://aws.amazon.com/blogs/database/multi-tenant-data-isolation-with-postgresql-row-level-security/)
- `docs/architecture/principles/01-architectuurprincipes-kaders.md` Principe 2 (Data Isolation)
- `docs/architecture/constraints/01-randvoorwaarden-ux-development.md` §2.1 DEV-01

---

## Decision Log

| Datum | Beslissing | Rationale |
|-------|------------|-----------|
| 2026-01-26 | PostgreSQL RLS for enforcement | Database-level security, developer productivity |
| 2026-01-26 | Shared database + RLS (not separate databases) | Operational simplicity, cost-effective |
| 2026-01-26 | x-tenant-id in header | Explicit tenant context per request |
| 2026-01-26 | SET LOCAL app.current_tenant_id | Transaction-scoped tenant context |
| 2026-01-26 | Compound indexes (tenant_id first) | Query performance optimization |

---

**Last Updated**: 2026-01-26  
**Next Review**: Q2 2027 (after 1 year production experience)
