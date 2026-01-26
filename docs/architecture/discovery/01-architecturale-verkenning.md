# Architecturale Verkenning - VVE Tooling MVP

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Architecture
- **Status**: Final
- **Versie**: 1.0
- **Doel**: Technische haalbaarheid, kaders en risico's expliciteren zonder oplossingsontwerp

## Bronverwijzingen
Dit document is gebaseerd op:
- [docs/product/discovery/01-probleemdefinitie-productrichting.md](../../product/discovery/01-probleemdefinitie-productrichting.md)
- [docs/product/strategy/01-productstrategie-keuzes.md](../../product/strategy/01-productstrategie-keuzes.md)
- [docs/backlog/epics/01-mvp-epics.md](../../backlog/epics/01-mvp-epics.md)
- [docs/ux/discovery/01-ux-vraagstukken-validatie.md](../../ux/discovery/01-ux-vraagstukken-validatie.md)

## 1. Analyse van Productrichting

### 1.1 Productdoelstellingen (uit PM-documentatie)

De Product Manager heeft de volgende kerndoelstellingen gedefinieerd:

**Primaire doelstelling:**
- Een multi-user platform bouwen voor complete zelfbeheer VVE's waar penningmeester, bestuursleden en bewoners kunnen samenwerken en transparantie krijgen over VVE-beheer.

**Secundaire doelstellingen:**
- Financiële administratie vereenvoudigen voor vrijwillige penningmeesters (van 5-15 uur/maand naar <2 uur/maand)
- Real-time inzicht bieden aan voorzitters/bestuursleden zonder penningmeester te hoeven vragen
- Transparantie en betrokkenheid creëren voor bewoners door read-only toegang tot financiële informatie

**Scope MVP:**
- Multi-user authenticatie en autorisatie (3 rollen: penningmeester, bestuurslid, bewoner)
- Financiële basis administratie (inkomsten, uitgaven, categorisatie)
- VVE-specifieke functionaliteit (splitsingssleutels, meerdere reserves, contributieberekening)
- Rapportages (maandelijkse financiële staat, jaarrekening, begroting)
- Basis communicatie en documenten delen
- Web applicatie (mobile-responsive, mobile-first voor bewoners)

**Bronverwijzing:** `docs/product/discovery/01-probleemdefinitie-productrichting.md` §1-4

### 1.2 Probleemdefinitie (uit PM-documentatie)

**Kernprobleem:**
Zelfbeheer VVE's (90.000-105.000 in Nederland) hebben gebrek aan transparantie, samenwerking en overzicht. Dit leidt tot:
- Overbelaste vrijwillige penningmeesters
- Bestuur zonder real-time inzicht
- Passieve, ongeïnformeerde bewoners
- Wantrouwen en miscommunicatie

**Bronverwijzing:** `docs/product/discovery/01-probleemdefinitie-productrichting.md` §1

### 1.3 Doelgroepen (uit PM-documentatie)

**Primaire gebruikersgroepen voor MVP:**
1. **Penningmeester** (primaire admin user): 35-65 jaar, basis tot gemiddeld digitaal vaardig, vrijwilliger, 5-15 uur/maand bezig
2. **Voorzitter/Bestuursleden** (collaborator users): 35-70 jaar, hebben inzicht en beperkte schrijfrechten nodig
3. **Bewoners/Eigenaren** (read-only users): 25-75 jaar, breed spectrum technische vaardigheden, 15-25 personen per VVE

**Technische context:**
- Gebruikers werken zowel op desktop (70%), mobile (20%) als tijdens vergaderingen (10%)
- Browser support: Chrome, Safari, Firefox (laatste 2 versies)
- Mobiele gebruikers vooral smartphone (iOS/Android)

**Bronverwijzing:** `docs/product/discovery/01-probleemdefinitie-productrichting.md` §2

## 2. Technische Implicaties van Productdoelen

### 2.1 Multi-User Platform Implicaties

**Vastgestelde productdoelen:**
- 3 verschillende gebruikersrollen met verschillende toegangsniveaus
- Unlimited users per VVE (flat fee pricing model)
- Verschillende dashboards per rol
- Gemiddeld 3-5 bestuursleden + 15-25 bewoners per VVE = 18-30 users per organisatie

**Technische implicaties:**
1. **Authenticatie & Autorisatie vereist**
   - Role-based access control (RBAC) systeem noodzakelijk
   - User management functionaliteit (uitnodigen, activeren, deactiveren)
   - Privacy by design: bewoners mogen alleen eigen betalingsstatus zien

