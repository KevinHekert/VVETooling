# ADR-002: API Style (REST/GraphQL/Hybrid)

## Status
**ACCEPTED** ✅

## Context

VVE Tooling MVP heeft een API nodig voor communicatie tussen frontend en backend. De keuze van API style heeft grote impact op:

### Functionele Requirements
- **Frontend-Backend Communicatie**: React/Next.js frontend moet data ophalen van Node.js backend
- **Mobile Apps (Roadmap Fase 2)**: Native iOS/Android apps zullen zelfde API gebruiken
- **Third-Party Integraties (Roadmap Jaar 2-3)**: Accountant tools, bank API's
- **Data Model**: VVE data is sterk relationeel (transacties, splitsingen, reserves)
- **Query Patterns**: 
  - Vaak: Get transacties voor VVE + datum range
  - Vaak: Get dashboard summary (meerdere resources tegelijk)
  - Soms: Deep nested queries (VVE → Appartmenten → Bewoners → Betalingen)

### Niet-Functionele Requirements
- **Performance**: API response time <500ms (95th percentile)
- **Developer Productivity**: Team moet snel kunnen ontwikkelen
- **Type Safety**: TypeScript end-to-end (frontend ↔ backend)
- **Documentation**: API moet self-documenting zijn
- **Versioning**: Backwards compatibility voor mobile apps
- **Caching**: Efficient caching voor performance

### Team Context
- Team heeft ervaring met REST (meeste developers kennen REST)
- Team heeft beperkte GraphQL ervaring (1-2 developers)
- Frontend en backend development vaak parallel (verschillende developers)

---

## Decision

We kiezen voor **RESTful API** als primary API style voor MVP, met **GraphQL optioneel in Fase 2** als mobile apps complexere query requirements hebben.

### REST API Design Principles

```
Base URL: https://api.vvetooling.nl/v1

Resources:
  /vves                    - VVE's
  /vves/{id}/transactions  - Transacties binnen VVE
  /vves/{id}/reports       - Rapportages binnen VVE
  /vves/{id}/users         - Gebruikers binnen VVE
  /vves/{id}/documents     - Documenten binnen VVE
  /vves/{id}/settings      - VVE instellingen
  
Authentication:
  Authorization: Bearer {JWT_TOKEN}
  x-tenant-id: {VVE_ID}
  
Versioning:
  URL-based: /v1/, /v2/
  
Content-Type:
  application/json
```

### API Design Standards

#### 1. Resource Naming

**Conventions:**
- Plural nouns voor collections: `/transactions`, `/reports`
- Nested resources voor relationships: `/vves/{id}/transactions`
- Kebab-case voor multi-word resources: `/payment-plans` (als needed)

**Example Resources:**
```
GET    /v1/vves                              # List VVE's waar user lid van is
GET    /v1/vves/{vveId}                      # VVE details
PUT    /v1/vves/{vveId}                      # Update VVE settings

GET    /v1/vves/{vveId}/transactions         # List transacties
POST   /v1/vves/{vveId}/transactions         # Create transactie
GET    /v1/vves/{vveId}/transactions/{id}    # Get specifieke transactie
PUT    /v1/vves/{vveId}/transactions/{id}    # Update transactie
DELETE /v1/vves/{vveId}/transactions/{id}    # Delete transactie

GET    /v1/vves/{vveId}/reports              # List rapportages
POST   /v1/vves/{vveId}/reports              # Generate rapport
GET    /v1/vves/{vveId}/reports/{id}         # Download rapport (PDF)

GET    /v1/vves/{vveId}/dashboard            # Dashboard summary (special endpoint)
```

#### 2. HTTP Methods & Status Codes

**Standard Methods:**
```
GET     - Retrieve resource(s)           → 200 OK, 404 Not Found
POST    - Create new resource            → 201 Created, 400 Bad Request
PUT     - Update existing resource       → 200 OK, 404 Not Found
PATCH   - Partial update                 → 200 OK, 404 Not Found  
DELETE  - Delete resource                → 204 No Content, 404 Not Found
```

**Error Status Codes:**
```
400 Bad Request          - Invalid input (validation errors)
401 Unauthorized         - Missing/invalid JWT token
403 Forbidden            - Insufficient permissions (RBAC)
404 Not Found            - Resource doesn't exist
409 Conflict             - Conflict (duplicate resource)
422 Unprocessable Entity - Semantic errors (business logic validation)
429 Too Many Requests    - Rate limit exceeded
500 Internal Server Error- Server error (catch-all)
503 Service Unavailable  - Temporary unavailable (maintenance)
```

#### 3. Request/Response Format

