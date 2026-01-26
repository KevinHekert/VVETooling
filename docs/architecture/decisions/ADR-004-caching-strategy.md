# ADR-004: Caching Strategy

## Status
**ACCEPTED** ✅

## Context

VVE Tooling MVP heeft een performance requirement van <2 seconden page load time en <500ms API response time (95th percentile). Caching is essentieel voor:

### Performance Requirements
- **Page Load**: <2 seconden (95th percentile)
- **API Response**: <500ms (95th percentile)
- **Database Queries**: <100ms (95th percentile)
- **Concurrent Users**: 2.000-8.000 bij piekbelasting

### Data Characteristics
- **Read-Heavy Workload**: 80% reads, 20% writes (estimated)
- **Hot Data**: Dashboard, recent transactions, current month reports
- **Cold Data**: Historical transactions (>1 jaar oud)
- **Static Assets**: CSS, JavaScript, images, documents
- **Real-Time Requirements**: Financial data moet consistent zijn (geen stale data)

### Business Constraints
- **Data Consistency**: Financial data mag NIET out-of-sync zijn
- **Multi-Tenancy**: Cache moet tenant-aware zijn
- **Cost**: Binnen budget (~€300/maand infrastructure)
- **Operational Simplicity**: Klein team, minimale maintenance

---

## Decision

We kiezen voor een **multi-layer caching strategie**:

1. **CDN Caching** (AWS CloudFront) - voor static assets
2. **HTTP Caching** (Browser + CDN) - voor API responses
3. **Application Caching** (In-Memory) - voor hot data & computed values
4. **Database Query Optimization** - indexing + materialized views

**GEEN Redis/Memcached in MVP** - add complexity zonder immediate need.

---

### Layer 1: CDN Caching (AWS CloudFront)

**What to Cache:**
- Static assets: JavaScript bundles, CSS, images, fonts
- Public documents (if applicable)
- Marketing site pages

**Configuration:**
```javascript
// CloudFront distribution setup
{
  "Origins": [
    {
      "Id": "S3-static-assets",
      "DomainName": "vve-tooling-assets.s3.eu-central-1.amazonaws.com",
      "S3OriginConfig": {
        "OriginAccessIdentity": "origin-access-identity/cloudfront/ABCDEFG"
      }
    },
    {
      "Id": "API-origin",
      "DomainName": "api.vvetooling.nl",
      "CustomOriginConfig": {
        "HTTPPort": 80,
        "HTTPSPort": 443,
        "OriginProtocolPolicy": "https-only"
      }
    }
  ],
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-static-assets",
    "ViewerProtocolPolicy": "redirect-to-https",
    "MinTTL": 0,
    "DefaultTTL": 86400,  // 1 dag voor static assets
    "MaxTTL": 31536000,   // 1 jaar maximum
    "Compress": true,      // Gzip/Brotli compression
    "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6"  // CachingOptimized
  },
  "CacheBehaviors": [
    {
      "PathPattern": "/api/*",
      "TargetOriginId": "API-origin",
      "ViewerProtocolPolicy": "https-only",
      "MinTTL": 0,
      "DefaultTTL": 0,       // No CDN caching voor API (use HTTP cache headers)
      "MaxTTL": 0,
      "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"  // CachingDisabled
    }
  ]
}
```

**Cache Invalidation:**
```bash
# Bij deployment: invalidate JavaScript/CSS bundles
aws cloudfront create-invalidation \
  --distribution-id E1234567890ABC \
  --paths "/static/js/*" "/static/css/*"
```

**Benefits:**
- Lage latency (edge locations in Amsterdam, Frankfurt)
- Bandwidth cost reduction (~70% reduction)
- DDoS protection (AWS Shield)

---

### Layer 2: HTTP Caching (Browser + Proxy)

**Cache-Control Headers Strategy:**

