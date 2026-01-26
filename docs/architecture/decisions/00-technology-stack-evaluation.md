# Technology Stack Evaluatie - VVE Tooling MVP

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Architecture & Development
- **Status**: Accepted
- **Versie**: 1.0
- **Doel**: Evaluatie en rationale voor gekozen technologie stack

## Executive Summary

Dit document beschrijft de geselecteerde technologie stack voor VVE Tooling MVP en de rationale achter elke keuze. De stack is geoptimaliseerd voor snelle time-to-market, team productiviteit, en operationele betrouwbaarheid binnen de gestelde architectuurprincipes.

**Gekozen Stack:**
- **Backend**: Node.js 20 + TypeScript 5 + Express.js 4
- **Frontend**: React 18 + Next.js 14 + TypeScript 5
- **Database**: PostgreSQL 15 (AWS RDS Multi-AZ)
- **Hosting**: AWS eu-central-1 Frankfurt (ECS Fargate of Elastic Beanstalk)
- **Authentication**: AWS Cognito
- **Storage**: AWS S3
- **CDN**: AWS CloudFront

---

## 1. Evaluatiecriteria

### 1.1 Must-Have Criteria (Non-Negotiable)

**C1: AVG Compliance - EU Data Residency**
- Data moet in Nederlandse/EU datacenter gehost worden
- Cloud provider moet AVG-compliant zijn
- DPA (Data Processing Agreement) beschikbaar

**C2: Bank-Level Security**
- Encryption at rest en in transit
- Industry-standard authentication mechanismen
- SOC 2, ISO 27001 certificering van cloud provider
- Built-in security features (WAF, DDoS protection)

**C3: Multi-Tenancy Support**
- Database moet Row-Level Security (RLS) ondersteunen
- Architectuur moet absolute data isolation mogelijk maken
- Performance met 500-5000 tenants

**C4: Performance Requirements**
- Database query time <100ms (95th percentile)
- API response time <500ms (95th percentile)
- Horizontaal schaalbaar

**C5: 99.5% Uptime Capability**
- Managed services met hoge SLA's
- Automated backups en point-in-time recovery
- Multi-AZ deployment mogelijk

**C6: Team Productiviteit**
- Breed recruitment pool (geen niche technologieën)
- Rijke ecosystem (libraries, tools, community)
- Goede developer experience (DX)
- **GitHub Copilot compatibility** (AI-assisted development voor verhoogde velocity)

---

### 1.2 Nice-to-Have Criteria

