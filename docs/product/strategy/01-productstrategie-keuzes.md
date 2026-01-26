# Productstrategie & Keuzes - VVE Tooling

## Documentinformatie
- **Datum**: 2026-01-26 (Updated: 2026-01-26)
- **Eigenaar**: Product Management
- **Status**: Final
- **Versie**: 2.0
- **Changelog**: v2.0 - Multi-user platform (penningmeester-first gewijzigd naar VVE-platform)

## Bronverwijzingen
Dit document is gebaseerd op:
- [docs/product/discovery/01-probleemdefinitie-productrichting.md](../discovery/01-probleemdefinitie-productrichting.md)
- [docs/product/intake/01-sales-intake-analyse.md](../intake/01-sales-intake-analyse.md)
- [docs/ux/discovery/01-ux-vraagstukken-validatie.md](../../ux/discovery/01-ux-vraagstukken-validatie.md)

## 1. Productvisie

### Vision Statement

> **VVE Tooling brengt transparantie en samenwerking naar zelfbeheer VVE's.**
>
> We geloven dat elke VVE-lid - van penningmeester tot bewoner - **toegang moet hebben tot informatie** en **kan samenwerken** aan een gezonde VVE. Door moderne technologie en gebruiksvriendelijk multi-user design te combineren met diepgaande VVE-kennis, creëren we het eerste platform waar **iedereen kan inloggen** en **ziet wat er gebeurt**.
>
> Van penningmeester die efficiënt werkt, tot voorzitter die overzicht heeft, tot bewoner die weet waar zijn contributie naartoe gaat - **VVE Tooling maakt VVE beheer transparant en collaboratief**.

### Mission (3-Jaars Horizon)

**Jaar 1 (2026)**:  
Het **transparantste, meest collaboratieve VVE platform** bouwen waar 500+ VVE's (met 2.000+ actieve gebruikers) bestuur en bewoners **samen** hun VVE beheren.

**Jaar 2 (2027)**:  
**Marktleider in moderne VVE tooling** worden met 2.000+ VVE's, native mobile apps, en het hoogste bewoner-engagement in de industrie.

**Jaar 3 (2028)**:  
**Het standaard platform** zijn voor zelfbeheer VVE's met 5.000+ VVE's, AI-powered features, en 30%+ van de Nederlandse zelfbeheer VVE markt.

### Core Values

1. **Transparantie Eerst**  
   Iedereen in de VVE moet kunnen zien wat er gebeurt. Geen black boxes, geen verborgen informatie.

2. **Samenwerking mogelijk maken**  
   Multi-user is geen feature, het is de kern. Penningmeester, voorzitter en bewoners werken samen.

3. **Simpliciteit zonder Compromissen**  
   Simpel voor passieve bewoners, krachtig voor actieve penningmeesters. Iedereen krijgt wat ze nodig hebben.

4. **Betrouwbaarheid boven Alles**  
   VVE financiën zijn serieus. We bouwen met bank-level security, 99.9% uptime en zero-tolerance voor data loss.

5. **Iteratief & Evidence-Based**  
   We valideren aannames, leren van gebruikers en itereren snel. No ego, alleen data en gebruikersfeedback.

## 2. Strategische Keuzes & Onderbouwing

### Keuze 1: Multi-User Platform (niet Single-User Tool)

**Besluit**: We bouwen een multi-user platform voor de **hele VVE** (penningmeester + bestuursleden + bewoners), niet alleen een tool voor de penningmeester.

**Rationale**:
- ✅ **Transparantie als differentiator**: Geen andere VVE tool geeft bewoners toegang
- ✅ **Grotere value proposition**: Hele VVE profiteert, niet alleen penningmeester
- ✅ **Hogere betalingsbereidheid**: VVE betaalt €15-35/maand voor volledige platform vs €5-10 voor penningmeester-only tool
- ✅ **Bewoner engagement**: Actieve bewoners = gezonde VVE's, betere retentie
- ✅ **Viral growth**: Meer users per VVE = meer mond-tot-mond marketing
- ✅ **Toekomst-proof**: Fundamentele architecture voor volledige VVE collaboration platform

**Trade-offs**:
- ❌ **Complexer MVP**: Multi-user, permissions, verschillende dashboards = meer development tijd
- ❌ **Langere time-to-market**: 4-6 maanden vs 3-4 maanden voor single-user
- ❌ **Bewoner activatie risico**: Passieve bewoners loggen misschien niet in
- ❌ **Privacy complexity**: Moet goed nadenken over wie wat kan zien