2. **Data isolatie per VVE**
   - Multi-tenancy architectuur vereist
   - Data mag niet lekken tussen VVE's (absolute data-isolatie vereiste)
   - Elke VVE is een separate "tenant" met eigen data

3. **Schaalbaarheidsvereisten**
   - Target: 500 VVE's jaar 1 = ~10.000 gebruikers
   - Target jaar 2: 2.000 VVE's = ~40.000 gebruikers
   - Concurrent users: piekbelasting bij maandafsluiting (geschat 10-20% concurrent)

**Complexiteitsanalyse:**
- Multi-tenancy + RBAC verhoogt architecturale complexiteit significant vs. single-user applicatie
- Privacy requirements verhogen security vereisten
- Verschillende UI's per rol verhogen frontend complexiteit

**Bronverwijzing:** `docs/product/discovery/01-probleemdefinitie-productrichting.md` §2, §4

### 2.2 VVE-Specifieke Functionaliteit Implicaties

**Vastgestelde productdoelen:**
- Splitsingssleutels per eigenaar (niet-uniform verdeeld)
- Meerdere reserves beheren (minimaal: onderhoud, algemeen, speciaal)
- Contributie automatisch berekenen op basis van splitsing
- VVE-specifieke categorieën en rapportages

**Technische implicaties:**
1. **Flexibel data model vereist**
   - Splitsingssleutels kunnen variëren per VVE (niet altijd gelijke verdeling)
   - Aantal reserves variabel per VVE (2-5 reserves is normaal)
   - Transacties moeten gekoppeld worden aan reserves

2. **Berekeningslogica**
   - Contributie berekening: Totaal bedrag * splitsingssleutel per eigenaar
   - Reserve mutaties: Transacties moeten correct toegewezen worden aan reserves
   - Saldo per reserve moet real-time berekend kunnen worden

3. **Nederlandse compliance**
   - VVE wetgeving en boekhoudregels (Model A jaarrekening)
   - AVG compliance (Nederlandse data opslag)
   - Mogelijk toekomstige wettelijke rapportagevereisten

**Complexiteitsanalyse:**
- VVE-specifieke logica is uniek en moet custom gebouwd worden
- Compliance vereisten zijn niet-onderhandelbaar
- Flexibiliteit vs. simpliciteit trade-off in data model

**Bronverwijzing:** `docs/product/discovery/01-probleemdefinitie-productrichting.md` §4, `docs/backlog/epics/01-mvp-epics.md` EP-002, EP-003

### 2.3 Multi-Device & Mobile-First Implicaties

**Vastgestelde productdoelen:**
- Web app, mobile-responsive
- Mobile-first design voor bewoners
- Desktop primair voor penningmeester
- Browser support: Chrome, Safari, Firefox (laatste 2 versies)
- Native apps NIET in MVP (roadmap Fase 2)

**Technische implicaties:**
1. **Responsive design vereist**
   - Verschillende layouts voor desktop, tablet, smartphone
   - Touch-friendly UI voor mobiel
   - Performance op mobiele netwerken (3G/4G)

2. **Progressive Web App (PWA) overwegen**
   - "Add to homescreen" functionaliteit kan native app gevoel geven
   - Beperkte offline functionaliteit mogelijk
   - Push notifications mogelijk (voor engagement)

3. **Performance requirements**
   - <2 sec page load time (PM requirement)
   - Werkbaar op mobiele netwerken
   - Minimale data usage voor mobiele gebruikers

**Complexiteitsanalyse:**
- Responsive design is standaard, geen extra complexiteit
- PWA is optioneel maar kan waarde toevoegen
- Performance requirement is realistisch maar vereist aandacht

**Bronverwijzing:** `docs/product/strategy/01-productstrategie-keuzes.md` §2 Keuze 8

### 2.4 Security & Compliance Implicaties

**Vastgestelde productdoelen:**
- Bank-level security
- AVG compliant (Nederlandse data opslag)
- 99.5% uptime SLA
- Optionele 2FA

**Technische implicaties:**
1. **Security requirements**
   - Encryptie van data at rest en in transit (TLS/SSL)
   - Secure authentication (password hashing, session management)
   - Optionele 2FA implementatie
   - Audit logging (wie heeft wat wanneer gedaan)
   - Regular security updates en patches