```typescript
// middleware/cache-headers.ts
import { Request, Response, NextFunction } from 'express';

export const setCacheHeaders = (
  duration: number,  // seconds
  options: {
    public?: boolean;
    immutable?: boolean;
    mustRevalidate?: boolean;
  } = {}
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const cacheControl = [];
    
    // Public vs Private
    cacheControl.push(options.public ? 'public' : 'private');
    
    // Max-age
    cacheControl.push(`max-age=${duration}`);
    
    // Immutable (for static assets with hash in filename)
    if (options.immutable) {
      cacheControl.push('immutable');
    }
    
    // Must-revalidate (for financial data)
    if (options.mustRevalidate) {
      cacheControl.push('must-revalidate');
    }
    
    res.setHeader('Cache-Control', cacheControl.join(', '));
    next();
  };
};
```

**Caching Rules per Resource Type:**

```typescript
// Static Assets (immutable, long cache)
app.use('/static', 
  setCacheHeaders(31536000, { public: true, immutable: true }),
  express.static('public')
);

// API Responses (tenant-specific, short cache or no cache)

// 1. Financial Data - NO CACHE (must be fresh)
app.get('/api/v1/vves/:id/transactions',
  authenticate,
  setCacheHeaders(0, { public: false, mustRevalidate: true }),
  getTransactions
);

// 2. Dashboard Summary - Short Cache (5 minuten)
app.get('/api/v1/vves/:id/dashboard',
  authenticate,
  setCacheHeaders(300, { public: false, mustRevalidate: true }),
  getDashboard
);

// 3. VVE Settings - Medium Cache (1 uur, changes infrequent)
app.get('/api/v1/vves/:id/settings',
  authenticate,
  setCacheHeaders(3600, { public: false }),
  getSettings
);

// 4. Reports (PDF) - Long Cache (documents don't change)
app.get('/api/v1/vves/:id/reports/:reportId',
  authenticate,
  setCacheHeaders(86400, { public: false }),
  getReport
);
```

**ETag Support (for conditional requests):**
```typescript
// middleware/etag.ts
import crypto from 'crypto';

export const setETag = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(data: any) {
    // Generate ETag from response body
    const etag = crypto
      .createHash('md5')
      .update(JSON.stringify(data))
      .digest('hex');
    
    res.setHeader('ETag', `"${etag}"`);
    
    // Check If-None-Match header
    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch === `"${etag}"`) {
      res.status(304).end(); // Not Modified
      return res;
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Usage
app.get('/api/v1/vves/:id/dashboard',
  authenticate,
  setETag,
  getDashboard
);
```

**Benefits:**
- Reduced API calls (browser cache hit = 0ms latency)
- Bandwidth savings (304 Not Modified)
- Offline support (service workers kunnen cache gebruiken)

---

### Layer 3: Application-Level Caching (In-Memory)

**Use Cases voor Application Cache:**
1. **Computed Values**: Dashboard aggregations (expensive queries)
2. **Hot Data**: Recent transactions (accessed frequently)
3. **Session Data**: User permissions (avoid database lookup per request)

**Implementation: Simple In-Memory Cache**

```typescript
// lib/cache.ts
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class InMemoryCache {
  private store: Map<string, CacheEntry<any>> = new Map();
  private ttl: number; // Default TTL in milliseconds
  
  constructor(ttl: number = 300000) { // 5 minutes default
    this.ttl = ttl;
    
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }
  
  set<T>(key: string, value: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.ttl);
    this.store.set(key, { value, expiresAt });
  }
  
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    
    return entry.value as T;
  }
  
  delete(key: string): void {
    this.store.delete(key);
  }
  
  // Delete all keys matching pattern
  invalidatePattern(pattern: RegExp): void {
    for (const key of this.store.keys()) {
      if (pattern.test(key)) {
        this.store.delete(key);
      }
    }
  }
  
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
  
  // Get cache stats
  getStats() {
    return {
      size: this.store.size,
      entries: Array.from(this.store.keys()),
    };
  }
}

// Singleton instance
export const appCache = new InMemoryCache(300000); // 5 min TTL
```