**Mitigatie**:
- Progressive rollout: Start met penningmeester + voorzitter, bewoners later in MVP
- Mobile-first UX voor bewoners (werkt op smartphone)
- Onboarding wizard helpt penningmeester om users uit te nodigen
- Privacy by design: Bewoners zien alleen eigen betalingsstatus

**Alternatief overwogen**: Single-user (alleen penningmeester)
- **Rejected because**: Missed opportunity voor echte differentiation, lagere value proposition, kleiner markt potentieel

**Bronverwijzing**: Nieuwe requirement van stakeholder

---

### Keuze 2: Zelfbeheer VVE-First (niet Professionele Beheerders)

**Rationale**:
**Rationale**:
- ✅ **Groter onbediend segment**: 60-70% van markt vs 30-40%
- ✅ **Minder concurrentie**: Tobias/VvE Admin focussen op professionele beheerders
- ✅ **Multi-user is natural fit**: Zelfbeheer VVE's hebben bestuur + bewoners die betrokken zijn
- ✅ **Transparantie value**: Grootste pain point bij zelfbeheer is gebrek aan transparantie
- ✅ **Fundament voor uitbreiding**: Zelfbeheer platform kan later uitbreiden naar beheerders

**Trade-offs**:
- ❌ **Lower ARPU per deal**: €15-35/maand per VVE vs €10-25/maand per VVE * 50-200 VVE's bij beheerders
- ❌ **Meer klanten nodig**: Voor zelfde revenue
- ❌ **Diverse user base**: Zelfbeheer VVE's variëren meer in sophistication

**Mitigatie**:
- Flat fee pricing compenseert met volume
- Platform architecture schaalt naar beheerders later (multi-VVE = roadmap Fase 2)
- Community/network effects bij zelfbeheer VVE's

**Bronverwijzing**: docs/marktonderzoek/13-markt-kansen.md - Penningmeester platform #1 prioriteit

---

### Keuze 3: Flat Fee Pricing (niet Freemium of Per-User)

**Besluit**: We hanteren **flat fee pricing per VVE** (€15-35/maand op basis van VVE grootte), **niet freemium** en **niet per-user pricing**.

**Rationale**:
- ✅ **Multi-user friendly**: Unlimited users per VVE = geen barrier voor bewoners/bestuur toe te voegen
- ✅ **Fair & transparent**: Prijs gebaseerd op VVE grootte (aantal appartementen), niet aantal users
- ✅ **Voorspelbaar**: VVE weet exact wat ze betalen, geen surprise bills
- ✅ **Hogere ARPU**: €15-35/maand vs €5-15 bij freemium (waar meeste gratis blijven)
- ✅ **Minder support load**: Geen gratis tier = betaalde users die meer waarde zien
- ✅ **Trial validates value**: 30 dagen gratis trial is voldoende om waarde te bewijzen

**Pricing tiers**:
- €15/maand: Tot 25 appartementen, unlimited users
- €25/maand: 25-50 appartementen, unlimited users
- €35/maand: 50+ appartementen, unlimited users
- 30 dagen gratis trial (volledige toegang)

**Trade-offs**:
- ❌ **Higher barrier to entry**: Geen permanent gratis tier
- ❌ **Conversie pressure**: Trial moet snel value laten zien
- ❌ **Kleinere funnel**: Minder trial signups dan met freemium

**Mitigatie**:
- 30 dagen trial is voldoende om één maand administratie te doen + jaarrekening voor te bereiden
- Onboarding wizard zorgt voor quick time-to-value
- Credit card upfront (maar niet charged during trial) = commitment but fair
- Can cancel anytime = low risk

**Alternatief overwogen**: Freemium model
- **Rejected because**: Multi-user platform is te waardevol voor permanent gratis tier, support costs te hoog

**Alternatief overwogen**: Per-user pricing
- **Rejected because**: Barrier voor bewoners toevoegen, complex te communiceren, not aligned met VVE budget model

**Bronverwijzing**: Gebaseerd op nieuwe multi-user requirement + industry best practices (Slack, Notion gebruiken ook flat-fee voor small teams)

---

### Keuze 8: Web-First, Native Apps Later

**Besluit**: MVP is responsive web app. Native iOS/Android apps komen in Fase 2 (Jaar 1 Q3-Q4).