2. **AVG/GDPR compliance**
   - Data opslag in Nederlandse/EU datacenters
   - Privacy by design (bewoners zien alleen eigen data)
   - Right to be forgotten implementatie
   - Data export functionaliteit (gebruiker kan eigen data ophalen)
   - Cookie consent en privacy policy

3. **Uptime & Reliability**
   - 99.5% uptime = maximaal 3.65 uur downtime per maand
   - Backup strategie vereist
   - Disaster recovery plan
   - Monitoring en alerting

**Complexiteitsanalyse:**
- Security en compliance zijn non-negotiable
- AVG compliance vereist juridische expertise
- 99.5% uptime is haalbaar met moderne cloud platforms

**Bronverwijzing:** `docs/product/discovery/01-probleemdefinitie-productrichting.md` §4, `docs/backlog/epics/01-mvp-epics.md` EP-005

### 2.5 Pricing Model Implicaties

**Vastgestelde productdoelen:**
- Flat fee per VVE (€15-35/maand afhankelijk van grootte)
- Unlimited users per VVE
- 30 dagen gratis trial
- Maandelijks opzegbaar

**Technische implicaties:**
1. **Billing & Subscription management**
   - Subscription lifecycle management (trial → betaald → opzeggen)
   - Payment processing integratie (iDEAL, creditcard)
   - Automatische facturering
   - Downgrade/upgrade flows

2. **Trial management**
   - Trial periode tracking
   - Automatische notificaties (trial eindigt over X dagen)
   - Credit card upfront maar niet charged tijdens trial
   - Conversie naar betaald na trial

3. **Multi-tier pricing**
   - VVE grootte moet bijgehouden worden (aantal appartementen)
   - Automatische tier toewijzing
   - Tier wijziging mogelijk (VVE groeit/krimpt)

**Complexiteitsanalyse:**
- Payment processing is standaard met payment provider (Mollie, Stripe)
- Subscription management kan complex zijn maar SaaS tools beschikbaar
- Flat fee model is eenvoudiger dan per-user pricing

**Bronverwijzing:** `docs/product/discovery/01-probleemdefinitie-productrichting.md` §4, `docs/product/strategy/01-productstrategie-keuzes.md` §2 Keuze 3

## 3. Aannames, Onzekerheden en Open Vragen

### 3.1 Aannames

**Aanname 1: Bewoner activatie is haalbaar**
- Product Manager gaat uit van 30%+ bewoner activatie (bewoners die account aanmaken en inloggen)
- **Onzekerheid**: Dit is een onbewezen aanname. Bewoners zijn vaak passief.
- **Architecturele impact**: Als bewoner activatie <10% is, heeft dit impact op de waarde van multi-user platform
- **Mitigatie**: Product moet ook waarde bieden met alleen penningmeester + bestuur (bestuursleden zijn actief)

**Aanname 2: 99.5% uptime is voldoende**
- PM heeft 99.5% uptime SLA vastgesteld
- **Onzekerheid**: Is dit voldoende voor financiële applicatie? Banken hebben 99.9%+
- **Architecturele impact**: 99.5% vs 99.9% heeft impact op architecturale complexiteit en kosten
- **Validatie nodig**: Testen met early adopters of 99.5% acceptabel is

**Aanname 3: Web-responsive is voldoende voor bewoners**
- PM gaat uit van responsive web app (geen native apps in MVP)
- **Onzekerheid**: Verwachten bewoners native apps? Vooral oudere doelgroep (25-75 jaar)
- **Architecturele impact**: Als native apps wel nodig zijn, kan dit MVP timeline beïnvloeden
- **Mitigatie**: PWA implementeren voor "add to homescreen" functionaliteit

**Aanname 4: Handmatige transactie invoer is acceptabel voor MVP**
- Geen bank API integratie in MVP
- **Onzekerheid**: Hoeveel transacties per maand moet penningmeester invoeren? 20-50?
- **Architecturele impact**: Als handmatig invoeren te tijdrovend is, moet bank integratie misschien in MVP
- **Validatie nodig**: Testen met penningmeesters hoeveel transacties ze gemiddeld hebben

**Aanname 5: Nederlandse markt only is voldoende**
- Geen internationalisatie (i18n) in MVP
- **Onzekerheid**: Wat als België of Duitsland ook interesse heeft?
- **Architecturele impact**: Later toevoegen van i18n is complexer dan vanaf begin inbouwen
- **Beslissing**: PM heeft bewust gekozen voor NL-only, maar architectuur moet i18n-ready zijn

**Bronverwijzing:** `docs/product/strategy/01-productstrategie-keuzes.md` §2

