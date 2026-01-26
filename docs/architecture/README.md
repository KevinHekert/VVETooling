# Architecturale Documentatie - VVE Tooling

## Overzicht

Deze map bevat de volledige architecturale documentatie voor VVE Tooling MVP. Alle documenten zijn gebaseerd op de Product Manager documentatie en expliciteren de technische haalbaarheid, kaders en risico's **zonder** oplossingsontwerp of detailimplementaties uit te werken.

## Documentstructuur

### 1. [Architecturale Verkenning](discovery/)
**Doel:** Analyse van productrichting en technische implicaties

- [01-architecturale-verkenning.md](discovery/01-architecturale-verkenning.md)
  - Analyse van aangeleverde productrichting en probleemdefinitie
  - Identificatie van technische implicaties van gekozen productdoelen
  - Benoeming van aannames, onzekerheden en open vragen
  - Volledige verwijzingen naar PM-documenten (herleidbaarheid)

### 2. [Architectuurprincipes & Kaders](principles/)
**Doel:** Vastleggen van niet-functionele randvoorwaarden en bewuste keuzes

- [01-architectuurprincipes-kaders.md](principles/01-architectuurprincipes-kaders.md)
  - 6 overkoepelende architectuurprincipes (Security by Design, Data Isolation, etc.)
  - Niet-functionele randvoorwaarden (Performance, Availability, Security, Scalability)
  - Bewuste keuzes: wat is vastgezet vs. wat is expliciet open gelaten
  - Kwaliteitsattributen en trade-off beslissingen
  - Compliance & regulatory constraints (AVG, VVE wetgeving)

### 3. [Risico's, Complexiteit & Afhankelijkheden](risks/)
**Doel:** Overzicht van technische risico's en impact op planning

- [01-risicos-complexiteit-afhankelijkheden.md](risks/01-risicos-complexiteit-afhankelijkheden.md)
  - Technische risico's (kritiek, hoog, gemiddeld)
  - Complexiteitsanalyse (architecturaal, operationeel)
  - Afhankelijkheden (intern, extern, team)
  - Impact op planning, onderhoud en doorontwikkeling
  - Mitigerende richtingen (zonder uitwerking)

### 4. [Randvoorwaarden voor UX en Development](constraints/)
**Doel:** Technische kaders en vrijheidsgraden voor UX en Development teams

- [01-randvoorwaarden-ux-development.md](constraints/01-randvoorwaarden-ux-development.md)
  - Technische constraints voor UX design (multi-tenancy awareness, role-based UI, mobile-first, etc.)
  - Technische constraints voor Development (multi-tenancy architectuur, RBAC, encryption, etc.)
  - Expliciete "no-go's" (absoluut niet toegestaan)
  - Bewust nog open (Development beslissingen)
  - Acceptance criteria voor MVP launch

### 5. [Architecture Decision Records (ADR's)](decisions/) ✨ **NIEUW**
**Doel:** Documentatie van technische beslissingen met rationale en alternatieven

- [README.md](decisions/README.md) - Overzicht van alle ADR's
- [00-technology-stack-evaluation.md](decisions/00-technology-stack-evaluation.md) - Volledige technology stack evaluatie
- [ADR-001: Authentication & Authorization](decisions/ADR-001-authentication-authorization.md) - AWS Cognito + RBAC
- [ADR-002: API Style](decisions/ADR-002-api-style.md) - RESTful API met OpenAPI
- [ADR-003: Multi-tenancy Implementation](decisions/ADR-003-multi-tenancy-implementation.md) - PostgreSQL RLS
- [ADR-004: Caching Strategy](decisions/ADR-004-caching-strategy.md) - Multi-layer caching
- [ADR-005: Observability & Logging](decisions/ADR-005-observability-logging.md) - CloudWatch + Sentry
- [PM-implications-summary.md](decisions/PM-implications-summary.md) - Tijd, kosten en resource implicaties

## Leeswijzer