**Usage Example: Cache Dashboard Data**

```typescript
// routes/dashboard.ts
import { appCache } from '../lib/cache';

router.get('/vves/:vveId/dashboard', async (req, res) => {
  const { vveId } = req.params;
  const cacheKey = `dashboard:${vveId}`;
  
  // Try cache first
  const cached = appCache.get(cacheKey);
  if (cached) {
    console.log('Cache hit:', cacheKey);
    return res.json({
      data: cached,
      meta: { cached: true }
    });
  }
  
  // Cache miss - query database
  console.log('Cache miss:', cacheKey);
  const dashboard = await computeDashboard(vveId);
  
  // Store in cache (5 minuten TTL)
  appCache.set(cacheKey, dashboard, 300000);
  
  res.json({
    data: dashboard,
    meta: { cached: false }
  });
});

// Invalidate cache when data changes
router.post('/vves/:vveId/transactions', async (req, res) => {
  // ... create transaction ...
  
  // Invalidate dashboard cache
  appCache.delete(`dashboard:${vveId}`);
  
  res.status(201).json({ data: transaction });
});
```

**Cache Invalidation Strategy:**
```typescript
// Invalidate specific patterns when data changes
const invalidateCacheForVVE = (vveId: string) => {
  // Invalidate all cache keys for this VVE
  appCache.invalidatePattern(new RegExp(`^(dashboard|summary|stats):${vveId}`));
};

// On transaction create/update/delete:
invalidateCacheForVVE(transaction.vve_id);

// On settings update:
appCache.delete(`settings:${vveId}`);
```

**Why NOT Redis for MVP:**
- ✅ Simpliciteit: No extra service to manage
- ✅ Cost: No Redis hosting cost (~€30-50/month)
- ✅ Latency: In-memory is faster than network call to Redis
- ⚠️ Limitation: Cache doesn't survive restarts (acceptable for MVP)
- ⚠️ Limitation: Single-server cache (not shared across ECS tasks)

**When to Add Redis (Post-MVP):**
- Multiple application servers (horizontal scaling)
- Cache needs to survive restarts
- Shared cache across services
- Advanced features (pub/sub, rate limiting)

---

### Layer 4: Database Query Optimization

**Indexing Strategy:**
```sql
-- Compound indexes (tenant_id + frequently filtered columns)
CREATE INDEX idx_transactions_tenant_date 
  ON transactions(tenant_id, date DESC);

CREATE INDEX idx_transactions_tenant_category 
  ON transactions(tenant_id, category);

CREATE INDEX idx_transactions_tenant_type 
  ON transactions(tenant_id, type, date DESC);

-- Covering index (include commonly selected columns)
CREATE INDEX idx_transactions_covering 
  ON transactions(tenant_id, date DESC)
  INCLUDE (description, amount, type, category);
```

**Materialized Views for Aggregations:**
```sql
-- Pre-computed dashboard summary (refresh hourly)
CREATE MATERIALIZED VIEW dashboard_summary AS
SELECT 
  tenant_id,
  COUNT(*) as transaction_count,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
  SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as balance,
  MAX(date) as last_transaction_date
FROM transactions
GROUP BY tenant_id;

CREATE UNIQUE INDEX ON dashboard_summary(tenant_id);

-- Refresh hourly (cron job or Lambda)
REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_summary;
```

**Query Optimization:**
```typescript
// BAD: N+1 query problem
const vves = await db.query('SELECT * FROM vves');
for (const vve of vves.rows) {
  const balance = await db.query(
    'SELECT SUM(amount) FROM transactions WHERE tenant_id = $1',
    [vve.id]
  );
  vve.balance = balance.rows[0].sum;
}

// GOOD: Single query with JOIN or subquery
const vves = await db.query(`
  SELECT 
    v.*,
    COALESCE(t.balance, 0) as balance
  FROM vves v
  LEFT JOIN (
    SELECT tenant_id, SUM(amount) as balance
    FROM transactions
    GROUP BY tenant_id
  ) t ON v.id = t.tenant_id
