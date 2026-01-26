# Risico's, Complexiteit en Afhankelijkheden - VVE Tooling MVP

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Architecture
- **Status**: Final
- **Versie**: 1.0
- **Doel**: Overzicht van technische risico's, complexiteit, afhankelijkheden en impact op planning

## Bronverwijzingen
Dit document is gebaseerd op:
- [docs/architecture/discovery/01-architecturale-verkenning.md](../discovery/01-architecturale-verkenning.md)
- [docs/architecture/principles/01-architectuurprincipes-kaders.md](../principles/01-architectuurprincipes-kaders.md)
- [docs/product/discovery/01-probleemdefinitie-productrichting.md](../../product/discovery/01-probleemdefinitie-productrichting.md)

## 1. Technische Risico's

### 1.1 Kritieke Risico's (P0 - Kunnen MVP Blokkeren)

#### Risico T-01: Data Isolation Fout 🔴

**Omschrijving:**
Een bug in multi-tenancy implementatie waardoor data van verschillende VVE's met elkaar gemengd of toegankelijk wordt.

**Impact:** KRITIEK
- Financiële data van VVE A zichtbaar voor VVE B
- AVG schending, mogelijke boetes tot €20 miljoen of 4% jaaromzet
- Reputatieschade die product kan doen falen
- Mogelijk wettelijke aansprakelijkheid

**Waarschijnlijkheid:** GEMIDDELD
- Multi-tenancy is complex
- Developers kunnen per ongeluk tenant_id filter vergeten in queries
- Testing van tenant isolation is lastig

**Mitigerende maatregelen:**
1. **Architectuur:**
   - Database row-level security (RLS) waar mogelijk
   - Tenant context object dat automatisch toegevoegd wordt aan alle queries
   - Code review checklist specifiek voor tenant isolation
   
2. **Testing:**
   - Automated integration tests die tenant isolation valideren (100% coverage)
   - Penetration testing specifiek gericht op tenant leakage
   - Manual security audit voor MVP launch
   
3. **Monitoring:**
   - Logging van alle database queries met tenant_id
   - Alerting bij ontbrekende tenant_id in queries
   - Regular audit van cross-tenant query patterns

**Detectie:**
- Automated tests falen bij tenant leakage
- Security audit detecteert kwetsbaarheid
- Monitoring detecteert abnormale cross-tenant query patterns

**Restrisico na mitigatie:** LAAG
Met goede architectuur, testing en monitoring is risico beheersbaar maar blijft aandacht vereisen.

**Eigenaar:** Development Lead + Security Engineer

**Bronverwijzing:** `docs/architecture/principles/01-architectuurprincipes-kaders.md` Principe 2

---

#### Risico T-02: VVE-Specifieke Berekeningen Incorrect 🔴

**Omschrijving:**
Berekeningen voor splitsingssleutels, reserves, of contributie zijn incorrect volgens Nederlandse VVE wetgeving.

**Impact:** HOOG
- VVE's betalen verkeerde contributie bedragen
- Jaarrekening klopt niet
- Juridische problemen voor VVE en mogelijk voor ons als platform aanbieder
- Reputatieschade: "De berekeningen kloppen niet"

**Waarschijnlijkheid:** GEMIDDELD-HOOG
- PM is geen VVE juridisch expert
- Development team kent VVE wetgeving niet
- Edge cases zijn moeilijk te voorspellen

**Mitigerende maatregelen:**
1. **Validatie:**
   - Consultatie met VVE juridisch expert VOOR development start
   - Review van berekeningen door ervaren penningmeester
   - Validatie met accountant die VVE's doet
   
2. **Testing:**
   - Test cases gebaseerd op real-world VVE voorbeelden
   - Edge case testing (oneven splitsingen, meerdere reserves, etc.)
   - Comparison testing: onze berekeningen vs. Excel berekeningen van penningmeester
   
3. **Transparantie:**
   - Toon berekeningslogica aan gebruiker (niet alleen uitkomst)
   - Disclaimer: software is tool, geen juridisch advies
   - Mogelijkheid voor penningmeester om handmatig te corrigeren

