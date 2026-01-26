# Epics & Backlog - VVE Tooling MVP

## Documentinformatie
- **Datum**: 2026-01-26 (Updated: 2026-01-26)
- **Eigenaar**: Product Management
- **Status**: Final
- **Versie**: 2.0
- **Changelog**: v2.0 - Multi-user platform requirement (EP-009 toegevoegd, alle epics ge-update)

## Bronverwijzingen
Dit document is gebaseerd op:
- [docs/product/discovery/01-probleemdefinitie-productrichting.md](../../product/discovery/01-probleemdefinitie-productrichting.md)
- [docs/product/strategy/01-productstrategie-keuzes.md](../../product/strategy/01-productstrategie-keuzes.md)
- [docs/ux/discovery/01-ux-vraagstukken-validatie.md](../../ux/discovery/01-ux-vraagstukken-validatie.md)

## Inleiding

Dit document definieert **Epics** voor VVE Tooling MVP. Elke epic is:
- ✅ Geformuleerd vanuit **probleem**, niet oplossing
- ✅ **Herleidbaar** naar product discovery en UX discovery
- ✅ Voorzien van **doelstelling** en **succesindicatoren**
- ✅ **Prioriteit** gebaseerd op impact en MVP scope

**Belangrijk**: Epics zijn problem-focused. Implementatie details (user stories, tasks) worden later uitgewerkt in samenwerking met Engineering.

## Epic Overzicht

| Epic ID | Epic Naam | Prioriteit | Status | Target Release |
|---------|-----------|------------|--------|----------------|
| EP-001 | Penningmeester kan VVE financieel overzicht beheren | P0 | To Do | MVP Q2 |
| EP-002 | Penningmeester kan VVE-specifieke splitsingen beheren | P0 | To Do | MVP Q2 |
| EP-003 | Penningmeester kan jaarrekening en begroting maken | P0 | To Do | MVP Q2 |
| EP-004 | VVE kan snel en foutloos onboarden (multi-user) | P0 | To Do | MVP Q2 |
| EP-005 | Alle gebruikers hebben vertrouwen in veiligheid en compliance | P0 | To Do | MVP Q2 |
| EP-006 | Bestuur en bewoners kunnen documenten inzien en delen | P0 | To Do | MVP Q2 |
| EP-007 | VVE kan data exporteren en back-uppen | P1 | To Do | MVP Q2/Q3 |
| EP-008 | VVE kan betalen voor platform (flat fee) | P0 | To Do | MVP Q2 |
| **EP-009** | **Voorzitter en Bewoners kunnen inloggen en platform gebruiken** | **P0** | **To Do** | **MVP Q2** |

---

## EP-001: Penningmeester kan VVE financieel overzicht beheren

### Probleemomschrijving
Penningmeesters besteden **5-15 uur per maand** aan handmatige financiële administratie in Excel, wat **foutgevoelig en tijdrovend** is. Ze hebben geen real-time overzicht van de financiële situatie van hun VVE en moeten handmatig transacties categoriseren en reconciliëren.

**User pain points**:
- "Ik moet elke transactie handmatig in Excel invoeren en categoriseren"
- "Ik weet niet altijd of ik alle transacties heb verwerkt"
- "Het duurt uren om een overzicht te maken voor het bestuur"
- "Ik maak vaak tikfouten die ik later moet corrigeren"

### Doelstelling
Penningmeesters kunnen **binnen minuten** inkomsten en uitgaven registreren, categoriseren en een up-to-date financieel overzicht genereren, met **90% minder tijd** dan in Excel.

### In Scope
- Transacties toevoegen (inkomsten & uitgaven)
- Transacties categoriseren (VVE-specifieke categorieën)
- Bankrekening saldo bijhouden
- Meerdere reserves beheren (onderhoud, algemeen, speciaal)
- Transacties zoeken en filteren
- Basis rapportage (inkomsten/uitgaven per periode, per categorie, per reserve)

### Out of Scope
- Automatische bank koppeling (Roadmap Fase 2)
- Budgettering / forecasting (Roadmap)
- Bulk import van transacties (Nice-to-have, maar niet MVP)
- Multi-currency (Nederland only)

### Succesindicatoren
**Quantitative**:
- ✅ 90%+ penningmeesters voegen minimaal 1 transactie per week toe
- ✅ Gemiddeld <2 min om transactie toe te voegen
- ✅ Gemiddeld <5 min om maandelijks overzicht te genereren
- ✅ <5% support tickets over financiële admin workflow