**Standard Request Body (POST/PUT):**
```json
POST /v1/vves/{vveId}/transactions
Content-Type: application/json

{
  "date": "2026-01-26",
  "description": "Schoonmaakkosten januari",
  "amount": 1500.00,
  "category": "onderhoud",
  "type": "expense",
  "reserve_fund": "onderhoud-reserve"
}
```

**Standard Success Response:**
```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "vve_id": "660e8400-e29b-41d4-a716-446655440000",
    "date": "2026-01-26",
    "description": "Schoonmaakkosten januari",
    "amount": 1500.00,
    "category": "onderhoud",
    "type": "expense",
    "reserve_fund": "onderhoud-reserve",
    "created_at": "2026-01-26T10:30:00Z",
    "created_by": "user-123",
    "updated_at": "2026-01-26T10:30:00Z"
  },
  "meta": {
    "request_id": "req-abc123"
  }
}
```

**Standard Error Response:**
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "amount",
        "message": "Amount must be a positive number",
        "code": "INVALID_NUMBER"
      },
      {
        "field": "date",
        "message": "Date is required",
        "code": "REQUIRED_FIELD"
      }
    ]
  },
  "meta": {
    "request_id": "req-abc123",
    "timestamp": "2026-01-26T10:30:00Z"
  }
}
```

#### 4. Pagination

**Standard Pagination (Cursor-Based):**
```
GET /v1/vves/{vveId}/transactions?limit=50&cursor=next_page_token

Response:
{
  "data": [
    { /* transaction 1 */ },
    { /* transaction 2 */ },
    ...
  ],
  "pagination": {
    "limit": 50,
    "next_cursor": "eyJpZCI6IjEyMyIsImRhdGUiOiIyMDI2LTAxLTI2In0=",
    "has_more": true
  },
  "meta": {
    "total": 1250  // Optional: total count (slow query mogelijk)
  }
}
```

**Why Cursor-Based:**
- Better performance (geen OFFSET bij grote datasets)
- Consistent results (geen duplicates bij concurrent inserts)
- Scalable naar miljoenen records

**Alternative: Page-Based** (voor UI met page numbers):
```
GET /v1/vves/{vveId}/transactions?page=2&per_page=50

Response:
{
  "data": [...],
  "pagination": {
    "page": 2,
    "per_page": 50,
    "total_pages": 25,
    "total_count": 1250
  }
}
```

#### 5. Filtering & Sorting

**Filtering:**
```
GET /v1/vves/{vveId}/transactions?date_from=2026-01-01&date_to=2026-01-31&category=onderhoud&type=expense
```

**Sorting:**
```
GET /v1/vves/{vveId}/transactions?sort=-date,+amount
  // -date = descending, +amount = ascending
```

**Searching:**
```
GET /v1/vves/{vveId}/transactions?q=schoonmaak
```

#### 6. Partial Responses (Field Selection)

**Voor bandwidth optimization:**
```
GET /v1/vves/{vveId}/transactions?fields=id,date,amount,description

Response:
{
  "data": [
    {
      "id": "...",
      "date": "2026-01-26",
      "amount": 1500.00,
      "description": "..."
      // Other fields excluded
    }
  ]
}
```

#### 7. Batch Operations

**Voor efficiency (één API call ipv N calls):**
```
POST /v1/vves/{vveId}/transactions/batch

{
  "operations": [
    {
      "method": "POST",
      "body": { "date": "2026-01-01", "amount": 100 }
    },
    {
      "method": "PUT",
      "id": "transaction-123",
      "body": { "amount": 150 }
    }
  ]
}

Response:
{
  "results": [
    {
      "status": 201,
      "data": { /* created transaction */ }
    },
    {
      "status": 200,
      "data": { /* updated transaction */ }
    }
  ]
}
```

#### 8. Dashboard Endpoint (Aggregations)

**Special composite endpoint voor dashboard:**
```
GET /v1/vves/{vveId}/dashboard

Response:
{
  "data": {
    "summary": {
      "total_balance": 125000.00,
      "reserve_funds": {
        "onderhoud": 50000.00,
        "groot_onderhoud": 75000.00
      },
      "monthly_contribution": 8500.00,
      "unpaid_contributions": 1200.00
    },
    "recent_transactions": [
      { /* laatste 5 transacties */ }
    ],
    "upcoming_payments": [
      { /* komende betalingen */ }
    ],
    "alerts": [
      { "type": "low_reserve", "message": "Onderhoud reserve < 10% van target" }
    ]
  }
}
```

**Rationale:**
- Één API call ipv 5+ individuele calls (performance)
- Atomaire data (alle data uit zelfde snapshot)
- Optimized database queries (pre-aggregated)

---

### OpenAPI Documentation

**Tool: Swagger/OpenAPI 3.0**

```yaml
openapi: 3.0.0
info:
  title: VVE Tooling API
  version: 1.0.0
  description: RESTful API voor VVE Tooling platform

