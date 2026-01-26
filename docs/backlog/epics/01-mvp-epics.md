# Epics & Backlog - VVE Tooling MVP

## Documentinformatie
- **Datum**: 2026-01-26 (Updated: 2026-01-26)
- **Eigenaar**: Product Management
- **Status**: Final
- **Versie**: 2.1
- **Changelog**: 
  - v2.1 - Epics herbekeken vanuit PM perspectief: EP-004, EP-005, EP-006 ge-update om beter aan te sluiten bij multi-user doelstellingen en VvE onboarding voor alle rollen
  - v2.0 - Multi-user platform requirement (EP-009 toegevoegd, alle epics ge-update)

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

## EP-004: VVE kan snel en foutloos onboarden met alle gebruikers

### Probleemomschrijving
VVE's hebben **moeite om het platform te implementeren** als complete organisatie. Penningmeesters moeten niet alleen zelf leren werken met de software, maar ook **voorzitter en bewoners activeren** om het platform te gebruiken. Als de onboarding te complex is of te veel tijd kost, haken ze af en blijven ze bij Excel en WhatsApp.

**User pain points**:
- **Penningmeester**: "Ik heb geen tijd om een handleiding te lezen én ook nog anderen te helpen"
- **Penningmeester**: "Hoe krijg ik voorzitter en bewoners ook aan boord?"
- **Voorzitter**: "Ik wil snel kunnen zien waar we staan, zonder uitleg nodig te hebben"
- **Bewoner**: "Ik heb geen technische achtergrond, moet dit simpel zijn"
- **Algemeen**: "We willen als VVE snel kunnen starten zonder lange training"

### Doelstelling
**80%+ VVE's** kunnen binnen **1 uur** volledig inrichten (VVE setup + gebruikers activeren) en **alle rollen** (penningmeester, voorzitter, bewoners) kunnen direct waarde halen uit het platform, **zonder hulp** van support.

**Specifiek**:
- Penningmeester: VVE inrichten en eerste transacties toevoegen (<30 min)
- Voorzitter: Uitnodiging accepteren en dashboard zien (<10 min)
- Bewoners: Account aanmaken en eigen status bekijken (<5 min)

### In Scope
**VVE Setup (Penningmeester)**:
- Onboarding wizard (stap-voor-stap VVE setup)
- VVE basis info (naam, aantal appartementen, oprichtingsdatum)
- Splitsingssleutel setup (simpele wizard)
- Eigenaren toevoegen (bulk of 1-by-1)
- Reserves aanmaken (templates: onderhoud, algemeen, speciaal)
- Eerste transacties toevoegen (tutorial)

**Gebruikers Activeren (Penningmeester)**:
- Voorzitter/bestuur uitnodigen (stap in onboarding wizard)
- Bewoners uitnodigen (bulk email invite met uitnodigingscode)
- Uitleg/templates voor uitnodiging emails
- Uitnodigingsstatus tracking (wie heeft geaccepteerd?)

**Onboarding voor Voorzitter/Bestuur**:
- Welkom email met duidelijke uitleg wat ze kunnen doen
- Korte tour van dashboard (tooltips, highlight key features)
- Quick start guide specifiek voor voorzitter rol

**Onboarding voor Bewoners**:
- Simpele account aanmaak flow (email + wachtwoord + uitnodigingscode)
- Welkom screen met uitleg: "Dit is jouw VVE dashboard"
- Tour van wat ze kunnen zien (financiën, documenten, eigen status)
- Mobile-first design (meeste bewoners op smartphone)

**Help & Tutorials (Rol-specifiek)**:
- Video tutorials per rol (penningmeester, voorzitter, bewoner)
- Tooltips en inline help
- FAQ sectie (rol-specifiek)
- Progress indicator (% complete)