### 3.2 Technische Onzekerheden

**Onzekerheid 1: Schaalbaarheidsgrenzen van gekozen technologie stack**
- PM heeft geen technologie stack voorgeschreven
- **Open vraag**: Welke technologieën zijn optimaal voor multi-tenant SaaS met deze requirements?
- **Architecturele beslissing nodig**: Technologie stack moet bepaald worden door Architecture/Development
- **Randvoorwaarde**: Technologie moet Nederlands talent pool ondersteunen (recruitment)

**Onzekerheid 2: Complexiteit van VVE-specifieke berekeningen**
- Splitsingssleutels en reserve-berekeningen kunnen complex zijn
- **Open vraag**: Zijn er edge cases waar PM niet aan gedacht heeft?
- **Validatie nodig**: Deep-dive in VVE wetgeving en boekhoudregels met juridisch/financieel expert
- **Risico**: Compliance issues als berekeningen niet correct zijn

**Onzekerheid 3: Data migratie van Excel naar platform**
- Bestaande penningmeesters hebben data in Excel
- **Open vraag**: Hoe makkelijk is het om bestaande data te importeren?
- **Architecturele impact**: Import functionaliteit kan complex zijn
- **PM input nodig**: Is Excel import vereist voor MVP of roadmap item?

**Onzekerheid 4: Piekbelasting tijdens maandafsluiting**
- Veel VVE's sluiten maand af rond dezelfde tijd (begin/eind maand)
- **Open vraag**: Wat is verwachte piekbelasting? 10%? 20%? 50% concurrent users?
- **Architecturele impact**: Heeft impact op infrastructuur sizing en kosten
- **Validatie nodig**: Monitoring vanaf dag 1 om werkelijke patronen te zien

**Onzekerheid 5: Support load en operationele complexiteit**
- Multi-user platform met 3 rollen = meer support vragen verwacht
- **Open vraag**: Hoeveel support FTE's zijn nodig voor 500 VVE's?
- **Architecturele impact**: Self-service features (help, FAQ, onboarding) worden belangrijker
- **PM input nodig**: Wat is acceptabele support load?

### 3.3 Open Vragen voor Product Management

**Vraag 1: Bewoner privacy vs. Transparantie**
- PM zegt: bewoners kunnen alles zien behalve betalingsstatus van anderen
- **Open vraag**: Kunnen bewoners NAW-gegevens van andere bewoners zien? Telefoonnummers? Emails?
- **Architecturele impact**: Privacy settings worden complexer als granulaire controle nodig is
- **Beslissing nodig**: Wat is minimale informatie die bewoners van elkaar moeten kunnen zien?

**Vraag 2: Audit trail granulariteit**
- PM noemt "audit log" als requirement
- **Open vraag**: Wat moet precies gelogd worden? Alleen financiële transacties of ook inloggen, documenten bekijken, etc.?
- **Architecturele impact**: Uitgebreide audit logging heeft impact op database size en performance
- **Compliance vraag**: Wat is wettelijk vereist vs. nice-to-have?

**Vraag 3: Document storage limits**
- PM zegt "documenten opslaan" maar geen limieten genoemd
- **Open vraag**: Hoeveel MB/GB per VVE? Wat voor bestandsformaten?
- **Architecturele impact**: Storage kosten en limieten
- **Pricing vraag**: Zijn er extra kosten voor VVE's met veel documenten?

**Vraag 4: Real-time vs. Eventual consistency**
- PM zegt "real-time inzicht" voor bestuursleden
- **Open vraag**: Moet dit echt real-time zijn (binnen seconden) of is "binnen enkele minuten" acceptabel?
- **Architecturele impact**: Real-time heeft impact op architectuur complexiteit
- **UX vraag**: Merken gebruikers verschil tussen 1 seconde en 1 minuut delay?

**Vraag 5: Data retention en archivering**
- VVE's moeten financiële data 7 jaar bewaren (wettelijk)
- **Open vraag**: Wat gebeurt er als VVE opzegt subscription? Blijft data beschikbaar?
- **Architecturele impact**: Data archivering strategie
- **Juridische vraag**: Wat zijn onze verplichtingen?

### 3.4 Open Vragen voor UX/Development

**Vraag 1: Offline functionaliteit**
- PM zegt web-responsive, geen native apps
- **Open vraag voor UX**: Is beperkte offline functionaliteit (PWA) gewenst door gebruikers?
- **Architecturele overwegingen**: Service workers, local storage, sync strategie
- **Beslissing Development**: Effort vs. value van offline support

