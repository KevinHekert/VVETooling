# Implementatierapport STORY-058: Opzegtermijn alert configureren

## Documentinformatie
- **Story ID**: STORY-058
- **Datum implementatie**: 2026-01-27
- **Implementatie door**: AI Development Agent
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0

## User Story (Origineel)
Als **beheerder** wil ik kunnen instellen hoeveel dagen voor de opzegtermijn ik een alert ontvang, zodat ik tijdig actie kan ondernemen.

## Acceptatiecriteria Status

| # | Criterium | Status | Implementatie Details |
|---|-----------|--------|----------------------|
| 1 | Alert-termijn configureerbaar per contract (30, 60, 90 dagen) | ✅ | Dropdown in contract form met 30/60/90 dagen opties |
| 2 | Standaardinstelling op VVE-niveau instelbaar | ⚠️ | Default 30 dagen per contract, VVE-level config nog niet |
| 3 | Alert wordt gegenereerd op ingestelde datum | ✅ | /alerts endpoint berekent alert deadlines |
| 4 | Alert is zichtbaar in dashboard en per email | ⚠️ | Dashboard widget in STORY-059, email nog niet |

## Technische Implementatie

### Backend
- **Model wijziging**: `alert_days_before` field toegevoegd aan Contract
- **Endpoint(s)**: 
  - `GET /api/v1/vves/{vve_id}/contracts/alerts` - Ophalen van contracten met upcoming alerts
- **Schema(s)**: `ContractAlertResponse` met berekende velden:
  - `notice_deadline` - datum waarop opzeggen moet
  - `alert_date` - datum waarop alert getriggered wordt
  - `days_until_alert` - dagen tot alert
  - `is_alert_due` - of alert nu actief is
- **Autorisatie**: Beheerder only

### Frontend
- **Pagina(s)**: `frontend/src/app/dashboard/beheerder/contracten/page.tsx`
- **Component(en)**: Alert dropdown selector in contract form
- **API Client**: `getContractAlerts()` - ophalen van alerts
- **Types**: `ContractAlertResponse`

## UX/UI Compliance

| Vereiste | Status | Toelichting |
|----------|--------|-------------|
| Dropdown voor alert-termijn selectie | ✅ | 30/60/90 dagen opties |
| Preview van alert-datum | ⚠️ | Berekening in backend, preview in STORY-059 widget |
| Bevestiging bij opslaan | ✅ | Via contract success toast |

## Bekende Beperkingen
1. VVE-level standaard alert instelling nog niet geïmplementeerd
2. Email notificaties nog niet geïmplementeerd (vereist email scheduler)
3. Alert preview in form toont geen berekende datum

## Openstaande Items
1. VVE-level alert defaults (beheerder instellingen)
2. Email scheduler voor alert notificaties
3. STORY-059: Dashboard widget aflopen contracten

## Gerelateerde Commits
- `feat(STORY-058): Add contract alert configuration with alert_days_before field`
- `feat(STORY-058): Add alert configuration dropdown to contracts form`

## Bronverwijzingen
- [STORY-058 Definitie](../stories/STORY-058-opzegtermijn-alert-configureren.md)
- [FEAT-027 Contract Alerts & Herinneringen](../features/FEAT-027-contract-alerts-herinneringen.md)
