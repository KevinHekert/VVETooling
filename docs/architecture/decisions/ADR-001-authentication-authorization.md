# ADR-001: Authentication & Authorization (RBAC)

## Status
**ACCEPTED** ✅

## Context

VVE Tooling MVP vereist een robuuste authentication en authorization oplossing die voldoet aan de volgende requirements:

### Functionele Requirements
- **Multi-tenancy**: Elke VVE is een aparte tenant met absolute data isolatie
- **Role-Based Access Control (RBAC)**: 3 gebruikersrollen met verschillende permissies:
  - **Penningmeester** (Admin): Volledige toegang - CRUD voor alle data
  - **Bestuurslid** (Collaborator): Read-only voor financiële data, beperkte write access voor documenten
  - **Bewoner** (Read-Only): Alleen eigen betalingsstatus en publieke documenten
- **Multi-VVE Support**: Gebruikers kunnen lid zijn van meerdere VVE's (toekomstige feature)
- **Session Management**: Automatische logout na 30 minuten inactiviteit
- **Password Security**: Minimum 8 karakters, complexity requirements

### Niet-Functionele Requirements
- **Bank-level security** (PM requirement)
- **AVG/GDPR compliance**: Data in EU, privacy by design
- **99.5% uptime SLA**: Managed service preferred
- **Performance**: Authentication <100ms, authorization check <10ms
- **Audit logging**: Alle login events en permission changes

### Business Constraints
- **Time-to-market**: MVP binnen 6 maanden (Q3 2026)
- **Team size**: Klein team zonder dedicated security engineer
- **Recruitment**: Oplossing moet niet rare niche expertise vereisen

---

## Decision

We kiezen voor **AWS Cognito User Pools** als managed authentication service, gecombineerd met **custom RBAC implementation** in de backend applicatie.

### Architectuur Componenten

```
┌──────────────┐
│   Frontend   │
│  (Next.js)   │
└──────┬───────┘
       │
       │ 1. Login Request (username/password)
       ▼
┌──────────────────┐
│  AWS Cognito     │
│  User Pools      │
│  (Authentication)│
└──────┬───────────┘
       │
       │ 2. JWT Token (access_token, id_token, refresh_token)
       ▼
┌──────────────────┐
│   Backend API    │
│  (Node.js/Express)│
│                  │
│  ┌────────────┐  │
│  │ JWT Verify │  │ 3. Verify token signature
│  └─────┬──────┘  │
│        │         │
│  ┌─────▼──────┐  │
│  │ Get User   │  │ 4. Query database for user roles
│  │ Roles      │  │
│  └─────┬──────┘  │
│        │         │
│  ┌─────▼──────┐  │
│  │ Check      │  │ 5. Authorize based on role + tenant
│  │ Permission │  │
│  └────────────┘  │
└──────────────────┘
```

### Implementatie Details

#### 1. Authentication (AWS Cognito)

**User Pool Configuration:**
```javascript
// Cognito User Pool setup
{
  "UserPoolName": "vve-tooling-users",
  "Policies": {
    "PasswordPolicy": {
      "MinimumLength": 8,
      "RequireUppercase": true,
      "RequireLowercase": true,
      "RequireNumbers": true,
      "RequireSymbols": false
    }
  },
  "AutoVerifiedAttributes": ["email"],
  "MfaConfiguration": "OPTIONAL", // Users kunnen 2FA aanzetten
  "EmailVerificationMessage": "Je VVE Tooling verificatiecode is {####}",
  "EmailVerificationSubject": "Verificeer je VVE Tooling account",
  "Schema": [
    {
      "Name": "email",
      "AttributeDataType": "String",
      "Required": true,
      "Mutable": true
    },
    {
      "Name": "name",
      "AttributeDataType": "String",
      "Required": true,
      "Mutable": true
    }
  ]
}
```

**Token Configuration:**
- Access token expiry: 1 uur
- Refresh token expiry: 30 dagen
- ID token bevat: user_id, email, name (geen rollen - die zitten in database)

#### 2. Authorization (Custom RBAC)