### Voor Product Managers
1. Start met [Architecturale Verkenning](discovery/01-architecturale-verkenning.md) - valideer dat technische interpretatie van product requirements correct is
2. **NIEUW**: Lees [PM Implications Summary](decisions/PM-implications-summary.md) - tijd, kosten en resource impact van technische beslissingen
3. Review [Technology Stack](decisions/00-technology-stack-evaluation.md) Executive Summary - begrijp gekozen technologieën en rationale
4. Lees [Risico's](risks/01-risicos-complexiteit-afhankelijkheden.md) §3 "Afhankelijkheden" - actie vereist voor expert consultaties
5. Review [Constraints](constraints/01-randvoorwaarden-ux-development.md) §4.2 "Open Product Beslissingen" - beslissingen nodig

### Voor UX Designers
1. Start met [Constraints](constraints/01-randvoorwaarden-ux-development.md) §1 "Randvoorwaarden voor UX Design"
2. Let speciaal op constraints (MOET), vrijheidsgraden (MAG), en no-go's (NIET)
3. Review [Architectuurprincipes](principles/01-architectuurprincipes-kaders.md) §2.5 voor usability & accessibility requirements
4. **NIEUW**: Check [Technology Stack](decisions/00-technology-stack-evaluation.md) §3 Frontend voor React + Next.js + Tailwind CSS details

### Voor Development Teams
1. **START HIER**: [Technology Stack Evaluation](decisions/00-technology-stack-evaluation.md) - volledige stack beslissing
2. Lees alle [ADR's](decisions/) - Authentication, API, Multi-tenancy, Caching, Observability
3. Review [Architectuurprincipes](principles/01-architectuurprincipes-kaders.md) - begrijp overkoepelende principes
4. Lees [Constraints](constraints/01-randvoorwaarden-ux-development.md) §2 "Randvoorwaarden voor Development"
5. Review [Risico's](risks/01-risicos-complexiteit-afhankelijkheden.md) voor kritieke risico's en mitigaties
6. Bekijk [Verkenning](discovery/01-architecturale-verkenning.md) §3 voor open vragen die beantwoord moeten worden

### Voor Technical Leads / Architects
Lees alle documenten in volgorde:
1. [Architecturale Verkenning](discovery/01-architecturale-verkenning.md)
2. [Architectuurprincipes](principles/01-architectuurprincipes-kaders.md)
3. [Risico's](risks/01-risicos-complexiteit-afhankelijkheden.md)
4. [Constraints](constraints/01-randvoorwaarden-ux-development.md)
5. **NIEUW**: [Technology Stack Evaluation](decisions/00-technology-stack-evaluation.md)
6. **NIEUW**: Alle [ADR's](decisions/) voor implementatie details

## Kernboodschappen

### Technische Haalbaarheid
✅ **MVP is technisch haalbaar** binnen 3-6 maanden timeline (realistisch: 5-6 maanden)

**✨ Update: Met GitHub Copilot AI-assisted development:**
- **Conservatieve schatting**: 4 weken besparing → 22 weken (5 maanden)
- **Optimistische schatting**: 8 weken besparing → 18 weken (4 maanden)
- **Cost reduction**: €48K-72K development cost saving

**Grootste technische uitdagingen:**
1. Multi-tenancy + RBAC correcte implementatie (data isolation is kritiek)
2. VVE-specifieke berekeningen compliance
3. 99.5% uptime + <2sec performance targets

### Kritieke Risico's (Top 3)
1. 🔴 **Data Isolation Fout** - financiële data lekkage tussen VVE's
2. 🔴 **VVE Compliance Incorrect** - berekeningen niet volgens wetgeving
3. 🔴 **AVG Schending** - non-compliance met privacy wetgeving

### Kritieke Afhankelijkheden (Top 3)
1. **Expert Consultaties** (juridisch, AVG, financieel) - VOOR development start
2. **Technologie Stack Beslissing** - ASAP, blocker voor development
3. **Team Hiring** - Begin Q2 2026, impact op development velocity

### Architectuurprincipes (Top 6)
1. **Security & Privacy by Design** - non-negotiable
2. **Data Isolation is Absoluut** - geen cross-tenant data access
3. **Simpliciteit boven Perfectie** - MVP binnen 3-6 maanden
4. **Cloud-Native & Managed Services** - reduce operational complexity
5. **API-First Design** - voor toekomst-bestendigheid
6. **Observability is Mandatory** - voor 99.5% uptime

## Herleidbaarheid naar PM Documentatie

Alle architecturale documenten zijn volledig herleidbaar naar PM documentatie:

| Architectuur Document | Primaire Bron PM Document |
|----------------------|---------------------------|
| Architecturale Verkenning | [01-probleemdefinitie-productrichting.md](../product/discovery/01-probleemdefinitie-productrichting.md) |
| Architectuurprincipes | [01-productstrategie-keuzes.md](../product/strategy/01-productstrategie-keuzes.md) |
| Risico's & Afhankelijkheden | [01-mvp-epics.md](../backlog/epics/01-mvp-epics.md) |
| Constraints | Alle PM documenten + [01-ux-vraagstukken-validatie.md](../ux/discovery/01-ux-vraagstukken-validatie.md) |
| **Technology Stack** ✨ | Architectuurprincipes + Constraints + PM requirements |
| **ADR's** ✨ | Technology Stack + Architectuurprincipes |

## Gekozen Technology Stack ✨ **NIEUW**

**Volledige stack:**
- **Backend**: Node.js 20 + TypeScript 5 + Express.js 4
- **Frontend**: React 18 + Next.js 14 + TypeScript 5 + Tailwind CSS
- **Database**: PostgreSQL 15 (AWS RDS Multi-AZ)
- **Cloud**: AWS eu-central-1 Frankfurt (ECS Fargate)
- **Auth**: AWS Cognito
- **Storage**: AWS S3
- **CDN**: AWS CloudFront
- **Monitoring**: AWS CloudWatch + Sentry

**Rationale:**
1. **Full-stack TypeScript** → Shared types, geen context switch
2. **GitHub Copilot excellent** → TypeScript Score 9.5/10 (Python 9/10)
3. **Recruitment pool** → Grootste developer availability in NL
4. **Performance** → Alle targets haalbaar (<2s, <500ms, <100ms)
5. **AVG compliant** → AWS eu-central-1 voldoet aan EU data residency
6. **Managed services** → Operational simplicity, 99.5%+ uptime

Zie [Technology Stack Evaluation](decisions/00-technology-stack-evaluation.md) voor volledige details.

## Open Vragen & Actie Vereist

### Voor Product Manager (Prioriteit: HOOG)
1. ❓ Is Excel import in MVP scope? **→ BESLOTEN: NEE** (Fase 2)
2. ❓ Bewoner NAW-gegevens zichtbaarheid? **→ BESLOTEN: Beperkt + opt-in**
3. ❓ Audit logging granulariteit? **→ BESLOTEN: Financial + critical actions**
4. ❓ Document storage limits per VVE? **→ BESLOTEN: 5GB per VVE MVP**
5. ❓ Data retention na subscription cancellation? **→ BESLOTEN: 7 jaar archief**

~~**Actie:** Plan expert consultaties (juridisch, AVG, financieel) - kosten €6.000-14.000~~
**✅ COMPLEET:** Zie [PM Implications](decisions/PM-implications-summary.md) voor expert consultatie planning

### Voor Development Team (Prioriteit: HOOG)
1. ~~❓ Technologie stack keuze (taal, framework, database, cloud)~~ **✅ BESLOTEN**
2. ~~❓ API style (REST vs. GraphQL)~~ **✅ BESLOTEN: REST**
3. ~~❓ Authentication provider (custom vs. managed service)~~ **✅ BESLOTEN: AWS Cognito**
4. ~~❓ Caching strategie~~ **✅ BESLOTEN: Multi-layer (zie ADR-004)**

~~**Actie:** Technologie evaluatie en Architecture Decision Records (ADR's)~~
**✅ COMPLEET:** Alle technische beslissingen gedocumenteerd in [ADR's](decisions/)

### Voor UX Team (Prioriteit: GEMIDDELD)
1. Review constraints en vrijheidsgraden
2. Start design werk binnen architecturale kaders
3. Vragen/clarificaties naar Architecture team

## Documentatie Principes

Alle documenten in deze map volgen deze principes:

✅ **Zelfstandig leesbaar** - geen mondelinge toelichting nodig
✅ **Navolgbaar** - reasoning is gedocumenteerd
✅ **Herleidbaar** - bronverwijzingen naar PM documenten
✅ **Geen oplossingsontwerpen** - alleen kaders en principes
✅ **Expliciet over onzekerheden** - niet impliciet oplossen

## Changelog

| Datum | Versie | Wijziging |
|-------|--------|-----------|
| 2026-01-26 | 1.0 | Initiële versie - volledige architecturale documentatie |

## Contact

Voor vragen over deze architecturale documentatie:
- Architecture team (eigenaar van deze documenten)
- Technical Lead (technische vragen)
- Product Manager (product/scope vragen)