`);
```

**Database Connection Pooling:**
```typescript
// lib/database.ts
import { Pool } from 'pg';

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  
  // Pool configuration
  max: 20,                // Maximum connections in pool
  min: 5,                 // Minimum idle connections
  idleTimeoutMillis: 30000,  // Close idle connections after 30s
  connectionTimeoutMillis: 5000,  // Timeout if no connection available
  
  // Statement timeout (kill slow queries)
  statement_timeout: 10000,  // 10 seconds max per query
});

// Monitor pool metrics
pool.on('connect', () => {
  console.log('New database connection established');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});
```

---

## Cache Invalidation Patterns

### Pattern 1: Write-Through Cache
```typescript
// Update database AND cache together
async function updateTransaction(id: string, data: any) {
  // 1. Update database
  const updated = await db.query(
    'UPDATE transactions SET ... WHERE id = $1 RETURNING *',
    [id, ...]
  );
  
  // 2. Update cache
  const cacheKey = `transaction:${id}`;
  appCache.set(cacheKey, updated.rows[0]);
  
  // 3. Invalidate related caches
  invalidateCacheForVVE(updated.rows[0].tenant_id);
  
  return updated.rows[0];
}
```

### Pattern 2: Cache-Aside (Lazy Loading)
```typescript
// Read from cache, populate on miss
async function getTransaction(id: string): Promise<Transaction> {
  const cacheKey = `transaction:${id}`;
  
  // Try cache
  let transaction = appCache.get<Transaction>(cacheKey);
  if (transaction) {
    return transaction;
  }
  
  // Cache miss - query database
  const result = await db.query(
    'SELECT * FROM transactions WHERE id = $1',
    [id]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Transaction not found');
  }
  
  transaction = result.rows[0];
  
  // Store in cache
  appCache.set(cacheKey, transaction);
  
  return transaction;
}
```

### Pattern 3: Time-Based Invalidation
```typescript
// Cache with expiry (TTL)
appCache.set('dashboard:vve-123', dashboardData, 300000); // 5 min TTL
```

### Pattern 4: Event-Based Invalidation
```typescript
// Invalidate when relevant events occur
eventEmitter.on('transaction.created', (transaction) => {
  invalidateCacheForVVE(transaction.tenant_id);
});

eventEmitter.on('transaction.updated', (transaction) => {
  appCache.delete(`transaction:${transaction.id}`);
  invalidateCacheForVVE(transaction.tenant_id);
});

eventEmitter.on('transaction.deleted', (transaction) => {
  appCache.delete(`transaction:${transaction.id}`);
  invalidateCacheForVVE(transaction.tenant_id);
});
```

---

## Monitoring & Metrics

### Cache Metrics to Track
```typescript
// metrics/cache-metrics.ts
interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;  // hits / (hits + misses)
  size: number;     // Number of entries
  evictions: number;
}

class CacheMetricsCollector {
  private hits = 0;
  private misses = 0;
  
  recordHit() {
    this.hits++;
  }
  
  recordMiss() {
    this.misses++;
  }
  
  getMetrics(): CacheMetrics {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
      size: appCache.getStats().size,
      evictions: 0, // TODO: track evictions
    };
  }
  
  reset() {
    this.hits = 0;
    this.misses = 0;
  }
}

export const cacheMetrics = new CacheMetricsCollector();

// Report metrics to CloudWatch every minute
setInterval(() => {
  const metrics = cacheMetrics.getMetrics();
  console.log('Cache metrics:', metrics);
  
  // TODO: Send to CloudWatch
  // cloudwatch.putMetricData({
  //   Namespace: 'VVETooling/Cache',
  //   MetricData: [
  //     { MetricName: 'HitRate', Value: metrics.hitRate },
  //     { MetricName: 'Size', Value: metrics.size }
  //   ]
  // });
  
  cacheMetrics.reset();
}, 60000);
```

