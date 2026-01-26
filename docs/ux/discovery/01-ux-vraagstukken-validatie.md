# UX Discovery & Validatie - VVE Tooling

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Product Management (in samenwerking met UX)
- **Status**: Final
- **Versie**: 1.0

## Bronverwijzingen
Dit document is gebaseerd op:
- [docs/product/discovery/01-probleemdefinitie-productrichting.md](../../product/discovery/01-probleemdefinitie-productrichting.md)
- [docs/product/intake/01-sales-intake-analyse.md](../../product/intake/01-sales-intake-analyse.md)

## Inleiding

Dit document identificeert de **UX-vraagstukken, aannames en hypotheses** die uit de product discovery naar voren zijn gekomen en **validatie vereisen** voordat we definitieve product- en designbeslissingen nemen.

**Belangrijk**: Product Management blijft eigenaar van de productrichting. UX voert onderzoek uit om beslissingen te onderbouwen, maar neemt geen productbeslissingen.

## 1. UX-Vraagstukken & Onzekerheden

### Vraagstuk 1: Wat is "Simpel genoeg" voor Penningmeesters?

**Context**:  
We positioneren ons product als "simpeler dan Excel, beter dan professionele tools". Maar wat betekent "simpel" concreet voor penningmeesters met verschillende digitale vaardigheden?

**Onzekerheid**:
- Welk kennisniveau kunnen we veronderstellen? (financieel, digitaal, VVE-specifiek)
- Hoeveel uitleg/onboarding is nodig?
- Welke terminologie gebruiken we? (boekhoudkundig vs dagelijks taalgebruik)
- Hoeveel features zijn "overweldigend" vs "compleet"?

**Aannames die gevalideerd moeten worden**:
- ⚠️ Penningmeesters kunnen binnen 30 minuten de tool gebruiken (zonder training)
- ⚠️ Basis Excel skills zijn voldoende om de tool te begrijpen
- ⚠️ Penningmeesters snappen financiële concepten zoals "reserve", "splitsing", "begroting"

**Impact op product**:
- Onboarding flow design
- UI complexity (hoeveel features zichtbaar)
- Help/documentation niveau
- Terminologie in de app

**Herleidbaar naar**: docs/product/discovery/01-probleemdefinitie-productrichting.md - Succesfactoren voor adoptie

---

### Vraagstuk 2: Hoe werken Penningmeesters nu (Workflow)?

**Context**:  
We weten dat penningmeesters Excel of handmatige methodes gebruiken, maar we weten niet exact **hoe** hun huidige workflow eruitziet.

**Onzekerheid**:
- In welke volgorde doen ze taken? (facturen → betaling → registratie? Of andersom?)
- Hoe vaak doen ze wat? (maandelijks batch vs wekelijks incrementeel?)
- Waar zijn breakpoints in hun workflow? (waar gaat het mis/duurt het lang?)
- Welke tools/systemen gebruiken ze naast Excel? (email, WhatsApp, bank app)
- Hoe collaboreren ze met bestuur/eigenaren?

**Aannames die gevalideerd moeten worden**:
- ⚠️ Penningmeesters werken vooral maandelijks in batches (eind vd maand)
- ⚠️ Email is primair communicatiemiddel met eigenaren
- ⚠️ Ze bewaren facturen in Google Drive of fysiek archief
- ⚠️ Bank app wordt gebruikt voor betalingen, Excel voor registratie

**Impact op product**:
- Feature volgorde in UI
- Workflow design (wizard vs freeform)
- Integraties (email, bank, cloud storage)
- Notifications timing

**Herleidbaar naar**: docs/product/discovery/01-probleemdefinitie-productrichting.md - Gebruikscontext

---

### Vraagstuk 3: Wat zijn de Grootste Frustraties met Huidige Tools?

**Context**:  
We weten generiek dat Excel "handmatig en foutgevoelig" is, maar we weten niet specifiek **welke taken** het meeste frustratie veroorzaken.

