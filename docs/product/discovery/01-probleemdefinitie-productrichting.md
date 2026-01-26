# Probleemdefinitie & Productrichting - VVE Tooling

## Documentinformatie
- **Datum**: 2026-01-26 (Updated: 2026-01-26)
- **Eigenaar**: Product Management
- **Status**: Final
- **Versie**: 2.0
- **Changelog**: v2.0 - Multi-user platform requirement (voorzitter + bewoners login toegevoegd)

## Bronverwijzingen
Dit document is gebaseerd op:
- [docs/product/intake/01-sales-intake-analyse.md](../intake/01-sales-intake-analyse.md)
- [docs/marktonderzoek/*](../../marktonderzoek/) - Alle Sales-documenten

## 1. Probleemstatement(s)

### Primair Probleem: VVE Besturen en Bewoners hebben geen Transparant, Collaboratief Platform

**Probleem**:  
Zelfbeheer VVE's (geschat 90.000-105.000 VVE's in Nederland) worstelen met **gebrek aan transparantie, samenwerking en overzicht**. Vrijwillige penningmeesters zijn overbelast met administratie, bestuursleden (voorzitters) hebben onvoldoende inzicht om het bestuur goed te doen, en bewoners (eigenaren) zijn passief omdat ze geen toegang hebben tot informatie. Dit leidt tot **wantrouwen, miscommunicatie en slechte besluitvorming**.

**Huidige situatie**:
- **Penningmeesters**: Gebruiken Excel/Google Sheets, handmatige administratie, veel tijd kwijt aan repetitieve taken
- **Voorzitters/Bestuur**: Hebben geen real-time inzicht in financiën, moeten penningmeester om rapportages vragen, kunnen niet meewerken in het systeem
- **Bewoners (eigenaren)**: Krijgen informatie via email/WhatsApp, hebben geen eigen toegang tot documenten/financiën, zijn passief en ongeïnformeerd
- **VVE als geheel**: Gebrek aan VVE-specifieke functionaliteit, geen samenwerking mogelijk, informatie versnipperd, geen transparantie

**Impact**:
- **Tijdsinvestering**: Penningmeester 5-15 uur/maand, voorzitter vraagt constant om updates
- **Stress**: Angst voor fouten, wantrouwen tussen bestuur en penningmeester
- **Kwaliteit**: Onvolledige of incorrecte administratie, slechte besluitvorming door gebrek aan informatie
- **Betrokkenheid**: Bewoners zijn passief, voelen zich buitengesloten, lage participatie bij ALV
- **Verloop**: Bestuursleden haken af door frustratie, moeilijk opvolgers te vinden
- **VVE gezondheid**: Slecht beheer, onduidelijke financiën, conflicten tussen bewoners en bestuur

**Waarom is dit een probleem waard om op te lossen?**
- **Groot segment**: 60-70% van alle VVE's = 90.000-105.000 VVE's
- **Meerdere users per VVE**: Gemiddeld 3-5 bestuursleden + 15-25 bewoners per VVE = grote gebruikersbasis
- **Duidelijke pijnpunten**: Gebrek aan transparantie, samenwerking en overzicht
- **Huidige oplossingen inadequaat**: Professionele tools zijn single-user (alleen penningmeester), geen bewoner-toegang
- **Maatschappelijke relevance**: Gezonde VVE's met betrokken bewoners = betere leefomgeving
- **Betalingsbereidheid**: VVE betaalt (niet individuele penningmeester), hogere budgetten mogelijk

**Bronverwijzing**:
- docs/marktonderzoek/02-gebruikers-penningmeesters.md - Pain points sectie
- docs/marktonderzoek/13-markt-kansen.md - Penningmeester platform, regel 12-26
- docs/product/intake/01-sales-intake-analyse.md - Gebruikersgroepen sectie

**Secundaire Problemen (Ook in Scope voor MVP)**

**Probleem 2: Voorzitters/Bestuursleden hebben geen Real-time Inzicht**
- Moeten penningmeester constant om updates vragen
- Kunnen niet zelf in systeem werken of controleren
- Moeilijk om beslissingen te nemen zonder actuele data
- Status: **In scope voor MVP - multi-user access**

**Probleem 3: Bewoners hebben Gebrek aan Transparantie en Betrokkenheid**
- Geen toegang tot financiële informatie of documenten
- Worden passief gehouden, kunnen niet zelf kijken
- Lage participatie bij ALV door gebrek aan informatie
- Status: **In scope voor MVP - bewoner login met read-only access**

## 2. Doelgroepen en Gebruikscontext

### Primaire Doelgroep (MVP): Complete Zelfbeheer VVE (Bestuur + Bewoners)

VVE Tooling is een **multi-user platform** voor de **hele VVE**, niet alleen de penningmeester. We hebben 3 primaire gebruikersgroepen:

#### 1. Penningmeester (Primaire Admin User)

##### Wie zijn ze?

**Demografisch**:
- Leeftijd: 35-65 jaar (typisch)
- Opleidingsniveau: MBO tot WO
- Vaak eigen appartement in de VVE
- Vrijwilliger, onbetaald
- Vaak "gedwongen vrijwilliger" (niemand anders wilde)

**Professioneel**:
- Reguliere baan (fulltime of parttime)
- Meestal geen financiële achtergrond
- Soms wel financieel inzicht (accountant, controller), maar niet altijd
- VVE werk is naast reguliere baan

**VVE Context**:
- **Kleine VVE's** (5-20 appartementen): 60% van doelgroep
- **Middelgrote VVE's** (20-50 appartementen): 35% van doelgroep
- **Grote VVE's** (50+ appartementen): 5% van doelgroep (vaak professioneel beheer)
- Gemiddelde VVE grootte in doelgroep: 15-25 appartementen
- Budget: €5.000-€50.000 per jaar
- 1-3 reserves (onderhoud, algemeen, soms speciale projecten)

**Technische vaardigheden**:
- Basis tot gemiddeld digitaal vaardig
- Bekend met email, WhatsApp, Excel/Google Sheets
- Niet per se technisch onderlegd
- Gebruikt waarschijnlijk smartphone (iOS of Android)
- Werkt soms op laptop, soms op tablet/phone

#### Gebruikscontext

**Wanneer gebruiken ze het product?**
- **Maandelijks**: Contributies controleren, betalingen matchen (2-3 uur)
- **Per transactie**: Facturen invoeren en betalen (30 min per keer, 5-15x per maand)
- **Kwartaal**: Rapportage maken voor bestuur (1-2 uur)
- **Jaarlijks**: Jaarrekening en begroting voorbereiden (10-20 uur, Q4/Q1)
- **Ad-hoc**: Vragen van eigenaren beantwoorden, informatie opzoeken (variabel)

**Waar gebruiken ze het product?**
- **Thuis**: 70% van gebruik (laptop/desktop)
- **Onderweg**: 20% van gebruik (smartphone - vooral quick checks)
- **Bij vergaderingen**: 10% van gebruik (laptop/tablet - presenteren cijfers)

**Met wie interacteren ze?**
- **Bestuur**: Rapporteren, adviseren (maandelijks)
- **Eigenaren**: Vragen beantwoorden, info delen (wekelijks)
- **Leveranciers**: Facturen ontvangen, betalen (wekelijks)
- **Accountant**: Jaarrekening afstemmen (jaarlijks)
- **Opvolger**: Knowledge transfer bij wisseling (incidenteel)

**Wat zijn hun doelen?**
1. **Correct en compliant**: Financieel gezonde VVE, volgens regels
2. **Efficient**: Minimale tijdsinvestering
3. **Transparant**: Eigenaren en bestuur tevreden en geïnformeerd
4. **Peace of mind**: Weten dat alles goed gaat, geen verrassingen
5. **Opvolger-klaar**: Makkelijk overdraagbaar als ze stoppen
6. **Samenwerking**: Bestuur kan meekijken/meewerken waar nodig

---

#### 2. Voorzitter / Bestuursleden (Collaborator Users)

##### Wie zijn ze?

**Demografisch**:
- Leeftijd: 35-70 jaar
- Vaak ook eigenaar in de VVE
- Vrijwilliger, onbetaald
- Voorzitter leidt vergaderingen en is gezicht van VVE
- Andere bestuursleden (secretaris, etc.) ondersteunen

**Rol in VVE**:
- Voorzitter: Leidt ALV, neemt beslissingen, communiceert met bewoners
- Secretaris: Notulen, communicatie, archief
- Andere bestuursleden: Verschillende verantwoordelijkheden
- Werken samen met penningmeester (financieel is niet hun primaire taak)

**Technische vaardigheden**:
- Basis tot gemiddeld digitaal vaardig
- Gebruikt email, WhatsApp, mogelijk ook Teams/Zoom
- Niet per se financieel onderlegd

##### Wat hebben ze nodig van het platform?

**Inzicht**:
- Real-time financieel overzicht (saldo's, reserves)
- Rapportages kunnen raadplegen (zonder penningmeester te vragen)
- Documenten kunnen inzien (contracten, facturen, notulen)
- Kunnen zien wat er speelt (recente transacties, openstaande zaken)

**Samenwerking**:
- Kunnen communiceren met penningmeester (binnen platform)
- Kunnen documenten uploaden (bijv. notulen, correspondentie)
- Kunnen acties zien en toevoegen (to-do's, besluiten)

**Controle**:
- Kunnen controleren of financiën kloppen
- Kunnen zien wie wat heeft gedaan (audit log)
- Kunnen rapportages maken voor ALV

**Wat zijn hun doelen?**
1. **Overzicht**: Altijd weten wat de financiële stand is
2. **Besluitvorming**: Goede beslissingen nemen op basis van actuele info
3. **Controle**: Kunnen checken of penningmeester het goed doet
4. **Transparantie**: Naar bewoners kunnen uitleggen wat er gebeurt
5. **Efficiency**: Niet constant penningmeester hoeven te vragen

**Permissions**: 
- Read access: Alles kunnen zien
- Limited write access: Documenten uploaden, opmerkingen toevoegen
- No financial transactions: Kunnen geen transacties toevoegen/wijzigen (dat is penningmeester rol)

---

#### 3. Bewoners / Eigenaren (Read-Only Users)

##### Wie zijn ze?

**Demografisch**:
- Leeftijd: 25-75 jaar (breed spectrum)
- Eigenaar van appartement in VVE
- Betalen contributie
- Soms betrokken, vaak passief
- 15-25 personen per gemiddelde VVE

**Betrokkenheid**:
- **Actief** (20%): Komen naar ALV, lezen alles, stellen vragen
- **Gemiddeld** (50%): Checken soms, komen naar ALV als het uitkomt
- **Passief** (30%): Alleen als er probleem is of persoonlijk geraakt worden

**Technische vaardigheden**:
- Zeer divers (van niet-digitaal tot tech-savvy)
- Iedereen gebruikt smartphone
- Sommigen alleen mobile, anderen desktop

##### Wat hebben ze nodig van het platform?

**Informatie**:
- Kunnen financiële stand inzien (waar gaat mijn contributie naartoe?)
- Kunnen documenten downloaden (jaarrekening, begroting, notulen)
- Kunnen eigen betalingsstatus checken (heb ik betaald? hoeveel nog open?)
- Kunnen contactgegevens vinden (bestuur, beheerder, medebewoners)

**Transparantie**:
- Zien wat er besloten is (ALV besluiten)
- Zien waar geld aan uitgegeven wordt
- Zien planning (onderhoud, projecten)

**Self-service**:
- Kunnen vragen stellen (aan bestuur/penningmeester)
- Kunnen documenten uploaden (bijv. defect melden met foto)
- Kunnen zelf info vinden (niet altijd via email/WhatsApp)

**Wat zijn hun doelen?**
1. **Transparantie**: Weten wat er gebeurt in de VVE
2. **Vertrouwen**: Kunnen controleren dat bestuur het goed doet
3. **Gemak**: Snel info kunnen vinden zonder te hoeven mailen
4. **Betrokkenheid**: Makkelijk kunnen participeren als ze willen
5. **Peace of mind**: Zien dat hun contributie goed besteed wordt

**Permissions**:
- Read-only: Kunnen alles zien, niets wijzigen
- Limited write: Kunnen berichten sturen, mogelijk documenten uploaden
- Privacy: Kunnen alleen eigen betalingsstatus zien, niet van anderen

---

#### Succesfactoren voor adoptie

**Het product wordt geadopteerd als**:
- ✅ **Simpeler** dan huidige methode (Excel + email/WhatsApp)
- ✅ **VVE-specifiek**: Snapt splitsingen, reserves, rollen (penningmeester/voorzitter/bewoner)
- ✅ **Betaalbaar**: Max €15-25/maand voor complete VVE (niet per gebruiker!)
- ✅ **Multi-user**: Bestuur kan samenwerken, bewoners kunnen inzien
- ✅ **Mobiel toegankelijk**: Bewoners vooral op smartphone
- ✅ **Betrouwbaar**: Geen bugs, geen dataverlies
- ✅ **Transparant**: Iedereen ziet wat er gebeurt (geen black box)
- ✅ **Compliant**: Juridisch/AVG/financieel correct

**Het product faalt als**:
- ❌ Te complex (vooral voor bewoners die passief zijn)
- ❌ Te duur (VVE's hebben beperkt budget)
- ❌ Single-user (alleen penningmeester, bestuur/bewoners buitengesloten)
- ❌ Niet betrouwbaar (bugs, downtime, dataverlies)
- ❌ Te veel werk om in te richten
- ❌ Niet VVE-specifiek (generieke tool)
- ❌ Slechte mobile experience (bewoners zijn vooral mobile)

### Secundaire Doelgroepen (Roadmap, niet MVP)

**Professionele Beheerders** (toekomstig)
- Multi-VVE beheer
- Andere requirements (schaalbaarheid, integraties)
- Roadmap prioriteit #2 (na MVP success)

## 3. Waarom een Nieuw Product?

### Bestaande Alternatieven en hun Tekortkomingen

**1. Excel / Google Sheets (meest gebruikt)**
- ❌ Handmatig, foutgevoelig
- ❌ Geen VVE-specifieke logica
- ❌ Moeilijk te delen/samenwerken
- ❌ Geen compliance checks
- ❌ Geen automatisering
- ✅ Gratis, bekend, flexibel

**2. Algemene boekhoud software (Exact, Moneybird, etc.)**
- ❌ Niet VVE-specifiek (geen splitsingen, reserves)
- ❌ Te complex voor vrijwilligers
- ❌ Relatief duur (€10-30/maand)
- ❌ Gericht op ondernemers, niet VVE's
- ✅ Betrouwbaar, compliant

**3. VVE-specifieke tools voor beheerders (Tobias, VvE Admin)**
- ❌ Te duur (€10-25/maand per VVE)
- ❌ Te complex (voor professionals, niet vrijwilligers)
- ❌ Verouderde UX
- ❌ Niet gericht op penningmeesters
- ✅ VVE-specifiek, compleet

**4. Geen software (papier, ad-hoc)**
- ❌ Maximaal foutgevoelig
- ❌ Niet transparant
- ❌ Niet schaalbaar
- ❌ Compliance risico's

### Waarom Bestaande Oplossingen niet Voldoen

**Gap 1: Prijs vs Functionaliteit**
- Goedkope oplossingen (Excel) missen VVE-specifieke features
- VVE-specifieke oplossingen zijn te duur voor zelfbeheer VVE's
- **Ons product**: Betaalbaar (€5-15/maand) én VVE-specifiek

**Gap 2: Complexiteit vs Doelgroep**
- Pro tools zijn voor beheerders, te complex voor vrijwilligers
- Simpele tools missen essentiële functionaliteit
- **Ons product**: Right-sized voor penningmeesters

**Gap 3: Modern vs VVE-specifiek**
- Moderne tools zijn generiek (niet VVE)
- VVE tools zijn verouderd (slechte UX, geen mobile)
- **Ons product**: Modern én VVE-specifiek

**Gap 4: Onboarding & Support**
- Professionele tools verwachten kennis
- Generieke tools bieden geen VVE-specifieke help
- **Ons product**: Begeleiding en templates specifiek voor penningmeesters

### Product Positionering

**VVE Tooling is**:
> "Het **transparante, collaboratieve platform** voor zelfbeheer VVE's, waar **bestuur en bewoners samen** de VVE beheren met **VVE-specifieke tools** voor financiën, communicatie en besluitvorming."

**Elevator Pitch**:
> "VVE Tooling is het eerste platform waar **iedereen** in de VVE kan inloggen: penningmeester beheert financiën, voorzitter heeft overzicht, bewoners zien waar hun geld naartoe gaat. Eindelijk transparantie en samenwerking in één platform. Vanaf €15 per maand voor de hele VVE."

**Differentiators**:
1. **Multi-user platform**: Niet alleen penningmeester - bestuur én bewoners hebben toegang
2. **VVE-specifiek**: Snapt splitsingen, reserves, rollen, jaarrekening
3. **Transparantie first**: Bewoners kunnen alles zien (geen black box meer)
4. **Modern & Mobile**: 2026 UX, werkt perfect op smartphone (voor bewoners)
5. **Betaalbaar**: Flat fee per VVE, niet per gebruiker
6. **Samenwerking**: Bestuur kan samenwerken in het platform

## 4. Afbakening (In-Scope / Out-of-Scope)

### IN SCOPE voor MVP (Fase 1, Jaar 1)

#### Core Features (Must-Have)

**1. Multi-User & Permissions**
   - ✅ **Rollen & Rechten**: Penningmeester (admin), Bestuurslid (collaborator), Bewoners (read-only)
   - ✅ **User management**: Gebruikers uitnodigen, rollen toewijzen, deactiveren
   - ✅ **Login systeem**: Email + wachtwoord, optioneel 2FA
   - ✅ **Bewoner self-service**: Bewoners kunnen zelf account aanmaken met uitnodigingscode

**2. Financiële Basis Administratie**
   - ✅ Inkomsten & uitgaven registreren
   - ✅ Categorieën (VVE-specifiek: contributie, onderhoud, verzekering, etc.)
   - ✅ Bankrekening koppeling (optioneel) of handmatig invoeren
   - ✅ Facturen uploaden/opslaan

**3. VVE-Specifieke Functionaliteit**
   - ✅ Splitsingssleutels definiëren (per eigenaar)
   - ✅ Meerdere reserves beheren (algemeen, onderhoud, speciaal)
   - ✅ Contributie berekenen op basis van splitsing
   - ✅ Eigenaren lijst met contactgegevens
   - ✅ **Bewoner profiel**: Bewoners kunnen eigen contact info updaten
   - ✅ **Bewoner betalingsstatus**: Bewoners kunnen eigen betaalstatus zien (privacy-safe)

**4. Rapportages**
   - ✅ Maandelijkse financiële staat (inkomsten/uitgaven per reserve)
   - ✅ Jaarrekening template (VVE-specifiek)
   - ✅ Begroting template
   - ✅ PDF export van rapportages
   - ✅ **Delen met bewoners**: Rapportages automatisch beschikbaar voor alle gebruikers

**5. Basis Communicatie & Documenten**
   - ✅ Web app (mobile-responsive, **mobile-first voor bewoners**)
   - ✅ **Verschillende dashboards**: Penningmeester (financieel), Voorzitter (overzicht), Bewoner (mijn VVE)
   - ✅ Onboarding wizard (VVE setup + gebruikers uitnodigen)
   - ✅ Help & tutorials (rol-specifiek)
   - ✅ Data export (voor backup/overdracht)

#### Non-Functional Requirements
- ✅ AVG compliant (Nederlandse data opslag)
- ✅ Bank-level security (encryptie, 2FA)
- ✅ 99.5% uptime SLA
- ✅ Fast (<2 sec page loads)
- ✅ Browser support: Chrome, Safari, Firefox (laatste 2 versies)

#### Pricing & Business Model (MVP)
- ✅ **Flat fee per VVE**, niet per gebruiker
  - €15/maand: Tot 25 appartementen, unlimited users
  - €25/maand: 25-50 appartementen, unlimited users
  - €35/maand: 50+ appartementen, unlimited users
- ✅ **Gratis trial**: 30 dagen gratis, daarna betalen
- ✅ Geen setup fees
- ✅ Maandelijks opzegbaar
- ✅ VVE betaalt (niet individuele penningmeester)

### OUT OF SCOPE voor MVP (Roadmap Items)

#### Fase 2 (Jaar 1, Q3-Q4): Verbetering & Groei
- ⏭️ Native mobile apps (iOS/Android) - bewoners vooral mobile
- ⏭️ Automatische incasso (SEPA)
- ⏭️ Bank API integraties (automatisch transacties ophalen)
- ⏭️ Geavanceerde rapportages (grafieken, trends, benchmarks)
- ⏭️ WhatsApp/SMS notificaties (voor passieve bewoners)
- ⏭️ **Chat/Messaging**: In-app berichten tussen bewoners en bestuur
- ⏭️ **Polls/Voting**: Online stemmen over voorstellen

#### Fase 3 (Jaar 2): Beheerders Platform
- ⏭️ Multi-VVE beheer (voor professionele beheerders)
- ⏭️ Onderhoud planning & tracking
- ⏭️ Contract management
- ⏭️ Vergader management (agenda, notulen, attendance)
- ⏭️ Taakbeheer (to-do's, assignments)
- ⏭️ API voor integraties

#### Fase 4 (Jaar 3): AI & Innovation
- ⏭️ AI chatbot (FAQ beantwoorden)
- ⏭️ Automatische categorisatie (facturen)
- ⏭️ Predictive alerts (lage reserves, etc.)
- ⏭️ Document analyse (data extractie uit PDF's)
- ⏭️ Benchmark insights

#### Permanent Out of Scope
- ❌ Juridisch advies (wel templates, geen advies)
- ❌ Accountancy diensten
- ❌ VVE beheer diensten (we zijn software, geen beheerkantoor)
- ❌ Makelaars functionaliteit
- ❌ Bouw/ontwikkel project management

### Feature Prioritisatie Rationale

**Waarom deze scope voor MVP?**

1. **Focus op core probleem**: Financiële administratie is #1 pijnpunt
2. **VVE-specifiek**: Splitsingen en reserves zijn essentieel, anders is het gewoon boekhoud software
3. **Quick time-to-value**: Penningmeester moet binnen 1 week waarde zien
4. **Realistic voor 3-6 maanden development**: Scope is haalbaar
5. **Differentiation**: Combinatie van VVE-specifiek + modern + betaalbaar bestaat niet

**Waarom NIET in MVP?**

- **Native apps**: Nice-to-have, maar web-responsive is 80% van de value. Bewoners kunnen bookmark op homescreen zetten (PWA).
- **Chat/Messaging**: Waardevol maar complex. Email notificaties + WhatsApp integratie later.
- **Polls/Voting**: Leuk maar niet core probleem. Kan later als engagement feature.
- **Bank integraties**: Complex, langdurig. Handmatige invoer is OK voor MVP.
- **Beheerders features**: Andere doelgroep, aparte product later.
- **AI features**: Cool maar niet core probleem, later als differentiator.

## 5. Eerste Succescriteria

### Product-Market Fit Metrics (Jaar 1, Q4)

**Adoption**:
- ✅ **500+ actieve VVE's** op het platform
- ✅ **2.000+ totale gebruikers** (gemiddeld 4 per VVE: penningmeester + 2 bestuursleden + bewoners)
- ✅ **30%+ bewoner activatie** (van totaal bewoners heeft account aangemaakt en logt in)
- ✅ **<10% monthly churn** (VVE's die stoppen)

**Engagement**:
- ✅ **60%+ WAU/MAU** voor penningmeesters (weekly/monthly active)
- ✅ **30%+ MAU voor bewoners** (log minimaal 1x per maand in)
- ✅ **Gemiddeld 3+ rollen per VVE actief** (penningmeester + voorzitter + bewoners)
- ✅ **80%+ compleet profiel** (VVE setup volledig + minimaal 3 gebruikers actief)

**Satisfaction**:
- ✅ **NPS > 40** (Net Promoter Score)
- ✅ **4+ stars** gemiddeld in app reviews
- ✅ **30%+ referral rate** (hoeveel gebruikers komen via bestaande gebruikers)

**Financial**:
- ✅ **€7.500-€12.500 MRR** (Monthly Recurring Revenue) eind jaar 1 (500 VVE's × €15-25)
- ✅ **LTV/CAC > 3** (Lifetime Value / Customer Acquisition Cost ratio)
- ✅ **Gemiddelde €20 ARPU** (Average Revenue Per VVE per maand)

### Feature Success Metrics

**Onboarding**:
- ✅ **80%+ completion rate** van onboarding wizard
- ✅ **<1 hour** gemiddelde tijd om VVE volledig in te richten (incl. gebruikers uitnodigen)
- ✅ **Gemiddeld 3+ gebruikers** geactiveerd tijdens onboarding
- ✅ **<5% support tickets** tijdens onboarding

**Core Workflow**:
- ✅ **90%+ penningmeesters** registreren minimaal 1 transactie per maand
- ✅ **70%+ voorzitters** checken dashboard minimaal 1x per week
- ✅ **30%+ bewoners** loggen in minimaal 1x per maand
- ✅ **70%+ VVE's** gebruiken document sharing feature
- ✅ **50%+ VVE's** genereren rapportage per kwartaal

**Technical**:
- ✅ **99.5%+ uptime**
- ✅ **<2 sec gemiddelde** page load time
- ✅ **Zero critical security incidents**
- ✅ **100% AVG compliant**

### Qualitative Success Indicators

**User Feedback**:
- ✅ Testimonials: "Dit bespaart me uren per maand"
- ✅ Referrals: Penningmeesters bevelen ons aan bij andere VVE's
- ✅ Use cases: Users gebruiken product voor complete jaarrekening cyclus

**Market Signal**:
- ✅ Media aandacht (bijv. Vereniging van Eigenaren blog, penningmeester forums)
- ✅ Organic growth (SEO, word-of-mouth)
- ✅ Partnership interest (accountants, VVE adviseurs willen samenwerken)

**Internal Learning**:
- ✅ Validated betalingsbereidheid (mensen betalen voor premium)
- ✅ Geïdentificeerd top 3 feature requests voor roadmap
- ✅ Begrepen conversie funnel (waar droppen gebruikers af?)

## 6. Risico's en Mitigaties

### Product Risks

**Risico 1: Bewoner activatie lager dan verwacht** 🔴
- Impact: Hoog (value proposition is multi-user, als bewoners niet inloggen faalt het)
- Probability: Gemiddeld-Hoog (passieve bewoners)
- Mitigatie:
  - Onboarding: Penningmeester nodigt bewoners uit tijdens setup
  - Email reminders: Regelmatige gentle reminders voor inactieve bewoners
  - Mobile-first UX: Makkelijk op smartphone (waar bewoners zijn)
  - Value proposition: Duidelijk maken wat bewoners krijgen (transparantie, eigen status)
  - Progressive disclosure: Start simpel (alleen bekijken), uitbreiden later (polls, chat)

**Risico 2: Betalingsbereidheid lager dan €15-25/maand** 🟡
- Impact: Gemiddeld-Hoog (business model aangepast naar flat fee, maar moet wel €15-25 waard zijn)
- Probability: Gemiddeld
- Mitigatie:
  - Value: Multi-user platform is meer waard dan single-user tool
  - Trial: 30 dagen gratis om waarde te bewijzen
  - Testimonials: Early adopters laten zien dat het werkt
  - ROI: Tijdsbesparing + peace of mind + transparantie = €15-25/maand waard
  
**Risico 3: Compliance/juridische fouten** 🔴
- Impact: Zeer hoog (aansprakelijkheid, reputatie)
- Probability: Laag (als we zorgvuldig zijn)
- Mitigatie:
  - Juridisch advies inhuren
  - Beta met accountants/VVE juristen
  - Disclaimers (software is tool, geen advies)
  - AVG specialist voor privacy

**Risico 4: Te complex voor passieve bewoners** 🟡
- Impact: Hoog (als bewoners het niet snappen, gebruiken ze het niet)
- Probability: Gemiddeld
- Mitigatie:
  - Mobile-first design (simpel, duidelijk)
  - Progressive disclosure (start met basics: kijken, dan meer features)
  - Onboarding voor bewoners (korte intro video, tooltips)
  - Help & FAQ (specifiek voor bewoners)
  - Support chat (voor vragen)

**Risico 5: Privacy/security concerns van bewoners** 🟡
- Impact: Gemiddeld (kunnen adoptie blokkeren)
- Probability: Laag-Gemiddeld
- Mitigatie:
  - Privacy by design: Bewoners zien alleen eigen betalingsstatus, niet van anderen
  - Duidelijke privacy policy
  - Opt-in voor email notificaties
  - Transparantie over wie wat kan zien
  - AVG compliance communiceren

**Risico 6: Freemium cannibalizes betaald** 🟡
- Impact: N/A (no freemium anymore - trial only)
- Probability: N/A
- Mitigatie: N/A - we hebben flat fee model, geen freemium

**Risico 7: Development duurt langer dan 6 maanden** 🟡
- Impact: Gemiddeld
- Probability: Hoog (als we succesvol zijn)
- Mitigatie:
  - Speed to market (first mover advantage)
  - Focus op UX differentiatie
  - Community bouwen (sticky)
  - Continuous innovation

**Risico 6: Marktomvang overschat** 🟡
- Impact: Hoog (kleinere TAM)
- Probability: Laag (90.000 VVE's is conservatief)
- Mitigatie:
  - Desktop research valideren
  - Early traction indicatie
  - Flexibel naar andere segmenten (beheerders)

### Execution Risks

**Risico 7: Development duurt langer dan 6 maanden** 🟡
- Impact: Gemiddeld (later to market)
- Probability: Hoog (software development timelines)
- Mitigatie:
  - Strikte scope discipline (MVP echt minimal)
  - Agile development
  - Early & frequent shipping
  - Cut features als nodig

## 7. Definitie van Succes

**Dit product is succesvol als**:

Na **12 maanden**:
- 500+ VVE's gebruiken het product actief
- €2.500-€5.000 MRR
- NPS > 40
- Validated product-market fit in penningmeester segment
- Clear roadmap naar €10k MRR in jaar 2

Na **24 maanden**:
- 2.000+ penningmeester VVE's
- 5-10 kleine beheerder klanten (500-1.000 VVE's)
- €25.000-€50.000 MRR
- Market leader in penningmeester segment
- V2 platform voor beheerders in beta

Na **36 maanden**:
- 5.000+ VVE's totaal
- €100.000+ MRR
- Funding secured of profitable
- #1 moderne VVE tooling in Nederland

**Dit product faalt als**:
- <100 VVE's na 6 maanden (geen traction)
- <10% conversie gratis→betaald (geen betalingsbereidheid)
- >20% monthly churn (product-market fit ontbreekt)
- Geen duidelijk pad naar profitability

## Conclusie

VVE Tooling richt zich op het oplossen van een **duidelijk, gevalideerd probleem** voor een **groot, ondergeserveerd segment** (vrijwillige penningmeesters van zelfbeheer VVE's) met een **betaalbaar, VVE-specifiek product** dat de complexiteit van VVE financieel beheer versimpelt.

De **MVP scope** is scherp afgebakend en focust op het core probleem: financiële administratie met VVE-specifieke functionaliteit. Dit is realistisch te bouwen in 3-6 maanden en vormt een solide basis voor verdere groei.

**Succesfactoren** zijn duidelijk gedefinieerd en meetbaar. Het grootste risico is betalingsbereidheid, gemititgeerd door freemium model en scherpe focus op value delivery.

De **roadmap** biedt duidelijke groeipadren: van penningmeesters naar beheerders, van basis naar AI-powered features, van niche naar marktleider.

## Vervolgstappen
→ Zie **docs/ux/discovery/** voor UX-vraagstukken en validatie
→ Zie **docs/product/strategy/** voor strategische keuzes
→ Zie **docs/backlog/epics/** voor epic definitie
