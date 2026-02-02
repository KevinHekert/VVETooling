# Functioneel Testrapport: VVE de Markt Dedemsvaart

**Datum:** 2026-02-02  
**Tester:** Functioneel Tester (UI/UX specialisme)  
**Applicatie:** VVE Tooling  
**Testscenario:** Inrichten VVE de Markt in Dedemsvaart  

---

## 1. Samenvatting

Dit rapport bevat de resultaten van een uitgebreide functionele UI/UX test van de VVE Tooling applicatie. De applicatie is getest door het inrichten van een fictieve VVE genaamd "VVE de Markt" in Dedemsvaart.

### Testomgeving
- **Frontend:** Next.js 14 op http://localhost:8080
- **Backend:** FastAPI op http://localhost:7001
- **Database:** PostgreSQL 15
- **Browser:** Chromium (via Playwright)
- **Viewports getest:** Desktop (1280x900) en Mobile (375x812)

### Algehele Beoordeling

| Categorie | Status | Score |
|-----------|--------|-------|
| Login Flow | ⚠️ Deels werkend | 7/10 |
| Dashboard | ✅ Werkend | 8/10 |
| Navigatie | ✅ Werkend | 9/10 |
| Tenant/Rol Switcher | ✅ Werkend | 8/10 |
| Onboarding Wizard | ✅ Werkend | 9/10 |
| Instellingen | ✅ Werkend | 8/10 |
| Contracten Beheer | ⚠️ Deels werkend | 6/10 |
| Documenten | ⚠️ Toegangsproblemen | 5/10 |
| Responsief Design | ✅ Werkend | 9/10 |

---

## 2. Gedetailleerde Testresultaten

### 2.1 Login Flow

**Testcase:** Inloggen met admin credentials

| Stap | Actie | Verwacht Resultaat | Actueel Resultaat | Status |
|------|-------|-------------------|-------------------|--------|
| 1 | Navigeer naar applicatie | Login pagina wordt getoond | Login pagina wordt getoond | ✅ Pass |
| 2 | Vul e-mailadres in | Veld accepteert input | Veld accepteert input | ✅ Pass |
| 3 | Vul wachtwoord in | Veld accepteert input (gemaskeerd) | Veld accepteert input | ✅ Pass |
| 4 | Klik op "Inloggen" | Redirect naar dashboard | Redirect naar dashboard | ✅ Pass |

**Bevindingen:**
- ✅ Login formulier is duidelijk en gebruiksvriendelijk
- ✅ Placeholder tekst geeft goede hints
- ✅ "Onthoud mij" checkbox aanwezig
- ✅ "Wachtwoord vergeten?" link beschikbaar
- ✅ Error handling werkt correct (inline foutmeldingen)
- ⚠️ **BUG:** Standaard dev admin e-mail `admin@vvetooling.local` wordt afgewezen door Pydantic EmailStr validatie (`.local` domein niet toegestaan)

**Screenshot:** `test-01-login-page.png`, `test-02-login-filled.png`

---

### 2.2 Dashboard (Bewoner View)

**Testcase:** Dashboard weergave na inloggen

| Element | Aanwezig | Functioneel | Opmerkingen |
|---------|----------|-------------|-------------|
| Welkomstbericht | ✅ | ✅ | Toont "Welkom, [voornaam]" |
| Mijn Bijdrage KPI | ✅ | ✅ | € 450,00 / maand |
| Status KPI | ✅ | ✅ | "Betaald ✓" met groene styling |
| Recente Betalingen | ✅ | ✅ | Lijst met 3 maanden |
| Recente Documenten | ✅ | ✅ | Links naar documentenpagina |

**Bevindingen:**
- ✅ Overzichtelijke layout met KPI cards
- ✅ Duidelijke visuele hiërarchie
- ✅ Consistente styling en kleuren
- ✅ Goede leesbaarheid

**Screenshot:** `test-03-dashboard-bewoner.png`

---

### 2.3 Tenant/Rol Switcher

**Testcase:** Wisselen tussen VVE's en rollen

| Stap | Actie | Verwacht Resultaat | Actueel Resultaat | Status |
|------|-------|-------------------|-------------------|--------|
| 1 | Klik op VVE selector | Dropdown opent | Dropdown opent | ✅ Pass |
| 2 | Bekijk beschikbare opties | Lijst van VVE's met rollen | 3 VVE's zichtbaar | ✅ Pass |
| 3 | Selecteer andere VVE/rol | Context wisselt | Context wisselt | ✅ Pass |

**Beschikbare Contexten (mock data):**
1. 🔧 VVE Amstelplein - Beheerder
2. 👔 VVE Keizersgracht - Bestuurslid
3. 🏠 VVE Prinsengracht 12 - Bewoner