**Rationale**:
- ✅ **Faster to market**: 1 codebase (web) vs 3 (web + iOS + Android)
- ✅ **Cost efficient**: Kleiner team, minder maintenance
- ✅ **Easier iteration**: Web deploys instant, apps door review proces
- ✅ **80/20 rule**: Responsive web dekt 80% van mobile use cases
- ✅ **Desktop for penningmeester**: Penningmeesters doen zware werk op laptop
- ✅ **Mobile-first design for bewoners**: Responsive web werkt goed op smartphone (bookmark op homescreen)

**Trade-offs**:
- ❌ **Suboptimale mobile UX voor bewoners**: Web kan niet alle native features (push notifications, offline, etc.)
- ❌ **Perceived value**: Sommige bewoners verwachten "echte app"
- ❌ **App store discovery**: Missen SEO van app stores
- ❌ **Perceived value**: Sommige users verwachten "echte app"
- ❌ **App store discovery**: Missen SEO van app stores

**Mitigatie**:
- Excellent responsive design (mobile-first design approach)
- Progressive Web App (PWA) voor "add to homescreen" functionaliteit
- Monitor mobile usage (target: <30% for MVP validation)
- Native apps op roadmap (Jaar 1 Q3-Q4) als mobile usage hoger is

**Alternatief overwogen**: React Native hybrid app
- **Rejected because**: Nog steeds complexity van mobile development, liever focus op web UX

**Bronverwijzing**: docs/product/discovery/01-probleemdefinitie-productrichting.md - Out of scope sectie

---

### Keuze 8: Scherpe MVP Scope (Financieel + VVE-Specifiek Only)

**Besluit**: MVP bevat ALLEEN financiële administratie + VVE-specifieke features. Geen onderhoud, contracten, communicatie, vergaderingen.

