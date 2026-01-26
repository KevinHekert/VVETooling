# Probleemdefinitie & Productrichting - VVE Tooling

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Product Management
- **Status**: Final
- **Versie**: 1.0

## Bronverwijzingen
Dit document is gebaseerd op:
- [docs/product/intake/01-sales-intake-analyse.md](../intake/01-sales-intake-analyse.md)
- [docs/marktonderzoek/*](../../marktonderzoek/) - Alle Sales-documenten

## 1. Probleemstatement(s)

### Primair Probleem: Vrijwillige Penningmeesters zijn Overbelast en Onzeker

**Probleem**:  
Vrijwillige penningmeesters van zelfbeheer VVE's (geschat 90.000-105.000 VVE's in Nederland) worstelen met de **complexiteit en tijdsintensiviteit** van VVE financieel beheer, terwijl ze dit naast hun reguliere baan en privéleven moeten doen. Ze hebben **angst om fouten te maken** die juridische of financiële consequenties kunnen hebben, en voelen zich **niet ondersteund** door geschikte, betaalbare software.

**Huidige situatie**:
- Penningmeesters gebruiken Excel/Google Sheets of algemene boekhoud software
- Handmatige administratie van contributies, splitsingen, reserves, facturen
- Gebrek aan VVE-specifieke functionaliteit (splitsingssleutels, meerdere reserves, etc.)
- Onduidelijkheid over compliance en juridische verplichtingen
- Veel tijd kwijt aan repetitieve taken (facturen maken, betalingen matchen, rapportages)
- Moeilijk om overzicht te bewaren en transparant te zijn naar eigenaren

**Impact**:
- **Tijdsinvestering**: 5-15 uur per maand aan administratie
- **Stress**: Angst voor fouten, vooral rond jaarrekening en ALV
- **Kwaliteit**: Onvolledige of incorrecte administratie
- **Verloop**: Penningmeesters haken af, moeilijk opvolgers te vinden
- **VVE gezondheid**: Slecht beheer leidt tot financiële problemen

**Waarom is dit een probleem waard om op te lossen?**
- Groot segment (60-70% van alle VVE's = 90.000-105.000 VVE's)
- Duidelijke, gevalideerde pijnpunten
- Huidige oplossingen zijn inadequaat (te complex, te duur, niet VVE-specifiek)
- Maatschappelijke relevance: Gezonde VVE's = goed onderhouden woningen = betere leefomgeving
- Betalingsbereidheid aanwezig (mits juiste waardeproposit ie)

**Bronverwijzing**:
- docs/marktonderzoek/02-gebruikers-penningmeesters.md - Pain points sectie
- docs/marktonderzoek/13-markt-kansen.md - Penningmeester platform, regel 12-26
- docs/product/intake/01-sales-intake-analyse.md - Gebruikersgroepen sectie

### Secundaire Problemen (Out of Scope voor MVP, In-Scope voor Roadmap)

**Probleem 2: Professionele Beheerders hebben Inefficiënte, Verouderde Tools**
- Huidige software (Tobias, VvE Admin) heeft slechte UX
- Multi-VVE beheer is omslachtig
- Geen moderne features (mobile, AI, integraties)
- Status: **Out of scope voor MVP, prioriteit #2 voor roadmap**

**Probleem 3: VVE Eigenaren hebben Gebrek aan Transparantie en Betrokkenheid**
- Weinig inzicht in financiën en beslissingen
- Passieve rol, moeilijk om betrokken te raken
- Status: **Out of scope voor MVP, mogelijk add-on later**

## 2. Doelgroepen en Gebruikscontext

### Primaire Doelgroep (MVP): Vrijwillige Penningmeesters van Zelfbeheer VVE's

#### Wie zijn ze?

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
3. **Transparant**: Eigenaren tevreden en geïnformeerd
4. **Peace of mind**: Weten dat alles goed gaat, geen verrassingen
5. **Opvolger-klaar**: Makkelijk overdraagbaar als ze stoppen

#### Succesfactoren voor adoptie

**Het product wordt geadopteerd als**:
- ✅ **Simpeler** dan Excel/huidige methode
- ✅ **VVE-specifiek**: Snapt splitsingen, reserves, jaarrekening
- ✅ **Betaalbaar**: Max €10-15/maand voor gemiddelde VVE
- ✅ **Weinig leercurve**: Direct te gebruiken
- ✅ **Mobiel toegankelijk**: Ook onderweg te checken
- ✅ **Betrouwbaar**: Geen bugs, geen dataverlies
- ✅ **Compliant**: Juridisch/AVG/financieel correct

**Het product faalt als**:
- ❌ Te complex of te veel features (overwhelming)
- ❌ Te duur (geen budget of niet waard voor kleine VVE)
- ❌ Niet betrouwbaar (bugs, downtime, dataverlies)
- ❌ Te veel werk om in te richten (onboarding te complex)
- ❌ Niet VVE-specifiek (generieke accounting tool)

### Secundaire Doelgroepen (Out of Scope voor MVP)

**Bestuursleden** (toekomstig)
- Consumeren rapportages van penningmeester
- Hebben ook behoefte aan overzicht en transparantie
- Roadmap prioriteit #3

**Professionele Beheerders** (toekomstig)
- Multi-VVE beheer
- Andere requirements (schaalbaarheid, integraties)
- Roadmap prioriteit #2

**Eigenaren/Leden** (toekomstig)
- Passieve gebruikers
- Mogelijk als add-on portal
- Roadmap prioriteit #4

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
> "De moderne, betaalbare financiële administratie tool **specifiek voor vrijwillige penningmeesters** van zelfbeheer VVE's, die **VVE-specifieke complexiteit** (splitsingen, reserves, compliance) **versimpelt** zonder de functionaliteit van dure professionele tools."

**Elevator Pitch**:
> "Penningmeester van je VVE? VVE Tooling maakt je administratie 10x makkelijker. Geen Excel gehannes meer - gewoon simpele, VVE-specifieke financiële administratie die werkt. Vanaf €5 per maand."

**Differentiators**:
1. **VVE-specifiek**: Snapt splitsingen, reserves, jaarrekening templates
2. **Penningmeester-focused**: Gemaakt voor vrijwilligers, niet professionals
3. **Modern & Mobile**: 2026 UX, werkt op je telefoon
4. **Betaalbaar**: Freemium model, vanaf €5/maand
5. **Simpel**: Onboarding in 30 minuten, niet 30 dagen

## 4. Afbakening (In-Scope / Out-of-Scope)

### IN SCOPE voor MVP (Fase 1, Jaar 1)

#### Core Features (Must-Have)
1. **Financiële Basis Administratie**
   - ✅ Inkomsten & uitgaven registreren
   - ✅ Categorieën (VVE-specifiek: contributie, onderhoud, verzekering, etc.)
   - ✅ Bankrekening koppeling (optioneel) of handmatig invoeren
   - ✅ Facturen uploaden/opslaan

2. **VVE-Specifieke Functionaliteit**
   - ✅ Splitsingssleutels definiëren (per eigenaar)
   - ✅ Meerdere reserves beheren (algemeen, onderhoud, speciaal)
   - ✅ Contributie berekenen op basis van splitsing
   - ✅ Eigenaren lijst met contactgegevens

3. **Rapportages**
   - ✅ Maandelijkse financiële staat (inkomsten/uitgaven per reserve)
   - ✅ Jaarrekening template (VVE-specifiek)
   - ✅ Begroting template
   - ✅ PDF export van rapportages

4. **Basis Communicatie**
   - ✅ Documenten delen met eigenaren (via link)
   - ✅ Email notificaties (optioneel)

5. **Gebruikerservaring**
   - ✅ Web app (mobile-responsive)
   - ✅ Onboarding wizard (VVE setup in 30 minuten)
   - ✅ Help & tutorials (penningmeester-specifiek)
   - ✅ Data export (voor backup/overdracht)

#### Non-Functional Requirements
- ✅ AVG compliant (Nederlandse data opslag)
- ✅ Bank-level security (encryptie, 2FA)
- ✅ 99.5% uptime SLA
- ✅ Fast (<2 sec page loads)
- ✅ Browser support: Chrome, Safari, Firefox (laatste 2 versies)

#### Pricing & Business Model (MVP)
- ✅ Freemium model
  - Gratis: Tot 10 appartementen
  - €5/maand: 10-25 appartementen
  - €10/maand: 25-50 appartementen
  - €15/maand: 50+ appartementen
- ✅ Geen setup fees
- ✅ Maandelijks opzegbaar

### OUT OF SCOPE voor MVP (Roadmap Items)

#### Fase 2 (Jaar 1, Q3-Q4): Verbetering & Groei
- ⏭️ Native mobile apps (iOS/Android)
- ⏭️ Automatische incasso (SEPA)
- ⏭️ Bank API integraties (automatisch transacties ophalen)
- ⏭️ Geavanceerde rapportages (grafieken, trends, benchmarks)
- ⏭️ Eigenaren portal (self-service info)
- ⏭️ WhatsApp/SMS notificaties

#### Fase 3 (Jaar 2): Beheerders Platform
- ⏭️ Multi-VVE beheer
- ⏭️ Onderhoud planning & tracking
- ⏭️ Contract management
- ⏭️ Vergader management (agenda, notulen)
- ⏭️ Taakbeheer
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

- **Native apps**: Nice-to-have, maar web-responsive is 80% van de value
- **Bank integraties**: Complex, langdurig, web-responsive is OK voor MVP
- **Beheerders features**: Andere doelgroep, aparte product later
- **AI features**: Cool maar niet core probleem, later als differentiator

## 5. Eerste Succescriteria

### Product-Market Fit Metrics (Jaar 1, Q4)

**Adoption**:
- ✅ **500+ actieve VVE's** op het platform
- ✅ **25%+ conversie** van gratis naar betaald (van gratis trial users)
- ✅ **<10% monthly churn** (betaalde gebruikers)

**Engagement**:
- ✅ **60%+ MAU/Registered** (monthly active users van totaal geregistreerde VVE's)
- ✅ **Gemiddeld 8+ logins per maand** per actieve penningmeester
- ✅ **80%+ compleet profiel** (VVE setup volledig ingevuld)

**Satisfaction**:
- ✅ **NPS > 40** (Net Promoter Score)
- ✅ **4+ stars** gemiddeld in app reviews
- ✅ **30%+ referral rate** (hoeveel gebruikers komen via bestaande gebruikers)

**Financial**:
- ✅ **€2.500-€5.000 MRR** (Monthly Recurring Revenue) eind jaar 1
- ✅ **LTV/CAC > 3** (Lifetime Value / Customer Acquisition Cost ratio)
- ✅ **Gemiddelde €8-10 ARPU** (Average Revenue Per User per maand)

### Feature Success Metrics

**Onboarding**:
- ✅ **80%+ completion rate** van onboarding wizard
- ✅ **<30 minuten** gemiddelde tijd om VVE volledig in te richten
- ✅ **<5% support tickets** tijdens onboarding

**Core Workflow**:
- ✅ **90%+ gebruikers** registreren minimaal 1 transactie per maand
- ✅ **70%+ gebruikers** genereren een rapportage per kwartaal
- ✅ **50%+ gebruikers** maken gebruik van document sharing

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

**Risico 1: Betalingsbereidheid lager dan verwacht** 🔴
- Impact: Hoog (business model faalt)
- Probability: Gemiddeld
- Mitigatie:
  - Freemium model om adoptie te driven
  - Early pricing tests met beta users
  - Flexibele pricing (kunnen aanpassen)
  - Focus op value delivery (tijdsbesparing)

**Risico 2: Compliance/juridische fouten** 🔴
- Impact: Zeer hoog (aansprakelijkheid, reputatie)
- Probability: Laag (als we zorgvuldig zijn)
- Mitigatie:
  - Juridisch advies inhuren
  - Beta met accountants/VVE juristen
  - Disclaimers (software is tool, geen advies)
  - AVG specialist voor privacy

**Risico 3: Te complex voor doelgroep** 🟡
- Impact: Hoog (geen adoptie)
- Probability: Gemiddeld
- Mitigatie:
  - Extensive UX research en testing
  - Onboarding wizard
  - Help & tutorials
  - Support chat

**Risico 4: Freemium cannibalizes betaald** 🟡
- Impact: Hoog (geen revenue)
- Probability: Gemiddeld
- Mitigatie:
  - Duidelijke free tier limits (10 appartementen)
  - Premium features (rapportages, export, support)
  - Monitor conversie rates en adjust

### Market Risks

**Risico 5: Concurrentie reageert** 🟡
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