**Database Schema:**
```sql
-- Users table (synced met Cognito)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cognito_user_id VARCHAR(255) UNIQUE NOT NULL, -- Sub claim uit JWT
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- VVE memberships (tenant association)
CREATE TABLE vve_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vve_id UUID REFERENCES vves(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- 'penningmeester', 'bestuurslid', 'bewoner'
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'invited', 'suspended'
  UNIQUE(user_id, vve_id)
);

-- Role-based permissions (explicit permission matrix)
CREATE TABLE role_permissions (
  role VARCHAR(50) NOT NULL,
  resource VARCHAR(100) NOT NULL, -- 'transactions', 'reports', 'users', etc.
  action VARCHAR(50) NOT NULL, -- 'create', 'read', 'update', 'delete'
  PRIMARY KEY (role, resource, action)
);

-- Seed permissions
INSERT INTO role_permissions (role, resource, action) VALUES
  -- Penningmeester: Full access
  ('penningmeester', 'transactions', 'create'),
  ('penningmeester', 'transactions', 'read'),
  ('penningmeester', 'transactions', 'update'),
  ('penningmeester', 'transactions', 'delete'),
  ('penningmeester', 'reports', 'create'),
  ('penningmeester', 'reports', 'read'),
  ('penningmeester', 'users', 'create'),
  ('penningmeester', 'users', 'read'),
  ('penningmeester', 'users', 'update'),
  ('penningmeester', 'users', 'delete'),
  ('penningmeester', 'vve_settings', 'update'),
  
  -- Bestuurslid: Read + limited write
  ('bestuurslid', 'transactions', 'read'),
  ('bestuurslid', 'reports', 'read'),
  ('bestuurslid', 'documents', 'create'),
  ('bestuurslid', 'documents', 'read'),
  ('bestuurslid', 'users', 'read'),
  
  -- Bewoner: Read-only (limited)
  ('bewoner', 'reports', 'read'),
  ('bewoner', 'documents', 'read'),
  ('bewoner', 'own_payment_status', 'read');
```

**Authorization Middleware:**
```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { db } from '../database';

// JWT Verifier (cached)
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  tokenUse: 'access',
  clientId: process.env.COGNITO_CLIENT_ID!,
});

// Extended Request type met user info
interface AuthRequest extends Request {
  user?: {
    cognitoUserId: string;
    userId: string;
    email: string;
    currentTenantId: string;
    role: string;
  };
}

// Authentication middleware: verify JWT
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    
    // Verify JWT with Cognito
    const payload = await verifier.verify(token);
    
    // Get user from database
    const user = await db.query(
      'SELECT id, cognito_user_id, email FROM users WHERE cognito_user_id = $1',
      [payload.sub]
    );
    
    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Get current tenant from header (user specifies which VVE context)
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) {
      return res.status(400).json({ error: 'Missing tenant context (x-tenant-id header)' });
    }
    
    // Get user's role in this VVE
    const membership = await db.query(
      'SELECT role FROM vve_memberships WHERE user_id = $1 AND vve_id = $2 AND status = $3',
      [user.rows[0].id, tenantId, 'active']
    );
    
    if (membership.rows.length === 0) {
      return res.status(403).json({ error: 'User not member of this VVE' });
    }
    
    // Attach user info to request
    req.user = {
      cognitoUserId: payload.sub,
      userId: user.rows[0].id,
      email: user.rows[0].email,
      currentTenantId: tenantId,
      role: membership.rows[0].role,
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Authorization middleware: check permissions
export const authorize = (resource: string, action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Check if role has permission
    const permission = await db.query(
      'SELECT 1 FROM role_permissions WHERE role = $1 AND resource = $2 AND action = $3',
      [req.user.role, resource, action]
    );
    
    if (permission.rows.length === 0) {
      // Log unauthorized access attempt
      await db.query(
        'INSERT INTO audit_logs (user_id, tenant_id, action, resource, result) VALUES ($1, $2, $3, $4, $5)',
        [req.user.userId, req.user.currentTenantId, action, resource, 'unauthorized']
      );
      
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Usage in routes:
// app.get('/api/transactions', authenticate, authorize('transactions', 'read'), getTransactions);
// app.post('/api/transactions', authenticate, authorize('transactions', 'create'), createTransaction);
```

#### 3. Multi-VVE Context Switching

**Frontend Implementation:**
```typescript
// context/VVEContext.tsx
import { createContext, useContext, useState } from 'react';

interface VVE {
  id: string;
  name: string;
  role: string; // User's role in this VVE
}

interface VVEContextType {
  currentVVE: VVE | null;
  availableVVEs: VVE[];
  switchVVE: (vveId: string) => void;
}

const VVEContext = createContext<VVEContextType | undefined>(undefined);

export const VVEProvider: React.FC = ({ children }) => {
  const [currentVVE, setCurrentVVE] = useState<VVE | null>(null);
  const [availableVVEs, setAvailableVVEs] = useState<VVE[]>([]);
  
  const switchVVE = (vveId: string) => {
    const vve = availableVVEs.find(v => v.id === vveId);
    if (vve) {
      setCurrentVVE(vve);
      // Update x-tenant-id header for all API calls
      axios.defaults.headers.common['x-tenant-id'] = vveId;
    }
  };
  
  return (
    <VVEContext.Provider value={{ currentVVE, availableVVEs, switchVVE }}>
      {children}
    </VVEContext.Provider>
  );
};
```