**Detectie:**
- Beta testing met echte penningmeesters
- User feedback: "Dit klopt niet"
- Accountant review tijdens beta

**Restrisico na mitigatie:** LAAG-GEMIDDELD
Met expert validatie en uitgebreide testing is risico beheersbaar, maar blijft mogelijk voor onbekende edge cases.

**Eigenaar:** Product Manager + Development Lead
**Actie:** Expert consultatie inplannen VOOR development start

**Bronverwijzing:** `docs/architecture/discovery/01-architecturale-verkenning.md` §3.2 Onzekerheid 2

---

#### Risico T-03: AVG Compliance Schending 🔴

**Omschrijving:**
Platform voldoet niet aan AVG vereisten, resulterend in compliance schending.

**Impact:** KRITIEK
- Boetes tot €20 miljoen of 4% jaaromzet
- Gedwongen shutdown van platform
- Reputatieschade
- Mogelijk individuele aansprakelijkheid directie

**Waarschijnlijkheid:** GEMIDDELD
- AVG is complex
- Development team is geen AVG expert
- Requirements kunnen over het hoofd gezien worden

**Mitigerende maatregelen:**
1. **Expertise:**
   - AVG specialist consultatie VOOR development start
   - Privacy impact assessment (PIA) voor platform
   - Legal review van privacy policy en terms of service
   
2. **Technisch:**
   - Data opslag in Nederlandse/EU datacenter (non-negotiable)
   - Encryption at rest en in transit
   - Data export functionaliteit (data portability)
   - Data deletion workflow (right to be forgotten)
   - Consent management voor cookies
   
3. **Proces:**
   - Privacy by design in development proces
   - Regular compliance reviews
   - Incident response plan voor data breaches

**Detectie:**
- AVG audit voor launch
- Regular compliance reviews
- User complaints over privacy

**Restrisico na mitigatie:** LAAG
Met AVG specialist en proper implementatie is risico beheersbaar.

**Eigenaar:** Product Manager + Legal
**Actie:** AVG specialist consultatie inplannen VOOR development start

**Bronverwijzing:** `docs/architecture/principles/01-architectuurprincipes-kaders.md` §5.1

---

### 1.2 Hoge Risico's (P1 - Kunnen Delay of Quality Impact Hebben)

#### Risico T-04: 99.5% Uptime Niet Halen 🟡

**Omschrijving:**
Platform heeft meer downtime dan 3.65 uur per maand (99.5% SLA).

**Impact:** GEMIDDELD-HOOG
- Frustratie bij gebruikers (vooral penningmeesters)
- Churn (gebruikers stoppen)
- Reputatieschade: "Platform is onbetrouwbaar"
- Mogelijk financiële compensatie verplicht

**Waarschijnlijkheid:** GEMIDDELD
- 99.5% is ambitieus voor startup zonder dedicated ops team
- Deployment issues, bugs, infrastructuur problemen kunnen downtime veroorzaken

**Mitigerende maatregelen:**
1. **Architectuur:**
   - Managed services met goede SLA's (cloud provider typically 99.9%+)
   - Health checks en auto-recovery
   - Graceful degradation (platform blijft deels werken bij partial outage)
   
2. **Proces:**
   - Staged rollouts (deploy naar kleine subset eerst)
   - Automated testing voor regression prevention
   - Rollback capability binnen 15 minuten
   - On-call rotation voor incident response
   
3. **Monitoring:**
   - Uptime monitoring (externe service, niet alleen internal)
   - Alerting bij downtime (SMS, phone call voor critical)
   - Status page voor gebruikers

**Detectie:**
- Uptime monitoring alerts
- User complaints: "Ik kan niet inloggen"
- Automated health checks fail

**Restrisico na mitigatie:** LAAG-GEMIDDELD
Met managed services en goede DevOps practices is 99.5% haalbaar, maar vereist discipline.

**Eigenaar:** DevOps Lead

**Bronverwijzing:** `docs/architecture/principles/01-architectuurprincipes-kaders.md` §2.2

---

#### Risico T-05: Performance Requirements Niet Halen (<2 sec) 🟡

**Omschrijving:**
Page load time is >2 seconden, resulterend in slechte gebruikerservaring.