**Vraag 2: Notificatie strategie**
- PM noemt email notificaties maar geen push notifications in MVP
- **Open vraag voor UX**: Willen gebruikers push notifications (browser/PWA)?
- **Architecturele overwegingen**: Notificatie service, user preferences
- **Roadmap vraag**: Wanneer toevoegen?

**Vraag 3: Accessibility (A11Y) niveau**
- PM heeft geen accessibility requirements genoemd
- **Open vraag voor UX**: Welk WCAG niveau streven we na? 2.0 AA? 2.1 AAA?
- **Architecturele impact**: Accessibility vanaf begin inbouwen is makkelijker dan later toevoegen
- **Compliance vraag**: Zijn er Nederlandse overheidsnormen waar we aan moeten voldoen?

## 4. Technische Haalbaarheid

### 4.1 Technische Haalbaarheid MVP (3-6 maanden)

**Haalbaar binnen MVP tijdlijn:**
✅ Multi-user authenticatie en RBAC
✅ Multi-tenancy data isolatie
✅ Financiële administratie basis
✅ VVE-specifieke berekeningen (splitsingen, reserves)
✅ Responsive web applicatie
✅ Document upload/storage
✅ Rapportages (PDF generatie)
✅ Payment integratie (Mollie/Stripe)
✅ AVG compliance basis

**Uitdagend maar haalbaar:**
🟡 99.5% uptime SLA (vereist goede DevOps/monitoring vanaf dag 1)
🟡 <2 sec page load (vereist performance optimization)
🟡 30%+ bewoner activatie (afhankelijk van UX kwaliteit)
🟡 Onboarding wizard (complexer dan verwacht voor multi-user setup)

**Risico's voor tijdlijn:**
🔴 VVE-specifieke compliance (wetgeving, boekhouding) - vereist expert validatie
🔴 Data migratie van Excel (als dit MVP requirement wordt)
🔴 Security audit voor bank-level security claim

### 4.2 Technische Haalbaarheid Post-MVP

**Roadmap items zijn technisch haalbaar:**
- Native mobile apps (iOS/Android)
- Bank API integraties
- Chat/messaging functionaliteit
- Polls/voting
- AI features (chatbot, automatische categorisatie)

**Geen technische blockers geïdentificeerd** voor roadmap items, alleen time/resources nodig.

## 5. Herleidbaarheid Overzicht

| Sectie | Bron PM Document | Sectie/Pagina |
|--------|------------------|---------------|
| Productdoelstellingen | 01-probleemdefinitie-productrichting.md | §1-4 |
| Probleemdefinitie | 01-probleemdefinitie-productrichting.md | §1 |
| Doelgroepen | 01-probleemdefinitie-productrichting.md | §2 |
| Multi-user implicaties | 01-probleemdefinitie-productrichting.md | §4, 01-mvp-epics.md EP-009 |
| VVE-specifiek | 01-mvp-epics.md | EP-002, EP-003 |
| Security/Compliance | 01-mvp-epics.md | EP-005 |
| Pricing model | 01-productstrategie-keuzes.md | §2 Keuze 3 |
| Web-first keuze | 01-productstrategie-keuzes.md | §2 Keuze 8 |

## 6. Samenvatting

**Technische haalbaarheid**: Het MVP is **technisch haalbaar** binnen de gestelde tijdlijn van 3-6 maanden, mits:
1. Technologie stack keuzes zorgvuldig gemaakt worden (zie Architecturale Principes document)
2. VVE-specifieke compliance gevalideerd wordt met experts
3. Scope discipline gehandhaafd blijft (geen feature creep)

**Grootste technische uitdagingen**:
1. Multi-tenancy + RBAC correcte implementatie (data isolation is kritiek)
2. VVE-specifieke berekeningen compliance
3. 99.5% uptime + <2sec performance targets

**Grootste onzekerheden**:
1. Bewoner activatie rates (impact op product waarde)
2. Werkelijke piekbelasting patronen (impact op infrastructuur sizing)
3. VVE wetgeving en compliance edge cases

**Vervolgstappen**:
→ Zie **docs/architecture/principles/** voor architectuurprincipes en niet-functionele randvoorwaarden
→ Zie **docs/architecture/risks/** voor uitgebreide risicoanalyse en afhankelijkheden
→ Zie **docs/architecture/constraints/** voor randvoorwaarden richting UX en Development