#### 4. Audit Logging

**Alle authentication events worden gelogd:**
```typescript
// Log successful login
await db.query(
  `INSERT INTO audit_logs (user_id, tenant_id, action, resource, details, ip_address, user_agent)
   VALUES ($1, $2, $3, $4, $5, $6, $7)`,
  [userId, null, 'login', 'authentication', { method: 'cognito' }, req.ip, req.headers['user-agent']]
);

// Log failed authorization
await db.query(
  `INSERT INTO audit_logs (user_id, tenant_id, action, resource, result, details)
   VALUES ($1, $2, $3, $4, $5, $6)`,
  [userId, tenantId, action, resource, 'unauthorized', { role: userRole, required: requiredRole }]
);

// Log role change
await db.query(
  `INSERT INTO audit_logs (user_id, tenant_id, action, resource, details, changed_by)
   VALUES ($1, $2, $3, $4, $5, $6)`,
  [targetUserId, tenantId, 'update_role', 'users', { old_role: oldRole, new_role: newRole }, adminUserId]
);
```

---

## Consequences

### Positieve Gevolgen

✅ **Security:**
- Managed service met bank-level security (AWS Cognito)
- SOC 2, ISO 27001 certificering
- Automatic token refresh en revocation
- Built-in protection tegen brute force attacks

✅ **Compliance:**
- AVG-compliant (data in EU)
- Audit trail voor alle authentication events
- User can revoke access tokens