**Rationale**:
- ✅ **Focus**: Oplossen van core probleem (financiële admin is #1 pain point)
- ✅ **Realistic timeline**: 3-6 maanden haalbaar voor financieel + VVE-specifiek
- ✅ **Clear value prop**: "Financiële admin voor VVE's" is simpel te communiceren
- ✅ **Differentiation**: VVE-specifieke financieel is unique (splitsingen, reserves)
- ✅ **Test hypotheses**: Kunnen we betalingsbereidheid valideren met minimal product?

**In scope MVP**:
- Financiële administratie (inkomsten, uitgaven, categorieën)
- VVE-specifiek (splitsingen, reserves, eigenaren)
- Rapportages (maand, jaar, begroting)
- Document opslag (facturen)

**Out of scope MVP**:
- Onderhoud planning
- Contract management
- Communicatie platform (email/WhatsApp integratie)
- Vergader management
- Multi-user (alleen penningmeester)

**Trade-offs**:
- ❌ **Incomplete solution**: Penningmeesters moeten andere tools gebruiken voor onderhoud etc.
- ❌ **Limited stickiness**: Minder lock-in zonder complete platform

**Mitigatie**:
- Clear roadmap communicatie (deze features komen)
- Integraties met andere tools (bijv. Google Drive voor documenten)
- Fast iteration (voeg features toe op basis van feedback)

**Bronverwijzing**: docs/product/discovery/01-probleemdefinitie-productrichting.md - In-scope/out-of-scope sectie

---

### Keuze 8: Nederland-First, Internationale Expansie Later

**Besluit**: MVP is volledig Nederlands (taal, compliance, features). Geen multi-language of internationale features.

**Rationale**:
- ✅ **VVE is Nederlands concept**: Vereniging Van Eigenaren is specifiek NL wetgeving
- ✅ **Focus**: 150.000 Nederlandse VVE's is groot genoeg voor jaren groei
- ✅ **Compliance**: Nederlandse AVG, belasting, accounting rules zijn specifiek
- ✅ **Simplicity**: Geen i18n complexity, geen multi-currency, geen multi-tax

**Trade-offs**:
- ❌ **Limited TAM**: Geen België, Duitsland, etc.
- ❌ **Later expansion harder**: Moet refactoren voor internationalization

**Mitigatie**:
- Architectuur bouwen met i18n in gedachten (but not implemented)
- Focus op Nederlandse markt dominatie eerst
- Expansie mogelijk naar België (VVE equivalent: VME) als eerste stap

**Alternatief overwogen**: Multi-language from start
- **Rejected because**: Adds complexity zonder validated demand, focus op NL eerst

**Bronverwijzing**: Impliciete keuze uit alle marktonderzoek documenten (focus op NL)

---

### Keuze 8: Hosted SaaS, Geen On-Premise

**Besluit**: Alleen cloud-hosted SaaS model. Geen on-premise of self-hosted optie.

**Rationale**:
- ✅ **Simpler**: 1 versie, geen deployment complexity
- ✅ **Better UX**: Altijd up-to-date, geen installatie
- ✅ **Lower support**: Geen "welke versie draai je?" issues
- ✅ **Recurring revenue**: Subscription model (niet one-time license)
- ✅ **Data security**: We controleren security, geen customer mistakes

**Trade-offs**:
- ❌ **Data privacy concerns**: Sommige VVE's willen data zelf hosten
- ❌ **Connectivity requirement**: Moet online zijn om te gebruiken

**Mitigatie**:
- Nederlandse data center (AVG compliant)
- Transparantie over data security en privacy
- Data export altijd mogelijk (geen lock-in)
- Offline mode later als feature (Roadmap)

**Alternatief overwogen**: Hybrid (cloud + on-premise optie)
- **Rejected because**: Adds operational complexity, niet nodig voor MVP

---

### Keuze 8: Direct-to-Consumer GTM, Sales Later

**Besluit**: Product-led growth (self-service signup) is primaire GTM. Geen sales team voor MVP.

**Rationale**:
- ✅ **Lower CAC**: Geen sales salaries, marketing alleen
- ✅ **Scalable**: Product verkoopt zichzelf
- ✅ **Faster feedback loop**: Directe user feedback
- ✅ **Product focus**: Forceer ons om excellent product te bouwen
- ✅ **Freemium friendly**: Self-service past bij freemium

**GTM Kanalen (MVP)**:
1. **Content marketing**: Blogs, SEO ("penningmeester software", "VVE administratie")
2. **Partnerships**: Vereniging van Eigenaren, VVE adviseurs
3. **Referrals**: Mond-tot-mond tussen penningmeesters
4. **Google Ads**: Paid search for high-intent keywords
5. **Social**: LinkedIn, Facebook (waar penningmeesters zijn)

**Trade-offs**:
- ❌ **Slower initial growth**: Geen big deals via sales
- ❌ **Miss beheerders**: Beheerders kopen vaak via sales proces

**Mitigatie**:
- Sales team toevoegen in Jaar 2 voor beheerders segment
- Partnerships als "soft sales" (adviseurs recommenden ons)
- Community building (forum, webinars) voor awareness

**Bronverwijzing**: docs/marktonderzoek/13-markt-kansen.md - GTM strategie sectie

---

## 3. Prioritering van Probleemgebieden

### Problem Priority Matrix

| Probleemgebied | Impact | Frequency | Urgency | Betalingsbereidheid | MVP Prioriteit |
|----------------|--------|-----------|---------|---------------------|----------------|
| **Financiële admin** | Zeer Hoog | Dagelijks/Wekelijks | Hoog | Hoog | **P0** ✅ |
| **Splitsingen berekenen** | Hoog | Maandelijks | Hoog | Zeer Hoog | **P0** ✅ |
| **Reserves beheren** | Hoog | Maandelijks | Gemiddeld | Hoog | **P0** ✅ |
| **Jaarrekening maken** | Zeer Hoog | Jaarlijks | Zeer Hoog | Zeer Hoog | **P0** ✅ |
| **Rapportages genereren** | Hoog | Maandelijks | Gemiddeld | Gemiddeld | **P0** ✅ |
| **Documenten opslaan** | Gemiddeld | Wekelijks | Laag | Laag | **P1** 🟡 |
| Onderhoud plannen | Gemiddeld | Jaarlijks | Gemiddeld | Gemiddeld | **P2** ⏭️ |
| Communicatie eigenaren | Gemiddeld | Maandelijks | Laag | Laag | **P2** ⏭️ |
| Contract beheer | Laag | Jaarlijks | Laag | Laag | **P3** ⏭️ |
| Vergader management | Laag | Kwartaal | Laag | Laag | **P3** ⏭️ |

**P0 = Must Have for MVP** (Blocker voor lancering)  
**P1 = Should Have for MVP** (Sterk gewenst, maar niet blocker)  
**P2 = Could Have** (Nice-to-have, roadmap Fase 2)  
**P3 = Won't Have** (Out of scope, misschien later)

### Rationale per Prioriteit

**P0 - Financiële Admin & VVE-Specifiek**:
- Dit IS het core probleem dat we oplossen
- Zonder dit is er geen product
- Alle 4 variabelen scoren hoog (impact, frequency, urgency, betalingsbereidheid)
- Differentiation vs Excel/generieke tools

**P1 - Documenten**:
- Helpt bij volledig financieel overzicht
- Relatief simpel te bouwen
- Niet blocker (kunnen Google Drive gebruiken)
- Include als tijd/resources toelaten

**P2 - Onderhoud & Communicatie**:
- Belangrijk maar niet core financieel
- Separate user needs (kunnen andere tools gebruiken)
- Roadmap Fase 2 (Jaar 1 Q3-Q4)

**P3 - Contract & Vergaderingen**:
- Laagste scores op alle dimensies
- Overlap met andere tools (Google Docs, Zoom)
- Niet VVE-specifiek genoeg
- Misschien ooit, maar lage prioriteit

## 4. Relatie tot Bredere Product- en Organisatiedoelen

### Product Portfolio Strategie (3-Jaars Horizon)

```
Jaar 1: Foundation
├── VVE Tooling Penningmeester (MVP)
│   └── Target: Zelfbeheer VVE's, vrijwillige penningmeesters
│   └── Product: Financiële admin + VVE-specifiek
│   └── Goal: 500 VVE's, €2.5-5k MRR, Product-Market Fit

Jaar 2: Expansion
├── VVE Tooling Penningmeester (V2)
│   └── Native apps, integraties, geavanceerde features
│   └── Goal: 2.000 VVE's, €15-25k MRR
│
└── VVE Tooling Beheerder (MVP)
    └── Target: Kleine/middelgrote beheerkantoren
    └── Product: Multi-VVE platform met onderhoud, contracten
    └── Goal: 10 beheerders (500-1.000 VVE's), €5-10k MRR

Jaar 3: Innovation
├── VVE Tooling Penningmeester (V3)
│   └── AI features, automation, compliance
│
├── VVE Tooling Beheerder (V2)
│   └── Enterprise features, API's, integraties
│
└── VVE Tooling Compliance (Add-on)
    └── Target: Alle VVE's
    └── Product: Juridisch, AVG, templates
    └── Goal: Upsell add-on, €2-5k MRR
```

### Organisatie Doelen Alignment

**Company Mission** (aangenomen):  
"Professionaliseren en digitaliseren van VVE beheer in Nederland"

**Hoe VVE Tooling Penningmeester bijdraagt**:
1. ✅ **Democratiseren**: Maakt professionele tools toegankelijk voor vrijwilligers
2. ✅ **Digitaliseren**: Vervangt Excel/papier met moderne cloud software
3. ✅ **Professionaliseren**: Verhoogt kwaliteit van VVE beheer via compliance en structuur
4. ✅ **Schaalbaar model**: Fundament voor complete VVE tooling ecosystem

**Strategic Pillars**:

**1. Market Leadership**
- Doel: #1 in penningmeester segment binnen 2 jaar
- Metrics: Marktaandeel, NPS, Brand awareness
- VVE Tooling bijdrage: First product, establishes brand in VVE markt

**2. User Delight**
- Doel: Best-in-class UX in VVE tooling
- Metrics: NPS >50, 4.5+ star rating, <10% churn
- VVE Tooling bijdrage: Sets UX standard, differentiatie vs concurrenten

**3. Sustainable Growth**
- Doel: Profitabel, schaalbaar business binnen 3 jaar
- Metrics: LTV/CAC >3, <50% burn rate, Path to profitability
- VVE Tooling bijdrage: Freemium model + low CAC = sustainable growth

**4. Innovation**
- Doel: Continue innovatie in VVE tooling (AI, automation)
- Metrics: Feature releases, patent/IP, Industry awards
- VVE Tooling bijdrage: Platform voor future innovation (AI, integrations)

### Portfolio Sequencing Rationale

**Waarom deze volgorde?**

1. **Penningmeester first**: Largest underserved segment, faster MVP
2. **Beheerder second**: Builds on penningmeester platform, higher ARPU
3. **Compliance third**: Upsell to existing base, regulatory moat

**Alternative sequencing overwogen**:
- Beheerder first → Rejected: Slower, meer concurrentie, complexer MVP
- All-in-one from start → Rejected: Te complex, te lang time-to-market
- Compliance first → Rejected: Niet standalone product, needs base platform

## 5. Roadmap & Milestones

### Jaar 1 (2026): Foundation

**Q1 (Jan-Mar)**
- ✅ Product Discovery & Strategy (dit document) ✓
- ✅ UX Research (interviews, surveys, prototype testing)
- ✅ MVP Scope finalization
- 🎯 **Milestone**: Validated product direction & MVP specs

**Q2 (Apr-Jun)**
- 🔨 MVP Development
- 🔨 Design system & UX/UI
- 🔨 Beta recruitment (50 VVE's)
- 🎯 **Milestone**: Private beta launch (50 users)

**Q3 (Jul-Sep)**
- 🔨 Beta feedback iteration
- 🔨 Public launch preparation
- 🔨 Marketing & GTM setup
- 🎯 **Milestone**: Public launch (target: 200 VVE's in Q3)

**Q4 (Oct-Dec)**
- 📈 Growth & optimization
- 📈 Feature iteration based on usage
- 📈 Native app development starts
- 🎯 **Milestone**: 500 VVE's, €2.5-5k MRR, Product-Market Fit validated

### Jaar 2 (2027): Expansion

**Q1-Q2**
- VVE Tooling Penningmeester V2 (native apps, integraties)
- VVE Tooling Beheerder MVP (scoping & development)
- Sales team hire (voor beheerders)
- 🎯 **Milestone**: 1.000 penningmeester VVE's, Beheerder beta

**Q3-Q4**
- VVE Tooling Beheerder launch
- Marketing expansion (beheerder segment)
- Platform optimizations
- 🎯 **Milestone**: 2.000 penningmeesters, 10 beheerders, €25-50k MRR

### Jaar 3 (2028): Innovation

**Q1-Q2**
- AI features (chatbot, automation)
- Compliance module development
- Partnerships (accountants, juristen)
- 🎯 **Milestone**: AI beta, Compliance MVP

**Q3-Q4**
- Platform consolidation
- Enterprise features (API's, SSO)
- International exploration (België?)
- 🎯 **Milestone**: 5.000 VVE's totaal, €100k+ MRR, Market leader

## 6. Success Metrics & KPIs

### North Star Metric
**Active VVE's generating monthly reports**

Rationale: Dit combineert adoptie (actieve gebruikers), engagement (maandelijks gebruik) en value delivery (genereren rapporten = core use case).

### Primary KPIs (per Kwartaal)

**Growth**:
- Nieuwe VVE signups
- Actieve VVE's (MAU)
- MRR (Monthly Recurring Revenue)
- Growth rate (MoM %)

**Engagement**:
- MAU/Registered ratio (active %)
- Logins per VVE per maand
- Features used per session
- Reports generated per VVE

**Retention**:
- Monthly churn rate
- 3-month retention
- 12-month retention
- Resurrection rate (reactivation)

**Monetization**:
- Free to Paid conversion rate
- ARPU (Average Revenue Per User)
- LTV (Lifetime Value)
- LTV/CAC ratio

**Satisfaction**:
- NPS (Net Promoter Score)
- CSAT (Customer Satisfaction)
- App store rating
- Support ticket volume

### Secondary KPIs

**Acquisition**:
- Website visitors
- Trial signups
- Signup conversion rate
- CAC per channel

**Onboarding**:
- Onboarding completion rate
- Time to first value
- Time to complete setup

**Product**:
- Feature adoption rates
- Support tickets per feature
- Bug rate / incident rate
- Page load time / uptime

## Conclusie

Deze productstrategie definieert een **duidelijke richting** voor VVE Tooling met:

1. **Scherpe focus**: Penningmeesters first, financieel admin core
2. **Realistische scope**: MVP in 3-6 maanden, iteratief uitbreiden
3. **Gedegen onderbouwing**: Elk strategische keuze is gebaseerd op analyse
4. **Meetbare doelen**: Clear KPIs en milestones
5. **Groeipad**: Van niche (penningmeesters) naar marktleider (volledig platform)

De **grootste strategische werf** is freemium + penningmeester-first approach in een markt die gewend is aan betaalde, beheerder-focused tools. Dit is bewust gekozen om:
- Sneller te groeien (lagere adoptie drempel)
- Beter product te bouwen (meer gebruikers = meer feedback)
- Groter segment te bedienen (ondergeserveerde markt)

**Succesfactoren**:
1. Excellent UX (10x better dan Excel/Tobias)
2. VVE-specifiek (splitsingen, reserves)
3. Fast time-to-value (30 min onboarding)
4. Right pricing (€5-15 sweet spot)
5. Community-driven growth (referrals)

We committeren aan **evidence-based beslissingen** en **iteratief leren**. Deze strategie is een living document dat updatet op basis van learnings.

## Vervolgstappen
→ Zie **docs/backlog/epics/** voor epic definitie
→ Product roadmap wordt bijgehouden in project management tool (link TBD)
→ KPI dashboard wordt ingeregeld in analytics tool (link TBD)
