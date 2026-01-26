# PM Implications Summary - Architecture Decisions

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Product Management & Architecture
- **Status**: Final
- **Versie**: 1.0
- **Doel**: Samenvatting van business impact van architectuurbeslissingen

## Executive Summary

Dit document vat de product management implicaties samen van alle architectuurbeslissingen (Technology Stack + 5 ADR's). Het focus op:
- **Tijd**: Development estimates en planning impact
- **Kosten**: Infrastructure, licensing, operationele kosten
- **Resources**: Team hiring needs en expertise requirements
- **Risico's**: Business en technical risico's
- **Dependencies**: Externe partijen en tooling

**Bottom Line:**
- **MVP Timeline**: 6 maanden (Q1-Q3 2026) is realistisch met gekozen stack
- **Monthly Infrastructure Cost**: ~€300-350 voor MVP schaal (500 VVE's, 10K users)
- **Team Size**: 4-6 developers (2 backend, 2 frontend, 1 full-stack, 1 DevOps part-time)
- **External Dependencies**: AWS, Sentry, GitHub - allemaal reliable managed services

---

## 1. Time Impact (Development Estimates)

### 1.1 Technology Stack Learning Curve

| Component | Learning Time | Impact | Mitigation |
|-----------|---------------|--------|------------|
| **Node.js + TypeScript** | 1-2 weken | LOW | Meeste developers kennen JavaScript, TypeScript is gradual adoption |
| **React + Next.js** | 2-3 weken | LOW-MEDIUM | React is industry standard, Next.js heeft excellent docs |
| **PostgreSQL** | 1-2 weken | LOW | SQL is known, RLS is new maar goed gedocumenteerd |
| **AWS Services** | 3-4 weken | MEDIUM | ECS Fargate, RDS, Cognito - learning curve maar managed services |
| **Express.js** | 1 week | VERY LOW | Minimal framework, meeste developers kennen dit |
| **Prisma ORM** | 1-2 weken | LOW | Excellent documentation, intuitive API |

**Total Team Onboarding**: 4-6 weken parallel met requirements gathering

**Recommendation:**
- Start POC (Proof of Concept) in Week 1-2 om team hands-on ervaring te geven
- Pair programming: Ervaren developers trainen juniors
- Online courses budget: €2.000 (Udemy, Pluralsight, A Cloud Guru)

---

### 1.2 Development Timeline per ADR

#### ADR-001: Authentication & Authorization (RBAC)
**Estimated Time**: 8-10 weken

| Phase | Duration | Details |
|-------|----------|---------|
| AWS Cognito Setup | 1 week | User pool, app client, JWT configuration |
| Backend Auth Middleware | 2 weeks | JWT verification, RBAC implementation |
| Database Schema (roles) | 1 week | Users, vve_memberships, role_permissions tables |
| Frontend Auth Flow | 2 weeks | Login, signup, password reset, token management |
| Multi-VVE Switching | 1 week | VVE context switching logic |
| 2FA Implementation | 1 week | Optional feature (can defer to post-MVP) |
| Testing & Security Audit | 2 weeks | Integration tests, penetration testing |

**Critical Path**: Authentication blocks all feature development
**Recommendation**: Start this in Sprint 1, before other features

---

#### ADR-002: API Style (REST)
**Estimated Time**: 6-8 weken (parallel met features)

| Phase | Duration | Details |
|-------|----------|---------|
| OpenAPI Spec Definition | 1 week | Define all endpoints, request/response schemas |
| Express Router Setup | 1 week | Base API structure, versioning |
| Standard Middleware | 2 weeks | Error handling, validation, response formatting |
| TypeScript Type Generation | 1 week | openapi-typescript setup, CI/CD integration |
| Swagger UI Setup | 1 week | API documentation hosting |
| Frontend API Client | 1 week | Type-safe API client library |
| Testing | 1 week | Contract testing, integration tests |

**Critical Path**: API structure moet early in project defined worden
**Recommendation**: OpenAPI spec in Sprint 1-2, itereren tijdens development

---

#### ADR-003: Multi-Tenancy (PostgreSQL RLS)
**Estimated Time**: 4-6 weken

| Phase | Duration | Details |
|-------|----------|---------|
| Database Schema Design | 2 weeks | Add tenant_id to all tables, foreign keys |
| RLS Policies Implementation | 1 week | Create policies for all tables |
| Application Context Layer | 2 weeks | Tenant context middleware, database client |
| Prisma Integration | 1 week | Prisma client extension for RLS |
| Testing | 2 weeks | Tenant isolation tests (critical!) |

**Critical Path**: Database schema must be correct from start (migration pain later)
**Recommendation**: Complete in Sprint 2-3, before feature development scales

---

#### ADR-004: Caching Strategy
**Estimated Time**: 3-4 weken

| Phase | Duration | Details |
|-------|----------|---------|
| CloudFront Setup | 1 week | CDN configuration, S3 origin |
| HTTP Cache Headers | 1 week | Middleware for cache-control, ETag |
| In-Memory Cache | 1 week | Application cache implementation |
| Database Optimization | 2 weeks | Indexing, materialized views |
| Testing & Performance | 1 week | Load testing, cache hit rate measurement |

**Critical Path**: Can be done incrementally (not blocking)
**Recommendation**: Basic caching in MVP, advanced optimization post-launch

---

#### ADR-005: Observability & Logging
**Estimated Time**: 3-4 weken

| Phase | Duration | Details |
|-------|----------|---------|
| CloudWatch Setup | 1 week | Log groups, retention policies |
| Structured Logging | 1 week | Winston setup, log middleware |
| Sentry Integration | 1 week | Error tracking, source maps |
| Custom Metrics | 1 week | CloudWatch metrics, dashboards |
| Alarms & Alerting | 1 week | SNS topics, alarm configuration |
| Audit Logging | 1 week | Compliance audit trail |

**Critical Path**: Basic logging needed from day 1, advanced monitoring can be incremental
**Recommendation**: Basic setup in Sprint 1, full monitoring by Sprint 4-5

---

### 1.3 Total MVP Timeline

**Parallel Development Possible:**
- Backend Auth + Frontend Auth (different developers)
- API development + Frontend features (API-first approach)
- Caching + Observability (non-blocking optimizations)

**Sequential Dependencies:**
- Auth must complete before features (hard dependency)
- Database schema must be finalized early (migration pain)
- Multi-tenancy must be correct from start (security critical)

**Realistic Timeline:**

```
Sprint 1-2 (Week 1-4):  
  - Architecture setup
  - AWS infrastructure
  - Auth implementation START
  - Database schema design
  
Sprint 3-4 (Week 5-8):
  - Auth implementation COMPLETE
  - Multi-tenancy implementation
  - API structure definition
  - Core features START (transactions, VVE management)
  
Sprint 5-8 (Week 9-16):
  - Core features development
  - Frontend implementation
  - Caching layer
  - Testing
  
Sprint 9-10 (Week 17-20):
  - Advanced features (reports, documents)
  - Performance optimization
  - Security audit
  
Sprint 11-12 (Week 21-24):
  - Beta testing
  - Bug fixes
  - Documentation
  - Launch preparation

Total: 24 weken (6 maanden) voor MVP
```

**Recommendation**: Add 4-week buffer → **Target: End Q3 2026**

---

## 2. Cost Implications

### 2.1 Infrastructure Costs (Monthly)

#### MVP Schaal (500 VVE's, 10.000 users)

| Service | Configuration | Cost/Month |
|---------|--------------|------------|
| **AWS ECS Fargate** | 2 tasks x 0.5 vCPU x 1GB RAM | €50 |
| **AWS RDS PostgreSQL** | db.t3.medium Multi-AZ | €120 |
| **AWS S3** | 100 GB storage + requests | €5 |
| **AWS CloudFront** | 500 GB data transfer | €40 |
| **AWS Cognito** | 10K MAU | €0 (free tier) |
| **AWS CloudWatch** | Logs + Metrics | €20 |
| **AWS SES** | 50K emails/month | €5 |
| **Data Transfer** | Out to internet | €30 |
| **Sentry** | Error tracking | €0 (free tier 5K events) |
| **TOTAL** | | **~€270/month** |

**Breakdown:**
- Compute (ECS): 18%
- Database (RDS): 44% ← Grootste kostenpost
- Storage (S3): 2%
- CDN (CloudFront): 15%
- Other: 21%

---

#### Jaar 1 Scaling (End of Year: 1000 VVE's, 20K users)

| Service | Configuration | Cost/Month |
|---------|--------------|------------|
| **AWS ECS Fargate** | 4 tasks x 0.5 vCPU x 2GB RAM | €120 |
| **AWS RDS PostgreSQL** | db.t3.large Multi-AZ | €240 |
| **AWS S3** | 300 GB storage | €10 |
| **AWS CloudFront** | 2 TB data transfer | €150 |
| **AWS Cognito** | 20K MAU | €55 |
| **AWS CloudWatch** | Increased logs | €40 |
| **AWS SES** | 150K emails | €15 |
| **Data Transfer** | Increased | €70 |
| **Sentry** | Paid tier (50K events) | €26 |
| **TOTAL** | | **~€726/month** |

**Scaling Factor**: ~2.7x cost voor ~2x users (non-linear vanwege fixed costs)

---

#### Jaar 3 Projection (5000 VVE's, 100K users)

| Service | Cost/Month |
|---------|------------|
| **Compute** | €400 |
| **Database** | €800 (mogelijk read replicas) |
| **Storage** | €50 |
| **CDN** | €400 |
| **Other AWS** | €300 |
| **Third-Party Tools** | €150 |
| **TOTAL** | **~€2.100/month** |

**Per-VVE Cost:**
- MVP (500 VVE's): €0.54/VVE/month
- Year 1 (1000 VVE's): €0.73/VVE/month
- Year 3 (5000 VVE's): €0.42/VVE/month

**Economics**: Margins improve met schaal (fixed costs amortized)

---

### 2.2 Development & Tooling Costs

| Item | Cost | Frequency |
|------|------|-----------|
| **GitHub Team** | €4/user/month | Recurring |
| **AWS Free Tier** | €0 (year 1) | One-time |
| **Domain + SSL** | €50/year | Annual |
| **Development Tools** | €500 | One-time (licenses) |
| **Online Courses** | €2.000 | One-time (training) |
| **External Security Audit** | €5.000 | Annual |
| **Legal/Compliance Consult** | €3.000 | One-time |

**Year 1 Total Non-Recurring**: ~€10.500
**Year 1 Recurring**: ~€4.000/year

---

### 2.3 Personnel Costs (Indicative, Dutch Market)

| Role | FTE | Salary Range (Year) |
|------|-----|---------------------|
| **Senior Backend Developer** | 1.0 | €70-90K |
| **Senior Frontend Developer** | 1.0 | €65-85K |
| **Full-Stack Developer** | 1.0 | €60-80K |
| **Junior Developer** | 1.0 | €40-55K |
| **DevOps Engineer (part-time)** | 0.3 | €25-30K |
| **Product Manager** | 1.0 | €60-80K |
| **UX Designer** | 0.5 | €30-40K |

**Total Personnel (MVP Team)**: 5.8 FTE = €350-450K/year

**Alternative**: Use contractors/freelancers (flexibility but higher hourly rate)

---

## 3. Resource Needs (Team & Expertise)

### 3.1 Minimum Viable Team (MVP)

**Backend Team (2-3 developers):**
- **Must Have:**
  - Node.js + TypeScript experience
  - RESTful API design
  - PostgreSQL / relational databases
  - Authentication & security basics
- **Nice to Have:**
  - AWS experience (can be learned)
  - Multi-tenancy architecture experience

**Frontend Team (2 developers):**
- **Must Have:**
  - React experience
  - TypeScript
  - Responsive design (CSS/Tailwind)
  - API integration
- **Nice to Have:**
  - Next.js experience (can be learned)
  - Accessibility (WCAG) knowledge

**DevOps (0.3-0.5 FTE):**
- **Must Have:**
  - AWS (ECS, RDS, CloudFront)
  - CI/CD (GitHub Actions)
  - Infrastructure as Code (Terraform or CloudFormation)
- **Nice to Have:**
  - Docker/container experience
  - Monitoring setup (CloudWatch, Sentry)

**Product + Design (1.5 FTE):**
- Product Manager: 1.0 FTE
- UX Designer: 0.5 FTE (can scale down post-MVP)

---

### 3.2 Recruitment Strategy

**Phase 1: Core Team (Month 0-1)**
- Hire Senior Backend Lead (critical hire)
- Hire Senior Frontend Lead
- Engage part-time DevOps consultant

**Phase 2: Team Growth (Month 2-3)**
- Hire Full-Stack Developer
- Hire Junior Developer (cost-effective scaling)
- Optionally: UX Designer (or outsource)

**Phase 3: Post-MVP (Month 6+)**
- Scale team based on growth
- Specialize: Add dedicated QA, DevOps full-time

**Hiring Challenges:**
- TypeScript + React developers: HIGH availability (good)
- AWS + Multi-tenancy experience: MEDIUM availability
- Senior security-focused developers: LOW availability (expensive)

**Mitigation:**
- Offer training budget (€2-3K/developer)
- Flexible remote work
- Competitive salary (market rate or higher)
- Equity/options voor early hires

---

## 4. Risk Factors

### 4.1 Technical Risks

#### Risk 1: AWS Vendor Lock-In
**Impact**: HIGH (migratie naar andere cloud is expensive)
**Likelihood**: HIGH (we worden AWS-dependent)
**Mitigation**: 
- Accepteer lock-in voor MVP (trade-off voor snelheid)
- Data export strategie documented
- Infrastructure as Code (cloud-agnostic waar mogelijk)
**Cost if Realized**: €50-100K+ migratie kosten
**Acceptatie**: Ja - AWS is stable, unlikely need to migrate

---

#### Risk 2: Multi-Tenancy Security Breach
**Impact**: CRITICAL (reputatie schade, possible lawsuit)
**Likelihood**: LOW (met RLS + testing)
**Mitigation**:
- PostgreSQL RLS enforcement (database-level security)
- 100% test coverage tenant isolation
- External security audit (€5K/year)
- Penetration testing
**Cost if Realized**: €50-500K+ (legal, PR, customer refunds)
**Acceptatie**: NIET acceptabel - must prevent

**Investment Needed**: €10K/year (audits, testing, monitoring)

---

#### Risk 3: Performance Degradation at Scale
**Impact**: MEDIUM (user churn, bad reviews)
**Likelihood**: MEDIUM (if not monitored)
**Mitigation**:
- Performance monitoring (CloudWatch, Sentry)
- Load testing before launch
- Database indexing from day 1
- Caching layer
**Cost if Realized**: €20-50K (emergency optimization work)
**Acceptatie**: Nee - proactive monitoring prevents

---

#### Risk 4: Team Learning Curve Delays
**Impact**: MEDIUM (timeline slippage)
**Likelihood**: MEDIUM (new stack voor some devs)
**Mitigation**:
- 4-6 week onboarding period
- POC phase (learn by doing)
- Pair programming
- Training budget
**Cost if Realized**: 4-8 week delay = €40-80K personnel cost
**Acceptatie**: Ja - built into timeline (6 month + 4 week buffer)

---

### 4.2 Business Risks

#### Risk 5: Overbudget Infrastructure Costs
**Impact**: LOW (predictable costs)
**Likelihood**: LOW (managed services transparent pricing)
**Mitigation**:
- Monthly budget alerts (AWS Budgets)
- Cost dashboard monitoring
- Reserved instances (save 30-50% long-term)
**Cost if Realized**: 20-50% cost overrun = €50-150/month extra
**Acceptatie**: Ja - margins can absorb

---

#### Risk 6: Compliance Audit Failure (AVG)
**Impact**: HIGH (cannot launch without compliance)
**Likelihood**: LOW (architecture designed for AVG)
**Mitigation**:
- Legal/compliance consultant (€3K)
- Privacy by design from start
- Audit trail built-in
- External audit before launch
**Cost if Realized**: 2-4 week delay + €5-10K fixes
**Acceptatie**: Nee - must prevent (compliance is gate)

---

#### Risk 7: Key Person Dependency
**Impact**: HIGH (if Senior Lead leaves)
**Likelihood**: MEDIUM (startup environment)
**Mitigation**:
- Documentation culture
- Knowledge sharing (pair programming)
- Competitive compensation
- Equity incentives
**Cost if Realized**: 4-8 week replacement + ramp-up = €30-60K
**Acceptatie**: Moeten minimaliseren met retention strategy

---

## 5. External Dependencies

### 5.1 Critical Dependencies

| Dependency | Criticality | SLA/Reliability | Fallback |
|------------|-------------|-----------------|----------|
| **AWS (Infrastructure)** | CRITICAL | 99.99% | None (full dependency) |
| **AWS Cognito (Auth)** | CRITICAL | 99.99% | Could migrate to Auth0 (weeks) |
| **PostgreSQL RDS** | CRITICAL | 99.95% (Multi-AZ) | None in MVP |
| **Sentry** | MEDIUM | 99.9% | CloudWatch only (degraded DX) |
| **GitHub** | LOW | 99.95% | GitLab migration possible |

**Single Points of Failure:**
- AWS Region (eu-central-1): If region down, entire app down
- Cognito: If down, no logins (existing sessions work)
- RDS: If down, app down (no fallback in MVP)

**Mitigation:**
- Accept risk for MVP (99.5% uptime target, not 99.99%)
- Monitoring + fast response more cost-effective dan multi-region
- Post-MVP: Consider multi-region if uptime requirement increases

---

### 5.2 External Consultants/Services Needed

| Service | When Needed | Cost | Duration |
|---------|-------------|------|----------|
| **Legal/AVG Consultant** | Before launch | €3.000 | One-time |
| **Security Audit** | Before launch + annual | €5.000/year | Annual |
| **VVE Domain Expert** | Requirements phase | €2.000 | One-time |
| **Accountant Review** | Before launch | €1.500 | One-time |
| **DevOps Consultant** | Infrastructure setup | €5.000 | One-time |

**Total External Services**: €16.500 (year 1) + €5.000/year (ongoing audits)

---

## 6. Decision Impact Matrix

### Architecture Decisions Impact Summary

| Decision | Time Impact | Cost Impact | Risk Impact | Flexibility |
|----------|-------------|-------------|-------------|-------------|
| **Node.js/TypeScript Stack** | ✅ LOW (known tech) | ✅ LOW (open source) | ✅ LOW (proven) | ⚠️ MEDIUM (AWS lock-in) |
| **AWS Cloud Provider** | ⚠️ MEDIUM (learning) | ⚠️ MEDIUM (€300/mo) | ⚠️ MEDIUM (lock-in) | ⚠️ LOW (vendor lock-in) |
| **PostgreSQL + RLS** | ⚠️ MEDIUM (RLS new) | ✅ LOW (included) | ✅ LOW (proven tech) | ✅ HIGH (open source) |
| **REST API (not GraphQL)** | ✅ LOW (simple) | ✅ LOW (no extra tools) | ✅ LOW (known pattern) | ⚠️ MEDIUM (can add GraphQL later) |
| **AWS Cognito Auth** | ⚠️ MEDIUM (learning) | ✅ LOW (free tier) | ⚠️ MEDIUM (lock-in) | ⚠️ MEDIUM (can migrate) |
| **In-Memory Cache (no Redis)** | ✅ LOW (simple) | ✅ LOW (no extra cost) | ⚠️ MEDIUM (single server) | ✅ HIGH (can add Redis later) |
| **CloudWatch + Sentry** | ✅ LOW (managed) | ✅ LOW (€30/mo) | ✅ LOW (proven) | ⚠️ MEDIUM (can change) |

**Legend:**
- ✅ GREEN (Low Impact): No significant concerns
- ⚠️ YELLOW (Medium Impact): Manageable with planning
- ❌ RED (High Impact): Requires significant investment/risk

**Overall Assessment**: Gekozen architectuur is **balanced** tussen time-to-market, cost, en risk.

---

## 7. Recommendations & Action Items

### Immediate Actions (Week 1-2)

1. **Hire Senior Backend Lead** (critical)
   - Start recruitment immediately
   - Target: 1 month hiring process
   - Budget: €75-90K/year

2. **Setup AWS Account & Budget Alerts**
   - Prevent cost overruns
   - Monthly budget: €300 (MVP)
   - Alert at 80% threshold

3. **Legal/AVG Consultant Engagement**
   - Schedule for Month 2
   - Budget: €3.000
   - Deliverable: AVG compliance checklist

4. **Technology POC (Proof of Concept)**
   - 2-week sprint
   - Validate: PostgreSQL RLS, AWS Cognito, Next.js
   - Team learning by doing

---

### Planning Adjustments

**Original Target**: 3-6 maanden MVP  
**Realistic Target**: **6 maanden + 4 week buffer = Q3 2026 launch**

**Rationale:**
- Learning curve: 4-6 weken (built into timeline)
- Security audit: 2 weken (critical, cannot skip)
- Beta testing: 4 weken (quality gate)
- Buffer: 4 weken (risk mitigation)

**Milestones:**
- Month 1 (Feb 2026): Team hired, POC complete, requirements finalized
- Month 2 (Mar 2026): Infrastructure setup, auth implementation
- Month 3-4 (Apr-May 2026): Core features development
- Month 5 (Jun 2026): Advanced features, testing
- Month 6 (Jul 2026): Beta testing, bug fixes
- Month 7 (Aug 2026): Launch preparation, buffer
- **Launch: End August / Early September 2026**

---

### Budget Summary (Year 1)

| Category | Amount |
|----------|--------|
| **Infrastructure (12 months)** | €3.240 - €8.700 |
| **Personnel (6 months MVP)** | €175-225K |
| **External Services** | €16.500 |
| **Development Tools** | €2.500 |
| **Contingency (20%)** | €40.000 |
| **TOTAL YEAR 1** | **€237-292K** |

**Breakdown:**
- 75% Personnel
- 15% Infrastructure
- 7% External Services
- 3% Tools/Training

**Post-Launch (Monthly Recurring):**
- Infrastructure: €300-700/month (scaling)
- Personnel: €30-40K/month (ongoing)
- Total: €32-45K/month

---

## 8. Success Metrics (KPIs)

### Technical KPIs
- **Uptime**: >99.5% (monthly)
- **Page Load Time**: <2 seconds (p95)
- **API Response Time**: <500ms (p95)
- **Error Rate**: <1%
- **Security Incidents**: 0 (critical)

### Business KPIs
- **Infrastructure Cost per VVE**: <€1/month
- **Development Velocity**: 10-15 story points/sprint
- **Time to Market**: Launch by Q3 2026
- **Budget**: Within 10% of estimate (€237-292K)

### Quality KPIs
- **Code Coverage**: >70%
- **Security Audit**: Pass (no critical/high issues)
- **Performance Tests**: Pass (load testing 2000 concurrent users)
- **Uptime (Beta)**: >99% during beta period

---

## 9. Conclusion

**Gekozen architectuur is geschikt voor MVP:**

✅ **Time-to-Market**: 6 maanden is haalbaar met gekozen stack  
✅ **Cost-Effective**: €270-350/month infrastructure is binnen budget  
✅ **Low Risk**: Proven technologies, managed services, defense-in-depth security  
✅ **Scalable**: Architectuur ondersteunt groei tot 5000 VVE's zonder major refactor  
✅ **Team-Friendly**: Stack is learnable, breed recruitment pool  

**Critical Success Factors:**
1. Hire ervaren Backend Lead (Week 1-2)
2. Complete security audit before launch (non-negotiable)
3. Maintain 4-week buffer in timeline (risk mitigation)
4. Proactive monitoring vanaf dag 1 (prevent issues)

**Go/No-Go Decision**: **GO** ✅
- Architectuur is solid foundation voor MVP en beyond
- Risks zijn identified en mitigated
- Budget is realistic en defendable
- Timeline is achievable met proper planning

---

## Bronverwijzingen

- `docs/architecture/decisions/00-technology-stack-evaluation.md`
- `docs/architecture/decisions/ADR-001-authentication-authorization.md`
- `docs/architecture/decisions/ADR-002-api-style.md`
- `docs/architecture/decisions/ADR-003-multi-tenancy-implementation.md`
- `docs/architecture/decisions/ADR-004-caching-strategy.md`
- `docs/architecture/decisions/ADR-005-observability-logging.md`
- `docs/architecture/principles/01-architectuurprincipes-kaders.md`
- `docs/product/decisions/01-productbesluiten-aannames-randvoorwaarden.md`

---

**Approved By**: [PM Name], [CTO Name]  
**Date**: 2026-01-26  
**Next Review**: Monthly during MVP development