**Onzekerheid**:
- Welke specifieke taken kosten de meeste tijd?
- Waar maken penningmeesters de meeste fouten?
- Wat vinden ze het vervelendst aan hun huidige aanpak?
- Welke pain points zijn zo erg dat ze ervoor zouden betalen?

**Aannames die gevalideerd moeten worden**:
- ⚠️ Splitsingsberekeningen zijn foutgevoelig en frustrerend
- ⚠️ Betalingen matchen met contributies kost veel tijd
- ⚠️ Jaarrekening maken is stressvol en tijdrovend
- ⚠️ Eigenaren mailen om documenten is omslachtig

**Impact op product**:
- Feature prioriteit (wat bouwen we eerst?)
- Automation opportunities (wat kan geautomatiseerd?)
- Value proposition messaging
- Pricing rationale

**Herleidbaar naar**: docs/product/intake/01-sales-intake-analyse.md - Pain points

---

### Vraagstuk 4: Mobile vs Desktop Gebruik

**Context**:  
We assumeren dat penningmeesters vooral op laptop werken, maar soms mobile willen checken. Maar hoe is de verdeling echt?

**Onzekerheid**:
- Hoeveel werk gebeurt op mobile vs desktop?
- Welke taken worden op mobile gedaan? (quick checks vs data entry?)
- Is mobile nice-to-have of must-have?
- Welke devices gebruiken ze? (iOS vs Android, tablet vs phone)

**Aannames die gevalideerd moeten worden**:
- ⚠️ 70% desktop, 20% mobile, 10% tablet
- ⚠️ Mobile wordt gebruikt voor quick checks, niet data entry
- ⚠️ Native app is niet nodig, responsive web is voldoende voor MVP
- ⚠️ iOS en Android zijn beide belangrijk (50/50)

**Impact op product**:
- Mobile-first vs desktop-first design
- Native app prioriteit op roadmap
- Feature availability per platform
- Development effort allocation

**Herleidbaar naar**: docs/product/discovery/01-probleemdefinitie-productrichting.md - Waar gebruiken ze het product?

---

### Vraagstuk 5: Betalingsbereidheid & Value Perception

**Context**:  
We hebben €5-15/maand pricing aangenomen, maar we weten niet of penningmeesters dit daadwerkelijk willen betalen en waarom.

**Onzekerheid**:
- Hoeveel zijn ze bereid te betalen?
- Voor welke features zouden ze betalen? (wat is premium-waardig?)
- Hoe percipiëren ze de waarde? (tijdsbesparing in uren? Peace of mind? Status?)
- Freemium vs direct betaald?
- Wie betaalt? (VVE betaalt of penningmeester privé?)

**Aannames die gevalideerd moeten worden**:
- ⚠️ €5-15/maand is acceptabel voor gemiddelde VVE
- ⚠️ Tijdsbesparing is primaire value driver
- ⚠️ Freemium model leidt tot hogere adoptie
- ⚠️ VVE betaalt (niet penningmeester privé)
- ⚠️ 25% conversie van gratis naar betaald is haalbaar

**Impact op product**:
- Pricing model en tiers
- Free vs premium feature split
- Value messaging in app
- Onboarding (gratis trial vs direct betaald)

**Herleidbaar naar**: docs/product/intake/01-sales-intake-analyse.md - Betalingsbereidheid aannames

---

### Vraagstuk 6: VVE-Specifieke Complexiteit

**Context**:  
We weten dat splitsingen en reserves VVE-specifiek zijn, maar we weten niet hoe divers deze in praktijk zijn.

**Onzekerheid**:
- Hoeveel verschillende splitsingssleutels gebruiken VVE's? (1 standaard of meerdere?)
- Hoe complex zijn splitsingsregels? (simpele percentages of complexe formules?)
- Hoeveel reserves heeft een gemiddelde VVE? (2-3 of 5-10?)
- Hoe vaak wijzigen deze? (1x bij oprichting of regelmatig?)
- Welke edge cases bestaan er?

