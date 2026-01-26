# Architecture Decision Records (ADRs) - VVE Tooling

## Overzicht

Deze directory bevat alle Architecture Decision Records (ADR's) voor VVE Tooling MVP. ADR's documenteren belangrijke architecturale beslissingen met context, rationale, alternatieven en consequenties.

## Documentstructuur

### Technology Stack Evaluation
- **[00-technology-stack-evaluation.md](00-technology-stack-evaluation.md)** - Volledige evaluatie en keuze van technology stack

### Architecture Decision Records

1. **[ADR-001: Authentication & Authorization](ADR-001-authentication-authorization.md)**
   - Status: Accepted
   - Beslissing: AWS Cognito + Custom RBAC met PostgreSQL
   - Context: Multi-tenant applicatie met 3 gebruikersrollen vereist robuuste authenticatie en autorisatie

2. **[ADR-002: API Style](ADR-002-api-style.md)**
   - Status: Accepted
   - Beslissing: RESTful API met OpenAPI documentatie
   - Context: API-first design principe, toekomstige integraties en mobile apps

3. **[ADR-003: Multi-Tenancy Implementation](ADR-003-multi-tenancy-implementation.md)**
   - Status: Accepted
   - Beslissing: PostgreSQL Row-Level Security (RLS) + Application-level enforcement
   - Context: Absolute data isolation tussen VVE's is kritieke security requirement

4. **[ADR-004: Caching Strategy](ADR-004-caching-strategy.md)**
   - Status: Accepted
   - Beslissing: Multi-layer caching (CDN + HTTP + Application) zonder Redis in MVP
   - Context: Performance requirement <2 sec page load, <500ms API response

5. **[ADR-005: Observability & Logging](ADR-005-observability-logging.md)**
   - Status: Accepted
   - Beslissing: AWS CloudWatch + Sentry + Structured Logging
   - Context: 99.5% uptime SLA vereist proactive monitoring en debugging capability

### PM Implications
- **[PM-implications-summary.md](PM-implications-summary.md)** - Tijd, kosten en resource implicaties voor Product Management

## Gekozen Technology Stack (Summary)

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Backend Runtime** | Python 3.12 | Excellent DX, native Decimal, proven for financial apps |
| **Backend Language** | Python 3.12 | Superior DX (9.2/10), readability, debugging |
| **Backend Framework** | FastAPI | Modern, async, type hints, excellent DevX |
| **ORM** | SQLAlchemy 2.x | Battle-tested, async support, type-safe with Pydantic |
| **Frontend Framework** | Next.js 14.x | SSR, performance, image optimization |
| **Frontend Library** | React 18.x | Largest recruitment pool, mature ecosystem |
| **Frontend Language** | TypeScript 5.x | Type safety, shared types met backend |
| **Styling** | Tailwind CSS 3.x | Utility-first, performance optimized |
| **UI Components** | shadcn/ui | Accessible (WCAG 2.0), customizable |
| **Database** | PostgreSQL 15.x | ACID, Row-Level Security, proven |
| **Database Managed** | AWS RDS PostgreSQL | Automated backups, Multi-AZ, EU region |
| **Object Storage** | AWS S3 | Document storage, versioning |
| **Authentication** | AWS Cognito | Managed auth, OAuth 2.0, MFA support |
| **CDN** | AWS CloudFront | Performance, edge caching |
| **Hosting** | AWS ECS Fargate | Containers, auto-scaling, serverless |
| **Monitoring** | AWS CloudWatch + Sentry | Logs, metrics, error tracking |
| **Email** | AWS SES | Transactional email delivery |
| **Infrastructure** | Terraform | Infrastructure-as-Code |

## ADR Format

Alle ADR's volgen het standaard ADR format:

```markdown
# ADR-XXX: [Titel]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
[Waarom moet deze beslissing genomen worden? Wat is de achtergrond?]

## Decision
[Wat hebben we besloten? Duidelijke en concrete beslissing.]

## Consequences
### Positive
[Positieve gevolgen van deze beslissing]

### Negative
[Negatieve gevolgen en trade-offs]

## Alternatives Considered
[Welke alternatieven zijn overwogen en waarom afgewezen?]

## Implementation
[Hoe wordt dit geïmplementeerd? Praktische details.]

## Validation
[Hoe valideren we dat deze beslissing correct is?]

## References
[Links naar relevante documentatie, architectuurprincipes, etc.]
```

## Validation tegen Architectuurprincipes

Alle beslissingen zijn gevalideerd tegen de 6 overkoepelende architectuurprincipes:

| Principe | Validatie Status |
|----------|-----------------|
| **1. Security & Privacy by Design** | ✅ AWS Cognito, PostgreSQL RLS, encryption at rest/transit |
| **2. Data Isolation is Absoluut** | ✅ PostgreSQL RLS, Prisma middleware, automated testing |
| **3. Simpliciteit boven Perfectie** | ✅ Monolith, managed services, proven frameworks |
| **4. Cloud-Native & Managed Services** | ✅ AWS managed services (RDS, S3, Cognito, CloudWatch) |
| **5. API-First Design** | ✅ RESTful API, OpenAPI docs, versioning |
| **6. Observability is Mandatory** | ✅ CloudWatch, Sentry, structured logging, metrics |

Zie [../principles/01-architectuurprincipes-kaders.md](../principles/01-architectuurprincipes-kaders.md) voor details.

## Non-Functional Requirements Validatie

| Requirement | Target | Stack Capability | Status |
|------------|--------|------------------|--------|
| **Page Load Time** | <2 sec | Next.js SSR: 1.2-1.8s | ✅ |
| **API Response** | <500ms | Express + RDS: 200-400ms | ✅ |
| **DB Query Time** | <100ms | PostgreSQL indexed: 50-80ms | ✅ |
| **Uptime SLA** | 99.5% | RDS Multi-AZ 99.95% + ECS 99.99% | ✅ |
| **Scalability** | 500-5000 VVE's | Horizontal scaling supported | ✅ |
| **AVG Compliance** | EU data residency | AWS eu-central-1 Frankfurt | ✅ |
| **Security** | Bank-level | AWS ISO 27001 + SOC 2 | ✅ |

## Cost Summary (MVP Jaar 1)

**Infrastructure (AWS):**
- RDS PostgreSQL (Multi-AZ): €150/maand
- ECS Fargate: €60/maand
- S3 + CloudFront: €45/maand
- Cognito: €50/maand
- CloudWatch: €30/maand
- Overig: €23/maand
- **Totaal**: ~€358/maand (€4.300/jaar)

**Third-party Services:**
- Sentry (Error tracking): €26/maand
- **Totaal**: ~€27/maand (€324/jaar)

**Total Operational Cost Jaar 1**: €4.624/jaar

**Cost per VVE (500 VVE's)**: €0.77/maand

Zie [PM-implications-summary.md](PM-implications-summary.md) voor volledige cost breakdown.

## Timeline Impact

**MVP Development**: 26 weken (~6 maanden)
- Setup & Foundation: 2 weken
- Backend Foundation: 4 weken
- Frontend Foundation: 4 weken
- Core Features: 10 weken
- Testing & Optimization: 4 weken
- Launch Preparation: 2 weken

**Target Launch**: Eind Q3 2026 (met +4 weken buffer)

## Team Requirements

**Development Team (MVP):**
- 1× Technical Lead (Python/FastAPI expert)
- 2× Backend Developers (Python + PostgreSQL)
- 2× Frontend Developers (React + Next.js)
- 1× DevOps Engineer (AWS + Terraform)
- 1× QA Engineer (Automated testing)

**Total**: 6-7 FTE (inclusief PM, UX Designer)

## Risks & Mitigations

Zie individuele ADR's voor specifieke risico's en mitigaties per beslissing.

**Top 3 Technische Risico's:**
1. 🔴 **Data Isolation Fout** - Mitigatie: PostgreSQL RLS + automated testing
2. 🟡 **AWS Cost Overrun** - Mitigatie: Cost monitoring, budgets, right-sizing
3. 🟡 **Performance Issues** - Mitigatie: Caching strategie, database optimization

## Open Vragen & Toekomstige Beslissingen

**Opgelost in deze ADR's:**
- ✅ Technology stack keuze
- ✅ Authentication provider (AWS Cognito)
- ✅ API style (REST vs GraphQL)
- ✅ Multi-tenancy implementatie
- ✅ Caching strategie
- ✅ Observability tooling

**Nog te beslissen (tijdens development):**
- ❓ Exact ECS Fargate vs Elastic Beanstalk deployment (cost vs simplicity trade-off)
- ❓ Payment provider: Mollie (Dutch preference) vs Stripe (international)
- ❓ PDF generatie library: PDFKit vs Puppeteer vs dedicated service
- ❓ Email templates: Custom HTML vs SendGrid templates vs React Email

Deze beslissingen zijn minder kritiek en kunnen tijdens development gemaakt worden.

## Bronverwijzingen

Deze ADR's zijn gebaseerd op:
- [Architecture Principles](../principles/01-architectuurprincipes-kaders.md)
- [Architecture Constraints](../constraints/01-randvoorwaarden-ux-development.md)
- [Product Decisions](../../product/decisions/01-productbesluiten-aannames-randvoorwaarden.md)
- [Architecture Discovery](../discovery/01-architecturale-verkenning.md)

## Changelog

| Datum | Versie | Wijziging | Auteur |
|-------|--------|-----------|--------|
| 2026-01-26 | 1.0 | Initiële versie - Complete technology stack evaluatie en 5 ADR's | Development Team |

## Approval Status

- ✅ **Development Team**: Approved
- ✅ **Architecture**: Approved
- ⏳ **Product Manager**: Pending review (PM implications)
- ⏳ **Technical Lead**: Pending review

**Next Steps:**
1. PM review van implications (tijd/kosten)
2. Infrastructure setup starten (Terraform)
3. Team recruitment (job descriptions)
4. Expert consultaties plannen (juridisch, AVG, financieel)

---

**Vragen over deze beslissingen?**
Contact: Development Team of Architecture team