- Open source (vendor lock-in mitigatie)
- Cloud-agnostic waar mogelijk
- Lage learning curve voor junior developers
- Actieve community en lange-termijn support
- Cost-effectief voor MVP schaal (500-2000 VVE's)

---

## 2. Backend Stack Evaluatie

### 2.1 Runtime Environment: Node.js 20

**Alternatieven overwogen:**
- Python (Django/FastAPI)
- C# (.NET Core)
- Java (Spring Boot)
- Go

**Evaluatie:**

| Criterium | Node.js | Python | C#/.NET | Java | Go |
|-----------|---------|--------|---------|------|-----|
| EU Hosting | ✅ | ✅ | ✅ | ✅ | ✅ |
| Performance | ✅ Excellent | ⚠️ Good | ✅ Excellent | ✅ Excellent | ✅ Excellent |
| Team Recruitment | ✅ Zeer breed | ✅ Zeer breed | ✅ Breed | ✅ Breed | ⚠️ Smaller |
| Ecosystem Rijkheid | ✅ Zeer rijk (npm) | ✅ Zeer rijk (pip) | ✅ Rijk (NuGet) | ✅ Rijk (Maven) | ⚠️ Growing |
| Full-Stack TS | ✅ Ja | ❌ Nee | ❌ Nee | ❌ Nee | ❌ Nee |
| **GitHub Copilot** | ✅ Excellent | ✅ Excellent | ✅ Good | ✅ Good | ⚠️ Good |
| Async I/O | ✅ Native | ⚠️ asyncio | ✅ async/await | ⚠️ Complex | ✅ Goroutines |
| Learning Curve | ✅ Laag | ✅ Laag | ⚠️ Medium | ⚠️ Medium-High | ⚠️ Medium |
| Startup Cost | ✅ Laag | ✅ Laag | ⚠️ Medium | ❌ Hoog | ✅ Laag |

**Beslissing: Node.js 20 + TypeScript 5**

**Rationale:**
1. **Full-Stack TypeScript**: Dezelfde taal voor frontend en backend = verhoogde developer productiviteit
2. **GitHub Copilot Excellence**: TypeScript + Node.js combinatie heeft excellent Copilot support:
   - Enorme trainingsdata (JavaScript is meest populaire taal op GitHub)
   - TypeScript types geven Copilot excellent context voor accurate suggestions
   - Shared types tussen frontend/backend → consistent Copilot suggestions
   - React + Node.js is één van de meest getrainde stacks in Copilot
3. **Excellent async I/O**: Perfect voor API-heavy applicaties met veel concurrent requests
4. **Breed recruitment pool**: JavaScript/TypeScript developers zijn meest beschikbaar in Nederlandse markt
5. **Rijk ecosystem**: npm heeft grootste package repository wereldwijd
6. **Fast startup times**: Belangrijk voor development ervaring en CI/CD
7. **Proven at scale**: Netflix, LinkedIn, PayPal gebruiken Node.js voor mission-critical systems

**Python vs Node.js/TypeScript - GitHub Copilot Vergelijking:**

| Aspect | Node.js + TypeScript | Python | Winnaar |
|--------|---------------------|--------|---------|
| **Trainingsdata volume** | ✅ Zeer groot (JS #1 taal GitHub) | ✅ Zeer groot (Python #2) | 🤝 Gelijkwaardig |
| **Type hints voor context** | ✅ TypeScript types (verplicht) | ⚠️ Python type hints (optioneel) | ✅ TypeScript |
| **Full-stack consistency** | ✅ Zelfde taal frontend/backend | ❌ Twee talen (JS + Python) | ✅ TypeScript |
| **Framework support** | ✅ Express/Next.js zeer populair | ✅ Django/FastAPI populair | 🤝 Gelijkwaardig |
| **Copilot accuracy** | ✅ Excellent met types | ✅ Excellent (expliciete syntax) | 🤝 Gelijkwaardig |
| **AI-generated tests** | ✅ Jest zeer common pattern | ✅ pytest zeer common | 🤝 Gelijkwaardig |

**Conclusie GitHub Copilot aspect:**
Beide talen hebben excellent Copilot support. **TypeScript heeft voordeel door:**
1. **Compile-time type checking** → Copilot suggestions zijn type-safe
2. **Full-stack type sharing** → Copilot begrijpt relatie frontend ↔ backend
3. **Expliciete interfaces** → Duidelijke contracts voor Copilot

Python heeft voordeel door:
1. **Expliciete, leesbare syntax** → Makkelijker voor Copilot te voorspellen
2. **Conventie over configuratie** → Voorspelbare project structuur

**Decisie blijft Node.js + TypeScript**, omdat:
- Copilot support is gelijkwaardig tot licht beter voor TypeScript
- Full-stack TypeScript geeft extra voordeel (geen context switch tussen talen)
- Combined met andere voordelen (recruitment pool, performance) is Node.js/TypeScript de beste keuze

**Trade-offs geaccepteerd:**
- CPU-intensive workloads zijn minder performant (maar niet relevant voor VVE Tooling workload)
- Single-threaded event loop vereist goede error handling (mitigatie: TypeScript type safety)

---

### 2.3 Diepgaande Analyse: GitHub Copilot Compatibility

**Context:**
GitHub Copilot is een AI-powered code completion tool die significant developer productivity kan verhogen (20-55% sneller coderen volgens GitHub studies). Voor een MVP met 3-6 maanden timeline is maximale Copilot compatibility een belangrijk criterium.

**Evaluatie per Backend Taal:**

#### TypeScript/Node.js - Copilot Score: 9.5/10

**Voordelen:**
- ✅ **Largest training corpus**: JavaScript is #1 taal op GitHub (miljoenen repositories)
- ✅ **Type-aware suggestions**: TypeScript types geven Copilot extra context
  ```typescript
  // Copilot kan exact type-safe code suggereren
  interface User {
    id: string;
    role: 'penningmeester' | 'bestuurslid' | 'bewoner';
  }
  // Copilot suggereert automatisch role validation met correcte union types
  ```
- ✅ **Full-stack context**: Frontend en backend in zelfde taal → Copilot leert van beide
- ✅ **Popular frameworks**: Express, Next.js, Prisma hebben enorme codebases in training data
- ✅ **Test generation**: Jest patterns zijn zeer common → excellent test suggestions
- ✅ **API contracts**: Shared TypeScript types tussen frontend/backend → consistent suggestions

**Real-world impact:**
- Boilerplate code (CRUD endpoints, validation): 70-80% sneller met Copilot
- Type definitions en interfaces: 60-70% sneller
- Test cases: 50-60% sneller
- Complex business logic: 20-30% sneller (vereist nog steeds developer thinking)

**Voorbeelden waar Copilot excellent presteert:**
```typescript
// 1. API endpoint generation - Copilot suggereert volledige implementation
router.post('/api/transactions', async (req, res) => {
  // Copilot genereert: validation, tenant check, database insert, audit log
});

// 2. Prisma query generation met RLS
async function getTransactionsByVVE(vveId: string, userId: string) {
  // Copilot suggereert: tenant filtering, user role check, includes
}

// 3. Type-safe error handling
try {
  // Business logic
} catch (error) {
  // Copilot suggereert type guards en proper error handling
}
```

#### Python - Copilot Score: 9/10

**Voordelen:**
- ✅ **Huge training corpus**: Python is #2 taal op GitHub
- ✅ **Explicit syntax**: Python's "one way to do things" → voorspelbaar voor Copilot
- ✅ **Type hints**: Modern Python met type hints geeft Copilot context
  ```python
  # Copilot kan type-aware code suggereren
  def get_transactions(vve_id: str, user: User) -> List[Transaction]:
      # Copilot suggereert implementatie met type checking
  ```
- ✅ **Popular frameworks**: Django, FastAPI hebben grote codebases
- ✅ **Data processing**: Excellent Copilot support voor pandas, numpy (als future analytics)
- ✅ **Testing**: pytest patterns zeer common in training data

**Nadelen vs TypeScript:**
- ⚠️ **Type hints optioneel**: Niet alle Python code heeft types → mindere Copilot accuracy
- ⚠️ **Frontend disconnect**: Copilot moet switchen tussen Python (backend) en JS/TS (frontend)
- ⚠️ **Async patterns**: asyncio is minder common dan Node.js async/await in training data

**Real-world impact:**
- Boilerplate code: 60-70% sneller (iets minder dan TypeScript door minder strikte types)
- Business logic: 30-40% sneller (Python's explicietere syntax helpt Copilot)
- Test cases: 50-60% sneller
- Data processing: 70-80% sneller (als relevant voor future analytics)

**Voorbeelden waar Copilot excellent presteert:**
```python
# 1. Django view generation
@require_http_methods(["POST"])
@login_required
def create_transaction(request):
    # Copilot genereert: form validation, tenant check, save, audit

# 2. Type-hinted functions
def calculate_contribution(
    total_amount: Decimal,
    split_key: Decimal,
    reserve_percentage: Decimal
) -> Decimal:
    # Copilot suggereert accurate calculations met type safety

# 3. pytest fixtures
@pytest.fixture
def authenticated_user(db):
    # Copilot suggereert volledige fixture setup
```

#### C#/.NET - Copilot Score: 7.5/10

**Voordelen:**
- ✅ Strong typing (excellent voor Copilot context)
- ✅ Mature enterprise patterns (common in training data)

**Nadelen:**
- ⚠️ Kleiner corpus dan JS/Python op GitHub
- ⚠️ Enterprise-focused → minder startup/MVP patterns in training
- ⚠️ Frontend disconnect (C# backend, JS/TS frontend)

#### Java - Copilot Score: 7/10

**Nadelen:**
- ⚠️ Verbose syntax → meer te typen zelfs met Copilot
- ⚠️ Oudere codebase patterns in training (veel legacy code)
- ⚠️ Frontend disconnect

---

**Conclusie GitHub Copilot Compatibility:**

| Taal | Copilot Score | Key Advantage | Key Disadvantage |
|------|--------------|---------------|------------------|
| **TypeScript** | 🥇 9.5/10 | Full-stack consistency, type safety | - |
| **Python** | 🥈 9/10 | Explicit syntax, data processing | Frontend disconnect |
| **C#** | 🥉 7.5/10 | Strong typing | Smaller corpus, enterprise-focused |
| **Java** | 7/10 | Enterprise patterns | Verbose, frontend disconnect |

**Decisie:**
TypeScript/Node.js heeft licht voordeel (9.5 vs 9) door:
1. Full-stack consistency (geen mental/Copilot context switch tussen talen)
2. Shared types maken Copilot suggestions accurater
3. Largest training corpus voor web development patterns

**Belangrijke nuance:**
Het verschil is **klein** (9.5 vs 9). Python zou ook excellent werken met Copilot. De keuze voor TypeScript is gebaseerd op **cumulative voordelen**:
- Copilot: 9.5 vs 9 (klein voordeel TypeScript)
- Full-stack consistency: TypeScript wint duidelijk
- Recruitment pool: Gelijkwaardig
- Async I/O: TypeScript iets beter voor API workload
- Ecosystem: Gelijkwaardig

**Alternative scenario - wanneer Python te prefereren:**
Als toekomstige roadmap **zwaar** leunt op:
- Data analytics (ML/AI features)
- Scientific computing
- Integration met Python-based tools (accounting software)

Dan zou Python + FastAPI sterke candidate zijn, ondanks frontend disconnect.

**Voor VVE Tooling MVP: TypeScript blijft de juiste keuze** ✅

---

### 2.4 Programming Language: TypeScript 5

**Alternatieven overwogen:**
- Plain JavaScript (ES2023)

**Beslissing: TypeScript 5**

**Rationale:**
1. **Type Safety**: Voorkomt runtime errors, verhoogt code kwaliteit
2. **Better IDE Support**: Autocomplete, refactoring, inline documentation
3. **Self-Documenting Code**: Types zijn living documentation
4. **Easier Refactoring**: Compiler catcht breaking changes
5. **Industry Standard**: >80% van nieuwe Node.js projecten gebruikt TypeScript
6. **Zero Runtime Overhead**: Compiled naar JavaScript, geen performance penalty

**Trade-offs:**
- Slightly langere build times (acceptabel met moderne tooling)
- Extra setup complexiteit (mitigatie: starter templates beschikbaar)

---

### 2.3 Web Framework: Express.js 4

**Alternatieven overwogen:**
- Fastify (performance-focused)
- NestJS (opinionated, Angular-like)
- Koa (modern Express alternative)
- Hapi (enterprise-focused)

**Evaluatie:**

| Criterium | Express.js | Fastify | NestJS | Koa | Hapi |
|-----------|------------|---------|--------|-----|------|
| Maturity | ✅ Zeer mature | ⚠️ Newer | ⚠️ Newer | ⚠️ Mature | ✅ Mature |
| Performance | ✅ Good | ✅ Excellent | ✅ Good | ✅ Good | ✅ Good |
| Ecosystem | ✅ Grootste | ⚠️ Growing | ✅ Groot | ⚠️ Smaller | ⚠️ Smaller |
| Learning Curve | ✅ Zeer laag | ✅ Laag | ⚠️ Medium-High | ⚠️ Medium | ⚠️ Medium |
| Flexibility | ✅ Zeer flexibel | ✅ Flexibel | ⚠️ Opinionated | ✅ Flexibel | ⚠️ Opinionated |
| TypeScript Support | ✅ Excellent | ✅ Native | ✅ Native | ✅ Good | ✅ Good |
| Community | ✅ Zeer groot | ⚠️ Growing | ⚠️ Medium | ⚠️ Medium | ⚠️ Small |

**Beslissing: Express.js 4**

**Rationale:**
1. **Industry Standard**: Meest gebruikte Node.js framework, bewezen track record
2. **Enorme ecosystem**: Middleware voor vrijwel elke use case beschikbaar
3. **Laagste learning curve**: Makkelijkste onboarding voor nieuwe developers
4. **Maximum flexibility**: Geen opinionated structuur, team kan eigen patterns kiezen
5. **Recruitment**: Vrijwel elke Node.js developer kent Express.js
6. **Minimale abstractie**: Dicht bij native Node.js HTTP, makkelijk te debuggen

**Trade-offs geaccepteerd:**
- Niet de snelste performance (Fastify is ~20% sneller), maar voldoende voor requirements
- Minder out-of-the-box structuur dan NestJS (mitigatie: team definieert eigen conventions)

---

## 3. Frontend Stack Evaluatie

### 3.1 UI Framework: React 18

**Alternatieven overwogen:**
- Vue 3
- Angular 17
- Svelte 4
- Solid.js

**Evaluatie:**

| Criterium | React | Vue | Angular | Svelte | Solid.js |
|-----------|-------|-----|---------|--------|----------|
| Maturity | ✅ Zeer mature | ✅ Mature | ✅ Zeer mature | ⚠️ Newer | ⚠️ New |
| Performance | ✅ Excellent | ✅ Excellent | ✅ Good | ✅ Excellent | ✅ Excellent |
| Recruitment | ✅ Zeer breed | ✅ Breed | ⚠️ Medium | ⚠️ Small | ❌ Zeer small |
| Ecosystem | ✅ Grootste | ✅ Groot | ✅ Groot | ⚠️ Growing | ❌ Small |
| Learning Curve | ✅ Laag-Medium | ✅ Laag | ⚠️ High | ✅ Laag | ⚠️ Medium |
| TypeScript Support | ✅ Excellent | ✅ Excellent | ✅ Native | ✅ Good | ✅ Good |
| Mobile-Responsive | ✅ Excellent | ✅ Excellent | ✅ Good | ✅ Excellent | ✅ Good |
| SSR Support | ✅ Next.js | ✅ Nuxt | ✅ Angular Universal | ✅ SvelteKit | ⚠️ Limited |

**Beslissing: React 18**

**Rationale:**
1. **Breedste recruitment pool**: 40%+ van frontend developers gebruikt React
2. **Grootste ecosystem**: Meeste UI component libraries (Material-UI, Ant Design, Chakra, etc.)
3. **Next.js integration**: Best-in-class meta-framework voor production apps
4. **Industry standard**: Used by Facebook, Netflix, Airbnb, Uber
5. **Excellent documentation**: Rijke learning resources en community support
6. **React Server Components**: Toekomst-proof met RSC voor performance optimization

**Trade-offs geaccepteerd:**
- Bundle size iets groter dan Svelte (maar acceptabel binnen 500KB budget)
- Niet de "easiest" framework (Vue is iets eenvoudiger), maar recruitment weegt zwaarder

---

### 3.2 Meta-Framework: Next.js 14

**Alternatieven overwogen:**
- Create React App (CRA)
- Vite + React Router
- Remix
- Gatsby

**Beslissing: Next.js 14**

**Rationale:**
1. **Production-Ready**: Out-of-the-box SSR, SSG, ISR, API routes
2. **Excellent Performance**: Automatic code splitting, image optimization, font optimization
3. **App Router (RSC)**: Modern React Server Components support
4. **Built-in API Routes**: Backend API's kunnen in Next.js (of separaat met Express)
5. **Vercel Support**: Excellent developer experience en deployment
6. **SEO Friendly**: SSR voor public pages (marketing site)
7. **Industry Adoption**: Used by Twitch, TikTok, Hulu, Nike

**Why Not Alternatives:**
- **CRA**: Deprecated, geen SSR support
- **Vite**: Excellent maar vereist meer setup voor production features
- **Remix**: Newer, kleinere community, maar zeer competent alternatief
- **Gatsby**: Te gericht op static sites, minder geschikt voor dynamic app

---

## 4. Database Stack Evaluatie

### 4.1 Database: PostgreSQL 15

**Alternatieven overwogen:**
- MySQL 8
- MongoDB
- Microsoft SQL Server
- MariaDB

**Evaluatie:**

| Criterium | PostgreSQL | MySQL | MongoDB | SQL Server | MariaDB |
|-----------|------------|-------|---------|------------|---------|
| Row-Level Security | ✅ Native RLS | ❌ Requires views | ❌ Manual | ⚠️ Complex | ❌ Requires views |
| ACID Compliance | ✅ Volledig | ✅ Volledig | ⚠️ Limited | ✅ Volledig | ✅ Volledig |
| JSON Support | ✅ Excellent (JSONB) | ⚠️ Basic | ✅ Native | ⚠️ Basic | ⚠️ Basic |
| Performance | ✅ Excellent | ✅ Excellent | ✅ Excellent | ✅ Excellent | ✅ Excellent |
| Open Source | ✅ Ja (PostgreSQL) | ✅ Ja (GPL) | ⚠️ SSPL | ❌ Proprietary | ✅ Ja (GPL) |
| AWS RDS Support | ✅ Excellent | ✅ Excellent | ❌ DocumentDB | ✅ Available | ✅ Available |
| Community | ✅ Zeer actief | ✅ Zeer actief | ✅ Actief | ⚠️ Enterprise | ✅ Actief |
| Learning Curve | ✅ SQL Standard | ✅ SQL Standard | ⚠️ NoSQL | ✅ SQL Standard | ✅ SQL Standard |

**Beslissing: PostgreSQL 15**

**Rationale:**
1. **Native Row-Level Security (RLS)**: Perfect voor multi-tenancy absolute data isolation
2. **ACID Compliance**: Kritiek voor financiële transacties (data integrity)
3. **Excellent JSON Support (JSONB)**: Flexibility voor semi-structured data (document metadata, audit logs)
4. **Advanced Features**: CTEs, window functions, full-text search - alles wat VVE app nodig heeft
5. **AWS RDS Support**: Managed service met Multi-AZ, automated backups, point-in-time recovery
6. **Open Source**: Geen licensing costs, geen vendor lock-in risico
7. **Active Community**: Continuous development, excellent documentation
8. **Industry Standard**: Used by Instagram, Spotify, Reddit, Twitch

**Row-Level Security Voorbeeld:**
```sql
-- RLS policy voor absolute tenant isolation
CREATE POLICY tenant_isolation ON transactions
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Elke query automatisch gefilterd op tenant_id
SELECT * FROM transactions WHERE id = 123;
-- Wordt automatisch: SELECT * FROM transactions WHERE id = 123 AND tenant_id = <current_tenant>
```

**Trade-offs geaccepteerd:**
- MySQL is iets eenvoudiger voor beginners (maar team leert snel)
- MongoDB zou sneller zijn voor document-heavy workloads (maar VVE app is relational)

---

### 4.2 ORM: Prisma (of TypeORM)

**Alternatieven overwogen:**
- TypeORM
- Sequelize
- Knex.js
- Raw SQL

**Beslissing: Prisma (voorkeur) of TypeORM (alternatief)**

**Rationale voor Prisma:**
1. **Type-Safe**: Automatische TypeScript types gegenereerd uit schema
2. **Excellent DX**: Prisma Studio voor data browsing, intuïtieve API
3. **Migration System**: Declarative schema met automatic migrations
4. **Query Performance**: Efficient query generation, N+1 prevention
5. **Modern**: Built for TypeScript-first development

**TypeORM als alternatief:**
- Meer mature, grotere community
- Meer flexibiliteit (decorators vs. schema file)
- Better voor complexe queries (QueryBuilder)

**Beslissing**: Development team kiest op basis van team voorkeur.

---

## 5. Cloud Platform Evaluatie

### 5.1 Cloud Provider: AWS (eu-central-1 Frankfurt)

**Alternatieven overwogen:**
- Microsoft Azure (West Europe)
- Google Cloud Platform (europe-west4 Netherlands)
- DigitalOcean (Amsterdam)
- Hetzner (Falkenstein, Germany)

**Evaluatie:**

| Criterium | AWS | Azure | GCP | DigitalOcean | Hetzner |
|-----------|-----|-------|-----|--------------|---------|
| EU Data Center | ✅ eu-central-1 Frankfurt | ✅ West Europe | ✅ Netherlands | ✅ Amsterdam | ✅ Germany |
| Managed Services | ✅ Meeste | ✅ Zeer veel | ✅ Veel | ⚠️ Limited | ⚠️ Limited |
| Security Certs | ✅ SOC 2, ISO 27001 | ✅ SOC 2, ISO 27001 | ✅ SOC 2, ISO 27001 | ⚠️ Limited | ⚠️ Limited |
| Cognito Alternative | ✅ AWS Cognito | ✅ Azure AD B2C | ⚠️ Firebase Auth | ❌ None | ❌ None |
| RDS PostgreSQL | ✅ Excellent | ✅ Excellent | ✅ Cloud SQL | ⚠️ Basic | ⚠️ Basic |
| Cost (MVP Scale) | ⚠️ Medium-High | ⚠️ Medium-High | ⚠️ Medium-High | ✅ Low | ✅ Low |
| Community | ✅ Grootste | ✅ Groot | ✅ Groot | ⚠️ Smaller | ⚠️ Small |
| Learning Curve | ⚠️ Medium-High | ⚠️ Medium-High | ⚠️ Medium | ✅ Laag | ✅ Laag |

**Beslissing: AWS eu-central-1 (Frankfurt)**

**Rationale:**
1. **Meeste managed services**: RDS, Cognito, S3, CloudFront, ECS - alles wat we nodig hebben
2. **Market leader**: Grootste cloud provider, proven reliability
3. **Excellent documentation**: Rijkste documentatie en learning resources
4. **Security compliance**: SOC 2, ISO 27001, AVG-compliant
5. **Cognito integration**: Managed authentication die perfect integreert met andere AWS services
6. **Recruitment**: Meeste cloud engineers hebben AWS ervaring
7. **Ecosystem**: Meeste third-party tools integreren met AWS

**Why Frankfurt (eu-central-1):**
- AVG compliance: data blijft in EU
- Lage latency naar Nederland (< 20ms)
- Alle AWS services beschikbaar (niet alle regio's hebben alle services)
- Kostenefficiënt (goedkoper dan ireland, uk)

**Trade-offs geaccepteerd:**
- Hogere kosten dan DigitalOcean/Hetzner (maar managed services wegen op tegen self-hosted complexity)
- Vendor lock-in risico (mitigatie: data export mogelijk, API abstractie laag)
- Learning curve voor team (mitigatie: extensive documentation, online courses)

---

### 5.2 Hosting: AWS ECS Fargate (voorkeur) of Elastic Beanstalk

**Alternatieven overwogen:**
- AWS Lambda (serverless)
- AWS EC2 (virtual machines)
- AWS EKS (Kubernetes)
- AWS Elastic Beanstalk

**Evaluatie:**

| Criterium | ECS Fargate | Lambda | EC2 | EKS | Elastic Beanstalk |
|-----------|-------------|--------|-----|-----|-------------------|
| Operational Overhead | ✅ Laag | ✅ Zeer laag | ❌ Hoog | ❌ Zeer hoog | ✅ Laag |
| Predictable Cost | ✅ Ja | ⚠️ Nee | ✅ Ja | ⚠️ Complex | ✅ Ja |
| Cold Start | ✅ Geen | ❌ Ja | ✅ Geen | ✅ Geen | ✅ Geen |
| Long-Running | ✅ Perfect | ❌ 15 min limit | ✅ Perfect | ✅ Perfect | ✅ Perfect |
| Scaling | ✅ Auto | ✅ Auto | ⚠️ Manual/ASG | ✅ Auto | ✅ Auto |
| WebSocket Support | ✅ Ja | ⚠️ Complex | ✅ Ja | ✅ Ja | ✅ Ja |
| Learning Curve | ⚠️ Medium | ✅ Laag | ⚠️ Medium | ❌ Hoog | ✅ Laag |

**Beslissing: ECS Fargate (voorkeur) OF Elastic Beanstalk (alternatief)**

**Rationale voor ECS Fargate:**
1. **Serverless Containers**: Geen servers te managen, alleen Docker containers
2. **Predictable Costs**: Pay per vCPU/memory per uur, geen cold start surprise bills
3. **Perfect voor API's**: Long-running processes, WebSocket support
4. **Auto-Scaling**: Schalen based on CPU/memory/request count
5. **Integration**: Perfect integratie met RDS, S3, Cognito, CloudWatch
6. **Production-Ready**: Used by vele enterprise applicaties

**Elastic Beanstalk als alternatief:**
- Eenvoudiger setup (PaaS like Heroku)
- Minder Docker kennis vereist
- Automatic deployments met git push
- Good voor teams zonder DevOps expertise

**Why Not Lambda:**
- Cold starts zijn problematisch voor latency-sensitive API's
- 15 minuten execution limit is problematisch voor long-running tasks (rapportage generatie)
- Unpredictable costs bij high traffic

**Why Not EKS:**
- Overkill voor MVP schaal (500-2000 VVE's)
- Hoge operational complexity (Kubernetes expertise vereist)
- Premature optimization

**Beslissing**: Development/DevOps team kiest tussen Fargate (meer control) of Beanstalk (meer simpliciteit).

---

### 5.3 Authentication: AWS Cognito

**Alternatieven overwogen:**
- Auth0 (managed service)
- Custom JWT (self-built)
- Firebase Authentication
- Keycloak (self-hosted)

**Evaluatie:**

| Criterium | AWS Cognito | Auth0 | Custom JWT | Firebase | Keycloak |
|-----------|-------------|-------|------------|----------|----------|
| Managed Service | ✅ Ja | ✅ Ja | ❌ Nee | ✅ Ja | ❌ Self-hosted |
| AWS Integration | ✅ Native | ⚠️ External | ⚠️ External | ⚠️ External | ⚠️ External |
| Cost (MVP Scale) | ✅ Laag | ⚠️ Medium-High | ✅ Laag | ✅ Laag | ⚠️ Operational cost |
| 2FA Support | ✅ SMS, TOTP | ✅ SMS, TOTP, etc. | ❌ Custom build | ✅ SMS, Email | ✅ TOTP |
| Social Login | ✅ Google, FB, etc. | ✅ Vele providers | ❌ Custom | ✅ Vele providers | ✅ Via config |
| GDPR Compliance | ✅ EU data | ✅ EU data | ⚠️ Custom | ⚠️ US-based | ✅ Self-hosted |
| User Management | ✅ UI + API | ✅ Excellent UI | ❌ Custom build | ✅ Firebase Console | ✅ Admin Console |
| Learning Curve | ⚠️ Medium | ✅ Laag | ❌ Hoog | ✅ Laag | ⚠️ Medium-High |

**Beslissing: AWS Cognito**

**Rationale:**
1. **Native AWS Integration**: Perfect integratie met API Gateway, Lambda, ECS
2. **Cost-Effective**: First 50K MAU gratis, daarna €0.0055 per MAU (€275/maand voor 50K users = veel meer dan MVP schaal)
3. **Security Proven**: Bank-level security, SOC 2, ISO 27001
4. **2FA Built-In**: SMS en TOTP support out-of-the-box
5. **User Pool Management**: User management UI in AWS Console
6. **GDPR Compliant**: Data in EU (Frankfurt)
7. **No Operational Overhead**: Fully managed, no servers to maintain

**Why Not Auth0:**
- Significant costs bij schaal (€0.02-0.03 per MAU = €1000+/maand voor 50K users)
- Extra vendor (prefer single cloud provider voor MVP)

**Why Not Custom JWT:**
- Security risico's (authentication is hard to build correctly)
- Development tijd (2-4 weken)
- Operational overhead (password reset, 2FA, etc.)

**Trade-offs geaccepteerd:**
- Vendor lock-in met AWS (mitigatie: user data export mogelijk, migration pad naar Auth0/custom mogelijk)
- Learning curve (mitigatie: goede AWS documentatie, team leert snel)

---

### 5.4 File Storage: AWS S3

**Beslissing: AWS S3**

**Rationale:**
1. **Industry Standard**: Meest gebruikte object storage wereldwijd
2. **Unlimited Scalability**: Groei met product
3. **Cost-Effective**: €0.023 per GB/maand (storage) + €0.09 per GB (data transfer)
4. **Security**: Encryption at rest, fine-grained access control
5. **Integration**: Native integratie met CloudFront, Lambda, ECS
6. **Durability**: 99.999999999% (11 nines)
7. **Versioning**: Document versioning built-in

**Alternatieven**: Geen serieuze alternatieven binnen AWS ecosystem.

---

### 5.5 CDN: AWS CloudFront

**Beslissing: AWS CloudFront**

**Rationale:**
1. **Native S3 Integration**: Perfect voor serving static assets en documents
2. **EU Edge Locations**: Amsterdam, Frankfurt, London voor lage latency Nederland
3. **SSL/TLS Included**: Free SSL certificates via ACM
4. **Compression**: Automatic gzip/brotli compression
5. **Cost-Effective**: €0.085 per GB (first 10 TB)
6. **Security**: AWS Shield (DDoS protection), WAF integration

**Alternatieven overwogen:**
- Cloudflare (goedkoper maar extra vendor)
- Geen CDN (acceptabel voor MVP, maar CloudFront is goedkoop genoeg om te implementeren)

---

## 6. Supporting Tools & Services

### 6.1 Monitoring & Logging

**Beslissing: AWS CloudWatch (primary) + Sentry (error tracking)**

**Rationale:**
- **CloudWatch**: Native AWS integration, logs, metrics, alarms
- **Sentry**: Excellent error tracking, stack traces, user context
- **Cost**: CloudWatch binnen AWS free tier for MVP scale, Sentry free tier voldoende

**Alternatieven overwogen:**
- Datadog (excellent maar expensive voor MVP)
- New Relic (excellent maar expensive)
- ELK Stack (operational overhead, self-hosted)

---

### 6.2 CI/CD

**Beslissing: GitHub Actions**

**Rationale:**
- Integrated met GitHub repository
- Free voor private repos (2000 minuten/maand)
- Excellent ecosystem (actions marketplace)
- Simple YAML configuration

**Alternatieven:**
- GitLab CI (als GitLab gebruikt wordt)
- AWS CodePipeline (meer AWS lock-in)
- CircleCI (extra vendor)

---

### 6.3 Email Service

**Beslissing: AWS SES (Simple Email Service)**

**Rationale:**
- Cost-effective (€0.10 per 1000 emails)
- Native AWS integration
- Excellent deliverability
- EU region support

**Alternatieven:**
- SendGrid (extra vendor, duurder)
- Mailgun (extra vendor, duurder)
- Postmark (excellent maar premium pricing)

---

## 7. Stack Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│  React 18 + Next.js 14 + TypeScript 5                      │
│  (Hosted on AWS ECS Fargate / Elastic Beanstalk)           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS / REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                             │
│  Node.js 20 + TypeScript 5 + Express.js 4                  │
│  (Hosted on AWS ECS Fargate / Elastic Beanstalk)           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   AWS RDS    │     │  AWS Cognito │     │   AWS S3     │
│ PostgreSQL15 │     │    (Auth)    │     │  (Storage)   │
│  Multi-AZ    │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
                                                   │
                                                   │
                                                   ▼
                                          ┌──────────────┐
                                          │ CloudFront   │
                                          │    (CDN)     │
                                          └──────────────┘
```

---

## 8. Cost Estimatie (MVP Schaal: 500 VVE's, 10K Users)

### 8.1 AWS Infrastructure Costs (maandelijks)

| Service | Configuratie | Kosten |
|---------|--------------|--------|
| **ECS Fargate** | 2 tasks x 0.5 vCPU x 1GB RAM | €50 |
| **RDS PostgreSQL** | db.t3.medium Multi-AZ | €120 |
| **S3 Storage** | 100 GB (documents) | €3 |
| **CloudFront** | 500 GB data transfer | €40 |
| **Cognito** | 10K MAU | Gratis (< 50K) |
| **CloudWatch** | Logs + Metrics | €20 |
| **SES** | 50K emails/maand | €5 |
| **Data Transfer** | Out to internet | €30 |
| **TOTAAL** | | **~€270/maand** |

### 8.2 Third-Party Services

| Service | Kosten |
|---------|--------|
| **Sentry** (Error Tracking) | Gratis (< 5K events) |
| **GitHub** (private repo + Actions) | Gratis |
| **TOTAAL** | **€0/maand** |

### 8.3 Total Cost of Ownership (MVP)

**Maandelijkse Kosten: ~€270**
**Jaarlijkse Kosten: ~€3.240**

**Per VVE (500 VVE's): €6.48/maand**

**Notes:**
- Costs schalen redelijk lineair tot ~2000 VVE's
- Database is grootste kostenpost (kan geoptimaliseerd worden later)
- CloudFront costs schalen met traffic (maar CDN bespaart backend resources)

---

## 9. Risico's & Mitigaties

### Risico 1: AWS Vendor Lock-In

**Impact**: Migratie naar andere cloud provider is complex en duur

**Mitigatie:**
1. **Data Export**: Regular exports van database en S3 files
2. **Infrastructure as Code**: Terraform (cloud-agnostic) ipv CloudFormation
3. **API Abstraction Layer**: Backend code niet direct afhankelijk van AWS SDK's waar mogelijk
4. **Cognitive Lock-In Acceptatie**: Voor MVP is lock-in acceptabel voor snelheid

**Likelihood**: Hoog (we worden AWS-dependent)
**Acceptabel**: Ja, trade-off voor managed services en snelheid

---

### Risico 2: PostgreSQL RLS Performance

**Impact**: Row-Level Security policies kunnen query performance beïnvloeden bij schaal

**Mitigatie:**
1. **Proper Indexing**: tenant_id moet geïndexeerd zijn op alle tables
2. **Query Optimization**: EXPLAIN ANALYZE voor alle queries
3. **Monitoring**: CloudWatch alarms voor slow queries (>100ms)
4. **Fallback**: Application-level filtering als RLS te langzaam blijkt (maar minder veilig)

**Likelihood**: Laag (RLS is production-proven bij correcte indexing)
**Acceptabel**: Ja, monitoring en optimization plan aanwezig

---

### Risico 3: Node.js Single-Threaded Bottleneck

**Impact**: CPU-intensive workloads kunnen event loop blokkeren

**Mitigatie:**
1. **Async I/O**: Gebruik altijd async operations (geen sync file I/O)
2. **Worker Threads**: Voor CPU-intensive tasks (PDF generatie) use worker threads
3. **Horizontal Scaling**: Meerdere ECS tasks voor load balancing
4. **Offload**: Zware processing naar Lambda of background jobs

**Likelihood**: Laag (VVE Tooling workload is I/O-bound, niet CPU-bound)
**Acceptabel**: Ja, workload is geschikt voor Node.js

---

### Risico 4: Learning Curve Team

**Impact**: Team heeft tijd nodig om AWS/PostgreSQL/React te leren

**Mitigatie:**
1. **Training Budget**: €5.000 voor online courses (Udemy, Pluralsight, A Cloud Guru)
2. **Pair Programming**: Ervaren developers trainen juniors
3. **Documentation**: Internal wiki met best practices en patterns
4. **POC Phase**: 2-4 weken proof-of-concept om tech te valideren

**Likelihood**: Medium (afhankelijk van team samenstelling)
**Acceptabel**: Ja, investment in team capabilities

---

## 10. Alternatieve Stacks Overwogen

### 10.1 "Django Stack" (Python-based)

**Stack:** Python + Django + PostgreSQL + Azure + React

**Pro's:**
- Excellent admin panel (Django Admin) out-of-the-box
- Strong ORM (Django ORM)
- Python is populair voor data/analytics features (roadmap)

**Con's:**
- Geen full-stack TypeScript (minder code reuse)
- Python async is complexer dan Node.js
- Kleiner recruitment pool voor full-stack development
- **Frontend disconnect**: Developers moeten switchen tussen Python en TypeScript (mental overhead)
- **GitHub Copilot**: Score 9/10 vs 9.5/10 voor TypeScript (marginaal verschil)

**Beslissing**: Rejected - Full-stack TypeScript weegt zwaarder voor team velocity en developer experience

**Note**: Python zou excellent alternatief zijn als:
- Roadmap zwaar leunt op data analytics/ML
- Team heeft sterke Python expertise maar zwakke JavaScript kennis
- Accounting integrations vereisen Python libraries

---

### 10.2 "Microsoft Stack" (.NET-based)

**Stack:** C# + .NET 8 + SQL Server + Azure + React

**Pro's:**
- Excellent performance (.NET is fastest web framework)
- Strong typing (C#)
- Azure integration is seamless

**Con's:**
- Geen full-stack TypeScript
- Smaller recruitment pool (vooral enterprise developers)
- Windows-centric culture (hoewel .NET Core cross-platform is)

**Beslissing**: Rejected - Recruitment pool en full-stack TypeScript belangrijker

---

### 10.3 "Serverless Stack" (AWS Lambda-based)

**Stack:** Node.js + Lambda + DynamoDB + Cognito + React

**Pro's:**
- Ultra-scalable (automatic scaling)
- Pay-per-use (zeer cost-effective bij low traffic)
- Zero server management

**Con's:**
- Cold starts (latency issues)
- DynamoDB is NoSQL (VVE app is relational)
- Debugging complexity
- Vendor lock-in (zeer AWS-specific)

**Beslissing**: Rejected - Cold starts en relational data model mismatch

---

## 11. Technology Roadmap

### MVP (Q1-Q3 2026)
- ✅ Node.js + Express.js + PostgreSQL + AWS
- ✅ React + Next.js
- ✅ AWS Cognito authentication
- ✅ CloudWatch monitoring
- ✅ Sentry error tracking

### Fase 2 (Q4 2026 - Q2 2027)
- Redis caching layer (performance optimization)
- Full-text search (PostgreSQL FTS of ElasticSearch)
- Background job processing (AWS SQS + Lambda of Bull queue)
- Advanced monitoring (mogelijk Datadog upgrade)

### Fase 3 (Q3 2027+)
- Read replicas (database scaling)
- Multi-region deployment (uptime improvement)
- GraphQL layer (flexibility voor mobile apps)
- Microservices extraction (als monolith bottleneck wordt)

---

## 12. Developer Productivity & AI-Assisted Development

### 12.1 GitHub Copilot Impact op MVP Timeline

**Verwachte productivity gains met Copilot:**

| Development Activity | % van Tijd | Copilot Gain | Time Saved |
|---------------------|-----------|--------------|------------|
| **Boilerplate code** (CRUD, validation) | 25% | 70% sneller | ~4.5 weken |
| **Type definitions** en interfaces | 10% | 60% sneller | ~1.5 weken |
| **Test writing** (unit, integration) | 20% | 50% sneller | ~2.5 weken |
| **API documentation** (OpenAPI) | 5% | 60% sneller | ~0.8 weken |
| **Bug fixes** en debugging | 15% | 30% sneller | ~1.1 weken |
| **Complex business logic** | 25% | 20% sneller | ~1.3 weken |

**Totale verwachte time saving: ~11.7 weken over 26 weken MVP**
**Effectieve timeline met Copilot: ~14.3 weken (3.5 maanden)**

**Belangrijke disclaimer:**
- Deze gains zijn OPTIMISTISCH (gebaseerd op GitHub studies en anecdotal evidence)
- Real-world gains zijn vaak 20-40% lager (team moet leren Copilot effectief te gebruiken)
- **Conservatieve schatting: 6-8 weken besparing over 26 weken project**

**Business impact:**
```
MVP zonder Copilot:     26 weken × €12K/week = €312K
MVP met Copilot:        20 weken × €12K/week = €240K
Besparing:              €72K (23% cost reduction)
```

**Realistische verwachting:**
```
Conservatieve gains:    4 weken besparing
Cost impact:            22 weken × €12K = €264K
Besparing:              €48K (15% cost reduction)
```

### 12.2 TypeScript + Copilot Best Practices

**Om Copilot effectiviteit te maximaliseren:**

1. **Expliciete type definitions** overal:
   ```typescript
   // GOOD - Copilot krijgt volledige context
   interface CreateTransactionRequest {
     amount: number;
     category: TransactionCategory;
     vveId: string;
     description?: string;
   }
   
   // BAD - Copilot moet gokken
   function createTransaction(data: any) { ... }
   ```

2. **Descriptive function/variable namen**:
   ```typescript
   // GOOD - Copilot snapt intent
   async function calculateMonthlyContributionPerApartment(...)
   
   // BAD - Copilot kan niet helpen
   async function calc(...) 
   ```

3. **Inline comments voor complexe logica**:
   ```typescript
   // Calculate contribution using Dutch VVE splitsingssleutel formula
   // Formula: (total_amount × split_key) / sum_of_all_split_keys
   function calculateContribution(...) {
     // Copilot genereert accurate implementation
   }
   ```

4. **Shared types tussen frontend/backend**:
   ```typescript
   // packages/types/src/Transaction.ts
   export interface Transaction { ... }
   
   // Backend en frontend importeren zelfde type
   // → Copilot suggereert consistent code
   ```

5. **Test-driven prompts**:
   ```typescript
   // describe('calculateContribution', () => {
   //   test('should calculate contribution correctly', () => {
   //     // Copilot genereert test cases
   ```

### 12.3 Team Training op Copilot

**Vereist training:**
- Week 1: Copilot basics (shortcuts, acceptance, rejection)
- Week 2: Advanced prompting (comments, naming, context)
- Week 3: Test generation met Copilot
- Week 4: Debugging Copilot suggestions (false positives)

**ROI van training:**
```
Training cost:          1 week × 6 developers × €2K = €12K
Productivity gain:      4-8 weken besparing × €12K = €48-96K
Net benefit:            €36-84K
```

**Conclusie**: Training investment is zeer waard ✅

---

## 13. Beslissing & Sign-Off

**Status**: ACCEPTED ✅

**Besloten door**:
- Technical Lead / CTO
- Development Team Lead
- Product Manager (stakeholder)

**Datum**: 2026-01-26

**Volgende stappen**:
1. ✅ Technology stack documented (dit document)
2. ⏭️ Setup development environment (lokale Docker setup)
3. ⏭️ Create starter repositories (backend, frontend)
4. ⏭️ AWS account setup en infrastructure provisioning
5. ⏭️ Team training (AWS, PostgreSQL, React/Next.js)
6. ⏭️ POC development (2-4 weken)

---

## Bronverwijzingen

- `docs/architecture/principles/01-architectuurprincipes-kaders.md`
- `docs/architecture/constraints/01-randvoorwaarden-ux-development.md`
- `docs/architecture/discovery/01-architecturale-verkenning.md`
- `docs/product/discovery/01-probleemdefinitie-productrichting.md`
- `docs/product/strategy/01-productstrategie-keuzes.md`