### CloudWatch Alarms
- **Low Cache Hit Rate**: <50% (caching niet effectief)
- **High Cache Size**: >10.000 entries (memory pressure)
- **Slow Database Queries**: p95 >100ms (indexing issue)

---

## Consequences

### Positieve Gevolgen

✅ **Performance:**
- CDN caching: ~90% reduction in static asset load time
- HTTP caching: ~30-50% reduction in API calls
- Application cache: ~60-80% reduction in database queries for hot data
- Total: Expected 40-60% improvement in page load time

✅ **Cost Reduction:**
- Bandwidth: ~70% reduction (CloudFront caching)
- Database: ~30-50% fewer queries (application cache)
- Compute: ~20-30% CPU reduction (fewer queries to process)

✅ **User Experience:**
- Faster page loads (<2 sec target)
- Responsive UI (instant for cached data)
- Reduced latency for repeat visits

✅ **Simpliciteit:**
- No extra infrastructure (Redis, Memcached)
- Built-in features (CloudFront, browser cache, in-memory)
- Low operational overhead

---

### Negatieve Gevolgen

⚠️ **Cache Inconsistency Risk:**
- Cached data kan out-of-sync raken met database
- **Mitigatie**: Short TTLs (5 min), aggressive invalidation
- **Acceptatie**: Financial data heeft NO cache, dashboard has short TTL

⚠️ **Memory Usage:**
- Application cache gebruikt server RAM
- **Mitigatie**: TTL-based eviction, size limits
- **Monitoring**: Track cache size metrics
- **Acceptatie**: MVP schaal (500-2000 VVE's) past in memory

⚠️ **Single-Server Cache Limitation:**
- In-memory cache niet shared tussen ECS tasks
- **Impact**: Cache misses bij load balancing tussen tasks
- **Mitigatie**: Sticky sessions (route requests to same task)
- **Future**: Redis voor shared cache als nodig

⚠️ **Invalidation Complexity:**
- Must invalidate cache in alle code paths
- **Risk**: Forget invalidation = stale data
- **Mitigatie**: 
  - Code review checklist
  - Short TTLs (auto-expire)
  - Integration tests

---

## Future Enhancements (Post-MVP)

### Phase 2: Redis Cache (When Needed)
**Triggers:**
- Multiple application servers (>3 ECS tasks)
- Cache needs to survive restarts
- Shared cache across services

**Implementation:**
```typescript
// Redis cache client
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
  password: process.env.REDIS_PASSWORD,
  db: 0,
});

// Same interface as in-memory cache
export class RedisCache {
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await redis.setex(key, ttl / 1000, serialized);
    } else {
      await redis.set(key, serialized);
    }
  }
  
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  }
  
  async delete(key: string): Promise<void> {
    await redis.del(key);
  }
  
  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}
```

### Phase 3: Advanced Caching Patterns
- **Cache warming**: Pre-populate cache during off-peak hours
- **Cache prefetching**: Predictive caching based on user behavior
- **Cache versioning**: Gradual cache invalidation
- **Cache compression**: Compress large cached values

---

## References

- [HTTP Caching RFC 7234](https://tools.ietf.org/html/rfc7234)
- [AWS CloudFront Caching Best Practices](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/ConfiguringCaching.html)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- `docs/architecture/principles/01-architectuurprincipes-kaders.md` §2.1 (Performance)

---

## Decision Log

| Datum | Beslissing | Rationale |
|-------|------------|-----------|
| 2026-01-26 | Multi-layer caching (CDN + HTTP + App) | Best performance with low complexity |
| 2026-01-26 | NO Redis in MVP | Add complexity without immediate need, in-memory sufficient |
| 2026-01-26 | Short TTLs for financial data | Data consistency over cache performance |
| 2026-01-26 | Materialized views for aggregations | Pre-computed expensive queries |
| 2026-01-26 | Aggressive cache invalidation | Prevent stale data in financial context |

---

**Last Updated**: 2026-01-26  
**Next Review**: Q4 2026 (evaluate Redis need based on scale)