**Impact:** GEMIDDELD
- Frustratie bij gebruikers, vooral mobiele gebruikers
- Lagere engagement en adoptie
- Slechte app store ratings (als later native apps)

**Waarschijnlijkheid:** GEMIDDELD
- <2 sec is ambitieus, vooral op mobiele netwerken (3G/4G)
- Frontend complexity (multiple roles, dashboards) kan performance beïnvloeden

**Mitigerende maatregelen:**
1. **Architectuur:**
   - Caching strategie (application, database, CDN)
   - Lazy loading van non-critical resources
   - Code splitting (load only wat nodig is per pagina)
   - Database query optimization en indexing
   
2. **Frontend:**
   - Minimale JavaScript bundle size (<500KB)
   - Image optimization (WebP, lazy loading)
   - Progressive rendering (show content incrementally)
   
3. **Monitoring:**
   - Real User Monitoring (RUM) voor actual gebruikerservaring
   - Performance budgets (max bundle size, max query time)
   - Synthetic monitoring voor key pages

**Detectie:**
- Performance monitoring shows page load >2 sec
- User feedback: "App is traag"
- Lighthouse/PageSpeed scores

**Restrisico na mitigatie:** LAAG
Met goede engineering practices is <2 sec haalbaar voor meeste users (95th percentile target).

**Eigenaar:** Frontend Lead + Backend Lead

**Bronverwijzing:** `docs/architecture/principles/01-architectuurprincipes-kaders.md` §2.1

---

#### Risico T-06: Technologie Stack Keuze Suboptimaal 🟡

**Omschrijving:**
Gekozen technologie stack is niet optimaal voor requirements, resulterend in development delays, performance issues, of recruitment problemen.

**Impact:** GEMIDDELD-HOOG
- Development velocity lager dan verwacht
- Moeilijk om goede developers te vinden
- Performance of scalability problemen
- Mogelijke re-platforming later (zeer kostbaar)

**Waarschijnlijkheid:** GEMIDDELD
- Stack keuze is complex met veel opties
- Trade-offs zijn niet altijd duidelijk upfront
- Team ervaring kan beperkt zijn met gekozen stack

**Mitigerende maatregelen:**
1. **Besluitvorming:**
   - Technologie evaluatie met duidelijke criteria (performance, scalability, community, recruitment)
   - Proof of concept voor kritieke componenten
   - Team input (developers moeten comfortable zijn met stack)
   
2. **Risk reduction:**
   - Kies proven, mature technologieën (niet bleeding edge)
   - Kies technologieën met sterke Nederlandse developer pool
   - Avoid vendor lock-in waar mogelijk (abstractie layers)
   
3. **Validatie:**
   - Prototype kritieke features vroeg (multi-tenancy, RBAC)
   - Performance testing vroeg in development
   - Recruitment test (kunnen we developers vinden?)

**Detectie:**
- Development velocity lager dan verwacht
- Performance problemen in testing
- Moeilijk om developers te recruiten

**Restrisico na mitigatie:** LAAG-GEMIDDELD
Met zorgvuldige evaluatie en proven technologies is risico beheersbaar.

**Eigenaar:** Technical Lead + Development Team

**Bronverwijzing:** `docs/architecture/principles/01-architectuurprincipes-kaders.md` §3.2

---

### 1.3 Gemiddelde Risico's (P2 - Beheersbaar, Monitoring Vereist)

#### Risico T-07: Piekbelasting Tijdens Maandafsluiting 🟡

**Omschrijving:**
Veel VVE's sluiten maand af rond dezelfde tijd (begin/eind maand), resulterend in piekbelasting.

**Impact:** LAAG-GEMIDDELD
- Tijdelijke performance degradatie
- Mogelijke timeouts of errors
- Frustratie bij gebruikers

**Waarschijnlijkheid:** HOOG
- Maandafsluiting is natuurlijk moment (eind maand)
- Penningmeesters hebben vergelijkbare routines

**Mitigerende maatregelen:**
- Auto-scaling infrastructuur
- Load testing specifiek voor piekbelasting scenario's
- Monitoring van traffic patterns
- Graceful degradation (queue non-critical tasks)