servers:
  - url: https://api.vvetooling.nl/v1
    description: Production
  - url: https://staging-api.vvetooling.nl/v1
    description: Staging

paths:
  /vves/{vveId}/transactions:
    get:
      summary: List transactions
      parameters:
        - name: vveId
          in: path
          required: true
          schema:
            type: string
            format: uuid
        - name: date_from
          in: query
          schema:
            type: string
            format: date
        - name: date_to
          in: query
          schema:
            type: string
            format: date
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TransactionList'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'

components:
  schemas:
    Transaction:
      type: object
      required:
        - date
        - description
        - amount
        - type
      properties:
        id:
          type: string
          format: uuid
          readOnly: true
        date:
          type: string
          format: date
        description:
          type: string
          minLength: 1
          maxLength: 500
        amount:
          type: number
          format: double
          minimum: 0.01
        type:
          type: string
          enum: [income, expense]
```

**Benefits:**
- Auto-generated API documentation (Swagger UI)
- Type generation voor TypeScript (via openapi-typescript)
- API validation (request/response schema validation)
- Mock servers voor frontend development

---

### Type Safety: TypeScript End-to-End

**Backend Types (Generated from Database Schema):**
```typescript
// types/database.ts (generated from Prisma schema)
export interface Transaction {
  id: string;
  vve_id: string;
  date: Date;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  reserve_fund?: string;
  created_at: Date;
  updated_at: Date;
}
```

**API Types (Shared between Frontend & Backend):**
```typescript
// types/api.ts (generated from OpenAPI spec)
export interface CreateTransactionRequest {
  date: string; // ISO date
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  reserve_fund?: string;
}

export interface TransactionResponse {
  data: Transaction;
  meta: {
    request_id: string;
  };
}

export interface TransactionListResponse {
  data: Transaction[];
  pagination: {
    limit: number;
    next_cursor?: string;
    has_more: boolean;
  };
  meta: {
    total?: number;
  };
}
```

**Frontend API Client (Type-Safe):**
```typescript
// lib/api-client.ts
import axios, { AxiosInstance } from 'axios';
import type { CreateTransactionRequest, TransactionResponse, TransactionListResponse } from '@/types/api';

class VVEApiClient {
  private client: AxiosInstance;
  
  constructor(baseURL: string, authToken: string, tenantId: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'x-tenant-id': tenantId,
        'Content-Type': 'application/json',
      },
    });
  }
  
  // Type-safe methods
  async createTransaction(
    vveId: string, 
    data: CreateTransactionRequest
  ): Promise<TransactionResponse> {
    const response = await this.client.post<TransactionResponse>(
      `/vves/${vveId}/transactions`,
      data
    );
    return response.data;
  }
  
  async listTransactions(
    vveId: string,
    params?: { date_from?: string; date_to?: string; limit?: number }
  ): Promise<TransactionListResponse> {
    const response = await this.client.get<TransactionListResponse>(
      `/vves/${vveId}/transactions`,
      { params }
    );
    return response.data;
  }
}

// Usage in React components
const { data } = await apiClient.createTransaction(vveId, {
  date: '2026-01-26',
  description: 'Test',
  amount: 100,
  type: 'expense', // TypeScript knows only 'income' or 'expense' allowed
  category: 'onderhoud',
});
// TypeScript knows `data.data` is a Transaction object
```

---

### Versioning Strategy

**URL-Based Versioning: `/v1/`, `/v2/`**

**Rationale:**
- Explicit en duidelijk
- Makkelijk te cachen (CDN, browser)
- Geen custom headers nodig

**Version Lifecycle:**
```
v1 - Initial MVP (Q3 2026)
  → v1 supported: Q3 2026 - Q3 2028 (2 jaar)
  
v2 - Major breaking changes (Q3 2027)
  → v2 supported: Q3 2027 - Q3 2029
  → v1 deprecated: Q3 2027
  → v1 sunset: Q3 2028