**Aannames die gevalideerd moeten worden**:
- ⚠️ Meeste VVE's hebben 1 splitsingssleutel (op basis van m² of aandeel)
- ⚠️ Gemiddeld 2-3 reserves (algemeen, onderhoud, speciaal)
- ⚠️ Splitsing wijzigt zelden (alleen bij splitsingsakte wijziging)
- ⚠️ Simpele percentage verdeling (geen complexe formules)

**Impact op product**:
- Flexibiliteit van splitsing model
- UI complexity voor reserves
- Migration/import complexity
- Edge case handling

**Herleidbaar naar**: docs/product/discovery/01-probleemdefinitie-productrichting.md - VVE-Specifieke Functionaliteit

---

### Vraagstuk 7: Onboarding & Migratie

**Context**:  
We willen dat penningmeesters binnen 30 minuten kunnen starten, maar we weten niet hoeveel historische data ze willen/moeten importeren.

**Onzekerheid**:
- Starten ze met schone lei (nieuwe VVE) of migreren ze (bestaande data)?
- Hoeveel historische data is nodig? (1 jaar? 5 jaar? Alleen saldo's?)
- In welk formaat hebben ze data nu? (Excel, PDF, papier?)
- Hoe makkelijk is het om data te importeren?
- Welke ondersteuning hebben ze nodig bij onboarding?

**Aannames die gevalideerd moeten worden**:
- ⚠️ 70% migreert vanaf bestaand systeem, 30% start nieuw
- ⚠️ Minimaal 1 jaar historie is gewenst
- ⚠️ Excel export is beschikbaar bij de meesten
- ⚠️ Wizard-based onboarding werkt beter dan freeform
- ⚠️ Video tutorials zijn voldoende, geen 1-on-1 support nodig

**Impact op product**:
- Import functionaliteit (Excel, CSV)
- Onboarding wizard design
- Help & documentation
- Support model (chat vs phone vs email)

**Herleidbaar naar**: docs/product/discovery/01-probleemdefinitie-productrichting.md - Onboarding succesfactoren

---

### Vraagstuk 8: Collaboratie & Rollen

**Context**:  
We focussen op penningmeesters, maar ze werken samen met bestuur en eigenaren. Hoe ziet die samenwerking eruit?

**Onzekerheid**:
- Werkt penningmeester solo of heeft bestuur ook toegang nodig?
- Welke info moet bestuur kunnen zien? (alles of summaries?)
- Hoe vaak checken bestuursleden mee? (maandelijks of alleen voor ALV?)
- Moeten eigenaren info kunnen zien? (self-service portal?)
- Wie mag wat doen? (penningmeester = admin, bestuur = read-only?)

**Aannames die gevalideerd moeten worden**:
- ⚠️ Penningmeester is primaire gebruiker, bestuur checkt occasioneel
- ⚠️ Bestuur heeft read-only toegang tot rapportages
- ⚠️ Eigenaren krijgen info via export/email, geen login nodig (MVP)
- ⚠️ Multi-user functionaliteit is nice-to-have, niet must-have voor MVP

**Impact op product**:
- User roles & permissions
- Sharing & collaboration features
- Eigenaren portal (roadmap prioriteit)
- Audit log (wie deed wat)

**Herleidbaar naar**: docs/product/discovery/01-probleemdefinitie-productrichting.md - Out of scope bepaling

---

## 2. Hypotheses voor Validatie

### Hypothese 1: Simpele Onboarding drijft Adoptie
**Stelling**: Als we de onboarding wizard simpel genoeg maken (<30 min), zullen penningmeesters de tool adopteren zonder hulp.

**Wat we geloven**:
- Wizard-based onboarding is beter dan freeform
- Video tutorials zijn voldoende
- Pre-filled templates helpen
- Progress indicator motiveert completion

**Hoe te valideren**:
- **Method**: Prototype testing met 5-10 penningmeesters
- **Metrics**: Time to complete, completion rate, waar droppen ze af?
- **Success**: >80% completion, <30 min gemiddeld, <2 support vragen

**Herleidbaar naar**: docs/product/discovery/01-probleemdefinitie-productrichting.md - Onboarding metrics

---

### Hypothese 2: Automatische Splitsingsberekening is Top Value Driver
**Stelling**: Het automatisch berekenen van contributie op basis van splitsing bespaart de meeste tijd en is de #1 reden om te upgraden van Excel.

**Wat we geloven**:
- Handmatige splitsingsberekeningen zijn foutgevoelig en tijdrovend
- Penningmeesters betalen voor deze automatisering
- Dit is bigger pain point dan bijv. document opslag

**Hoe te valideren**:
- **Method**: Gebruikers interviews + time tracking study
- **Metrics**: Hoeveel tijd kost splitsing nu? Hoeveel fouten? Willingness to pay?
- **Success**: Splitsing is top 3 pain point, tijdsbesparing >2 uur/maand

**Herleidbaar naar**: docs/product/discovery/01-probleemdefinitie-productrichting.md - VVE-Specifieke Functionaliteit

---

### Hypothese 3: Freemium Converteert bij 10+ Appartementen
**Stelling**: VVE's met >10 appartementen zijn bereid te betalen omdat het werk complexer is en de value hoger.

**Wat we geloven**:
- Kleine VVE's (<10 app) kunnen gratis blijven, te simpel om te betalen
- Middelgrote VVE's (10-50 app) zien value en converteren
- Free tier is goed voor adoptie, upgrade path is natuurlijk

**Hoe te valideren**:
- **Method**: Pricing survey + competitor analysis
- **Metrics**: Willingness to pay per VVE grootte, conversie in beta
- **Success**: >30% conversie bij 10-25 app, >50% bij 25-50 app

**Herleidbaar naar**: docs/product/intake/01-sales-intake-analyse.md - Freemium conversie aannames

---

### Hypothese 4: Mobile-Responsive Web > Native App (voor MVP)
**Stelling**: Een goed responsive web app is voldoende voor MVP; native apps zijn nice-to-have maar niet critical.

**Wat we geloven**:
- Penningmeesters doen zware work op desktop
- Mobile wordt gebruikt voor quick checks (saldo, status)
- Responsive web kan 80% van mobile use cases dekken
- Native app kan later, niet blocker voor adoptie

**Hoe te valideren**:
- **Method**: Usage pattern analysis + prototype testing
- **Metrics**: Desktop vs mobile usage, mobile tasks performed, native app demand
- **Success**: <30% mobile usage, quick-check tasks only, geen blocker voor adoptie

**Herleidbaar naar**: docs/product/discovery/01-probleemdefinitie-productrichting.md - Out of scope (native apps in Fase 2)

---

### Hypothese 5: Penningmeesters zoeken "Peace of Mind", niet alleen Efficiency
**Stelling**: De emotionele value proposition ("weten dat het goed zit") is even belangrijk als tijdsbesparing.

**Wat we geloven**:
- Angst voor fouten en non-compliance drijft adoptie
- "Slapen zonder zorgen" is waardevolle benefit
- Validation & checks (bijv. "je jaarrekening klopt") zijn premium features
- Trust & reliability zijn critical

**Hoe te valideren**:
- **Method**: Jobs-to-be-done interviews
- **Metrics**: Welke "job" hired ze de tool voor? Emotionele vs functionele motivaties?
- **Success**: "Peace of mind" komt voor in top 3 redenen om te kopen

**Herleidbaar naar**: docs/product/discovery/01-probleemdefinitie-productrichting.md - Doelen van gebruikers

---

## 3. UX Onderzoeksvragen

### Fase 1: Exploratory Research (Pre-MVP)

**Doel**: Begrijpen van huidige situatie en valideren van aannames

**Methoden**:
1. **User Interviews** (n=10-15 penningmeesters)
   - Huidige workflow & tools
   - Pain points & frustraties
   - Behoeften & wensen
   - Betalingsbereidheid
   - VVE context (grootte, type, complexiteit)

2. **Contextual Inquiry** (n=5 penningmeesters)
   - Observeren van actueel werk
   - Shadowing tijdens administratie taken
   - Documenteren van breakpoints
   - Tools & artifacts verzamelen

3. **Survey** (n=50-100 penningmeesters)
   - Kwantificeren van hypotheses
   - Segmentatie (VVE grootte, regio, etc.)
   - Pricing validation
   - Feature prioriteit

**Research Vragen**:
1. Hoe doet een penningmeester nu financiële administratie? (stap voor stap)
2. Welke 3 taken kosten de meeste tijd?
3. Waar gaat het het vaakst mis? (fouten, problemen)
4. Wat zou je leven 10x makkelijker maken?
5. Hoeveel uren per maand besteed je aan VVE admin?
6. Hoeveel zou je betalen voor een tool die 50% tijd bespaart?
7. Wat zijn de 3 belangrijkste features voor jou?
8. Hoe technisch vaardig ben je? (1-10)
9. Welke devices gebruik je voor VVE werk?
10. Hoe lang ben je al penningmeester? Hoe lang blijf je het nog?

**Deliverables**:
- User research rapport (insights & quotes)
- Persona's (2-3 primary penningmeester types)
- Journey maps (huidige workflow + pijnpunten)
- Feature prioriteit matrix (must/should/could/won't)
- Validated hypotheses (groen/rood/oranje)

**Tijdlijn**: 3-4 weken

---

### Fase 2: Evaluative Research (During MVP Build)

**Doel**: Valideren van design keuzes en itereren

**Methoden**:
1. **Prototype Testing** (n=8-10 penningmeesters)
   - Lo-fi wireframes → Hi-fi prototype
   - Task-based usability testing
   - Think-aloud protocol
   - A/B testing van key flows

2. **Card Sorting** (n=15-20 penningmeesters)
   - Information architecture
   - Menu structuur
   - Feature categorisatie
   - Terminologie validatie

3. **First Click Testing** (n=30-50 penningmeesters)
   - Navigation validatie
   - Call-to-action effectiveness
   - Quick remote tests

**Research Vragen**:
1. Kun je een nieuwe transactie toevoegen? (usability test)
2. Waar verwacht je de jaarrekening te vinden? (first click)
3. Hoe zou je deze features groeperen? (card sorting)
4. Snap je wat "splitsingssleutel" betekent? (terminology)
5. Is de onboarding wizard duidelijk?
6. Welke variant vind je makkelijker? (A vs B)

**Deliverables**:
- Usability test rapporten (findings & severity)
- Design iterations (versie 1, 2, 3)
- Information architecture (validated)
- Heuristic evaluations
- Accessibility audit

**Tijdlijn**: Lopend tijdens development (maand 2-5)

---

### Fase 3: Validatie Research (Beta/Launch)

**Doel**: Valideren van product-market fit en optimaliseren

**Methoden**:
1. **Beta Testing** (n=50-100 VVE's)
   - Real usage data
   - Analytics (funnel, retention, engagement)
   - In-app feedback & NPS
   - Support ticket analysis

2. **Follow-up Interviews** (n=10 beta users)
   - Ervaring met volledig product
   - Gaps & missing features
   - Competitive comparison
   - Willingness to recommend

3. **Pricing Tests** (n=variabel)
   - A/B test van prijspunten
   - Conversie optimalisatie
   - Churn analysis

**Research Vragen**:
1. Welke features gebruik je het meest?
2. Wat mis je nog?
3. Zou je dit aanraden aan andere penningmeesters?
4. Hoe vaak log je in?
5. Welke taken doe je nog steeds buiten de tool?
6. Is de prijs fair voor de waarde?

**Deliverables**:
- Product-market fit rapport
- Feature usage analytics
- Conversion funnel analysis
- Churn & retention insights
- Roadmap recommendations (prioriteit updates)

**Tijdlijn**: Maand 6-12

---

## 4. Schriftelijke Samenvattingen UX-Inzichten

### Template voor UX Research Rapporten

Alle UX research resultaten worden gedocumenteerd in `docs/ux/discovery/research-reports/` met de volgende structuur:

```markdown
# [Research Titel] - [Datum]

## Samenvatting
- Doel van onderzoek
- Methode
- Aantal participanten
- Key findings (top 3-5)

## Hypothese Validatie
- Welke hypotheses getest?
- Resultaat (validated/rejected/partially)
- Onderbouwing

## Detailed Findings
- Finding 1: [Titel]
  - Observatie
  - Evidence (quotes, data)
  - Impact op product
  - Aanbeveling
  
[etc.]

## Personas/Journey Updates
- Wat hebben we geleerd over gebruikers?
- Updates aan personas of journeys

## Actionable Recommendations
1. [Prio 1] [Recommendation]
   - Rationale
   - Effort
   - Impact
2. [etc.]

## Appendix
- Research protocol
- Participant screener
- Raw data/notes (link)
```

### Verbinding met Product Beslissingen

**Belangrijk**: Elk UX inzicht moet:
1. ✅ **Herleidbaar** zijn naar research data (niet meningen)
2. ✅ **Actionable** zijn (wat moeten we doen met dit inzicht?)
3. ✅ **Gelinkt** zijn aan product discovery docs
4. ✅ **Gedocumenteerd** zijn in gestandaardiseerd format

**Product Management verantwoordelijkheid**:
- Interpreteren van UX inzichten voor productrichting
- Afwegen van UX aanbevelingen tegen andere constraints (tech, business, timing)
- Beslissen over feature prioriteit
- Communiceren van rationale (waarom we wel/niet UX aanbevelingen opvolgen)

**UX team verantwoordelijkheid**:
- Uitvoeren van research volgens protocol
- Objectief rapporteren van findings
- Aanbevelingen doen (met rationale)
- Ondersteunen van product beslissingen met data

## 5. Prioritering UX Onderzoek

### Must Do (Pre-MVP)
1. ✅ **User interviews** (10-15 penningmeesters) - Valideren aannames
2. ✅ **Workflow mapping** - Begrijpen huidige situatie
3. ✅ **Feature prioriteit** - Wat is echt MVP?
4. ✅ **Pricing validation** - Betalingsbereidheid checken
5. ✅ **Terminology testing** - Juiste taal gebruiken

### Should Do (During MVP)
6. ✅ **Prototype testing** (iteratief) - Usability valideren
7. ✅ **Card sorting** - IA valideren
8. ✅ **Onboarding testing** - Critical flow optimaliseren

### Could Do (Nice to Have)
9. 🟡 **Competitive UX audit** - Benchmark tegen Tobias/VvE Admin
10. 🟡 **Accessibility testing** - Wcag compliance
11. 🟡 **Eye tracking** - Advanced usability insights

### Won't Do (Out of Scope)
12. ❌ **Beheerders research** (andere doelgroep, later)
13. ❌ **Eigenaren research** (niet MVP doelgroep)
14. ❌ **AI features research** (fase 3, te vroeg)

## Conclusie

Dit UX discovery document heeft **8 kritieke vraagstukken**, **5 valideerbare hypotheses** en een **gestructureerd onderzoeksplan** geïdentificeerd die de basis vormen voor evidence-based product beslissingen.

De **grootste onzekerheden** zijn:
1. Betalingsbereidheid (€5-15/maand realistic?)
2. Freemium conversie rates (25% haalbaar?)
3. Onboarding complexity (30 min realistic?)
4. Mobile vs desktop usage (responsive web voldoende?)

Deze moeten **gevalideerd** worden in Fase 1 (Exploratory Research) voordat we MVP scope finaliseren.

**Product Management committeert** aan:
- UX research budget & tijd (3-4 weken pre-MVP)
- Participanten rekrutering support
- Acting on research findings (met rationale)
- Iterative design process

## Vervolgstappen
→ Zie **docs/product/strategy/** voor strategische keuzes
→ Research rapporten worden gedocumenteerd in **docs/ux/discovery/research-reports/**