**Eigenaar:** DevOps Lead

---

#### Risico T-08: Data Migratie van Excel Complex 🟡

**Omschrijving:**
Als Excel import feature toegevoegd wordt (huidige status: unclear), kan data migratie complex zijn.

**Impact:** LAAG-GEMIDDELD
- Moeilijke onboarding voor bestaande penningmeesters
- Mogelijke data quality issues
- Support load verhoogd

**Waarschijnlijkheid:** ONBEKEND
- PM heeft nog niet besloten of Excel import MVP requirement is
- Complexiteit afhankelijk van Excel format variabiliteit

**Mitigerende maatregelen:**
- **Eerst:** Clarificatie van PM of Excel import in MVP scope is
- Als JA: Template Excel format voor gebruikers
- Data validatie en preview voor import
- Manual data entry als fallback

**Eigenaar:** Product Manager (scope decision)

**Actie:** PM moet beslissen of Excel import in MVP scope is

**Bronverwijzing:** `docs/architecture/discovery/01-architecturale-verkenning.md` §3.2 Onzekerheid 3

---

#### Risico T-09: Third-Party Service Dependencies 🟡

**Omschrijving:**
Platform is afhankelijk van third-party services (payment provider, email service, cloud provider) die kunnen falen of duur worden.

**Impact:** LAAG-GEMIDDELD
- Downtime als third-party service faalt
- Cost overruns als pricing verandert
- Vendor lock-in

**Waarschijnlijkheid:** LAAG
- Managed services zijn typically betrouwbaar
- Pricing is meestal transparant en stable

**Mitigerende maatregelen:**
- Kies betrouwbare providers met goede SLA's
- Abstractie layers voor kritieke dependencies (makkelijker om te switchen)
- Monitoring van third-party service health
- Budget alerting voor cost overruns
- Fallback opties waar mogelijk (bijv. meerdere email providers)

**Eigenaar:** Technical Lead

---

## 2. Complexiteit Analyse

### 2.1 Architecturale Complexiteit

**Hoge Complexiteit Gebieden:**

1. **Multi-Tenancy + RBAC**
   - Complexiteit: HOOG
   - Rationale: Data isolation + role-based permissions is complex patroon
   - Impact op timeline: +20-30% development tijd vs. single-user app
   - Mitigatie: Gebruik proven patterns, frameworks met RBAC support

2. **VVE-Specifieke Berekeningen**
   - Complexiteit: GEMIDDELD-HOOG
   - Rationale: Domein-specifieke logica, veel edge cases
   - Impact op timeline: Afhankelijk van expert validatie en testing
   - Mitigatie: Expert consultatie, extensive testing, transparante berekeningslogica

3. **Multi-Device Responsive Design**
   - Complexiteit: GEMIDDELD
   - Rationale: Verschillende layouts en interactions per device type
   - Impact op timeline: +15-20% frontend development tijd
   - Mitigatie: Mobile-first approach, component library met responsive components

**Lage Complexiteit Gebieden:**

1. **CRUD Operaties (Transactions, Documents)**
   - Complexiteit: LAAG
   - Rationale: Standaard database operaties
   
2. **PDF Rapportages**
   - Complexiteit: LAAG-GEMIDDELD
   - Rationale: Libraries beschikbaar (jsPDF, pdfmake, etc.)
   
3. **Payment Integratie**
   - Complexiteit: LAAG
   - Rationale: Payment providers (Mollie, Stripe) hebben goede SDK's

### 2.2 Operationele Complexiteit

**DevOps Complexiteit:**
- Deployment: GEMIDDELD (managed services reduceren complexiteit)
- Monitoring: GEMIDDELD (tools beschikbaar, maar setup vereist)
- Security: HOOG (bank-level security, AVG compliance vereist expertise)
- Backup/Recovery: LAAG-GEMIDDELD (managed services helpen, maar strategie vereist)

**Support Complexiteit:**
- Multi-user platform = meer support vragen verwacht (3 rollen, verschillende use cases)
- VVE-specifieke domein kennis vereist voor support team
- Mitigatie: Goede documentation, onboarding wizard, FAQ, video tutorials

