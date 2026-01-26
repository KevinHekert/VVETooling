# Randvoorwaarden voor UX en Development - VVE Tooling MVP

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Architecture
- **Status**: Final
- **Versie**: 1.0
- **Doel**: Technische kaders, grenzen, vrijheidsgraden en bewuste keuzes voor UX en Development teams

## Bronverwijzingen
Dit document is gebaseerd op:
- [docs/architecture/discovery/01-architecturale-verkenning.md](../discovery/01-architecturale-verkenning.md)
- [docs/architecture/principles/01-architectuurprincipes-kaders.md](../principles/01-architectuurprincipes-kaders.md)
- [docs/architecture/risks/01-risicos-complexiteit-afhankelijkheden.md](../risks/01-risicos-complexiteit-afhankelijkheden.md)

## 1. Randvoorwaarden voor UX Design

### 1.1 Technische Constraints voor UX

#### Constraint UX-01: Multi-Tenancy Awareness

**Constraint:**
Elke user moet altijd weten tot welke VVE hij/zij behoort. VVE context moet altijd zichtbaar zijn in de interface.

**Rationale:**
- Multi-tenancy architectuur vereist dat users zich bewust zijn van hun VVE context
- Voorkomen van verwarring (vooral voor bestuursleden die mogelijk in meerdere VVE's zitten)
- Security: voorkomen dat user denkt data van andere VVE te zien

**Implicaties voor UX:**
- VVE naam moet prominent zichtbaar zijn in UI (header, sidebar)
- User profile moet VVE membership tonen
- Bij wisselen tussen VVE's (als toekomstige feature) moet dit expliciet en duidelijk zijn

**Niet negocieerbaar:** VVE context moet altijd duidelijk zijn.

**Bronverwijzing:** `docs/architecture/principles/01-architectuurprincipes-kaders.md` Principe 2

---

#### Constraint UX-02: Role-Based UI Verschillen

**Constraint:**
3 verschillende gebruikersrollen (Penningmeester, Bestuurslid, Bewoner) vereisen verschillende UI's en informatie.

**Vereiste verschillen per rol:**

**Penningmeester (Admin):**
- Volledige toegang tot alle data (read + write)
- Financiële transacties toevoegen/bewerken/verwijderen
- Rapportages genereren
- Gebruikers uitnodigen/beheren
- VVE instellingen beheren (splitsingssleutels, reserves)
- Complexere UI acceptabel (power user)

**Bestuurslid (Collaborator):**
- Read access tot alle data
- Beperkte write access (documenten uploaden, opmerkingen toevoegen)
- Geen financiële transacties wijzigen
- Dashboard met overzicht (niet detailed financial admin)
- Eenvoudiger UI dan penningmeester

**Bewoner (Read-Only):**
- Read-only access tot meeste data
- Eigen betalingsstatus zien (privacy-safe)
- Documenten downloaden
- Berichten sturen (mogelijk)
- Zeer eenvoudige, mobile-first UI

**Implicaties voor UX:**
- Minimaal 3 verschillende dashboards nodig
- Navigation menu verschilt per rol
- Feature flags per rol (sommige features zijn disabled voor bepaalde rollen)
- Duidelijke visual indicators van user rol

**Vrijheidsgraad:**
UX team bepaalt specifieke UI designs, zolang role differences duidelijk zijn en toegankelijkheid gerespecteerd wordt.

**Bronverwijzing:** `docs/product/discovery/01-probleemdefinitie-productrichting.md` §2

---

#### Constraint UX-03: Mobile-First voor Bewoners

**Constraint:**
Bewoner UI moet mobile-first gedesignd zijn. Desktop is secundair voor bewoners.

**Rationale:**
- PM data: bewoners zijn vooral op smartphone
- Bewoner engagement is kritiek voor product success
- Desktop-first design werkt vaak slecht op mobile

**Implicaties voor UX:**
- Bewoner UI: Start met mobile design, dan scale up naar desktop
- Touch-friendly UI elements (minimaal 44x44px tap targets)
- Optimized voor one-handed mobile gebruik
- Minimale scrolling (belangrijkste info above the fold)
- Simple navigation (max 3-4 top-level menu items voor bewoners)

**Penningmeester/Bestuurslid:**
- Desktop-first is acceptabel (primary gebruik is desktop)
- Maar moet ook responsive zijn voor mobile (secondary gebruik)

**Vrijheidsgraad:**
UX team bepaalt specifieke design approach (progressive enhancement, adaptive design, etc.).

**Bronverwijzing:** `docs/product/discovery/01-probleemdefinitie-productrichting.md` §2.3

---

#### Constraint UX-04: Performance Budget

**Constraint:**
Page load tijd moet <2 seconden zijn (95th percentile).

**Technische implicaties voor UX:**
- Minimale assets (images, icons, fonts)
- Lazy loading voor below-the-fold content
- Progressive rendering (show content incrementally)
- Optimized images (WebP waar mogelijk, max 100KB per image)
- Maximum JavaScript bundle size: 500KB initial load

**Implicaties voor UX:**
- Voorkeur voor system fonts (of maximum 2 custom font weights)
- Minimale animaties (alleen waar significant value)
- Icons: SVG sprite sheet of icon font (niet individuele images)
- Illustraties: SVG waar mogelijk, geoptimaliseerde PNG/JPG als fallback

**Meetbaar:**
- Lighthouse score: >90 voor performance
- First Contentful Paint (FCP): <1.5 sec
- Largest Contentful Paint (LCP): <2.0 sec

**Vrijheidsgraad:**
UX team kan design keuzes maken zolang performance budget gerespecteerd wordt.

**Bronverwijzing:** `docs/architecture/principles/01-architectuurprincipes-kaders.md` §2.1

---

#### Constraint UX-05: Accessibility Minimale Niveau

**Constraint:**
Minimaal WCAG 2.0 niveau A, streven naar niveau AA.

**Vereisten:**
- **Kleurcontrast:** Minimaal 4.5:1 voor normale tekst, 3:1 voor grote tekst
- **Keyboard navigation:** Alle functionaliteit toegankelijk via keyboard
- **Screen reader:** Semantic HTML, ARIA labels waar nodig
- **Focus indicators:** Duidelijk zichtbare focus states
- **Alt text:** Voor alle images met content (decorative images: alt="")
- **Forms:** Labels voor alle input fields, error messages accessible

**Implicaties voor UX:**
- Color alleen is niet voldoende (ook icons, text, patterns voor status)
- Font size minimaal 16px voor body text
- Line height minimaal 1.5 voor leesbaarheid
- Sufficient whitespace voor duidelijkheid
- Tap targets minimaal 44x44px (mobile)

**Vrijheidsgraad:**
UX team kiest specifieke design system, maar accessibility is non-negotiable.

**Bronverwijzing:** `docs/architecture/principles/01-architectuurprincipes-kaders.md` §2.5

---

#### Constraint UX-06: Browser Compatibility

**Constraint:**
Support voor Chrome, Safari, Firefox (laatste 2 versies).

**Implicaties voor UX:**
- Modern CSS features zijn OK (Grid, Flexbox, CSS Variables)
- Progressive enhancement approach (basic functionality in alle browsers)
- Testing vereist in alle 3 browsers
- Edge cases (oude Safari versies) kunnen limited support hebben

**Niet ondersteund:**
- Internet Explorer (officieel discontinued)
- Oudere browsers (>2 versies oud)

**Vrijheidsgraad:**
UX team kan moderne web features gebruiken die supported zijn in target browsers.

**Bronverwijzing:** `docs/product/discovery/01-probleemdefinitie-productrichting.md` §4

---

### 1.2 Privacy Constraints voor UX

#### Constraint UX-07: Privacy by Design

**Constraint:**
Bewoners kunnen alleen eigen betalingsstatus zien, niet van andere bewoners.

**Rationale:**
- AVG privacy requirement
- Social dynamics (niet iedereen wil dat anderen hun betalingstatus zien)

**Implicaties voor UX:**
- Bewoner dashboard: "Mijn betalingsstatus" (niet "Alle betalingen")
- Penningmeester/Bestuurslid: Kunnen wel alle betalingen zien (need-to-know)
- Duidelijke visual indicators van wat private vs. public is

**Open vraag voor UX/PM:**
Kunnen bewoners NAW-gegevens (naam, adres, telefoonnummer, email) van andere bewoners zien?
- **Pro transparantie:** Ja, voor samenwerking en contact
- **Pro privacy:** Alleen naam en appartement nummer, geen contact gegevens
- **Beslissing nodig:** PM moet input geven op privacy vs. transparantie trade-off

**Voorlopige aanname:**
Bewoners kunnen naam + appartement nummer zien van andere bewoners, maar geen contact gegevens (tenzij bewoner opt-in voor sharing).

**Bronverwijzing:** `docs/architecture/discovery/01-architecturale-verkenning.md` §3.3 Vraag 1

---

#### Constraint UX-08: Consent Management

**Constraint:**
Cookie consent en privacy policy acceptance vereist voor AVG compliance.

**Implicaties voor UX:**
- Cookie banner bij eerste bezoek (before any tracking)
- Privacy policy link toegankelijk in footer
- User kan consent intrekken (settings pagina)
- Duidelijke uitleg welke cookies gebruikt worden (necessary vs. analytics vs. marketing)

**Vrijheidsgraad:**
UX team kiest specifieke cookie banner design, zolang compliant met AVG.

**Bronverwijzing:** `docs/architecture/principles/01-architectuurprincipes-kaders.md` §5.1

---

### 1.3 UX Vrijheidsgraden (Bewust Open)

**UX team heeft volledige vrijheid voor:**

1. **Visual Design:**
   - Color palette (binnen contrast requirements)
   - Typography (binnen performance budget)
   - Iconography
   - Illustration style
   - Spacing system

2. **Interaction Design:**
   - Animation patterns (binnen performance budget)
   - Micro-interactions
   - Transition effects
   - Feedback mechanisms (toasts, modals, etc.)

3. **Information Architecture:**
   - Navigation structure (zolang role-based differences gerespecteerd)
   - Content hierarchy
   - Labeling en terminologie
   - User flows (zolang key flows addressed)

4. **Component Library:**
   - Specific components (buttons, forms, cards, etc.)
   - Component variants en states
   - Design tokens

**Voorwaarde:**
Alle UX beslissingen moeten gedocumenteerd worden in design system voor consistentie en developer handoff.

---

## 2. Randvoorwaarden voor Development

### 2.1 Technische Constraints voor Development

#### Constraint DEV-01: Multi-Tenancy Architectuur Verplicht

**Constraint:**
Alle data moet tenant-aware zijn. Elke database query moet gefilterd op tenant_id.

**Implementatie vereisten:**
```
Voorbeeld (pseudo-code):
// WRONG - geen tenant filtering
SELECT * FROM transactions WHERE user_id = 123

// CORRECT - met tenant filtering
SELECT * FROM transactions 
WHERE tenant_id = current_tenant 
AND user_id = 123
```

**Afdwinging:**
- Code review checklist: tenant isolation check
- Automated tests: tenant isolation tests (100% coverage kritieke queries)
- Database row-level security (RLS) waar mogelijk als extra layer
- Linting rules voor tenant_id enforcement

**Geen uitzonderingen:** Elke data access moet tenant-aware zijn.

**Bronverwijzing:** `docs/architecture/principles/01-architectuurprincipes-kaders.md` Principe 2

---

#### Constraint DEV-02: Role-Based Access Control (RBAC)

**Constraint:**
3 rollen met verschillende permissies moeten afgedwongen worden op backend (niet alleen frontend).

**Rollen en permissies:**

**Penningmeester (Admin):**
- CREATE, READ, UPDATE, DELETE: Transactions, Reports, Documents
- READ, UPDATE: VVE settings (splitsingen, reserves)
- CREATE, READ, UPDATE, DELETE: Users (binnen eigen VVE)

**Bestuurslid (Collaborator):**
- READ: Transactions, Reports, VVE settings
- CREATE, READ: Documents
- CREATE: Comments/Notes
- NO: Transacties wijzigen, users beheren

**Bewoner (Read-Only):**
- READ: Reports, Documents (public), eigen payment status
- NO: Transacties, andere users' payment status, VVE settings

**Implementatie vereisten:**
- Authorization checks op ELKE API endpoint
- Frontend hiding van features is niet voldoende (security through obscurity is not security)
- Clear error messages bij unauthorized access (403 Forbidden)
- Audit logging van authorization failures

**Afdwinging:**
- Authorization middleware/decorator op alle API routes
- Integration tests voor authorization (test alle permissies)
- Manual security audit voor launch

**Bronverwijzing:** `docs/architecture/discovery/01-architecturale-verkenning.md` §2.1

---

#### Constraint DEV-03: Data Encryption Verplicht

**Constraint:**
Alle data moet encrypted zijn at rest en in transit.

**Vereisten:**

**At Rest:**
- Database encryption (managed service feature of database-level encryption)
- File storage encryption (S3 encryption, Azure Blob encryption)
- Backup encryption
- Password hashing: bcrypt, scrypt, of Argon2 (GEEN MD5, SHA1, plain text)

**In Transit:**
- HTTPS only (TLS 1.2+ only, geen SSL, TLS 1.0/1.1)
- No HTTP traffic toegestaan (redirect HTTP → HTTPS)
- HSTS header (HTTP Strict Transport Security)
- Secure cookies (Secure, HttpOnly, SameSite flags)

**Geen uitzonderingen:** Encryption is mandatory, niet optional.

**Bronverwijzing:** `docs/architecture/principles/01-architectuurprincipes-kaders.md` §2.4

---

#### Constraint DEV-04: Audit Logging Verplicht

**Constraint:**
Alle financiële transacties en user actions met data impact moeten gelogd worden.

**Vereiste logging:**

**Altijd loggen:**
- Financial transactions: CREATE, UPDATE, DELETE (wie, wat, wanneer, waarom)
- User management: CREATE, UPDATE, DELETE users
- Permission changes: role wijzigingen
- VVE settings changes: splitsingen, reserves
- Login/logout events
- Failed authorization attempts (security)

**Optioneel loggen:**
- READ operations (kan privacy implications hebben)
- Non-critical UI events

**Log format:**
```json
{
  "timestamp": "2026-01-26T10:30:00Z",
  "tenant_id": "vve-123",
  "user_id": "user-456",
  "action": "CREATE_TRANSACTION",
  "resource": "transaction-789",
  "details": {
    "amount": 1500.00,
    "category": "onderhoud",
    "reserve": "onderhoud-reserve"
  },
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

**Retention:**
- Financial audit logs: 7 jaar (wettelijk vereist)
- Other audit logs: 1 jaar minimaal

**Geen sensitive data in logs:**
- Geen passwords
- Geen creditcard nummers (mask: **** **** **** 1234)
- Geen BSN (als opgeslagen)

**Bronverwijzing:** `docs/architecture/principles/01-architectuurprincipes-kaders.md` §2.4

---

#### Constraint DEV-05: API-First Architecture

**Constraint:**
Alle business logica moet toegankelijk zijn via API's. Frontend is pure consumer van API.

**Vereisten:**
- RESTful API of GraphQL (keuze aan Development team)
- API versioning vanaf dag 1 (bijv. /api/v1/)
- OpenAPI/Swagger documentation
- Consistent error handling (standaard error format)
- Pagination voor list endpoints (max 100 items per page)
- Rate limiting (prevent abuse)

**Geen uitzonderingen:**
Frontend mag GEEN directe database toegang hebben. Alles via API.

**Rationale:**
- Toekomstige native apps zullen zelfde API gebruiken
- Toekomstige integraties (bank API's, accountant tools)
- Testbaarheid
- Clear separation of concerns

**Bronverwijzing:** `docs/architecture/principles/01-architectuurprincipes-kaders.md` Principe 5

---

#### Constraint DEV-06: Database Choice Constraints

**Constraints:**
- Nederlandse/EU datacenter (AVG requirement)
- Managed service (niet self-hosted)
- Relational database voor transactional data (ACID properties)
- Backup en point-in-time recovery support

**Vrijheidsgraad:**
Development team kiest specifieke database (PostgreSQL, MySQL, SQL Server, etc.) zolang voldaan aan constraints.

**Rationale AVG datacenter:**
Wettelijk verplicht voor AVG compliance. Data mag niet buiten EU opgeslagen worden.

**Bronverwijzing:** `docs/architecture/principles/01-architectuurprincipes-kaders.md` §2.4, §5.1

---

### 2.2 Performance Constraints voor Development

#### Constraint DEV-07: Performance Targets

**Harde constraints:**
- Page load time: <2 sec (95th percentile)
- API response time: <500ms (95th percentile)
- Database query time: <100ms (95th percentile)

**Implementatie vereisten:**

**Backend:**
- Database indexing voor alle frequent queries
- Query optimization (use EXPLAIN for slow queries)
- Connection pooling
- Caching waar zinvol (application cache of Redis)

**Frontend:**
- Code splitting (load only wat nodig per page)
- Lazy loading voor images en non-critical components
- Minimale bundle size (<500KB initial load)
- Tree shaking (remove unused code)

**Monitoring:**
- Real User Monitoring (RUM) voor actual performance
- Synthetic monitoring voor uptime en performance checks
- Performance budgets in CI/CD (fail build if bundle too large)

**Vrijheidsgraad:**
Development team kiest specifieke caching strategie, bundling tools, etc. zolang targets gehaald worden.

**Bronverwijzing:** `docs/architecture/principles/01-architectuurprincipes-kaders.md` §2.1

---

#### Constraint DEV-08: Scalability Requirements

**Constraints:**
- Stateless application design (state in database, niet in application servers)
- Horizontaal schaalbaar (kunnen servers toevoegen voor meer capacity)
- Database connection pooling (niet 1 connection per request)

**Implicaties:**
- Geen in-memory session storage (use database of Redis for sessions)
- Geen file storage op local disk (use object storage: S3, Azure Blob)
- Geen hard-coded limits (gebruik configuratie)

**Target schaal (jaar 1-2):**
- 500-2.000 VVE's
- 10.000-40.000 gebruikers
- ~2.000-8.000 concurrent users (bij piekbelasting)

**Vrijheidsgraad:**
Development team kiest specifieke implementatie (load balancer, auto-scaling, etc.).

**Niet vereist voor MVP:**
- Multi-region deployment
- Database sharding
- Microservices

**Bronverwijzing:** `docs/architecture/principles/01-architectuurprincipes-kaders.md` §2.3

---

### 2.3 Security Constraints voor Development

#### Constraint DEV-09: Input Validation

**Constraint:**
Alle user input moet gevalideerd worden op backend (niet alleen frontend).

**Vereisten:**
- Type validation (string, number, email, etc.)
- Length validation (max length voor text fields)
- Format validation (email, phone, date, etc.)
- Whitelist validation waar mogelijk (enums, allowed values)
- SQL injection prevention (parameterized queries, ORM)
- XSS prevention (sanitize user input, CSP headers)

**Geen vertrouwen in frontend:**
Frontend validation is UX, niet security. Backend moet ALTIJD valideren.

**Bronverwijzing:** `docs/architecture/principles/01-architectuurprincipes-kaders.md` §2.4

---

#### Constraint DEV-10: Authentication & Session Management

**Constraints:**
- Industry-standard authentication (OAuth 2.0, JWT, of session-based)
- Password requirements: minimaal 8 karakters, complexity rules
- Session timeout: 30 minuten inactiviteit
- Secure session storage (encrypted, HttpOnly cookies)
- Logout functionaliteit (clear session)

**Optioneel (nice-to-have MVP):**
- 2FA via TOTP of SMS
- Password reset flow
- "Remember me" functionaliteit

**Vrijheidsgraad:**
Development team kiest specifieke authentication mechanisme (custom, Auth0, AWS Cognito, etc.).

**Bronverwijzing:** `docs/architecture/principles/01-architectuurprincipes-kaders.md` §2.4

---

### 2.4 Testing Constraints voor Development

#### Constraint DEV-11: Code Coverage Minimaal

**Constraint:**
Minimaal 70% code coverage voor business logic.

**Vereiste tests:**

**Unit tests:**
- VVE-specifieke berekeningen (splitsingen, contributie) - 100% coverage
- Business logic (transaction processing, etc.) - 70%+ coverage
- Utility functions - 70%+ coverage

**Integration tests:**
- API endpoints - alle endpoints minimaal 1 happy path test
- Authentication & authorization - alle permissies getest
- Tenant isolation - 100% coverage kritieke scenarios

**End-to-end tests:**
- Critical user flows (login, transactie toevoegen, rapportage genereren)
- Multi-role scenarios (penningmeester creates, bestuurslid views)

**Security tests:**
- Automated vulnerability scanning (OWASP ZAP, Snyk)
- Dependency vulnerability checks (npm audit, etc.)

**Vrijheidsgraad:**
Development team kiest testing frameworks, maar coverage minimums zijn verplicht.

**Bronverwijzing:** `docs/architecture/principles/01-architectuurprincipes-kaders.md` §2.6

---

### 2.5 Development Vrijheidsgraden (Bewust Open)

**Development team heeft volledige vrijheid voor:**

1. **Technologie Stack Keuze:**
   - Programming language (JavaScript/TypeScript, Python, C#, Java, Go, etc.)
   - Frontend framework (React, Vue, Angular, Svelte, etc.)
   - Backend framework (Express, Django, .NET, Spring Boot, etc.)
   - Database (PostgreSQL, MySQL, MongoDB, etc. - binnen constraints)
   - Cloud provider (AWS, Azure, GCP - binnen AVG constraint)

2. **Architecture Patterns:**
   - Monolith vs. modular monolith (microservices NOT recommended for MVP)
   - API style (REST vs. GraphQL)
   - Authentication implementation (custom vs. managed service)
   - Caching strategy (Redis, application cache, CDN)

3. **Development Proces:**
   - Git workflow (GitFlow, trunk-based, etc.)
   - Code review proces
   - CI/CD tools (GitHub Actions, GitLab CI, Jenkins, etc.)
   - Project management tools (Jira, Linear, GitHub Projects, etc.)

4. **Deployment:**
   - Containerization (Docker, Kubernetes, etc. - optional)
   - Deployment strategy (blue/green, canary, rolling)
   - Infrastructure as Code tool (Terraform, CloudFormation, etc.)

**Voorwaarde:**
Alle technology keuzes moeten gedocumenteerd worden met rationale (Architecture Decision Records - ADR's).

**Bronverwijzing:** `docs/architecture/principles/01-architectuurprincipes-kaders.md` §3.2

---

## 3. Expliciete "No-Go's"

### 3.1 Absolute No-Go's (Nooit Toegestaan)

**NO-01: Data Buiten EU Opslaan**
- Rationale: AVG compliance vereist Nederlandse/EU data residency
- Geen uitzonderingen, zelfs niet voor development/testing

**NO-02: Plain Text Passwords**
- Rationale: Security basic, absolutely niet acceptabel
- Altijd hashing (bcrypt, scrypt, Argon2)

**NO-03: Cross-Tenant Data Toegang**
- Rationale: Privacy en security kritiek
- Geen enkele feature mag cross-tenant data lekken

**NO-04: Frontend-Only Security**
- Rationale: Security through obscurity is not security
- Backend moet ALTIJD authorizatie enforcen

**NO-05: HTTP Traffic (Alleen HTTPS)**
- Rationale: Encryption in transit is verplicht
- Redirect HTTP → HTTPS, HSTS header

**NO-06: Hardcoded Secrets in Code**
- Rationale: Security risk, secrets moeten in environment variables of secrets manager
- Code review moet dit catchen

---

### 3.2 MVP No-Go's (Niet in MVP, Wel Roadmap)

**NO-07: Native Mobile Apps**
- Rationale: MVP is web-responsive, native apps in Fase 2
- Development team moet niet native apps bouwen in MVP

**NO-08: Bank API Integraties**
- Rationale: Complex, tijdrovend, niet kritiek voor MVP
- Handmatige transactie invoer is acceptabel voor MVP

**NO-09: Microservices Architectuur**
- Rationale: Premature optimization, monolith is voldoende voor MVP schaal
- Tenzij zeer dwingende reden (unlikely)

**NO-10: Multi-Region Deployment**
- Rationale: Single region is voldoende voor 99.5% uptime MVP
- Extra complexiteit niet nodig

**NO-11: Advanced AI Features**
- Rationale: Roadmap item (Fase 4), niet MVP
- Focus op core functionality eerst

**Bronverwijzing:** `docs/architecture/principles/01-architectuurprincipes-kaders.md` §3.3

---

## 4. Bewust Nog Open (Development Beslissingen)

### 4.1 Open Technische Beslissingen

**OPEN-01: Technologie Stack**
- Beslissing: Development team + Technical Lead
- Deadline: Q1 2026 (ASAP)
- Criteria: Performance, scalability, team skills, recruitment, cost

**OPEN-02: API Style (REST vs. GraphQL)**
- Beslissing: Backend Lead
- Rationale: Beide kunnen werken, trade-offs verschillen
- Voorwaarde: Moet API-first principle respecteren

**OPEN-03: Authentication Provider (Custom vs. Managed)**
- Beslissing: Security Engineer + Backend Lead
- Trade-off: Build vs. buy, cost vs. control
- Voorwaarde: Moet security requirements halen

**OPEN-04: Caching Strategie**
- Beslissing: Backend Lead + DevOps Lead
- Opties: Redis, application cache, CDN, combinatie
- Voorwaarde: Moet performance targets halen

**OPEN-05: Deployment Strategie**
- Beslissing: DevOps Lead
- Opties: Blue/green, canary, rolling updates
- Voorwaarde: Moet minimale downtime hebben

---

### 4.2 Open Product Beslissingen (PM Input Nodig)

**OPEN-06: Excel Import in MVP?**
- Beslissing: Product Manager
- Impact: 2-4 weken development tijd als JA
- Alternatief: Manual data entry voor MVP

**OPEN-07: Bewoner NAW-gegevens Zichtbaarheid**
- Beslissing: Product Manager + Legal
- Trade-off: Privacy vs. transparantie vs. samenwerking
- Impact: Privacy settings complexity

**OPEN-08: Audit Logging Granulariteit**
- Beslissing: Product Manager + Legal
- Vraag: Alleen financieel of alles loggen?
- Impact: Database size, privacy implications

**OPEN-09: Document Storage Limits**
- Beslissing: Product Manager
- Vraag: Hoeveel MB/GB per VVE?
- Impact: Storage costs, pricing model

**OPEN-10: Data Retention Na Subscription Cancellation**
- Beslissing: Product Manager + Legal
- Vraag: Bewaren voor 7 jaar (wettelijk) of verwijderen?
- Impact: Storage costs, legal compliance

**Bronverwijzing:** `docs/architecture/discovery/01-architecturale-verkenning.md` §3.3

---

## 5. Handoff Requirements

### 5.1 Van UX naar Development

**Vereiste deliverables van UX team:**
1. **Design System:**
   - Component library (buttons, forms, cards, etc.)
   - Design tokens (colors, typography, spacing)
   - Responsive breakpoints
   - Accessibility annotations

2. **User Flows:**
   - Key flows voor alle 3 rollen
   - Edge cases (errors, empty states, loading states)
   - Multi-step processes (onboarding wizard)

3. **Screen Designs:**
   - Desktop designs (1920x1080, 1366x768)
   - Tablet designs (768x1024)
   - Mobile designs (375x667, 390x844)
   - All interactive states (hover, focus, active, disabled)

4. **Assets:**
   - Icons (SVG)
   - Illustrations (SVG waar mogelijk)
   - Images (optimized, WebP + fallbacks)
   - Fonts (WOFF2 format)

5. **Documentation:**
   - Design rationale (waarom deze keuzes?)
   - Accessibility notes (per component)
   - Responsive behavior notes
   - Animation specifications (if any)

---

### 5.2 Van Architecture naar Development

**Deliverables van dit document:**
1. **Technische constraints (MOET worden gerespecteerd)**
2. **Vrijheidsgraden (Development team bepaalt implementatie)**
3. **No-go's (Absoluut niet toegestaan)**
4. **Open beslissingen (Development team moet beslissen)**

**Verwachting:**
- Development team leest alle 4 architecture documenten
- Development team maakt Architecture Decision Records (ADR's) voor grote beslissingen
- Development team komt terug met vragen/clarificaties

---

## 6. Acceptance Criteria voor MVP Launch

### 6.1 Functionele Acceptance Criteria

**Must-Have voor Launch:**
- ✅ Multi-user authenticatie (3 rollen: penningmeester, bestuurslid, bewoner)
- ✅ Multi-tenancy (elke VVE aparte tenant, data isolation 100%)
- ✅ Financiële administratie (transacties CRUD, categorisatie)
- ✅ VVE-specifieke berekeningen (splitsingen, reserves, contributie)
- ✅ Rapportages (maandelijks, jaarrekening, begroting)
- ✅ Document upload/storage
- ✅ Responsive web app (desktop, tablet, mobile)
- ✅ Payment integratie (subscription management)

**Bronverwijzing:** `docs/product/discovery/01-probleemdefinitie-productrichting.md` §4

---

### 6.2 Niet-Functionele Acceptance Criteria

**Performance:**
- ✅ Page load <2 sec (95th percentile)
- ✅ API response <500ms (95th percentile)
- ✅ Lighthouse score >90

**Security:**
- ✅ Encryption at rest en in transit
- ✅ RBAC enforced op backend
- ✅ Tenant isolation validated (zero cross-tenant leaks)
- ✅ Security audit passed (external audit)
- ✅ Vulnerability scan passed (geen critical/high severity)

**Compliance:**
- ✅ AVG compliance audit passed
- ✅ Data in Nederlandse/EU datacenter
- ✅ Privacy policy en cookie consent implemented
- ✅ Audit logging voor financial transactions

**Availability:**
- ✅ Uptime monitoring active
- ✅ Backup strategie implemented en tested
- ✅ Rollback capability tested (<15 min)

**Usability:**
- ✅ WCAG 2.0 A compliance (minimaal)
- ✅ Browser compatibility tested (Chrome, Safari, Firefox)
- ✅ Mobile responsive tested (iOS, Android)

**Testing:**
- ✅ Code coverage >70% voor business logic
- ✅ Integration tests voor alle API endpoints
- ✅ E2E tests voor critical user flows
- ✅ Tenant isolation tests (100% coverage)

---

## 7. Samenvatting & Checklist

### Voor UX Team

**Verplichte Constraints:**
- ✅ VVE context altijd zichtbaar (multi-tenancy awareness)
- ✅ 3 verschillende UI's voor 3 rollen
- ✅ Mobile-first voor bewoners
- ✅ Performance budget: <2 sec, <500KB bundle
- ✅ WCAG 2.0 A minimaal (AA streven)
- ✅ Privacy by design (bewoners zien alleen eigen payment status)

**Vrijheidsgraden:**
- ✅ Visual design (colors, typography, etc.)
- ✅ Interaction design (animations, micro-interactions)
- ✅ Information architecture
- ✅ Component library specifics

### Voor Development Team

**Verplichte Constraints:**
- ✅ Multi-tenancy (tenant_id in ALLE queries)
- ✅ RBAC (backend enforcement, niet alleen frontend)
- ✅ Encryption (at rest en in transit)
- ✅ Audit logging (financial transactions + user actions)
- ✅ API-first architecture
- ✅ Nederlandse/EU datacenter
- ✅ Performance targets (<2 sec, <500ms, <100ms)
- ✅ Code coverage >70%

**Vrijheidsgraden:**
- ✅ Technologie stack (within constraints)
- ✅ Architecture patterns
- ✅ Development proces
- ✅ Deployment strategie

**No-Go's:**
- ❌ Data buiten EU
- ❌ Plain text passwords
- ❌ Cross-tenant data access
- ❌ Frontend-only security
- ❌ HTTP traffic
- ❌ Native apps in MVP
- ❌ Microservices in MVP

**Open Beslissingen:**
- ❓ Technology stack keuze (Development beslissing)
- ❓ API style (REST vs. GraphQL)
- ❓ Authentication provider
- ❓ Caching strategie
- ❓ Excel import (PM beslissing)
- ❓ NAW-gegevens zichtbaarheid (PM beslissing)

---

## Vervolgstappen

→ **Actie UX Team:**
1. Review constraints en vrijheidsgraden
2. Start design werk binnen gegeven kaders
3. Vragen/clarificaties naar Architecture team

→ **Actie Development Team:**
1. Review alle 4 architecture documenten
2. Technologie stack evaluatie en voorstel
3. Architecture Decision Records (ADR's) voor grote beslissingen
4. Questions/clarificaties naar Architecture team

→ **Actie Product Manager:**
1. Beslissing over open product vragen (Excel import, NAW zichtbaarheid, etc.)
2. Expert consultaties plannen (juridisch, AVG, financieel)
3. Beta recruitment starten

→ **Alle Teams:**
Wekelijkse sync tijdens Q1 2026 voor alignment en vraagbeantwoording.