✅ **Operationele Simpliciteit:**
- Geen custom authentication code (minder security risico's)
- 99.99% uptime SLA van AWS Cognito
- Automatic scaling (geen capacity planning)
- Built-in password reset flow

✅ **Developer Productivity:**
- Standard JWT tokens (industry standard)
- Excellent AWS SDK's en documentatie
- Makkelijk te testen (mock JWT tokens)

✅ **Features Out-of-the-Box:**
- 2FA support (TOTP, SMS)
- Social login (Google, Facebook) - future roadmap
- Email verification
- Password reset
- Account recovery

✅ **Cost-Effective:**
- Eerste 50K MAU gratis
- €0.0055 per MAU daarna
- MVP schaal (10K users) = €0/maand

---

### Negatieve Gevolgen

⚠️ **AWS Vendor Lock-In:**
- Migratie naar andere authentication provider vereist re-implementation
- **Mitigatie**: User data kan geëxporteerd worden, JWT standard blijft
- **Acceptatie**: Lock-in is acceptabel voor managed service voordelen

⚠️ **Two-Hop Authorization:**
- Authorization check vereist database query (niet in JWT token)
- **Impact**: +5-10ms latency per request
- **Mitigatie**: Database connection pooling, role caching mogelijk
- **Acceptatie**: <10ms is binnen performance budget

⚠️ **Learning Curve:**
- Team moet AWS Cognito leren
- **Mitigatie**: Goede AWS documentatie, online courses beschikbaar
- **Tijd**: 1-2 weken voor team om Cognito te leren

⚠️ **Token Size:**
- JWT tokens zijn relatief groot (1-2KB)
- **Impact**: Extra bandwidth per request
- **Mitigatie**: Gzip compression, tokens cached in browser
- **Acceptatie**: 1-2KB is acceptabel voor modern internet

---

### Risico's

**Risico 1: Cognito Downtime**
- **Impact**: Gebruikers kunnen niet inloggen (authentication failure)
- **Likelihood**: Zeer laag (99.99% SLA)
- **Mitigatie**: Bestaande sessies blijven werken (JWT tokens valid tot expiry)
- **Acceptabel**: Ja, SLA is hoger dan onze 99.5% requirement

**Risico 2: JWT Token Leakage**
- **Impact**: Unauthorized access als token gestolen wordt
- **Likelihood**: Medium (phishing, XSS attacks)
- **Mitigatie**: 
  - Short token expiry (1 uur access token)
  - HttpOnly cookies (refresh token)
  - HTTPS only
  - Token revocation mogelijk via Cognito
- **Acceptabel**: Ja, mitigaties zijn industry standard

**Risico 3: Role Management Complexity**
- **Impact**: Bugs in authorization logic kunnen leiden tot unauthorized access
- **Likelihood**: Medium (custom code)
- **Mitigatie**: 
  - Extensive integration tests (100% coverage authorization logic)
  - Code reviews met security focus
  - Regular penetration testing
- **Acceptabel**: Ja, testing en reviews zijn verplicht

---

## Alternatives Considered

### Alternative 1: Auth0 (Managed Service)

**Pro's:**
- Excellent UI en developer experience
- Zeer uitgebreide features (social login, passwordless, etc.)
- Multi-tenancy support out-of-the-box

**Con's:**
- Significant costs: €0.02-0.03 per MAU = €600-900/maand voor 30K users
- Extra vendor (complexity)
- Minder native AWS integration

**Why Rejected**: Cost is 3x hoger dan Cognito bij schaal, extra vendor

---

### Alternative 2: Custom JWT Implementation

**Pro's:**
- Volledige controle
- Geen vendor lock-in
- Geen externe dependencies

**Con's:**
- Security risico (authentication is hard to build correctly)
- Development tijd: 3-4 weken
- Operational overhead (password reset, 2FA, email verification)
- Geen 2FA out-of-the-box
- Recruitment: vereist security expertise

**Why Rejected**: Time-to-market en security risico's te hoog voor MVP

---

### Alternative 3: Firebase Authentication

**Pro's:**
- Excellent developer experience
- Gratis tot 50K MAU
- Social login out-of-the-box

**Con's:**
- Google Cloud Platform (niet AWS)
- Data in US by default (AVG compliance complex)
- Minder native integration met PostgreSQL/Express.js stack

**Why Rejected**: AVG compliance en ecosystem integration

---

### Alternative 4: Keycloak (Self-Hosted)

**Pro's:**
- Open source (geen vendor lock-in)
- Zeer feature-rijk (enterprise-grade)
- RBAC built-in

**Con's:**
- Self-hosted (operational overhead)
- Kubernetes/Docker vereist voor HA
- Learning curve hoog
- Team moet Keycloak managen (updates, security patches)

**Why Rejected**: Operational complexity te hoog voor klein team

---

## Implementation Plan

### Phase 1: Setup (Week 1-2)
- [ ] AWS Cognito User Pool aanmaken
- [ ] Database schema implementeren (users, vve_memberships, role_permissions)
- [ ] JWT verification middleware implementeren
- [ ] Authorization middleware implementeren
- [ ] Unit tests voor authorization logic

### Phase 2: Integration (Week 3-4)
- [ ] Frontend login flow (Next.js + Cognito SDK)
- [ ] Token refresh mechanism
- [ ] VVE context switching
- [ ] Logout flow
- [ ] Integration tests (alle rollen en permissies)

### Phase 3: Features (Week 5-6)
- [ ] Password reset flow
- [ ] Email verification
- [ ] 2FA setup (optioneel voor users)
- [ ] User invitation flow
- [ ] Role management UI (voor penningmeester)

### Phase 4: Security & Audit (Week 7-8)
- [ ] Audit logging implementatie
- [ ] Security testing (penetration test)
- [ ] Rate limiting (brute force protection)
- [ ] Security documentation

---

## Metrics & Monitoring

### Key Metrics
- **Authentication Success Rate**: >99.5%
- **Authentication Latency (p95)**: <100ms
- **Authorization Check Latency (p95)**: <10ms
- **Failed Login Attempts**: <1% van total logins
- **Token Refresh Success Rate**: >99%

### Alarms
- **High Failed Login Rate**: >5% failed logins in 5 minuten (mogelijk brute force attack)
- **Cognito Errors**: >10 errors in 5 minuten (Cognito downtime?)
- **Slow Authorization**: p95 >50ms (database performance issue?)

### Dashboards
- CloudWatch dashboard met:
  - Login success/failure rate
  - Authentication latency
  - Authorization latency
  - Active sessions
  - 2FA adoption rate

---

## References

- [AWS Cognito User Pools Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- `docs/architecture/principles/01-architectuurprincipes-kaders.md` §2.4
- `docs/architecture/constraints/01-randvoorwaarden-ux-development.md` §2.3 DEV-02, DEV-10

---

## Decision Log

| Datum | Beslissing | Rationale |
|-------|------------|-----------|
| 2026-01-26 | AWS Cognito + Custom RBAC | Best balance tussen security, cost, time-to-market |
| 2026-01-26 | JWT tokens (niet sessions) | Stateless, horizontaal schaalbaar |
| 2026-01-26 | Role in database (niet JWT) | Flexibiliteit voor role changes zonder token refresh |
| 2026-01-26 | x-tenant-id in header | Explicit tenant context per request |

---

**Last Updated**: 2026-01-26  
**Next Review**: Q2 2027 (na 1 jaar production experience)