### 2.3 Timeline Impact

**Geschatte timeline impact door complexiteit:**

**Base MVP (single-user, basic features):** 3 maanden (12 weken)
**+Multi-tenancy/RBAC:** +4-6 weken
**+VVE-specifieke features:** +2-4 weken
**+Multi-device responsive:** +2-3 weken
**+Security/Compliance (AVG, bank-level):** +2-3 weken
**+Testing/QA:** +2-4 weken

**Totaal toevoegingen:** +12-20 weken (3-5 maanden)
**Totaal geschat:** 6-8 maanden voor MVP

Dit is aan de hogere kant van PM schatting van 3-6 maanden. Realistisch is 5-6 maanden met ervaren team en scherpe scope discipline, of 7-8 maanden met minder ervaring of scope creep.

**Bronverwijzing:** `docs/product/strategy/01-productstrategie-keuzes.md` §5 Roadmap

---

## 3. Afhankelijkheden

### 3.1 Interne Afhankelijkheden

#### Afhankelijkheid I-01: Product Management Requirements Finalization

**Omschrijving:**
Development kan niet starten zonder finalized requirements van PM.

**Kritieke open vragen:**
1. Is Excel import in MVP scope? (Impact op ontwikkeltijd)
2. Welke privacy instellingen voor bewoners? (NAW-gegevens zichtbaarheid)
3. Wat is audit logging granulariteit? (Alles loggen of alleen financieel?)
4. Document storage limits per VVE?
5. Data retention na subscription cancellation?

**Impact als niet resolved:**
- Scope creep tijdens development
- Re-work nodig
- Timeline delay (geschat 2-4 weken)

**Eigenaar:** Product Manager
**Deadline:** VOOR development start (uiterlijk eind Q1 2026)

**Bronverwijzing:** `docs/architecture/discovery/01-architecturale-verkenning.md` §3.3

---

#### Afhankelijkheid I-02: UX Design Compleet

**Omschrijving:**
Frontend development is afhankelijk van UX designs voor alle 3 rollen (penningmeester, bestuurslid, bewoner).

**Vereisten:**
- Wireframes voor alle key screens
- Design system (components, colors, typography)
- User flows voor critical paths (onboarding, transactie toevoegen, rapportage genereren)
- Mobile designs (bewoner dashboard vooral mobiel)

**Impact als niet resolved:**
- Frontend development kan niet starten
- Risk van re-work als designs laat veranderen
- Timeline delay (geschat 2-4 weken)

**Eigenaar:** UX Designer
**Deadline:** Voor frontend development start (Q2 2026)

---

#### Afhankelijkheid I-03: Technologie Stack Beslissing

**Omschrijving:**
Development kan niet starten zonder beslissing over technologie stack.

**Beslissingen nodig:**
- Programming language(s)
- Frontend framework
- Backend framework
- Database
- Cloud provider
- Authentication provider

**Impact als delayed:**
- Development kan niet starten
- Timeline delay (elke week delay = 1 week timeline delay)

**Eigenaar:** Technical Lead + Development Team
**Deadline:** Eind Q1 2026 (ASAP)

**Proces:**
1. Evaluatie criteria vaststellen (performance, scalability, recruitment, cost)
2. Proof of concepts voor kritieke componenten
3. Team alignment en decision
4. Documentation van decision rationale

---

### 3.2 Externe Afhankelijkheden

#### Afhankelijkheid E-01: Juridisch/Compliance Expert Consultatie

**Omschrijving:**
VVE-specifieke berekeningen en compliance vereisten moeten gevalideerd worden door experts.

**Vereiste expertise:**
1. **VVE Juridisch Expert:**
   - Validatie van splitsingssleutel berekeningen
   - Jaarrekening format compliance (Model A)
   - Data retention requirements
   - VVE wetgeving edge cases

2. **AVG Specialist:**
   - Privacy impact assessment
   - AVG compliance review
   - Privacy policy drafting
   - Cookie consent strategie

3. **Financieel/Accountant:**
   - Boekhouding regels voor VVE's
   - Rapportage formats
   - Reserve beheer best practices

