# Productbesluiten: Open Keuzes & Randvoorwaarden - VVE Tooling MVP

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Product Management
- **Status**: Final - Besluitvorming Compleet
- **Versie**: 1.0
- **Doel**: Expliciete besluitvorming op alle open productkeuzes zodat Development en UX kunnen starten

## Executive Summary

Dit document sluit alle open productbeslissingen af die geïdentificeerd zijn in de architectuurverkenning. Deze beslissingen blokkeerden de voortgang van Development en UX teams. Met dit document kunnen alle teams zonder aannames starten.

**Resultaat**: 
- ✅ Alle 6 "OPEN – PM" beslispunten zijn gesloten
- ✅ 3 kritieke aannames zijn gevalideerd/geaccepteerd
- ✅ Scope-keuze vastgesteld: **6 maanden MVP** (realistisch pad)
- ✅ Externe expertise commitment: **€10.000 budget**, Q1 2026 consultaties
- ✅ Officiële MVP planning: **Eind Q3 2026 launch** (met +4 weken buffer)

---

## 1. Besluitvorming: 6 Open Productbesluiten

### Besluit PM-01: Excel Import in MVP Scope ✅

**Context**:  
Architectuur team identificeerde onzekerheid of Excel import functionaliteit in MVP scope moet zijn. Penningmeesters hebben huidige data in Excel en moeten dit kunnen importeren.

**Analysekader**:
- **Impact op ontwikkeltijd**: +2-4 weken development
- **Gebruikerswaarde**: Hoog (vermijdt handmatige data-entry voor bestaande penningmeesters)
- **Alternative**: Handmatige data entry tijdens trial periode
- **Risk**: Data quality issues, variabiliteit in Excel formats

**BESLUIT**: **NIET in MVP scope** ❌

**Rationale**:
1. **Focus op MVP tijdlijn**: 2-4 weken extra is 10-15% van totale MVP tijd
2. **Workaround beschikbaar**: Nieuwe VVE's starten vanaf scratch, bestaande VVE's kunnen handmatig 1-2 maanden data invoeren tijdens 30-dagen trial
3. **Data kwaliteit risico**: Excel formats variëren sterk tussen penningmeesters
4. **Roadmap commitment**: Excel import wordt **Fase 2 feature** (Q4 2026)

**Mitigatie**:
- Onboarding wizard met video tutorial voor handmatige invoer
- Template Excel format voorbereiden (voor Fase 2)
- Support team traint op data entry best practices
- Communicatie: "Trial periode is ideaal om nieuw jaar te starten in platform"

**Impact op backlog**: Excel import wordt Epic in Roadmap Fase 2

**Bronverwijzing**: `docs/architecture/discovery/01-architecturale-verkenning.md` §3.2

---

### Besluit PM-02: Bewoner NAW-Gegevens Zichtbaarheid ✅

**Context**:  
Privacy vs. transparantie trade-off. Kunnen bewoners NAW-gegevens (naam, adres, telefoonnummer, email) van andere bewoners zien?

**Analysekader**:
- **Pro transparantie**: Bewoners kunnen contact opnemen voor samenwerking
- **Pro privacy**: AVG compliance, niet iedereen wil gegevens delen
- **Legal**: AVG "legitimate interest" vs "consent required"

**BESLUIT**: **Beperkte zichtbaarheid met opt-in** ✅

**Implementatie**:
1. **Altijd zichtbaar voor alle bewoners** (geen privacy setting):
   - Voornaam + Achternaam
   - Appartement nummer
   - Rol in VVE (Penningmeester, Bestuurslid, Bewoner)

2. **Optioneel zichtbaar** (bewoner kan kiezen om te delen):
   - Telefoonnummer
   - Email adres
   - Extra contactgegevens

3. **Alleen zichtbaar voor Penningmeester/Bestuur**:
   - Volledig adres
   - Betalingsstatus
   - Splitsingssleutel

**Rationale**:
- Naam + appartement is minimaal nodig voor transparantie en herkenbaarheid
- Opt-in model respecteert privacy terwijl samenwerking mogelijk blijft
- AVG "legitimate interest" doctrine: VVE leden moeten elkaar kunnen identificeren
- Penningmeester/Bestuur heeft "need to know" voor administratie

**Impact**:
- UX: Privacy settings pagina voor bewoners (opt-in contact sharing)
- Development: Privacy preference schema in database
- Documentation: Privacy policy update

**Bronverwijzing**: `docs/architecture/constraints/01-randvoorwaarden-ux-development.md` §1.2 Constraint UX-07

---

### Besluit PM-03: Audit Logging Granulariteit ✅

**Context**:  
Wat moet exact gelogd worden? Alleen financiële transacties of ook niet-financiële acties (logins, documenten bekijken)?

**Analysekader**:
- **Compliance**: VVE's moeten financiële transacties 7 jaar bewaren (wettelijk)
- **Security**: Audit trail helpt bij security incident investigation
- **Privacy**: Excessive logging kan privacy issues hebben
- **Storage**: Meer logging = hogere database costs

**BESLUIT**: **Twee-niveau logging strategie** ✅

**Implementatie**:

**Niveau 1 - Altijd Loggen (7 jaar retention)**:
- Financial transactions: CREATE, UPDATE, DELETE
- User management: CREATE, UPDATE, DELETE users
- Permission changes: Role wijzigingen
- VVE settings changes: Splitsingssleutels, reserves wijzigen
- Login/Logout events (authenticatie)
- Failed authorization attempts (security)