```

**Breaking Changes (require new version):**
- Removing fields from response
- Changing field types
- Renaming fields
- Changing URL structure
- Changing authentication mechanism

**Non-Breaking Changes (same version):**
- Adding new fields to response
- Adding new optional parameters
- Adding new endpoints
- Adding new error codes

---

## Consequences

### Positieve Gevolgen

✅ **Developer Familiarity:**
- REST is industry standard, alle developers kennen het
- Onboarding nieuwe developers is makkelijk
- Veel learning resources beschikbaar

✅ **Tooling Ecosystem:**
- Swagger UI voor API documentation
- Postman/Insomnia voor API testing
- OpenAPI code generation (TypeScript types)
- HTTP caching (CDN, browser, reverse proxy)

✅ **Simpliciteit:**
- Geen extra abstraction layer (zoals GraphQL resolver)
- Direct mapping resources → database tables
- Debugging is straightforward (HTTP request/response logs)

✅ **Caching:**
- HTTP caching headers (ETag, Cache-Control)
- CDN caching voor GET requests
- Browser caching automatic

✅ **Performance:**
- Minimal overhead (geen query parsing zoals GraphQL)
- Efficient database queries (direct SQL, geen N+1 problems)
- Predictable performance (elk endpoint is geoptimaliseerd)

✅ **Type Safety:**
- TypeScript end-to-end via OpenAPI code generation
- Compile-time errors voor API mismatches
- Auto-completion in IDE

---

### Negatieve Gevolgen

⚠️ **Over-Fetching:**
- Client kan meer data krijgen dan nodig
- **Mitigatie**: Field selection (`?fields=id,name`)
- **Impact**: ~10-20% extra bandwidth (acceptabel voor MVP)

⚠️ **Under-Fetching (Multiple Requests):**
- Dashboard vereist mogelijk 5+ API calls
- **Mitigatie**: Special composite endpoints (`/dashboard`)
- **Impact**: Extra development voor composite endpoints

⚠️ **Mobile App Complexity:**
- Native apps hebben mogelijk complexere query patterns
- **Mitigatie**: GraphQL layer in Fase 2 als nodig
- **Acceptatie**: MVP is web-only, mobile is Fase 2

⚠️ **Versioning Complexity:**
- Onderhouden van meerdere API versies is work
- **Mitigatie**: Maximum 2 versies tegelijk supported
- **Acceptatie**: 2-jaar deprecation cycle is industry standard

---

### Risico's

**Risico 1: N+1 Query Problem**
- Frontend doet lijst query, dan N detail queries
- **Likelihood**: Medium (als developers niet alert zijn)
- **Mitigatie**: 
  - Backend includes related data waar zinvol
  - Code review checklist voor N+1 patterns
  - Performance monitoring (alerts bij >10 queries per request)
- **Acceptabel**: Ja, mitigaties zijn effectief

**Risico 2: API Bloat (Endpoint Proliferation)**
- Teveel specifieke endpoints (unmanageable)
- **Likelihood**: Medium (bij rapid feature development)
- **Mitigatie**: 
  - Regular API review (quarterly)
  - Consolidate endpoints waar mogelijk
  - Generic endpoints met filtering ipv specifieke endpoints
- **Acceptabel**: Ja, review proces voorkomt bloat

**Risico 3: Breaking Changes Accidents**
- Accidenteel breaking change zonder version bump
- **Likelihood**: Low-Medium
- **Mitigatie**: 
  - OpenAPI schema validation in CI/CD
  - Contract testing (Pact.io of similar)
  - Automated breaking change detection
- **Acceptabel**: Ja, tooling voorkomt meeste accidents

---

## Alternatives Considered

### Alternative 1: GraphQL

**Pro's:**
- ✅ Client-driven queries (geen over-fetching)
- ✅ Single endpoint (`/graphql`)
- ✅ Built-in type system (schema)
- ✅ Perfect voor mobile apps (flexible queries)
- ✅ Real-time subscriptions (WebSocket)

**Con's:**
- ⚠️ Steepere learning curve (vooral voor junior developers)
- ⚠️ N+1 query problem (zonder DataLoader optimization)
- ⚠️ Caching is complexer (geen HTTP caching)
- ⚠️ Geen standard errors (elke query returns 200)
- ⚠️ Query complexity attacks (zonder rate limiting op complexity)
- ⚠️ Debugging is harder (geen direct HTTP logs)

**Why Not for MVP:**
- Team heeft beperkte GraphQL ervaring
- Caching strategie is complexer
- MVP workload past goed bij REST (niet veel flexible queries)

**Future Consideration:**
- GraphQL layer in Fase 2 (voor mobile apps) als needed
- Kan naast REST bestaan (hybrid approach)

---

### Alternative 2: gRPC

**Pro's:**
- ✅ Excellent performance (binary protocol)
- ✅ Strong typing (Protocol Buffers)
- ✅ Bi-directional streaming

**Con's:**
- ❌ Niet web-browser friendly (vereist gRPC-Web proxy)
- ❌ Debugging is moeilijker (binary format)
- ❌ Kleiner ecosystem dan REST
- ❌ Steepere learning curve

**Why Rejected:**
- Web browser support vereist extra tooling
- Performance benefit is minimal voor VVE workload (meeste latency is database, niet protocol)
- Learning curve te hoog voor team

---

### Alternative 3: JSON-RPC

**Pro's:**
- ✅ Simple protocol
- ✅ Single endpoint

**Con's:**
- ⚠️ Minder tooling support dan REST
- ⚠️ Geen standard caching
- ⚠️ Geen standard status codes

**Why Rejected:**
- REST heeft betere tooling en ecosystem
- JSON-RPC biedt geen significante voordelen voor use case

---

### Alternative 4: Hybrid (REST + GraphQL)

**Beschrijving**: REST voor MVP, GraphQL layer toevoegen in Fase 2

**Pro's:**
- ✅ Best of both worlds
- ✅ REST voor standard CRUD, GraphQL voor complexe queries
- ✅ Gradual migration (geen big bang)

**Con's:**
- ⚠️ Twee API styles om te maintainen
- ⚠️ Client code moet beide styles ondersteunen
- ⚠️ Complexity voor team

**Future Consideration:**
- Mogelijk voor Fase 2 als mobile app requirements dit vereisen
- Niet voor MVP (add complexity zonder immediate benefit)

---

## Implementation Plan

### Phase 1: Foundation (Week 1-2)
- [x] OpenAPI spec document (skelet)
- [ ] Express.js API router setup
- [ ] Standard error handling middleware
- [ ] Request validation middleware (express-validator of Zod)
- [ ] Response formatting middleware
- [ ] API versioning structure (`/v1/`)

### Phase 2: Core Endpoints (Week 3-6)
- [ ] VVE endpoints (`GET /vves`, `GET /vves/{id}`)
- [ ] Transaction endpoints (CRUD)
- [ ] Report endpoints
- [ ] User endpoints
- [ ] Document endpoints
- [ ] Dashboard composite endpoint

### Phase 3: Developer Experience (Week 7-8)
- [ ] Swagger UI setup (hosted at `/api-docs`)
- [ ] TypeScript type generation (openapi-typescript)
- [ ] Frontend API client library
- [ ] Postman collection (voor QA testing)

### Phase 4: Production Readiness (Week 9-10)
- [ ] Rate limiting (express-rate-limit)
- [ ] CORS configuration
- [ ] Compression (gzip/brotli)
- [ ] HTTP caching headers
- [ ] API metrics (Prometheus)
- [ ] API monitoring (CloudWatch, Sentry)

---

## Metrics & Monitoring

### Key Metrics
- **API Response Time (p50, p95, p99)**: Target <500ms p95
- **Error Rate**: <1% (4xx + 5xx errors)
- **Throughput**: Requests per second
- **Cache Hit Rate**: >70% voor GET requests

### Alarms
- **High Error Rate**: >5% errors in 5 minuten
- **Slow API**: p95 >1000ms
- **High Latency**: p50 >200ms

### Dashboards
- CloudWatch dashboard met:
  - Request count per endpoint
  - Response time percentiles
  - Error rate per endpoint
  - Cache hit/miss rate
  - Top slowest endpoints

---

## References

- [RESTful API Design Best Practices](https://docs.microsoft.com/en-us/azure/architecture/best-practices/api-design)
- [OpenAPI Specification 3.0](https://swagger.io/specification/)
- [RFC 7807: Problem Details for HTTP APIs](https://tools.ietf.org/html/rfc7807)
- `docs/architecture/principles/01-architectuurprincipes-kaders.md` Principe 5 (API-First)
- `docs/architecture/constraints/01-randvoorwaarden-ux-development.md` §2.1 DEV-05

---

## Decision Log

| Datum | Beslissing | Rationale |
|-------|------------|-----------|
| 2026-01-26 | REST for MVP | Team familiarity, tooling, simpliciteit |
| 2026-01-26 | URL-based versioning | Explicit, cacheable |
| 2026-01-26 | Cursor-based pagination | Performance, consistency |
| 2026-01-26 | OpenAPI 3.0 documentation | Type generation, validation |
| 2026-01-26 | Dashboard composite endpoint | Performance (één call ipv N calls) |
| 2026-01-26 | GraphQL deferred to Fase 2 | Evaluate after mobile app requirements clear |

---

**Last Updated**: 2026-01-26  
**Next Review**: Q4 2026 (na mobile app requirements definitief)