**Impact als not done:**
- KRITIEK risico van compliance schendingen
- Mogelijk juridische problemen
- Re-work nodig als later problemen ontdekt

**Timeline impact:**
- Expert consultatie: 2-4 weken
- Implementation van bevindingen: 1-3 weken
- Re-validation: 1 week

**Eigenaar:** Product Manager (arrange consultations)
**Deadline:** Voor development start (Q1 2026)

**Kosten schatting:**
- VVE juridisch expert: €2.000-5.000
- AVG specialist: €3.000-7.000
- Accountant consultatie: €1.000-2.000
- **Totaal: €6.000-14.000**

**Bronverwijzing:** `docs/architecture/discovery/01-architecturale-verkenning.md` §3.1, §3.2

---

#### Afhankelijkheid E-02: Cloud Provider Setup

**Omschrijving:**
Infrastructuur moet opgezet worden bij gekozen cloud provider.

**Vereisten:**
- Cloud provider account (AWS, Azure, of GCP)
- Budgetten en billing setup
- Nederlandse/EU datacenter selectie (AVG requirement)
- Network configuratie (VPC, subnets, security groups)
- IAM setup (users, roles, permissions)

**Timeline:**
- Account setup: 1-2 dagen
- Infrastructure as Code (Terraform/CloudFormation): 1-2 weken
- Security hardening: 1 week
- Monitoring setup: 1 week

**Eigenaar:** DevOps Lead
**Deadline:** Voor development environment setup (begin Q2 2026)

---

#### Afhankelijkheid E-03: Third-Party Service Accounts

**Omschrijving:**
Accounts en integraties met third-party services.

**Vereiste services:**
1. **Payment Provider** (Mollie, Stripe)
   - Account setup
   - KYC verification (kan 1-2 weken duren)
   - Test environment setup
   
2. **Email Service** (SendGrid, Mailgun, AWS SES)
   - Account setup
   - Domain verification en SPF/DKIM setup
   - Template setup
   
3. **Monitoring/Logging** (Datadog, New Relic, CloudWatch)
   - Account setup
   - Agent installation
   - Dashboard configuratie

**Timeline:**
- Account setups: 1 week
- KYC verification: 1-2 weken (voor payment provider)
- Integration development: 1-2 weken per service

**Eigenaar:** DevOps Lead + Backend Lead
**Deadline:** Voor beta testing (mid Q2 2026)

---

#### Afhankelijkheid E-04: Beta Testers Recruitment

**Omschrijving:**
Beta testing vereist real VVE's met echte data.

**Vereisten:**
- Target: 50 VVE's voor private beta
- Diversiteit: klein (5-10 apt), middel (20-30 apt), groot (50+ apt)
- Mix van penningmeesters (ervaren vs. nieuwe, tech-savvy vs. niet)
- Bereidheid om feedback te geven

**Timeline:**
- Recruitment: 4-6 weken
- Onboarding: 2 weken
- Testing period: 4-6 weken

**Eigenaar:** Product Manager
**Deadline:** Beta recruitment start eind Q1 2026 (voor Q2 beta launch)

**Bronverwijzing:** `docs/product/strategy/01-productstrategie-keuzes.md` §5 Q2 milestones

---

### 3.3 Team Afhankelijkheden

#### Afhankelijkheid T-01: Team Hiring

**Omschrijving:**
MVP development vereist volledige development team.

**Minimale team (aangenomen):**
- 1x Technical Lead / Full-stack Developer
- 1-2x Backend Developer
- 1-2x Frontend Developer
- 1x UX Designer
- 0.5x DevOps Engineer (part-time of shared)
- 0.5x QA Engineer (part-time of shared)

**Timeline impact als team incomplete:**
- Elke ontbrekende developer = 20-30% timeline delay
- Technical lead is kritiek (missing = project blocked)

**Eigenaar:** Hiring Manager / Founder
**Deadline:** Team compleet voor development start (begin Q2 2026)

---

#### Afhankelijkheid T-02: Team Onboarding & Training

**Omschrijving:**
Team moet opgeleind worden in VVE domein en gekozen technologie stack.