**Qualitative**:
- ✅ "Dit bespaart me uren per maand" (user testimonials)
- ✅ "Eindelijk overzicht over mijn reserves" (user feedback)
- ✅ NPS >40 voor deze feature

### Herleidbaarheid
- **Probleemstatement**: docs/product/discovery/01-probleemdefinitie-productrichting.md - Primair Probleem
- **UX Onderzoek**: docs/ux/discovery/01-ux-vraagstukken-validatie.md - Vraagstuk 3 (Grootste frustraties)
- **Prioriteit**: docs/product/strategy/01-productstrategie-keuzes.md - Problem Priority Matrix (P0)

### Acceptance Criteria (High-Level)
- [ ] Penningmeester kan inkomsten en uitgaven toevoegen met datum, bedrag, categorie, beschrijving
- [ ] Penningmeester kan transacties toewijzen aan specifieke reserve (onderhoud, algemeen, etc.)
- [ ] Penningmeester kan transacties bewerken en verwijderen
- [ ] Penningmeester kan huidige saldo per reserve zien
- [ ] Penningmeester kan transacties filteren op periode, categorie, reserve
- [ ] Penningmeester kan basis rapportage genereren (inkomsten/uitgaven overzicht)

---

## EP-002: Penningmeester kan VVE-specifieke splitsingen beheren

### Probleemomschrijving
Splitsingsberekeningen (verdelen van kosten over eigenaren op basis van percentage/aandeel) zijn **complex, foutgevoelig en tijdrovend** in Excel. Penningmeesters maken vaak fouten in formules, vooral bij VVE's met meerdere splitsingssleutels of wijzigingen in eigenaarschap.

**User pain points**:
- "Elke maand moet ik contributie handmatig berekenen per eigenaar"
- "Als ik een fout maak in de formule, ziet niemand het tot het te laat is"
- "Bij nieuwe eigenaren moet ik alles opnieuw uitzoeken"
- "Ik ben bang dat ik iemand te veel of te weinig factureer"

### Doelstelling
Penningmeesters kunnen **automatisch** contributie en kosten berekenen op basis van splitsingssleutels, met **100% nauwkeurigheid** en **minimale handmatige berekeningen**.

### In Scope
- Splitsingssleutel definiëren (percentage per eigenaar)
- Meerdere eigenaren beheren (naam, contact, percentage)
- Automatisch contributie berekenen op basis van splitsing
- Kosten verdelen over eigenaren (handmatig of automatisch)
- Overzicht per eigenaar (wat hebben ze betaald, wat moeten ze betalen)
- Eigenaren lijst exporteren

### Out of Scope
- Meerdere splitsingssleutels per VVE (Nice-to-have, maar niet MVP - meestal 1 sleutel)
- Complexe splitsingsformules (MVP = simpele percentages)
- Automatische incasso (Roadmap Fase 2)
- Betalingsherinneringen (Roadmap)

### Succesindicatoren
**Quantitative**:
- ✅ 95%+ penningmeesters gebruiken splitsing feature
- ✅ 100% nauwkeurigheid (geen fouten in splitsingsberekeningen)
- ✅ <1 min om contributie te berekenen voor alle eigenaren
- ✅ <2% support tickets over splitsingen

**Qualitative**:
- ✅ "Ik hoef nooit meer handmatig te rekenen" (user feedback)
- ✅ "Dit alleen al is de prijs waard" (willingness to pay validation)
- ✅ Splitsing is top 3 meest gewaardeerde feature

### Herleidbaarheid
- **Probleemstatement**: docs/product/discovery/01-probleemdefinitie-productrichting.md - VVE-Specifieke Functionaliteit
- **UX Onderzoek**: docs/ux/discovery/01-ux-vraagstukken-validatie.md - Vraagstuk 6 (VVE-specifieke complexiteit)
- **Hypothese**: docs/ux/discovery/01-ux-vraagstukken-validatie.md - Hypothese 2 (Splitsing is top value driver)

### Acceptance Criteria (High-Level)
- [ ] Penningmeester kan splitsingssleutel instellen (% per eigenaar, totaal = 100%)
- [ ] Penningmeester kan eigenaren toevoegen met naam, contact, percentage
- [ ] Systeem controleert dat totaal percentage = 100%
- [ ] Penningmeester kan contributie bedrag invoeren en systeem berekent automatisch per eigenaar
- [ ] Penningmeester kan kosten verdelen over eigenaren op basis van splitsing
- [ ] Penningmeester kan per eigenaar zien: contributie verschuldigd, betaald, openstaand
- [ ] Penningmeester kan eigenaren lijst exporteren (Excel/PDF)