**Niveau 2 - Optioneel Loggen (1 jaar retention)**:
- Document uploads/downloads
- Report generation
- Page views (analytics)
- Export actions

**NIET loggen**:
- Routine READ operations (privacy)
- UI interactions zonder data impact
- Health checks / monitoring pings

**Rationale**:
- Compliance-driven: Financieel = 7 jaar (wettelijk), rest = 1 jaar (reasonable)
- Security-first: Authenticatie en authorization failures zijn kritiek
- Privacy-respectful: Geen excessive tracking van normal user behavior
- Cost-conscious: Selective logging = lagere storage costs

**Impact**:
- Development: Audit log service met twee retention policies
- Storage: Database partitioning voor audit logs (7-jaar vs 1-jaar)
- Documentation: Audit log policy in privacy statement

**Bronverwijzing**: `docs/architecture/constraints/01-randvoorwaarden-ux-development.md` §2.1 Constraint DEV-04

---

### Besluit PM-04: Document Storage Limits per VVE ✅

**Context**:  
Hoeveel storage ruimte krijgt elke VVE voor documenten (facturen, vergadernotulen, contracten)?

**Analysekader**:
- **Cost**: Cloud storage (S3/Azure Blob) ~€0.02/GB/maand
- **Usage pattern**: Geschat 50-200 documenten per VVE per jaar, 50-500KB per document
- **Pricing**: Flat fee model zonder extra kosten voor storage

**BESLUIT**: **Tiered storage limits** ✅

**Implementatie**:
- **Tier 1** (€15/maand, tot 25 appartementen): **2 GB storage**
- **Tier 2** (€25/maand, 25-50 appartementen): **5 GB storage**
- **Tier 3** (€35/maand, 50+ appartementen): **10 GB storage**

**Bestandsformaat beperkingen**:
- **Toegestaan**: PDF, JPG, PNG, XLSX, DOCX, TXT
- **Niet toegestaan**: Video, executable files (.exe, .app), ZIP archives
- **Max bestandsgrootte**: 25 MB per bestand

**Rationale**:
- 2-10 GB is ruim voldoende voor typische VVE (5-10 jaar documenten)
- Tier-based is fair: grotere VVE's hebben meer storage nodig
- Bestandsformaat restrictions: Security (geen executables) en cost (geen video)
- 25 MB limit: Voorkomt misuse, PDF's zijn typically <5 MB

**Escalatie pad**:
Indien VVE storage limit bereikt:
1. Warning bij 80% usage
2. Notification bij 100% (upload blocked)
3. Contact support voor extra storage (€5/maand per extra 5GB)

**Impact**:
- Development: Storage quota monitoring per tenant
- UX: Storage usage indicator in settings
- Pricing: Documented in pricing page

**Cost implications**:
- 2-10 GB @ €0.02/GB/maand = €0.04-0.20 per VVE → Negligible vs €15-35 pricing

**Bronverwijzing**: `docs/architecture/discovery/01-architecturale-verkenning.md` §3.3 Vraag 3

---

### Besluit PM-05: Data Retention na Subscription Cancellation ✅

**Context**:  
Wat gebeurt er met VVE data als subscription wordt opgezegd? Nederlandse VVE's moeten financiële data 7 jaar bewaren (wettelijk).

**Analysekader**:
- **Legal**: 7 jaar bewaarplicht voor financiële administratie
- **User value**: VVE wil toegang tot historische data
- **Cost**: Storage costs voor inactive accounts
- **Competition**: Wat doen andere SaaS platforms?

**BESLUIT**: **Grace period + Read-only archive + Export** ✅

**Implementatie**:

**Fase 1 - Grace Period (30 dagen)**:
- VVE subscription cancelled maar account blijft volledig actief
- Notification emails (dag 7, 14, 21, 28)
- Can reactivate subscription anytime (restore immediately)

**Fase 2 - Read-Only Archive (7 jaar)**:
- Account wordt read-only (geen edits, geen nieuwe data)
- Kan inloggen en data bekijken
- Kan data exporteren (PDF reports, Excel export)
- **GRATIS** (geen subscription kosten)

**Fase 3 - Data Deletion (na 7 jaar)**:
- Automatic notification 60 dagen voor deletion
- Final export reminder
- Permanent deletion na 7 jaar + 60 dagen

**Rationale**:
- 30 dagen grace: Voorkomt onbedoelde cancellation, churn reduction
- 7 jaar read-only: Compliance met Nederlandse wetgeving, goodwill
- Gratis archive: Differentiator vs competitors, morally right
- 7+ jaar deletion: Legaal vereist (AVG right to be forgotten after legal retention period)

**Export functionaliteit**:
- Full data export: Excel bestand met alle transacties, eigenaren, reserves
- PDF rapportages: Alle historische rapporten downloadable
- Documenten: Bulk download van alle geüploade bestanden

**Impact**:
- Development: Account status management (Active, Cancelled, ReadOnly, Deleted)
- Storage: Minimal (read-only accounts hebben bestaande data)
- Support: Cancellation workflow documentation

**Competitive advantage**:
- Meeste SaaS platforms deleten data na 30-90 dagen
- Wij: 7 jaar gratis read-only = Unique selling point

**Bronverwijzing**: `docs/architecture/discovery/01-architecturale-verkenning.md` §3.3 Vraag 5

---

### Besluit PM-06: Real-Time vs Eventual Consistency voor "Real-Time Inzicht" ✅

