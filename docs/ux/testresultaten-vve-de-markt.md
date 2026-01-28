# Testresultaten – VVE de Markt (Dedemsvaart)

## 1. Context & scope
Deze test is uitgevoerd als functioneel tester met specialisme in UI/UX. De focus ligt op het inrichten van **VVE de Markt in Dedemsvaart** via de beschikbare onboarding en het nalopen van kernflows (login, dashboards, financiën, documenten, tickets en kennisbank).

## 2. Testaanpak
- **Type test:** Functionele UI/UX end-to-end controle via de draaiende applicatie.
- **Niveau:** UI/UX-validatie van primaire gebruikersflows.
- **Uitgangspunt:** Frontend + backend lokaal gestart.

## 3. Testomgeving
- **Frontend:** `npm run dev` op `http://localhost:3000`
- **Backend:** `uvicorn app.main:app --reload` op `http://localhost:8000`
- **API check:** `GET /docs` retourneert **200 OK**.

## 4. Inrichting VVE de Markt (ingevoerd in onboarding)
De onboarding is gestart via **Instellingen → Onboarding** en gevuld met onderstaande gegevens.

### 4.1 Basisgegevens
- **Naam:** VVE de Markt
- **Adres:** Marktstraat 1-29
- **Postcode/plaats:** 7701 AA, Dedemsvaart
- **KvK:** 87654321 (test)

### 4.2 Rollen & uitnodigingen
- Navigatie naar stap **Rollen & Uitnodigingen** is gelukt.
- Er is geen uitnodiging toegevoegd (stap bevat knop om uit te nodigen).

### 4.3 Splitsingssleutel
- Navigatie naar stap **Splitsingssleutel** is gelukt.
- De stap toont een waarschuwing dat het totaal 0.00% is en 100% moet zijn (geen units toegevoegd).

> **Beperking:** Verdere stappen (Financieel startpakket, Documenten) zijn niet doorlopen doordat de geautomatiseerde browser bij een vervolgactie sporadisch crashte (segfault). Dit is een toolingbeperking tijdens de test.

## 5. Testcases & resultaten

| ID | Flow | Verwachting | Resultaat | Opmerking |
| --- | --- | --- | --- | --- |
| T01 | Login (auth/login) | Succesvol inloggen met foutmelding bij invalid | **Fail** | Na klikken op **Inloggen** verschijnt **“Failed to fetch”** (API-call faalt). |
| T02 | Onboarding stap 1 | Basisgegevens opslaan en naar stap 2 | **Pass** | Stap 1 slaat op en navigeert naar **Rollen & Uitnodigingen**. |
| T03 | Onboarding stap 2 | Navigatie naar stap 3 | **Pass** | Zonder uitnodiging door naar **Splitsingssleutel**. |
| T04 | Onboarding stap 3 | Valideren totaal 100% en door naar stap 4 | **Blocked** | Waarschuwing aanwezig, geen units toegevoegd. Verdere stap niet getest door tooling-crash. |
| T05 | Dashboard (algemeen) | Overzicht laden | **Pass** | Dashboardpagina laadt met voorbeelddata. |
| T06 | Bewonersstatus (dashboard/bewoner) | Statusoverzicht laden | **Fail** | **“Failed to fetch”** melding zichtbaar. |
| T07 | Bewonersreserves | Reservesoverzicht tonen | **Pass** | Reservesoverzicht toont mock data en voortgang. |
| T08 | Documenten | Documentlijst laden | **Fail** | **“Failed to fetch”** melding zichtbaar. |
| T09 | Bewoner Tickets | Ticketoverzicht laden | **Fail** | **“Failed to fetch”** melding zichtbaar + lege state. |
| T10 | Beheerder Tickets | Ticketbeheer laden | **Fail** | **“Failed to fetch”** melding zichtbaar + lege state. |
| T11 | Penningmeester Transacties | Transacties laden | **Fail** | **“Failed to fetch”** melding zichtbaar. |
| T12 | Penningmeester Reserves | Overzicht reserves laden | **Pass** | Reservesoverzicht toont data en tabellen. |
| T13 | Jaarrekening | Jaarrekeningoverzicht tonen | **Pass** | Overzicht toont inkomsten/uitgaven en exportknop. |
| T14 | Kennisbank | Pagina zonder runtime errors | **Fail** | **Unhandled Runtime Error**: `useToast must be used within a ToastProvider`. |
| T15 | Instellingen (root) | Instellingen overzicht tonen | **Fail** | `/instellingen` retourneert **404**. |

## 6. UI/UX bevindingen

### Kritiek / blokkers
1. **Auth & data ophalen faalt** (meerdere pagina’s tonen “Failed to fetch”). Dit blokkeert belangrijke flows: login, documenten, tickets, transacties.
2. **Kennisbank crasht** door ontbrekende `ToastProvider`, wat de pagina onbruikbaar maakt.
3. **Instellingen root geeft 404**, terwijl er wel onboarding aanwezig is; dit leidt tot navigatie-inconsistentie.

### Verbeterpunten
1. **Consistente foutafhandeling**: “Failed to fetch” is te generiek; toon context (API, retry, contactbeheerder).
2. **Onboarding validatie**: Splitsingssleutel toont waarschuwing, maar er is geen duidelijke call-to-action om units toe te voegen.
3. **Rol/tenant context**: In de header staat een tenant (bijv. VVE Amstelplein); dat botst met de ingestelde VVE de Markt en kan verwarrend zijn.

## 7. Conclusie
De omgeving is succesvol opgestart en een deel van de inrichting (onboarding stappen 1–3) is uitgevoerd. Kernfunctionaliteiten zoals **reserves** en **jaarrekening** renderen UI en data correct, maar veel kernflows zijn geblokkeerd door **API fetch-fouten**, een **runtime error** in de kennisbank en een **404 op instellingen**. Voor een volledige end-to-end validatie is het noodzakelijk dat de API-koppeling functioneert en de runtime error wordt opgelost.

---

**Status:** Test uitgevoerd met draaiende frontend en backend. Verdere onboarding-stappen geblokkeerd door tooling-crash tijdens geautomatiseerde browseractie.