---

## EP-003: Penningmeester kan jaarrekening en begroting maken

### Probleemomschrijving
**Jaarrekening maken is de meest stressvolle taak** voor penningmeesters (1x per jaar, Q4/Q1). Ze moeten handmatig alle transacties verzamelen, categoriseren, reserves berekenen en een rapport maken volgens VVE standaarden. Dit kost **10-20 uur** en is **foutgevoelig**.

**User pain points**:
- "Jaarrekening maken is een nachtmerrie, duurt weken"
- "Ik weet niet zeker of ik alle verplichte onderdelen heb"
- "Elke VVE wil iets anders zien in de jaarrekening"
- "Ik ben bang dat de ALV me erop aanspreekt als iets niet klopt"

### Doelstelling
Penningmeesters kunnen **binnen 1-2 uur** een complete, VVE-conforme jaarrekening en begroting genereren, met **80% minder tijd** en **100% compleetheid** (alle verplichte onderdelen).

### In Scope
- Jaarrekening template (VVE-standaard)
- Automatisch vullen van template met transactie data
- Begroting template (voor volgend jaar)
- Reserves mutatie overzicht (begin saldo, mutaties, eind saldo)
- PDF export van jaarrekening en begroting
- Jaar-op-jaar vergelijking (basic)

### Out of Scope
- Accountant review/approval workflow (Roadmap)
- Multi-year trends (Nice-to-have)
- Custom rapportage (MVP = standaard template)
- Goedkeuring/digitale handtekening (Roadmap)

### Succesindicatoren
**Quantitative**:
- ✅ 70%+ penningmeesters genereren jaarrekening in systeem
- ✅ Gemiddeld <2 uur om jaarrekening te completeren
- ✅ 100% compleetheid (alle verplichte onderdelen aanwezig)
- ✅ <10% support tickets over jaarrekening

**Qualitative**:
- ✅ "Jaarrekening ging dit jaar 10x sneller" (user testimonials)
- ✅ "ALV was impressed met de professionele rapportage" (user feedback)
- ✅ Jaarrekening feature is top 1 reason to upgrade to paid

### Herleidbaarheid
- **Probleemstatement**: docs/product/discovery/01-probleemdefinitie-productrichting.md - Gebruikscontext (jaarlijks Q4/Q1)
- **UX Onderzoek**: docs/ux/discovery/01-ux-vraagstukken-validatie.md - Vraagstuk 3 (Jaarrekening is stressvol)
- **Prioriteit**: docs/product/strategy/01-productstrategie-keuzes.md - Problem Priority Matrix (P0 - zeer hoog impact)

### Acceptance Criteria (High-Level)
- [ ] Penningmeester kan jaarrekening genereren voor geselecteerd jaar
- [ ] Jaarrekening bevat alle verplichte onderdelen: balans, exploitatie, reserves mutatie, toelichting
- [ ] Jaarrekening wordt automatisch gevuld met transactie data uit systeem
- [ ] Penningmeester kan begroting maken voor volgend jaar (vooringevuld met dit jaar + aanpassingen)
- [ ] Penningmeester kan jaarrekening en begroting exporteren als PDF
- [ ] Penningmeester kan jaar-op-jaar vergelijking zien (basic: dit jaar vs vorig jaar)

---

## EP-004: Penningmeester kan snel en foutloos onboarden

### Probleemomschrijving
Nieuwe penningmeesters hebben **geen tijd of geduld** om complexe software te leren. Ze willen **binnen 30 minuten** kunnen starten zonder training. Als onboarding te complex is, haken ze af en blijven ze Excel gebruiken.

**User pain points**:
- "Ik heb geen tijd om een handleiding te lezen"
- "Ik wil gewoon snel kunnen beginnen"
- "Ik weet niet hoe ik moet starten met een nieuw systeem"
- "Ik heb geen technische achtergrond"

### Doelstelling
**80%+ penningmeesters** kunnen binnen **30 minuten** hun VVE volledig inrichten en eerste transacties toevoegen, **zonder hulp** van support.