**Context**:  
Product visie belooft "real-time inzicht" voor bestuursleden. Maar moet dit echt real-time zijn (< 1 seconde) of is "near real-time" (< 1 minuut) acceptabel?

**Analysekader**:
- **User expectation**: Wat verwachten bestuursleden met "real-time"?
- **Technical complexity**: True real-time vereist WebSockets, complex architecture
- **Cost**: Real-time infrastructure is duurder
- **Use case**: Hoe snel moeten bestuursleden updates zien?

**BESLUIT**: **Near real-time is voldoende (< 30 seconden)** ✅

**Implementatie**:
- **Target**: Updates zichtbaar binnen 30 seconden na data wijziging
- **Mechanism**: Polling (frontend refreshes elke 30 seconden) of Page refresh
- **No WebSockets** in MVP (complexity reduction)

**Use cases & requirements**:

| Use Case | Frequency | Real-time needed? | Besluit |
|----------|-----------|-------------------|---------|
| Penningmeester voegt transactie toe | Dagelijks | Nee (bulk entry) | 30 sec OK |
| Bestuurslid checkt saldo | Wekelijks | Nee | 30 sec OK |
| Bewoner checkt betalingsstatus | Maandelijks | Nee | 30 sec OK |
| Multi-user editing | Zelden | Misschien | Not MVP scope |

**Rationale**:
- VVE financiën zijn niet time-critical (niet trading platform)
- Gebruikers refreshen typically pagina als ze nieuwe data verwachten
- 30 seconden is "real-time genoeg" voor use case
- Complexity/cost reduction: Polling is veel simpeler dan WebSockets

**Mitigatie**:
- UX: "Refresh" button altijd beschikbaar
- UX: Timestamp "Last updated: X seconds ago"
- Documentation: Transparant over "near real-time" (manage expectations)

**Roadmap**:
- Fase 2: WebSockets voor true real-time (als user feedback vraagt om dit)

**Impact**:
- Development: Standard REST API (geen WebSocket complexity)
- Infrastructure: Simpler, cheaper
- UX: Refresh indicators

**Bronverwijzing**: `docs/architecture/discovery/01-architecturale-verkenning.md` §3.3 Vraag 4

---

## 2. Aannames: Acceptatie of Afwijzing

### Aanname 1: Bewonersactivatie ≥30% ✅ GEACCEPTEERD (met mitigatie)

**Aanname**:  
Product Manager gaat uit van 30%+ bewoner activatie (bewoners die account aanmaken en inloggen minimaal 1x per kwartaal).

**Validatie**:
- **Data**: Geen directe data beschikbaar (nieuwe markt)
- **Benchmark**: Online banking heeft 60-80% activatie, community platforms 10-30%
- **VVE context**: Bewoners zijn vaak passief, maar financiële transparantie kan motiveren

**BESLUIT**: **GEACCEPTEERD** met realistische targets & mitigatie ✅

**Revised targets**:
- **Jaar 1 target**: **20% bewoner activatie** (conservatief)
  - 3-5 bestuursleden + 3-5 actieve bewoners per VVE (van 15-25 totaal)
- **Jaar 2 target**: 30% (na product maturity & mobile apps)
- **Jaar 3 target**: 40%+ (met community features & notifications)

**Rationale acceptatie**:
1. **Product waarde blijft** ook bij 20% activatie:
   - Penningmeester + Bestuur = core users (high engagement expected)
   - Bewoners zijn "nice to have" niet "must have"
   - Transparantie waarde bestaat ook als bewoners 1x per kwartaal inloggen
   
2. **Mitigatie strategie**:
   - **Mobile-first bewoner UX**: Makkelijker toegang = hogere activatie
   - **Push notifications** (Fase 2): Reminders voor contributie betaling
   - **Email digests**: Maandelijks overzicht (engagement zonder inloggen)
   - **Gamification** (Fase 3): Beloningen voor actieve bewoners

3. **Validation plan**:
   - Beta testing (Q2 2026): Meet actual activatie rate
   - Pivot mogelijk: Als <10%, focus shift naar Penningmeester+Bestuur only

**Impact op product**:
- MVP blijft multi-user maar expectations managed
- Marketing messaging: Focus op Penningmeester + Bestuur value first
- Roadmap flexibility: Bewoner features kunnen deprioritized als activatie laag

**Success criteria**:
- 20% bewoner activatie in Jaar 1 = SUCCESS ✅
- 10-20% = ACCEPTABLE (evaluate roadmap)
- <10% = PIVOT (bestuurders-only product overwegen)

**Bronverwijzing**: `docs/architecture/discovery/01-architecturale-verkenning.md` §3.1 Aanname 1

---

### Aanname 2: 99,5% Uptime is Voldoende ✅ GEACCEPTEERD

**Aanname**:  
99.5% uptime SLA is voldoende voor financiële applicatie (= max 3.65 uur downtime per maand).

**Validatie**:
- **Benchmark**: 
  - Banken: 99.9%+ (mission-critical)
  - SaaS business tools: 99.5-99.9% (Salesforce, Slack)
  - Consumer apps: 99.0-99.5%
- **VVE use case**: Niet mission-critical (geen real-time betalingen), mainly monthly usage
- **Cost**: 99.5% vs 99.9% = significant infrastructure cost difference

**BESLUIT**: **GEACCEPTEERD** ✅