### Out of Scope
- Data import van bestaande systeem (Nice-to-have, maar complex)
- 1-on-1 onboarding calls (niet schaalbaar, alleen voor beta)
- Accountant assisted setup (Roadmap)
- In-person training sessions
- Custom onboarding per VVE type (MVP = standaard flow voor alle VVE's)

### Succesindicatoren
**Quantitative - VVE Setup**:
- ✅ 80%+ completion rate van onboarding wizard (penningmeester)
- ✅ <1 uur gemiddelde tijd om complete VVE in te richten (incl. gebruikers uitnodigen)
- ✅ <30 min voor alleen VVE basis setup (zonder gebruikers)
- ✅ <5% support tickets tijdens onboarding

**Quantitative - Gebruikers Activatie**:
- ✅ Gemiddeld 3+ gebruikers uitgenodigd per VVE tijdens onboarding
- ✅ 60%+ acceptance rate van uitnodigingen (binnen 7 dagen)
- ✅ 70%+ voorzitters loggen in binnen 24u na uitnodiging
- ✅ 30%+ bewoners loggen in binnen 7 dagen na uitnodiging

**Quantitative - Time to Value**:
- ✅ 60%+ penningmeesters voegen transacties toe binnen 24u na signup
- ✅ 50%+ voorzitters checken dashboard binnen 48u
- ✅ 20%+ bewoners bekijken hun status binnen 7 dagen

**Qualitative**:
- ✅ "Zo makkelijk om te starten, zelfs voor onze bewoners!" (penningmeester feedback)
- ✅ "Ik had geen hulp nodig om te beginnen" (alle rollen)
- ✅ "Fijn dat iedereen direct kan inloggen" (voorzitter feedback)
- ✅ Onboarding is geen blocker voor adoptie (alle gebruikersgroepen)

### Herleidbaarheid
- **Probleemstatement**: docs/product/discovery/01-probleemdefinitie-productrichting.md - Primair Probleem (multi-user platform, alle rollen moeten onboarden)
- **Product Visie**: docs/product/strategy/01-productstrategie-keuzes.md - Multi-user platform (niet single-user tool)
- **Succesfactoren**: docs/product/discovery/01-probleemdefinitie-productrichting.md - Succesfactoren voor adoptie (simpel voor alle rollen)
- **UX Onderzoek**: docs/ux/discovery/01-ux-vraagstukken-validatie.md - Vraagstuk 1 (Wat is "simpel genoeg" voor diverse gebruikersgroepen?)
- **Hypothese**: docs/ux/discovery/01-ux-vraagstukken-validatie.md - Hypothese 1 (Simpele onboarding voor alle rollen drijft adoptie)

### Acceptance Criteria (High-Level)

**Penningmeester Onboarding**:
- [ ] Nieuwe penningmeester ziet onboarding wizard bij eerste login
- [ ] Wizard heeft duidelijke stappen: VVE info → Splitsing → Eigenaren → Reserves → Gebruikers uitnodigen → First transaction
- [ ] Wizard heeft progress indicator (stap X van Y)
- [ ] Wizard heeft skip optie (kunnen later invullen)
- [ ] Wizard bevat stap: "Nodig voorzitter en bewoners uit" met uitleg waarom dit belangrijk is
- [ ] Penningmeester kan bulk email uitnodigingen versturen naar bewoners
- [ ] Penningmeester ziet status van uitnodigingen (geaccepteerd/pending)

**Voorzitter/Bestuur Onboarding**:
- [ ] Voorzitter ontvangt duidelijke uitnodiging email met uitleg van hun rol
- [ ] Voorzitter kan eenvoudig account aanmaken via uitnodigingslink
- [ ] Voorzitter ziet welkom tour bij eerste login (5-10 seconden, key features)
- [ ] Voorzitter ziet direct dashboard met financieel overzicht (geen lege state)
- [ ] Help sectie heeft quick start guide voor voorzitter rol

**Bewoner Onboarding**:
- [ ] Bewoner ontvangt simpele, vriendelijke uitnodiging email ("Bekijk jouw VVE")
- [ ] Bewoner kan account aanmaken met alleen email + wachtwoord + uitnodigingscode
- [ ] Bewoner ziet welkom screen: "Dit is jouw VVE dashboard" (simpele uitleg)
- [ ] Bewoner ziet direct hun eigen status (contributie, betalingen) - geen lege state
- [ ] Bewoner onboarding is mobile-first (werkt perfect op smartphone)
- [ ] Bewoner kan dashboard bookmarken op homescreen (PWA)

**Algemeen**:
- [ ] Wizard heeft tooltips en help (inline explanations)
- [ ] Na wizard: gebruikers zien rol-specifiek dashboard met "what's next" acties
- [ ] Help sectie heeft video tutorials voor alle rollen (penningmeester, voorzitter, bewoner)
- [ ] Alle onboarding flows hebben duidelijke exit/save points (kunnen pauzeren en later verder)

---

## EP-005: Alle gebruikers hebben vertrouwen in veiligheid en compliance

### Probleemomschrijving
VVE's beheren **gevoelige financiële data** van de organisatie en alle eigenaren. **Penningmeesters, voorzitters en bewoners** hebben allen **angst voor datalekken, verlies of niet-compliance** met AVG. Dit kan een blocker zijn voor adoptie als vertrouwen niet is opgebouwd, zeker omdat bewoners hun persoonlijke betalingsgegevens delen.

**User pain points**:
- **Penningmeester/Voorzitter**: "Kan ik jullie vertrouwen met onze financiële data?"
- **Penningmeester/Voorzitter**: "Wat als jullie gehackt worden?"
- **Penningmeester**: "Is dit AVG compliant? Ik wil geen boete riskeren"
- **Bewoner**: "Kunnen andere bewoners mijn betalingsgegevens zien?"
- **Bewoner**: "Wat gebeurt er met mijn persoonlijke data?"
- **Algemeen**: "Wat als jullie failliet gaan, waar is mijn data dan?"

### Doelstelling
**100% gebruikers** (penningmeesters, voorzitters en bewoners) hebben vertrouwen in veiligheid, privacy en compliance van VVE Tooling, met **zero security incidents** en **volledige AVG compliance**.

### In Scope
- Bank-level encryptie (data in transit en at rest)
- Nederlandse data center (AVG compliance)
- 2-factor authentication (2FA)
- Rol-gebaseerde toegangscontrole (permissions per gebruikersrol)
- Privacy by design: Bewoners kunnen alleen eigen betalingsstatus zien, niet van anderen
- Audit log (wie heeft wat gedaan, toegankelijk voor penningmeester en voorzitter)
- Data export/backup (eigenaar van data)
- Privacy policy & Terms of Service (transparant, begrijpelijk)
- Security page (hoe we data beschermen, voor alle gebruikers)
- AVG compliance verklaring
- Duidelijke communicatie over wie wat kan zien (rol-specifiek)

### Out of Scope
- ISO/SOC2 certificering (Nice-to-have, maar niet MVP requirement)
- Penetration testing (Roadmap, na MVP)
- GDPR officer (Initially Product Manager, later dedicated role)

### Succesindicatoren
**Quantitative**:
- ✅ 99.9%+ uptime
- ✅ Zero security incidents (breaches, leaks)
- ✅ 100% AVG compliant
- ✅ <1% support tickets over security/privacy concerns (alle gebruikersgroepen)
- ✅ 0 complaints over privacy violations (bijv. bewoners die elkaars data kunnen zien)

**Qualitative**:
- ✅ "Ik voel me veilig met mijn data hier" (alle gebruikersgroepen)
- ✅ "Duidelijke uitleg over privacy" (vooral belangrijk voor bewoners)
- ✅ "Fijn dat andere bewoners mijn betalingen niet kunnen zien" (bewoner feedback)
- ✅ Security is geen blocker voor adoptie (penningmeester, voorzitter, bewoner)
- ✅ Trust & reliability in top 3 redenen om VVE Tooling te kiezen

### Herleidbaarheid
- **Probleemstatement**: docs/product/discovery/01-probleemdefinitie-productrichting.md - Succesfactoren (betrouwbaar, compliant)
- **UX Onderzoek**: docs/ux/discovery/01-ux-vraagstukken-validatie.md - Hypothese 5 (Peace of mind is key)
- **Prioriteit**: Core value proposition - zonder trust geen adoptie

### Acceptance Criteria (High-Level)
- [ ] Data is encrypted in transit (HTTPS/TLS) en at rest (AES-256)
- [ ] Data opslag is in Nederlandse data center (AVG compliant)
- [ ] Alle gebruikers kunnen 2FA inschakelen (optioneel maar recommended)
- [ ] Rol-gebaseerde permissions zijn correct geïmplementeerd (penningmeester/voorzitter/bewoner)
- [ ] Bewoners kunnen ALLEEN eigen betalingsstatus zien, niet van anderen (privacy by design)
- [ ] Penningmeester kan data exporteren (Excel/CSV/PDF) voor backup
- [ ] Penningmeester kan VVE account verwijderen (incl. alle gebruikers en data)
- [ ] Bewoners kunnen hun eigen account verwijderen
- [ ] Website heeft security page met uitleg over data bescherming (voor alle gebruikers)
- [ ] Privacy policy en ToS zijn duidelijk, transparant en begrijpelijk (geen juridisch jargon)
- [ ] Privacy policy legt uit wie wat kan zien (rol-specifieke uitleg)
- [ ] Audit log toont belangrijke acties (wie heeft wat gedaan, toegankelijk voor penningmeester en voorzitter)
- [ ] Bewoners krijgen duidelijke uitleg bij signup over wat ze wel/niet kunnen zien

---

## EP-006: Bestuur en bewoners kunnen documenten inzien en delen

### Probleemomschrijving
VVE's ontvangen **veel documenten** (facturen, contracten, notulen, vergaderstukken, etc.) en hebben **geen centrale plek** om deze op te slaan en te delen met bestuur en bewoners. Nu gebruiken ze Google Drive, email of fysieke archieven, wat **versnipperd en onoverzichtelijk** is. **Bewoners moeten steeds vragen** om documenten en **voorzitters kunnen niet zelfstandig** documenten uploaden of inzien.

**User pain points**:
- **Penningmeester**: "Ik moet facturen zoeken in mijn email of WhatsApp"
- **Voorzitter**: "Ik kan notulen niet zelf uploaden, moet het naar penningmeester sturen"
- **Bewoner**: "Ik moet steeds vragen om de jaarrekening of notulen"
- **Bestuur**: "Delen met bewoners is omslachtig (email attachments naar 25 mensen)"
- **Algemeen**: "Ik heb geen overzicht van wat er wel/niet is opgeslagen"

### Doelstelling
**Bestuur** (penningmeester en voorzitter) kan **binnen seconden** documenten uploaden en organiseren. **Alle gebruikers** (inclusief bewoners) kunnen **direct en zelfstandig** documenten inzien en downloaden, met **100% overzicht** van alle VVE documenten.

**Specifiek**:
- Penningmeester: Uploaden, organiseren, categoriseren
- Voorzitter/Bestuur: Uploaden (bijv. notulen, correspondentie), inzien alles
- Bewoners: Inzien en downloaden (self-service, geen vragen meer hoeven stellen)

### In Scope
- Documenten uploaden (PDF, JPG, etc.) - Penningmeester en Voorzitter/Bestuur
- Documenten categoriseren (factuur, contract, notulen, vergaderstukken, etc.)
- Documenten linken aan transacties (factuur → uitgave) - alleen Penningmeester
- Documenten zoeken en filteren - alle gebruikers
- Alle gebruikers kunnen documenten inzien en downloaden (self-service)
- Rol-gebaseerde upload rechten (Penningmeester + Voorzitter kunnen uploaden, Bewoners alleen lezen)
- Basis document viewer (PDF preview in platform)
- Automatisch delen: Alle documenten zijn direct zichtbaar voor alle gebruikers (transparantie)

### Out of Scope
- Document signing (Roadmap)
- OCR / data extraction (AI feature, Roadmap Fase 3)
- Version control (Nice-to-have)
- Granulare permissions per document (MVP = documenten zijn zichtbaar voor alle gebruikers)
- Document approval workflow (Roadmap)

### Succesindicatoren
**Quantitative**:
- ✅ 60%+ penningmeesters uploaden minimaal 5 documenten
- ✅ 30%+ voorzitters uploaden minimaal 1 document (bijv. notulen)
- ✅ 40%+ bewoners openen minimaal 1 document per maand
- ✅ <30 sec om document te uploaden en categoriseren
- ✅ 50%+ van documenten wordt geopend door minimaal 1 bewoner (engagement)

**Qualitative**:
- ✅ "Eindelijk alles op 1 plek, iedereen kan het zien" (bestuur feedback)
- ✅ "Fijn dat ik niet meer hoef te vragen om documenten" (bewoner feedback)
- ✅ "Bespaart me tijd in email verkeer" (penningmeester feedback)
- ✅ Document feature is in top 5 most used features

### Herleidbaarheid
- **Prioriteit**: docs/product/strategy/01-productstrategie-keuzes.md - Keuze 1 (Transparantie als differentiator)
- **Probleemstatement**: docs/product/discovery/01-probleemdefinitie-productrichting.md - Primair Probleem (transparantie en toegang voor alle rollen)
- **Product Visie**: docs/product/strategy/01-productstrategie-keuzes.md - Vision Statement (transparantie en samenwerking)

### Acceptance Criteria (High-Level)
- [ ] Penningmeester kan documenten uploaden (drag & drop)
- [ ] Voorzitter/Bestuur kan documenten uploaden (drag & drop)
- [ ] Beide kunnen documenten categoriseren (type: factuur, contract, notulen, vergaderstuk, etc.)
- [ ] Penningmeester kan documenten linken aan transactie
- [ ] Alle gebruikers kunnen documenten zoeken en filteren (naam, type, datum, categorie)
- [ ] Alle gebruikers kunnen documenten bekijken en downloaden (self-service)
- [ ] Bewoners zien direct nieuwe documenten in hun dashboard (transparantie)
- [ ] Systeem toont document preview (PDF viewer, werkt op mobile)
- [ ] Penningmeester kan documenten verwijderen (met confirmation)
- [ ] Document upload werkt goed op mobile (voor voorzitters en bewoners die onderweg documenten willen uploaden)

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