**Vereist:**
- VVE domein training (wat is VVE, splitsingen, reserves, jaarrekening)
- Technologie stack training (als nieuwe technologie)
- Security & compliance training (AVG, bank-level security)
- Development proces training (git workflow, code review, testing)

**Timeline:**
- VVE domein training: 1 week
- Stack training: 1-2 weken (als nieuw voor team)
- Security training: 1 week
- Proces setup: 1 week

**Impact op timeline:**
- +2-4 weken voor team ramp-up

**Eigenaar:** Technical Lead + Product Manager
**Deadline:** Voor development start

---

## 4. Impact Analyse

### 4.1 Impact op Planning

**Kritieke pad items:**
1. **Expert consultaties** (juridisch, AVG) - MOET voor development start
   - Timeline: 4-6 weken
   - Blocker: Development kan starten maar risico op re-work
   
2. **Technologie stack beslissing** - MOET voor development start
   - Timeline: 2-3 weken
   - Blocker: Absolute blocker voor development
   
3. **UX designs** - MOET voor frontend development
   - Timeline: 4-6 weken
   - Blocker: Frontend development kan niet starten
   
4. **Team hiring** - MOET voor development
   - Timeline: 6-8 weken (recruitment is langzaam)
   - Blocker: Development velocity afhankelijk van team grootte

**Parallel pad items (kunnen tegelijkertijd):**
- Cloud provider setup (tijdens development)
- Third-party service accounts (tijdens development)
- Beta recruitment (tijdens development, voor beta phase)

**Geschatte timeline met afhankelijkheden:**
- Q1 2026: Expert consultaties, stack decision, UX design, team hiring
- Q2 2026: Development (4-5 maanden met volledige team)
- Q3 2026: Beta testing, iteration (1-2 maanden)
- Q4 2026: Public launch

**Realistische MVP launch:** Q3-Q4 2026 (PM target: Q2-Q3 2026, mogelijk 1 quarter delay)

### 4.2 Impact op Onderhoud

**Post-Launch Onderhoud Vereisten:**

**Operationeel:**
- 24/7 monitoring (on-call rotation nodig voor 99.5% uptime)
- Regular security patches (weekly/monthly)
- Database backups monitoring
- Performance monitoring en optimization

**Functioneel:**
- Bug fixes (prioritized by severity)
- User support (expected load: 5-10% van gebruikers per maand)
- Feature updates (roadmap items)

**Compliance:**
- AVG compliance reviews (jaarlijks minimaal)
- Security audits (jaarlijks minimaal)
- Data retention policy enforcement