**Bevindingen:**
- ✅ Duidelijke emoji-iconen per rol
- ✅ VVE naam en rol duidelijk zichtbaar
- ✅ Dropdown styling is consistent
- ⚠️ **Opmerking:** Tenant switcher gebruikt mock data, niet database data

**Screenshot:** `test-04-tenant-switcher-open.png`

---

### 2.4 Contracten Beheer (Beheerder)

**Testcase:** Contracten overzichtspagina

| Element | Aanwezig | Functioneel | Opmerkingen |
|---------|----------|-------------|-------------|
| Pagina titel | ✅ | ✅ | "Contracten" |
| KPI cards | ✅ | ✅ | Totaal, Actief, Verloopt binnenkort |
| Filter dropdowns | ✅ | ✅ | Type en Status filters |
| Zoekbalk | ✅ | ✅ | Placeholder tekst aanwezig |
| "+ Nieuw Contract" button | ✅ | - | Niet getest |
| Empty state | ✅ | ✅ | "Geen contracten gevonden" |

**Bevindingen:**
- ✅ Overzichtelijke layout
- ✅ Goede filter functionaliteit beschikbaar
- ⚠️ **BUG:** Error message toont `[object Object],[object Object]` - JSON niet correct geparseerd
- ✅ Empty state is gebruiksvriendelijk

**Screenshot:** `test-05-contracten-page.png`

---

### 2.5 Documenten Pagina

**Testcase:** Documenten beheer

| Stap | Actie | Verwacht Resultaat | Actueel Resultaat | Status |
|------|-------|-------------------|-------------------|--------|
| 1 | Navigeer naar /dashboard/documenten | Documenten overzicht | "Geen toegang tot deze VVE" | ❌ Fail |

**Bevindingen:**
- ❌ **BUG:** 403 Forbidden error - Gebruiker heeft geen toegang ondanks beheerder rol
- ⚠️ Autorisatie logica lijkt niet correct gekoppeld aan geselecteerde VVE context

**Screenshot:** `test-06-transactions-page.png`

---

### 2.6 Instellingen Pagina

**Testcase:** Instellingen overzicht

| Module | Aanwezig | Link Werkt | Beschrijving |
|--------|----------|------------|--------------|
| Onboarding | ✅ | ✅ | Start of hervat de VVE onboarding flow |
| Rollen | ✅ | - | Beheer rollen en toegang binnen de VVE |
| Splitsingssleutel | ✅ | - | Definieer de aandelen per unit |
| Splitsingsakte | ✅ | - | Beheer versies van de splitsingsakte |
| E-mail | ✅ | - | Configureer e-mailinstellingen en templates |
| Notificaties | ✅ | - | Stel meldingen en voorkeuren in |
| Leveranciers | ✅ | - | Beheer leveranciers en evaluaties |
| Export & backup | ✅ | - | Exporteer data en beheer back-ups |
| Abonnementen | ✅ | - | Bekijk en beheer abonnementen |

**Bevindingen:**
- ✅ Overzichtelijke card-layout
- ✅ Duidelijke beschrijvingen per module
- ✅ Consistente navigatie

**Screenshot:** `test-07-instellingen-page.png`

---

### 2.7 Onboarding Wizard

**Testcase:** VVE de Markt Dedemsvaart inrichten

#### Stap 1: Basisgegevens

| Veld | Ingevuld | Validatie | Opmerkingen |
|------|----------|-----------|-------------|
| Naam VVE * | VVE de Markt Dedemsvaart | ✅ | Verplicht veld |
| KVK Nummer | 87654321 | ✅ | Optioneel |
| Adres | Marktstraat 15 | ✅ | Optioneel |
| Postcode | 7701 AB | ✅ | Optioneel |
| Stad | Dedemsvaart | ✅ | Optioneel |

**Bevindingen Stap 1:**
- ✅ Duidelijke veldlabels
- ✅ Placeholder tekst geeft hints
- ✅ "Volgende" knop werkt correct
- ✅ Voortgangsindicator toont stappen

#### Stap 2: Rollen & Uitnodigingen

| Element | Aanwezig | Functioneel |
|---------|----------|-------------|
| Stap titel | ✅ | ✅ |
| Beschrijving | ✅ | ✅ |
| "+ Uitnodiging toevoegen" button | ✅ | - |
| Vorige/Volgende knoppen | ✅ | ✅ |
| Success toast | ✅ | ✅ |

**Bevindingen Stap 2:**
- ✅ Checkmark verschijnt op voltooide stap
- ✅ Toast notification "Stap opgeslagen" werkt
- ✅ Navigatie tussen stappen werkt correct

**Screenshots:** `test-08-onboarding-step1.png`, `test-09-onboarding-filled.png`, `test-10-onboarding-step2.png`

---