**Rationale**:
1. **Use case past bij 99.5%**:
   - VVE administratie is niet time-critical
   - Penningmeesters werken voornamelijk eind maand (scheduled work)
   - Bewoners loggen in sporadisch
   - Geen real-time transacties (niet zoals payment processing)

2. **Cost-benefit**:
   - 99.5% is haalbaar met managed cloud services (standard)
   - 99.9% vereist multi-region, veel complexer, 2-3x duurder
   - Resources beter besteed aan features dan extreme uptime

3. **Acceptable downtime**:
   - 3.65 uur per maand = ~50 minuten per week
   - Deployment windows: Maandagavond 22:00-00:00 (low traffic)
   - Emergency hotfixes: <30 min downtime acceptable

**Mitigatie**:
- **Transparantie**: Public status page (status.vvetooling.nl)
- **Communication**: Planned maintenance notifications 48h advance
- **Monitoring**: 24/7 uptime monitoring + on-call rotation
- **Rollback**: <15 min rollback capability voor failed deployments
- **SLA commitment**: Officiële 99.5% SLA in Terms of Service

**Escalatie pad**:
- Als uptime < 99.5% consistent → Investigate en fix infrastructure
- Als customer complaints over downtime → Re-evaluate naar 99.9%
- Year 2 evaluation: Upgrade naar 99.9% als revenue supports it

**Impact**:
- Infrastructure: Standard managed services (niet multi-region)
- DevOps: Focus op monitoring & fast recovery (niet zero-downtime)
- Pricing: Can keep pricing competitive (cost savings passed to customers)

**Success criteria**:
- Actual uptime > 99.5% in Jaar 1 = SUCCESS ✅
- 99.0-99.5% = ACCEPTABLE (investigate issues)
- <99.0% = ESCALATE (infrastructure upgrade required)

**Bronverwijzing**: `docs/architecture/discovery/01-architecturale-verkenning.md` §3.1 Aanname 2

---

### Aanname 3: Web-Responsive is Voldoende (geen Native Apps in MVP) ✅ GEACCEPTEERD

**Aanname**:  
Responsive web applicatie is voldoende voor bewoners (mobile-first design). Native iOS/Android apps zijn niet nodig voor MVP.

**Validatie**:
- **Market trend**: PWA's (Progressive Web Apps) worden steeds beter
- **User expectation**: Depends on doelgroep (25-75 jaar breed spectrum)
- **Competition**: Tobias/VvE Admin hebben geen native apps
- **Use case**: Bewoners gebruiken app voornamelijk voor "check status" (eenvoudig), niet voor complex data entry

**BESLUIT**: **GEACCEPTEERD** met excellente PWA implementatie ✅

**Rationale**:
1. **MVP speed**: Web-first = 3-4 maanden sneller dan native apps
2. **80/20 regel**: Web app + PWA dekt 80% van mobile use cases
3. **Desktop-heavy workflow**: Penningmeesters (core users) werken op desktop
4. **Competitive parity**: Geen competitie heeft native apps, niet achterstand

**PWA requirements (MVP)** om aanname te valideren:
- ✅ **"Add to Home Screen"** functionaliteit
- ✅ **Offline fallback page** ("No connection" message)
- ✅ **Fast load times** (<2 sec on 4G)
- ✅ **Mobile-first design** voor bewoner dashboard
- ✅ **Touch-optimized UI** (44x44px tap targets)
- ❌ **Push notifications** (Fase 2, niet MVP)
- ❌ **Full offline mode** (Fase 2, niet MVP)

**Validation plan**:
- **Beta testing (Q2 2026)**: 
  - Survey: "Mist u een native app?"
  - Analytics: % mobile vs desktop usage
  - Target: <30% mobile usage in MVP = web-first validated

**Escalatie criteria** (wanneer native apps bouwen):
- >50% mobile usage AND user complaints over web UX → Prioritize native apps
- Competitive pressure (concurrent launch native app) → Re-evaluate
- Target: Native apps in **Q4 2026 / Q1 2027** (Fase 2)

**Impact**:
- Development: Web stack only (React/Vue/Angular single choice)
- Timeline: 4-6 maanden MVP (niet 8-10 met native)
- Cost: 1 development team (niet 3: web + iOS + Android)

**Mitigatie als assumptie fout**:
- **API-first architecture** = makkelijk om native apps later toe te voegen
- **Design system** herbruikbaar voor native apps
- **Roadmap**: Native apps zijn Fase 2 commitment

**Success criteria**:
- <40% mobile usage + NPS >40 voor web app = Assumptie CORRECT ✅
- >50% mobile usage OR complaints → Native apps prioriteren

**Bronverwijzing**: `docs/architecture/discovery/01-architecturale-verkenning.md` §3.1 Aanname 3, `docs/product/strategy/01-productstrategie-keuzes.md` Keuze 8

---

## 3. Scope-Keuze: Planning & Tijdlijn

### Analyse: 3-6 Maanden vs 6-8 Maanden

**Context**:  
Initiële PM schatting: 3-6 maanden voor MVP  
Architectuur analyse: 6-8 maanden realistisch

**Complexiteit analyse**:

| Component | Base tijd | Multi-tenant | VVE-specifiek | Security | TOTAAL |
|-----------|-----------|--------------|---------------|----------|---------|
| Auth & Users | 2 weken | +1 week (RBAC) | - | +1 week | 4 weken |
| Financial CRUD | 3 weken | +1 week | +2 weken (reserves) | - | 6 weken |
| VVE Berekeningen | - | - | +3 weken | +1 week (audit) | 4 weken |
| Reports & PDF | 2 weken | +1 week | +1 week | - | 4 weken |
| Documents | 1 week | +1 week | - | +1 week | 3 weken |
| Payments | 2 weken | - | - | +1 week | 3 weken |
| UX/Design | 4 weken | +1 week | - | - | 5 weken |
| Testing & QA | 2 weken | +2 weken | +1 week | +1 week | 6 weken |
| **TOTAAL** | **16 wk** | **+7 wk** | **+7 wk** | **+5 wk** | **~35 weken** |

**Expert consultaties (parallel track)**:
- VVE juridisch + AVG specialist: 4-6 weken (Q1 2026)
- Development team hiring & onboarding: 4-6 weken (Q1-Q2 2026)

**Realistische berekening**: 35 weken = ~8 maanden (zonder buffer)

---

### BESLUIT: 6 Maanden MVP met +4 Weken Buffer ✅

**Officiële commitment**:
- **Target MVP launch**: **Eind Q3 2026** (30 September 2026)
- **Development start**: Begin Q2 2026 (1 April 2026)
- **Development periode**: 6 maanden (26 weken)
- **Acceptabele uitloop**: +4 weken (total 7 maanden acceptabel)
- **Hard deadline**: 31 Oktober 2026 (cannot slip verder)

**Rationale**:
1. **Realistisch maar ambitieus**: 6 maanden met goede scope discipline
2. **Buffer voor unknowns**: +4 weken voor onvoorziene complexiteit
3. **Stakeholder management**: Onder-promise, over-deliver
4. **Team morale**: Haalbare deadline > burnout van unrealistic 3-maanden sprint

**Scope reductie voor 6-maanden target**:

**IN SCOPE (Must-Have MVP)**:
- ✅ Multi-user (3 rollen): Penningmeester, Bestuurslid, Bewoner
- ✅ Authenticatie & RBAC
- ✅ Financiële admin: Transacties CRUD, categorieën
- ✅ VVE-specifiek: Splitsingssleutels, reserves, contributie berekening
- ✅ Rapportages: Maandelijks, jaarrekening, begroting
- ✅ Document opslag (basisversie: upload, download, view)
- ✅ Payment integratie: Mollie/Stripe, subscription management
- ✅ Responsive web app (desktop + mobile)

**REDUCED SCOPE (Nice-to-Have → Fase 2)**:
- ❌ Excel import (Besluit PM-01: Fase 2)
- ❌ Advanced document management (folders, tags, search)
- ❌ Email notificaties (alleen essential: payment reminder, trial ending)
- ❌ User activity feed ("X added transaction")
- ❌ Advanced reporting (custom date ranges, filters)
- ❌ 2FA (optioneel in MVP, priority in Fase 2)

**PWA features (Simplified)**:
- ✅ Add to Home Screen
- ❌ Push notifications (Fase 2)
- ❌ Offline mode (Fase 2)

**Impact op Epics** (zie backlog voor details):
- EP-001 (Auth): Simplified (no 2FA in MVP)
- EP-002 (VVE Setup): Core only
- EP-003 (Financieel): Core only (no advanced filtering)
- EP-004 (Reports): Standard templates only
- EP-005 (Documents): Basic CRUD only
- EP-009 (Multi-user): Full scope (core differentiator)

---

### Planning Details & Milestones

**Q1 2026 (Jan-Mar)**: Pre-Development
- ✅ Architectuur verkenning COMPLETED
- ✅ Product strategie FINALIZED
- ✅ Dit beslisdocument FINALIZED
- 🔨 Expert consultaties (juridisch, AVG, accountant): 4-6 weken
- 🔨 UX research & design: 6-8 weken
- 🔨 Tech stack evaluatie & beslissing: 2 weken
- 🔨 Team hiring: 6-8 weken
- **Milestone Q1**: Teams compleet, design klaar, development ready