**Geschatte onderhoud FTE:**
- 0.5-1 FTE DevOps
- 1-2 FTE Development (bug fixes, features)
- 1 FTE Support (voor 500 VVE's)

### 4.3 Impact op Doorontwikkeling

**Roadmap Impact:**

**Fase 2 Items (Jaar 1 Q3-Q4):**
- Native mobile apps: +4-6 maanden development
  - Afhankelijk van: API-first architecture (mitigated)
  - Complexiteit: Gemiddeld (reuse business logic)
  
- Bank API integraties: +2-3 maanden development
  - Afhankelijk van: PSD2 compliance, bank partnerships
  - Complexiteit: Hoog (bank API's zijn complex, security kritiek)

**Fase 3 Items (Jaar 2):**
- Multi-VVE beheer (beheerders platform): +6-9 maanden
  - Afhankelijk van: Scalability van huidige architectuur
  - Complexiteit: Hoog (nieuwe user type, veel nieuwe features)

**Technische schuld risico:**
- Als MVP gebouwd wordt met te veel shortcuts, refactoring nodig voor Fase 2/3
- Mitigatie: Goede architectuurprincipes vanaf dag 1, maar accepteer dat refactoring nodig zal zijn

**Bronverwijzing:** `docs/product/strategy/01-productstrategie-keuzes.md` §5 Roadmap

---

## 5. Mitigerende Richtingen (Zonder Uitwerking)

### 5.1 Risico Mitigatie Richtingen

**Voor Data Isolation Risico:**
- Richting: Database row-level security (RLS) implementeren
- Richting: Tenant context abstractions in applicatie code
- Richting: Extensive automated testing voor tenant isolation

**Voor Compliance Risico's:**
- Richting: Expert consultaties vroeg in proces (VOOR development)
- Richting: Compliance-first development approach (niet "we fixen het later")
- Richting: Regular audits (jaarlijks minimaal)

**Voor Performance Risico's:**
- Richting: Performance testing vanaf dag 1 (niet pas voor launch)
- Richting: Caching strategie (multiple levels)
- Richting: Database optimization (indexing, query optimization)

### 5.2 Complexiteit Reductie Richtingen

**Voor Multi-Tenancy Complexiteit:**
- Richting: Gebruik frameworks/libraries met multi-tenancy support
- Richting: Code generators voor repetitive tenant-aware code
- Richting: Strikte code review proces

**Voor VVE-Specifieke Complexiteit:**
- Richting: Domain expert validatie vroeg en vaak
- Richting: Extensive testing met real-world scenarios
- Richting: Transparante berekeningslogica (gebruiker kan zien hoe berekend is)

**Voor Operationele Complexiteit:**
- Richting: Maximaal gebruik van managed services
- Richting: Infrastructure as Code (IaC) voor reproducibility
- Richting: Automated deployment pipelines

### 5.3 Afhankelijkheid Reductie Richtingen

**Voor Expert Afhankelijkheden:**
- Richting: Expert consultaties zo vroeg mogelijk inplannen
- Richting: Document bevindingen goed (voor toekomstige referentie)
- Richting: Retainer met experts voor ongoing consultatie

**Voor Third-Party Afhankelijkheden:**
- Richting: Abstractie layers voor kritieke dependencies
- Richting: Fallback opties waar mogelijk
- Richting: Monitoring van third-party service health

**Voor Team Afhankelijkheden:**
- Richting: Start hiring vroeg (recruitment duurt lang)
- Richting: Cross-training team members (reduce single points of failure)
- Richting: Goede documentation (reduce dependency op individual knowledge)

---

## 6. Samenvatting

### Kritieke Risico's (Top 3)
1. **Data Isolation Fout** (impact: KRITIEK, mitigatie: architectuur + testing + monitoring)
2. **VVE Compliance Incorrect** (impact: HOOG, mitigatie: expert consultatie + validatie)
3. **AVG Schending** (impact: KRITIEK, mitigatie: specialist consultatie + compliance proces)

### Kritieke Afhankelijkheden (Top 3)
1. **Expert Consultaties** (juridisch, AVG, financieel) - VOOR development start
2. **Technologie Stack Beslissing** - ASAP, blocker voor development
3. **Team Hiring** - Begin Q2 2026, impact op development velocity

### Grootste Complexiteit
- **Multi-Tenancy + RBAC:** +20-30% development tijd
- **VVE-Specifieke Features:** Afhankelijk van expert validatie
- **Security/Compliance:** Vereist expertise, kan niet shortcut

### Timeline Impact
- **Realistische MVP timeline:** 5-6 maanden (PM schatting 3-6 maanden)
- **Kritieke pad:** Expert consultaties (6 weken) → Development (4-5 maanden) → Beta testing (6 weken)
- **Earliest launch:** Q3 2026 (PM target Q2-Q3 2026)

### Onderhoud & Doorontwikkeling
- **Post-launch FTE:** 2.5-4 FTE (DevOps, Development, Support)
- **Roadmap feasibility:** Technisch haalbaar, maar vereist tijd en resources
- **Technische schuld:** Acceptabel voor MVP, maar refactoring verwacht voor Fase 2/3

---

## Vervolgstappen

→ **Zie docs/architecture/constraints/** voor:
- Technische kaders waar UX-ontwerp rekening mee moet houden
- Grenzen en vrijheidsgraden voor Development
- Expliciete "no-go's" en "bewust nog open" onderdelen

→ **Acties:**
1. **PM:** Plan expert consultaties (juridisch, AVG, financieel) - ASAP
2. **Technical Lead:** Technologie stack evaluatie en beslissing - Q1 2026
3. **Hiring:** Start recruitment voor development team - ASAP
4. **UX:** Start design werk voor alle 3 rollen - Q1 2026
5. **DevOps:** Cloud provider evaluatie en setup - Q1 2026