### 2.8 Responsief Design (Mobile)

**Testcase:** Mobile weergave (375x812 - iPhone X formaat)

| Pagina | Layout | Navigatie | Leesbaarheid |
|--------|--------|-----------|--------------|
| Dashboard | ✅ | ✅ | ✅ |
| Onboarding | ✅ | ✅ | ✅ |

**Mobile Specifieke Elementen:**

| Element | Aanwezig | Functioneel |
|---------|----------|-------------|
| Hamburger menu | ✅ | ✅ |
| Collapsed navigatie | ✅ | ✅ |
| Touch-friendly buttons | ✅ | ✅ |
| Responsive KPI cards | ✅ | ✅ |

**Bevindingen:**
- ✅ Navigatie collapsed naar hamburger menu
- ✅ Menu opent correct met slide-in animatie
- ✅ VVE switcher beschikbaar in mobile menu
- ✅ Alle links toegankelijk
- ✅ Goede touch targets (≥44px)
- ✅ Tekst blijft leesbaar

**Screenshots:** `test-11-mobile-onboarding.png`, `test-12-mobile-dashboard.png`, `test-13-mobile-menu-open.png`

---

## 3. Bugs en Issues

### 3.1 Kritieke Issues

| ID | Pagina | Beschrijving | Impact | Prioriteit |
|----|--------|--------------|--------|------------|
| BUG-001 | Login | `.local` domein niet toegestaan in EmailStr validatie | Dev workflow | Medium |
| BUG-002 | Documenten | 403 Forbidden - Geen toegang ondanks juiste rol | Functionaliteit | Hoog |
| BUG-003 | Contracten | Error message toont `[object Object]` | UX | Medium |

### 3.2 Verbeterpunten

| ID | Pagina | Suggestie | Type |
|----|--------|-----------|------|
| IMP-001 | Dashboard | Role switcher zou dashboard content moeten updaten | UX |
| IMP-002 | Tenant Switcher | Database data gebruiken i.p.v. mock data | Functionaliteit |
| IMP-003 | Onboarding | Voortgang persistent opslaan | Functionaliteit |

---

## 4. Testdata VVE de Markt

De volgende testdata is aangemaakt in de database:

### VVE
- **Naam:** VVE de Markt Dedemsvaart
- **ID:** 90f3032e-e9da-4985-b4f0-4d1e13cf3fbd

### Leden

| Naam | E-mail | Rol |
|------|--------|-----|
| Dev Admin | admin@vvetooling.nl | Beheerder |
| Jan de Vries | jan.devries@demarkt.nl | Penningmeester |
| Maria Jansen | maria.jansen@demarkt.nl | Bestuurslid |
| Peter Bakker | peter.bakker@demarkt.nl | Bewoner |

---

## 5. Screenshots

Alle screenshots zijn opgeslagen in:
`docs/screenshots/tests/functional-test-vve-de-markt/`

| Bestand | Beschrijving |
|---------|--------------|
| test-01-login-page.png | Login pagina (leeg) |
| test-02-login-filled.png | Login pagina (ingevuld) |
| test-03-dashboard-bewoner.png | Dashboard bewoner weergave |
| test-04-tenant-switcher-open.png | Tenant/rol switcher open |
| test-05-contracten-page.png | Contracten overzicht |
| test-06-transactions-page.png | Transacties pagina |
| test-07-instellingen-page.png | Instellingen overzicht |
| test-08-onboarding-step1.png | Onboarding stap 1 (leeg) |
| test-09-onboarding-filled.png | Onboarding stap 1 (ingevuld) |
| test-10-onboarding-step2.png | Onboarding stap 2 |
| test-11-mobile-onboarding.png | Mobile: Onboarding |
| test-12-mobile-dashboard.png | Mobile: Dashboard |
| test-13-mobile-menu-open.png | Mobile: Menu open |

---

## 6. Conclusie

De VVE Tooling applicatie toont een solide basis voor VVE beheer. De UI/UX is over het algemeen goed ontworpen met:

### Sterke Punten
- ✅ Moderne, overzichtelijke interface
- ✅ Goede responsieve ondersteuning
- ✅ Duidelijke navigatiestructuur
- ✅ Effectieve onboarding wizard
- ✅ Rol-gebaseerde toegang concept

### Aandachtspunten
- ⚠️ Backend autorisatie moet gefixt worden (403 errors)
- ⚠️ Error handling verbeterpunten (object serialisatie)
- ⚠️ Mock data moet vervangen worden door echte database data

### Aanbevelingen
1. Fix de 403 Forbidden errors op documenten/transacties pagina's
2. Verbeter error message formatting (geen [object Object])
3. Implementeer persistent onboarding state
4. Koppel tenant switcher aan database data

---

**Einde Testrapport**