### In Scope
- Onboarding wizard (stap-voor-stap VVE setup)
- VVE basis info (naam, aantal appartementen, oprichtingsdatum)
- Splitsingssleutel setup (simpele wizard)
- Eigenaren toevoegen (bulk of 1-by-1)
- Reserves aanmaken (templates: onderhoud, algemeen, speciaal)
- Eerste transacties toevoegen (tutorial)
- Help & tutorials (video's, tooltips)
- Progress indicator (% complete)

### Out of Scope
- Data import van bestaande systeem (Nice-to-have, maar complex)
- 1-on-1 onboarding calls (niet schaalbaar, alleen voor beta)
- Accountant assisted setup (Roadmap)

### Succesindicatoren
**Quantitative**:
- ✅ 80%+ completion rate van onboarding wizard
- ✅ <30 min gemiddelde tijd om VVE in te richten
- ✅ <5% support tickets tijdens onboarding
- ✅ >60% voegt transacties toe binnen 24u na signup

**Qualitative**:
- ✅ "Zo makkelijk om te starten!" (user feedback)
- ✅ "Ik had geen hulp nodig" (user testimonials)
- ✅ Onboarding is geen blocker voor adoptie

### Herleidbaarheid
- **Probleemstatement**: docs/product/discovery/01-probleemdefinitie-productrichting.md - Succesfactoren voor adoptie (simpel, weinig leercurve)
- **UX Onderzoek**: docs/ux/discovery/01-ux-vraagstukken-validatie.md - Vraagstuk 1 (Wat is "simpel genoeg"?)
- **Hypothese**: docs/ux/discovery/01-ux-vraagstukken-validatie.md - Hypothese 1 (Simpele onboarding drijft adoptie)

### Acceptance Criteria (High-Level)
- [ ] Nieuw penningmeester ziet onboarding wizard bij eerste login
- [ ] Wizard heeft duidelijke stappen: VVE info → Splitsing → Eigenaren → Reserves → First transaction
- [ ] Wizard heeft progress indicator (stap X van Y)
- [ ] Wizard heeft skip optie (kunnen later invullen)
- [ ] Wizard heeft tooltips en help (inline explanations)
- [ ] Na wizard: penningmeester ziet dashboard met "what's next" acties
- [ ] Help sectie heeft video tutorials voor common tasks

---

## EP-005: Penningmeester heeft vertrouwen in veiligheid en compliance

### Probleemomschrijving
Penningmeesters beheren **gevoelige financiële data** van hun VVE en eigenaren. Ze hebben **angst voor datalekken, verlies of niet-compliance** met AVG. Dit kan een blocker zijn voor adoptie als vertrouwen niet is opgebouwd.

**User pain points**:
- "Kan ik jullie vertrouwen met onze financiële data?"
- "Wat als jullie gehackt worden?"
- "Is dit AVG compliant? Ik wil geen boete riskeren"
- "Wat als jullie failliet gaan, waar is mijn data dan?"

### Doelstelling
**100% penningmeesters** hebben vertrouwen in veiligheid en compliance van VVE Tooling, met **zero security incidents** en **volledige AVG compliance**.

### In Scope
- Bank-level encryptie (data in transit en at rest)
- Nederlandse data center (AVG compliance)
- 2-factor authentication (2FA)
- Audit log (wie heeft wat gedaan)
- Data export/backup (eigenaar van data)
- Privacy policy & Terms of Service (transparant)
- Security page (hoe we data beschermen)
- AVG compliance verklaring

### Out of Scope
- ISO/SOC2 certificering (Nice-to-have, maar niet MVP requirement)
- Penetration testing (Roadmap, na MVP)
- GDPR officer (Initially Product Manager, later dedicated role)

### Succesindicatoren
**Quantitative**:
- ✅ 99.9%+ uptime
- ✅ Zero security incidents (breaches, leaks)
- ✅ 100% AVG compliant
- ✅ <1% support tickets over security/privacy concerns

**Qualitative**:
- ✅ "Ik voel me veilig met mijn data hier" (user feedback)
- ✅ "Duidelijke uitleg over privacy" (user testimonials)
- ✅ Security is geen blocker voor adoptie
- ✅ Trust & reliability in top 3 redenen om VVE Tooling te kiezen

### Herleidbaarheid
- **Probleemstatement**: docs/product/discovery/01-probleemdefinitie-productrichting.md - Succesfactoren (betrouwbaar, compliant)
- **UX Onderzoek**: docs/ux/discovery/01-ux-vraagstukken-validatie.md - Hypothese 5 (Peace of mind is key)
- **Prioriteit**: Core value proposition - zonder trust geen adoptie

### Acceptance Criteria (High-Level)
- [ ] Data is encrypted in transit (HTTPS/TLS) en at rest (AES-256)
- [ ] Data opslag is in Nederlandse data center (AVG compliant)
- [ ] Penningmeester kan 2FA inschakelen (optioneel maar recommended)
- [ ] Penningmeester kan data exporteren (Excel/CSV/PDF)
- [ ] Penningmeester kan account verwijderen (incl. alle data)
- [ ] Website heeft security page met uitleg over data bescherming
- [ ] Privacy policy en ToS zijn duidelijk en transparant
- [ ] Audit log toont belangrijke acties (wie heeft transacties toegevoegd/gewijzigd)

---

## EP-006: Penningmeester kan documenten beheren en delen

### Probleemomschrijving
Penningmeesters ontvangen **veel documenten** (facturen, contracten, notulen, etc.) en hebben **geen centrale plek** om deze op te slaan en te delen met bestuur/eigenaren. Ze gebruiken nu Google Drive, email of fysieke archieven, wat **versnipperd en onoverzichtelijk** is.

**User pain points**:
- "Ik moet facturen zoeken in mijn email of WhatsApp"
- "Eigenaren vragen om documenten die ik niet kan vinden"
- "Ik heb geen overzicht van wat ik wel/niet heb opgeslagen"
- "Delen met bestuur is omslachtig (email attachments)"

**Note**: Dit is **P1 (Should Have)**, niet P0. Documenten zijn belangrijk maar niet blocker voor MVP. Kan in later sprint als tijd toelaat.

### Doelstelling
Penningmeesters kunnen **binnen seconden** documenten uploaden, organiseren en delen met bestuur/eigenaren, met **100% overzicht** van alle VVE documenten.

### In Scope
- Documenten uploaden (PDF, JPG, etc.)
- Documenten categoriseren (factuur, contract, notulen, etc.)
- Documenten linken aan transacties (factuur → uitgave)
- Documenten zoeken en filteren
- Documenten delen via link (read-only)
- Basis document viewer (PDF preview)

### Out of Scope
- Document signing (Roadmap)
- OCR / data extraction (AI feature, Roadmap Fase 3)
- Version control (Nice-to-have)
- Permissions per document (MVP = share all or nothing)

### Succesindicatoren
**Quantitative**:
- ✅ 60%+ penningmeesters uploaden minimaal 5 documenten
- ✅ 40%+ penningmeesters gebruiken document sharing feature
- ✅ <30 sec om document te uploaden en categoriseren

**Qualitative**:
- ✅ "Eindelijk alles op 1 plek" (user feedback)
- ✅ Document feature is in top 5 most used features

### Herleidbaarheid
- **Prioriteit**: docs/product/strategy/01-productstrategie-keuzes.md - Problem Priority Matrix (P1 - Should Have)
- **Probleemstatement**: docs/product/discovery/01-probleemdefinitie-productrichting.md - In-scope MVP (facturen uploaden/opslaan)

### Acceptance Criteria (High-Level)
- [ ] Penningmeester kan documenten uploaden (drag & drop)
- [ ] Penningmeester kan documenten categoriseren (type: factuur, contract, etc.)
- [ ] Penningmeester kan documenten linken aan transactie
- [ ] Penningmeester kan documenten zoeken (naam, type, datum)
- [ ] Penningmeester kan documenten delen via link (read-only)
- [ ] Penningmeester kan documenten verwijderen
- [ ] Systeem toont document preview (PDF viewer)

---

## EP-007: Penningmeester kan VVE data exporteren en back-uppen

### Probleemomschrijving
Penningmeesters willen **eigenaar blijven van hun data** en hebben **behoefte aan backup** voor disaster recovery of wisseling van systeem. Ze willen niet "locked in" zijn bij één platform.

**User pain points**:
- "Wat als VVE Tooling stopt? Waar is mijn data?"
- "Ik wil een backup voor de zekerheid"
- "Accountant wil Excel bestand voor jaarrekening"
- "Bij wisseling van penningmeester moet ik data kunnen overdragen"

**Note**: Dit is **P1 (Should Have)** vanwege trust building (geen lock-in), maar niet absolute blocker.

### Doelstelling
Penningmeesters kunnen **altijd en instant** hun volledige VVE data exporteren in standaard formaten (Excel, CSV, PDF) voor backup of migratie.

### In Scope
- Data export (Excel/CSV: transacties, eigenaren, splitsing)
- Rapportage export (PDF: jaarrekening, begroting, overzichten)
- Volledige export (alles in 1 zip)
- Export op moment van keuze (instant download)

### Out of Scope
- Automatische backups (naar Google Drive etc.) - Nice-to-have
- Scheduled exports (weekly/monthly) - Roadmap
- Import from export (re-importing data) - Complex, later

### Succesindicatoren
**Quantitative**:
- ✅ 40%+ penningmeesters exporteren data minimaal 1x
- ✅ <10 sec download tijd voor export
- ✅ <2% support tickets over export

**Qualitative**:
- ✅ "Fijn dat ik mijn data kan downloaden" (user feedback)
- ✅ Export is trust-building feature (no lock-in)

### Herleidbaarheid
- **Probleemstatement**: docs/product/discovery/01-probleemdefinitie-productrichting.md - Gebruikerservaring (data export voor backup/overdracht)
- **Trust**: Onderdeel van vertrouwen opbouwen (EP-005)

### Acceptance Criteria (High-Level)
- [ ] Penningmeester kan transacties exporteren (Excel/CSV)
- [ ] Penningmeester kan eigenaren lijst exporteren (Excel/CSV)
- [ ] Penningmeester kan rapportages exporteren (PDF)
- [ ] Penningmeester kan complete VVE data exporteren (ZIP met alles)
- [ ] Export is instant (no waiting, direct download)
- [ ] Export formaat is standaard en leesbaar (niet proprietary)

---

## EP-008: VVE kan upgraden van gratis naar betaald tier

### Probleemomschrijving
Freemium business model vereist **smooth upgrade path** van gratis naar betaald. Als upgrade process te complex of onduidelijk is, verliezen we conversie en blijven users stuck op gratis tier.

**User pain points**:
- "Wanneer moet ik betalen?"
- "Wat krijg ik extra als ik betaal?"
- "Hoe upgrade ik?"
- "Kan ik weer downgraden?"

### Doelstelling
**25%+ van gratis users** upgraden naar betaald tier binnen **3 maanden**, met **duidelijke value proposition** en **frictionless upgrade flow**.

### In Scope
- Free tier limiet (10 appartementen)
- Pricing tiers (€5, €10, €15 per maand op basis van VVE grootte)
- Upgrade prompt (wanneer free limiet bereikt)
- Payment integration (Stripe/Mollie)
- Subscription management (upgrade/downgrade/cancel)
- Billing & invoices
- Feature gating (premium features alleen voor betaald)

### Out of Scope
- Annual billing (MVP = monthly only)
- Coupons/discounts (Nice-to-have)
- Affiliate/referral credits (Roadmap)
- Enterprise/custom pricing (Roadmap Fase 2)

### Succesindicatoren
**Quantitative**:
- ✅ 25%+ conversie van gratis naar betaald (binnen 3 maanden)
- ✅ <5% failed payments
- ✅ <10% downgrade/cancel binnen 1e maand
- ✅ <2% support tickets over billing

**Qualitative**:
- ✅ "Upgrade was makkelijk" (user feedback)
- ✅ "Prijs is fair" (willingness to pay validated)
- ✅ Duidelijk welke features premium zijn

### Herleidbaarheid
- **Business Model**: docs/product/strategy/01-productstrategie-keuzes.md - Keuze 2 (Freemium business model)
- **Pricing**: docs/product/discovery/01-probleemdefinitie-productrichting.md - Pricing & Business Model
- **Hypothese**: docs/ux/discovery/01-ux-vraagstukken-validatie.md - Hypothese 3 (Freemium converteert bij 10+ appartementen)

### Acceptance Criteria (High-Level)
- [ ] Gratis tier is gelimiteerd tot 10 appartementen
- [ ] Penningmeester ziet duidelijke pricing page (€5/€10/€15 tiers)
- [ ] Penningmeester krijgt upgrade prompt bij free limiet (friendly, niet pushy)
- [ ] Penningmeester kan upgraden via credit card (Stripe/Mollie)
- [ ] Penningmeester ontvangt invoice per email
- [ ] Penningmeester kan subscription beheren (upgrade/downgrade/cancel)
- [ ] Premium features zijn duidelijk gelabeld (badge/icon)
- [ ] Downgrade is mogelijk (data blijft beschikbaar, read-only)

---

## EP-009: Voorzitter en Bewoners kunnen inloggen en platform gebruiken

### Probleemomschrijving
VVE's hebben **gebrek aan transparantie en samenwerking** omdat alleen de penningmeester toegang heeft tot financiële informatie en documenten. **Voorzitters moeten constant penningmeester om updates vragen**, en **bewoners blijven passief** omdat ze geen inzicht hebben in waar hun contributie naartoe gaat. Dit leidt tot **wantrouwen, miscommunicatie en lage betrokkenheid**.

**User pain points**:
- **Voorzitter**: "Ik moet penningmeester constant mailen voor een financieel overzicht"
- **Voorzitter**: "Ik kan niet zelf controleren of de cijfers kloppen"
- **Bewoner**: "Ik weet niet waar mijn contributie aan uitgegeven wordt"
- **Bewoner**: "Ik moet altijd naar ALV komen om documenten te krijgen"
- **Penningmeester**: "Ik krijg steeds dezelfde vragen van bewoners over hetzelfde"

### Doelstelling
**Alle VVE leden** (voorzitter, bestuursleden, bewoners) kunnen **inloggen** en toegang krijgen tot relevante informatie op basis van hun rol, met **100% transparantie** en **rol-gebaseerde permissions**.

**Success target**:
- **100% van VVE's** heeft minimaal 3 actieve gebruikers (penningmeester + voorzitter + bewoners)
- **30%+ bewoners** maken account aan en loggen in minimaal 1x per maand
- **Voorzitters loggen minimaal 1x per week** in om financiën te checken

### In Scope
- **User Management**:
  - Penningmeester kan gebruikers uitnodigen (email invite)
  - Gebruikers kunnen account aanmaken met uitnodigingscode
  - Rollen toewijzen: Penningmeester (admin), Voorzitter/Bestuur (collaborator), Bewoner (read-only)
  - Gebruikers activeren/deactiveren
  
- **Permissions & Roles**:
  - **Penningmeester (Admin)**:
    - Volledige toegang: alles zien, alles doen
    - Gebruikers beheren
    - Financiële transacties toevoegen/wijzigen
  - **Voorzitter/Bestuur (Collaborator)**:
    - Lezen: Alle financiële data, documenten, rapportages
    - Schrijven beperkt: Documenten uploaden, opmerkingen toevoegen
    - Geen financiële transacties wijzigen
  - **Bewoner (Read-Only)**:
    - Lezen: Financiële overzichten (niet details van individuele transacties), documenten, rapportages
    - Eigen profiel: Contactgegevens updaten, eigen betalingsstatus zien
    - Geen access tot andere bewoners' gegevens
    
- **Different Dashboards**:
  - **Penningmeester dashboard**: Financieel focus (transacties, reconciliatie, taken)
  - **Voorzitter dashboard**: Overzicht focus (saldi, recente activiteiten, documenten)
  - **Bewoner dashboard**: Transparantie focus (waar gaat geld naartoe, documenten, eigen status)
  
- **Privacy & Security**:
  - Bewoners kunnen alleen eigen betalingsstatus zien (niet van anderen)
  - Audit log: Wie heeft wat gedaan (bestuur kan zien)
  - Email notificaties voor belangrijke events (configureerbaar per user)

### Out of Scope
- Advanced permissions (custom roles, granular permissions) - Roadmap
- Delegation (bijv. penningmeester tijdelijk toegang geven aan iemand anders) - Roadmap
- SSO / Social login (Google, Facebook) - Roadmap
- In-app messaging tussen gebruikers - Roadmap Fase 2
- Polls/Voting - Roadmap Fase 2

### Succesindicatoren
**Quantitative**:
- ✅ 100% van VVE's heeft ≥3 actieve gebruikers
- ✅ 30%+ van bewoners maken account aan en loggen ≥1x/maand in
- ✅ 80%+ van voorzitters loggen ≥1x/week in
- ✅ <10% support tickets over permissions/access

**Qualitative**:
- ✅ "Eindelijk weet ik waar mijn geld naartoe gaat" (bewoner feedback)
- ✅ "Ik kan nu zelf de financiën checken" (voorzitter feedback)
- ✅ "Ik krijg minder repetitieve vragen van bewoners" (penningmeester feedback)
- ✅ Multi-user is top 1 differentiator vs concurrenten

### Herleidbaarheid
- **Probleemstatement**: docs/product/discovery/01-probleemdefinitie-productrichting.md - Primair Probleem (v2.0)
- **Nieuwe requirement**: Voorzitter + bewoners moeten kunnen inloggen
- **Prioriteit**: P0 - Core value proposition van het platform

### Acceptance Criteria (High-Level)
- [ ] Penningmeester kan gebruikers uitnodigen via email (met rol: voorzitter/bestuur/bewoner)
- [ ] Uitgenodigde gebruikers ontvangen email met link + uitnodigingscode
- [ ] Gebruikers kunnen account aanmaken met email + wachtwoord (+ uitnodigingscode)
- [ ] System wijst correct rol toe op basis van uitnodiging
- [ ] **Penningmeester** ziet admin dashboard met alle financiële tools
- [ ] **Voorzitter** ziet overzicht dashboard met saldi, recente transacties, documenten (read-only financial data)
- [ ] **Voorzitter** kan documenten uploaden (bijv. notulen)
- [ ] **Bewoner** ziet transparantie dashboard met: waar geld naartoe gaat, eigen betalingsstatus, documenten
- [ ] **Bewoner** kan eigen contactgegevens updaten
- [ ] Bewoners kunnen NIET andere bewoners' financiële data zien
- [ ] Audit log toont wie wat heeft gedaan (toegankelijk voor penningmeester en voorzitter)
- [ ] Penningmeester kan gebruikers deactiveren (bijv. bij vertrek uit VVE)
- [ ] Email notificaties voor nieuwe documenten, belangrijke updates (opt-in)

---

## Prioritisering & Roadmap

### MVP Critical Path (Must Have voor Launch)
1. **EP-001**: Financieel overzicht - Core value proposition
2. **EP-002**: Splitsingen - VVE-specific differentiator
3. **EP-003**: Jaarrekening - High-impact, annual pain point
4. **EP-004**: Onboarding (multi-user) - Adoption enabler
5. **EP-005**: Security & Compliance - Trust builder
6. **EP-006**: Documenten - Transparency enabler (upgraded to P0)
7. **EP-008**: Payment (flat fee) - Revenue enabler
8. **EP-009**: Multi-user & Permissions - **Core differentiator, transparency driver**

**Estimated timeline**: 4-6 maanden (Q2-Q3 2026) - Multi-user adds complexity

### MVP Nice-to-Have (Launch if Time Allows)
9. **EP-007**: Data export - Trust building

**Estimated timeline**: +1 maand (Q3 2026)

### Post-MVP (Roadmap Fase 2)
- Bank integraties (automatisch transacties ophalen)
- Native mobile apps (iOS/Android) - vooral voor bewoners
- In-app messaging (chat tussen bewoners en bestuur)
- Polls/Voting (online stemmen)
- WhatsApp integraties
- Onderhoud planning
- Contract management

## Next Steps

**Voor Engineering**:
→ Epics worden uitgewerkt in User Stories met technical specs
→ Story mapping sessie plannen voor MVP scope
→ Architecture design voor EP-001, EP-002 (core platform)

**Voor Design**:
→ User flows maken voor EP-004 (onboarding) - highest UX risk
→ Wireframes voor EP-001, EP-002 (core workflows)
→ Prototype testing plannen (zie UX discovery doc)

**Voor Product**:
→ UX Research starten (valideren hypotheses uit EP-002, EP-003, EP-004)
→ Beta recruitment (50 VVE's)
→ Success metrics dashboard setup

## Conclusie

Deze **9 Epics** vormen de basis van VVE Tooling MVP. Ze zijn:
- ✅ **Problem-focused**: Geformuleerd vanuit gebruikers pijnpunten
- ✅ **Herleidbaar**: Linked naar discovery en strategy docs
- ✅ **Meetbaar**: Duidelijke succesindicatoren
- ✅ **Scoped**: Realistic voor 3-6 maanden development
- ✅ **Multi-user**: Platform voor hele VVE (penningmeester + voorzitter + bewoners)

**Critical path** (EP-001 t/m EP-006, EP-008, EP-009) is **must-have** voor MVP launch. EP-007 is **nice-to-have** en kan later.

**Belangrijkste wijziging vs origineel**: **EP-009 (Multi-user)** is toegevoegd als P0 epic. Dit verandert het product van "tool voor penningmeester" naar "platform voor hele VVE". Dit heeft grote impact op UX, permissions, pricing en value proposition.

Met deze epics bouwen we een **collaboratief, transparant platform** dat het core probleem (gebrek aan overzicht en samenwerking in VVE) oplost met multi-user access en VVE-specifieke differentiatie.