**Q2 2026 (Apr-Jun)**: Development Sprint 1
- **Week 1-4**: Foundation (auth, database, multi-tenancy setup)
- **Week 5-8**: Core financial admin (transactions CRUD)
- **Week 9-12**: VVE-specifiek (splitsingen, reserves)
- **Week 13**: Sprint 1 review & beta prep
- **Milestone Q2**: Private beta launch (50 VVE's)

**Q3 2026 (Jul-Sep)**: Development Sprint 2 + Beta
- **Week 14-17**: Reports & PDF generation
- **Week 18-20**: Documents & payments
- **Week 21-24**: Beta feedback iteration, bug fixes
- **Week 25-26**: Performance optimization, security hardening
- **Milestone Q3**: Public launch **30 September 2026**

**Q4 2026 (Oct-Dec)**: Buffer & Optimization (if needed)
- **Week 27-30**: BUFFER for overrun (alleen als nodig)
- **Week 31-35**: Post-launch optimization & growth
- **Milestone Q4**: 200 VVE's, Product-Market Fit validation

---

### Contingency Planning

**Scenario A: Development on Track** (Target bereikt)
- Launch 30 Sept 2026 ✅
- Use Q4 voor growth & optimization
- Start Fase 2 planning (native apps, Excel import)

**Scenario B: Minor Delay** (+2-3 weken)
- Launch mid Oktober 2026
- Still acceptable, use Q4 for stabilization
- Communicate transparantly met beta users

**Scenario C: Significant Delay** (+4 weken)
- Launch 31 Oktober 2026 (hard deadline)
- Root cause analysis: Wat ging fout?
- Scope reduction discussion (cut features)

**Scenario D: Major Issues** (>4 weken delay risk)
- **Escalation protocol**:
  1. Week 12 review: Are we on track voor Q3 launch?
  2. If >4 weeks behind → Emergency scope reduction meeting
  3. Options: Cut bewoner features, cut document management, delay beta
  4. Decision: Product Manager + Technical Lead + Stakeholders

**Risk indicators** (early warnings):
- Week 8: Foundation not complete → RED FLAG 🚩
- Week 16: Core financieel not working → RED FLAG 🚩
- Week 20: Major bugs discovered → YELLOW FLAG ⚠️

---

### Impact op Backlog & Epics

**Prioritization**:
1. **P0** (Blocker): EP-001, EP-002, EP-003, EP-009 (auth, VVE, financieel, multi-user)
2. **P1** (Critical): EP-004, EP-005, EP-006 (reports, documents, payments)
3. **P2** (Important): UX polish, performance optimization
4. **P3** (Nice-to-have): Advanced features, moved naar Fase 2

**Epic scope adjustments**:
- **EP-001**: Remove 2FA from MVP (add in Fase 2)
- **EP-005**: Remove advanced document features (folders, tags)
- **EP-009**: Full multi-user scope maintained (differentiator)

**Nieuwe Epic toevoegen**:
- **EP-011**: Excel Import (Fase 2, Q4 2026)

**Bronverwijzing**: `docs/backlog/epics/01-mvp-epics.md` for detailed epic breakdown

---

## 4. Externe Expertise: Consultaties & Budget

### Context

Architectuur team identificeerde 3 kritieke externe afhankelijkheden:
1. **VVE Juridisch Expert**: Validate berekeningen, jaarrekening format, wetgeving
2. **AVG Specialist**: Privacy impact assessment, compliance review
3. **Financieel/Accountant**: Boekhouding regels, reserve beheer, rapportages

Deze consultaties moeten VOOR development start (blocker voor correcte implementatie).

---

### BESLUIT: 3 Expert Consultaties, Budget €10.000 ✅

**Budget allocatie**:
- **VVE Juridisch Expert**: €3.000-4.000
  - Scope: Splitsingssleutel validatie, jaarrekening Model A, data retention wetgeving
  - Deliverable: Compliance checklist, edge case documentatie
  - Timeline: 2 weken (Q1 2026)

- **AVG Specialist**: €4.000-5.000
  - Scope: Privacy impact assessment (PIA), AVG compliance audit, privacy policy review
  - Deliverable: PIA rapport, compliance roadmap, privacy policy draft
  - Timeline: 3 weken (Q1 2026)

- **VVE Accountant**: €2.000-3.000
  - Scope: Boekhouding best practices, reserve beheer, rapportage formats validatie
  - Deliverable: Accounting requirements document, template review
  - Timeline: 1-2 weken (Q1 2026)

**TOTAAL BUDGET: €9.000-12.000** (commitment: **€10.000 mediaan**)

**Rationale budget**:
- Within architecture estimate (€6K-14K)
- Critical investment (voorkomt compliance issues later)
- One-time cost (geen recurring fees)
- ROI: Vermijdt €20M AVG boetes en juridische problemen

---

### Consultatie Planning & Timeline

**Q1 2026 Detailed Planning**:

**Week 1-2 (Begin Januari)**:
- ✅ Procurement: Selecteer experts via netwerk/LinkedIn/partnerships
- ✅ Contracting: SOW's (Statement of Work) opstellen
- ✅ Kickoff: Context sharing (product docs, architecture docs)

**Week 3-6 (Eind Januari - Begin Februari)**:
- **VVE Juridisch**: 2 weken intensieve consultatie
  - Week 1: Document review, vragenlijst
  - Week 2: Edge case discussie, deliverable drafting
  - Output: Compliance checklist by Week 6

- **AVG Specialist**: 3 weken PIA + review
  - Week 1: Stakeholder interviews, scope definition
  - Week 2: PIA assessment, gap analysis
  - Week 3: Rapport finalization, privacy policy draft
  - Output: PIA rapport + privacy policy by Week 6

**Week 5-7 (Midden Februari)**:
- **VVE Accountant**: 2 weken consultatie (parallel met AVG)
  - Week 1: Accounting standards review, template design
  - Week 2: Validation met real VVE examples
  - Output: Accounting requirements by Week 7

**Week 8 (Eind Februari)**:
- **Integration**: Development team review van alle deliverables
- **Q&A**: Follow-up sessies met experts (1-2 uur each)
- **Finalization**: Incorporate findings in development specs

**Milestone**: **All expert consultaties compleet by End Q1 2026** ✅

---

### Expert Selection Criteria

**VVE Juridisch Expert**:
- ✅ Minimaal 5 jaar ervaring met VVE wetgeving
- ✅ Ervaring met digitale platforms (niet alleen traditioneel)
- ✅ Kennis van Model A jaarrekening (verplicht VVE format)
- ✅ Referenties van andere VVE-gerelateerde organisaties
- **Preferred**: Lid van Nederlandse Vereniging van Makelaars (NVM) of equivalent

**AVG Specialist**:
- ✅ Gecertificeerd privacy professional (CIPP/E of equivalent)
- ✅ Ervaring met SaaS platforms (multi-tenancy, cloud)
- ✅ Nederlandse AVG wetgeving expertise (niet alleen GDPR generic)
- ✅ PIA (Privacy Impact Assessment) portfolio
- **Preferred**: Ervaring met financiële data / compliance

**VVE Accountant**:
- ✅ Registeraccountant (RA) of Administratieconsulent (AA)
- ✅ Ervaring met VVE administraties (minimaal 20 VVE's beheerd)
- ✅ Kennis van digitale boekhouding tools
- ✅ Bereidheid tot collaboration (niet alleen audit role)
- **Preferred**: Tech-savvy, ervaring met SaaS tools

---

### Deliverables van Expert Consultaties

**Van VVE Juridisch Expert**:
1. **Compliance Checklist** (PDF, 5-10 pagina's):
   - VVE wetgeving requirements voor software
   - Splitsingssleutel calculation edge cases
   - Jaarrekening Model A template requirements
   - Data retention policies (7-jaar bewaarplicht details)
   - Liability considerations (disclaimer language)

2. **Edge Case Documentatie**:
   - Oneven splitsingen (niet 1/N)
   - Multiple appartement owners (samenwoning, verhuur)
   - Reserve transfers en correcties
   - VVE fusies/splitsingen (rare but happens)

3. **Legal Review**:
   - Terms of Service review (liability clauses)
   - Platform disclaimer language
   - User agreement template

**Van AVG Specialist**:
1. **Privacy Impact Assessment (PIA) Rapport** (PDF, 15-25 pagina's):
   - Data processing inventory (wat slaan we op?)
   - Privacy risks assessment (DPIA methodology)
   - Compliance gaps analysis (what's missing?)
   - Remediation roadmap (prioritized action items)
   - Compliance certification (AVG compliant status)

2. **Privacy Policy Draft** (Markdown, 3-5 pagina's):
   - User-friendly privacy statement (Dutch language)
   - Cookie consent language
   - Data processing details (wat, waarom, hoe lang)
   - User rights (export, delete, correct)

3. **Technical Requirements**:
   - Data encryption specifications
   - Access control requirements
   - Audit logging requirements (what to log for compliance)
   - Data residency confirmation (NL/EU datacenters)

**Van VVE Accountant**:
1. **Accounting Requirements Document** (PDF, 10-15 pagina's):
   - VVE boekhouding best practices
   - Chart of accounts (rekeningschema) voor VVE's
   - Reserve beheer guidelines (onderhoud vs algemeen vs speciaal)
   - Month-end close procedures
   - Year-end procedures (jaarrekening prep)

2. **Report Template Validation**:
   - Maandelijkse financiële staat format review
   - Jaarrekening Model A template approval
   - Begroting template review
   - Contributie overzicht format

3. **Test Case Scenarios**:
   - Real-world VVE examples (anonymized)
   - Edge case scenarios (large reserves, deficit, special assessments)
   - Calculation validation (are our formulas correct?)

---

### Risk Mitigation & Contingency

**Risk**: Expert niet beschikbaar in Q1 timeframe
- **Mitigatie**: Start recruitment in Week 1 (nu!), multiple candidates in pipeline
- **Contingency**: Freelance platforms (LinkedIn, Upwork Premium) voor experts

**Risk**: Expert deliverables niet compleet/bruikbaar
- **Mitigatie**: Clear SOW met deliverable specs, weekly check-ins
- **Contingency**: Budget +€2K reserve voor extra consultant uren

**Risk**: Expert findings blocken development (major changes needed)
- **Mitigatie**: Early consultation (Q1), before development starts
- **Contingency**: Scope adjustment, prioritize compliance fixes

**Risk**: Budget overschrijding
- **Mitigatie**: Fixed-price contracts waar mogelijk, hourly cap
- **Contingency**: Approved budget buffer (+€2K total = €12K max)

---

### Post-Consultatie: Implementation Plan

**Week 8-10 (Q1 2026)**:
- Development team review: Incorporate expert findings in specs
- UX team review: Privacy policy, cookie consent, UI changes
- Architecture update: Compliance requirements in technical design

**Ongoing (Q2-Q3 2026)**:
- Retainer optional: €500/maand voor ad-hoc vragen (budget separately)
- Validation checkpoints: Week 12, Week 20 (expert review van implementation)
- Pre-launch audit: AVG specialist final review before public launch

---

## 5. Samenvatting & Acties

### Alle Beslissingen Overzicht

| Besluit ID | Onderwerp | Besluit | Impact |
|------------|-----------|---------|--------|
| **PM-01** | Excel Import | ❌ Niet in MVP, Fase 2 | -2 wk dev tijd |
| **PM-02** | NAW Zichtbaarheid | ✅ Beperkt + Opt-in | +1 wk dev (privacy settings) |
| **PM-03** | Audit Logging | ✅ Twee-niveau strategie | +1 wk dev (logging service) |
| **PM-04** | Storage Limits | ✅ 2-10 GB tiered | Minimal dev (quota check) |
| **PM-05** | Data Retention | ✅ Grace + 7yr archive | +1 wk dev (account status) |
| **PM-06** | Real-time | ✅ 30-sec near real-time | -2 wk dev (no WebSockets) |

**NET IMPACT**: -1 week development tijd (savings van PM-01 & PM-06 offset PM-02, 03, 05)

### Aannames Status

| Aanname | Target | Status | Mitigatie |
|---------|--------|--------|-----------|
| Bewonersactivatie | 20-30% | ✅ Accepted | Mobile-first UX, email digests |
| 99,5% Uptime | 99.5% | ✅ Accepted | Monitoring, status page |
| Web-responsive | PWA | ✅ Accepted | Excellent mobile UX, native Fase 2 |

### Planning Commitment

- **MVP Launch**: **30 September 2026** (Q3 2026)
- **Development**: 6 maanden (April-September)
- **Buffer**: +4 weken acceptabel (max 31 Oktober 2026)
- **Scope**: Focused MVP (Excel import, advanced features → Fase 2)

### Externe Expertise

- **Budget**: €10.000 (€9-12K range)
- **Experts**: VVE Juridisch (€3-4K), AVG Specialist (€4-5K), Accountant (€2-3K)
- **Timeline**: Q1 2026 (Week 1-8, compleet by End Q1)
- **Deliverables**: Compliance checklist, PIA rapport, accounting requirements

---

## 6. Acceptance Criteria: COMPLEET ✅

### Originele Acceptance Criteria (uit problem statement):

✅ **Alle "OPEN – PM" beslispunten uit architectuurdocument zijn gesloten**
- PM-01 t/m PM-06: ALLE 6 beslissingen gedocumenteerd met rationale

✅ **Besluiten zijn schriftelijk vastgelegd en gedeeld**
- Dit document = officiële besluitvorming (Final status)
- Te delen met: Development, UX, Architecture teams

✅ **Development & UX kunnen zonder aannames starten**
- Scope duidelijk (6 open vragen beantwoord)
- Aannames validated (3 aannames geaccepteerd met mitigatie)
- Planning commitment (6 maanden, Q3 2026 launch)
- Externe expertise gepland (Q1 2026 consultaties)

---

## 7. Communicatie & Distributie

### Distributie Plan

**Target audiënce**:
1. **Development Team**: Voor scope clarity en technical decisions
2. **UX Team**: Voor design constraints (privacy, storage, real-time)
3. **Architecture Team**: Voor validation van beslissingen
4. **Stakeholders/Founders**: Voor planning en budget commitment

**Distributie methode**:
- Email: PDF export van dit document
- GitHub: docs/product/decisions/ (version controlled)
- Meeting: 1-uur walkthrough met alle teams (Q1 Week 1)

### Follow-up Acties

**Immediate (Week 1)**:
- [ ] **Product Manager**: Expert recruitment starten (VVE juridisch, AVG, accountant)
- [ ] **Development Lead**: Review scope reductions, update epic backlog
- [ ] **UX Lead**: Review privacy decisions (NAW visibility, consent management)
- [ ] **Architecture Team**: Validate technical feasibility van besluiten

**Q1 2026 (Week 1-8)**:
- [ ] Expert consultaties execution (zie §4 planning)
- [ ] Tech stack evaluation & decision (Development team)
- [ ] UX design finalization (UX team)
- [ ] Team hiring (Hiring manager)

**Q2 2026 (Development Start)**:
- [ ] Incorporate expert findings in development specs
- [ ] Begin MVP development (6-maanden sprint)
- [ ] Beta recruitment (target: 50 VVE's)

---

## 8. Versioning & Updates

**Document versioning**:
- **v1.0** (2026-01-26): Initial decision document (FINAL)
- Future updates: Als nieuwe beslissingen nodig zijn, versie bump (v1.1, v2.0)

**Review cadence**:
- **Week 12 review** (Q2): Are decisions still valid? Any pivots needed?
- **Week 20 review** (Q3): Final scope check before launch
- **Post-launch review** (Q4): Retrospective, wat ging goed/fout?

**Change management**:
- Significant beslissing changes → New version van dit document
- Minor clarifications → Inline updates (version unchanged)

---

## Bijlagen

### Bijlage A: Bronverwijzingen

Alle beslissingen in dit document zijn gebaseerd op:
- `docs/architecture/discovery/01-architecturale-verkenning.md`
- `docs/architecture/constraints/01-randvoorwaarden-ux-development.md`
- `docs/architecture/risks/01-risicos-complexiteit-afhankelijkheden.md`
- `docs/product/strategy/01-productstrategie-keuzes.md`
- `docs/product/discovery/01-probleemdefinitie-productrichting.md`

### Bijlage B: Acronymen & Begrippen

- **MVP**: Minimum Viable Product
- **AVG**: Algemene Verordening Gegevensbescherming (GDPR in NL)
- **VVE**: Vereniging Van Eigenaren
- **RBAC**: Role-Based Access Control
- **PWA**: Progressive Web App
- **PIA**: Privacy Impact Assessment (DPIA)
- **SLA**: Service Level Agreement
- **SOW**: Statement of Work

### Bijlage C: Decision-Making Framework

Alle beslissingen zijn gemaakt met volgende framework:
1. **Context**: Waarom is dit een beslissing? (problem statement)
2. **Analysekader**: Wat zijn de opties en trade-offs?
3. **Besluit**: Wat is de definitieve keuze?
4. **Rationale**: Waarom deze keuze? (data, logic, constraints)
5. **Impact**: Wat betekent dit voor teams? (development, UX, cost, timeline)
6. **Mitigatie**: Hoe verminderen we risico's?

Dit zorgt voor **traceable, defendable, evidence-based** beslissingen.

---

**Document END**

**Status**: ✅ FINAL - Alle open PM beslissingen zijn gesloten
**Goedkeuring**: Product Manager
**Datum**: 2026-01-26
**Volgende review**: Q2 2026 Week 12
