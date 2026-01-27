# Implementatierapport STORY-059: Dashboard widget aflopen contracten

## Documentinformatie
- **Story ID**: STORY-059
- **Datum implementatie**: 2026-01-27
- **Implementatie door**: AI Development Agent
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0

## User Story (Origineel)
Als **beheerder** wil ik in het dashboard een widget zien met contracten die binnenkort aflopen, zodat ik direct overzicht heb van te ondernemen acties.

## Acceptatiecriteria Status

| # | Criterium | Status | Implementatie Details |
|---|-----------|--------|----------------------|
| 1 | Widget toont contracten die binnen 90 dagen aflopen | ✅ | Filter op days_until_notice <= 90 |
| 2 | Sortering op einddatum (eerst aflopend) | ✅ | Sorted by days_until_alert (urgency first) |
| 3 | Klik op contract navigeert naar detail | ✅ | "Bekijk alle" link naar contracten pagina |
| 4 | Aantal items configureerbaar (5, 10, 15) | ✅ | Dropdown selector in widget header |

## Technische Implementatie

### Frontend
- **Pagina(s)**: `frontend/src/app/dashboard/page.tsx`
- **Component(en)**: 
  - `ExpiringContractsWidget` - Nieuwe widget component
  - Geïntegreerd in `BeheerderDashboard`
- **API Client**: Gebruikt `api.getContractAlerts()` van STORY-058
- **State Management**: 
  - `alerts` - Lijst van contract alerts
  - `displayCount` - Aantal weergegeven items (5/10/15)
  - `isLoading` - Loading state

### UX Features
- Kleurcodering op urgentie:
  - Rood: < 30 dagen (kritiek)
  - Oranje: 30-60 dagen (waarschuwing)
  - Geel: 60-90 dagen (aandacht)
- Compacte weergave met leverancier en deadline
- Lege state met groen vinkje indien geen aflopen contracten
- Spinner tijdens laden

## UX/UI Compliance

| Vereiste | Status | Toelichting |
|----------|--------|-------------|
| Kleurcodering op urgentie | ✅ | Rood/oranje/geel gradatie |
| Compacte weergave met key info | ✅ | Leverancier, deadline, dagen remaining |
| Lege state indien geen aflopen contracten | ✅ | Groen vinkje met geruststellende tekst |

## Bekende Beperkingen
1. VVE ID is momenteel hardcoded als demo-vve-id
2. Geen directe link naar individueel contract detail (alleen overzicht)
3. Widget laadt data bij elke page refresh (geen caching)

## Openstaande Items
1. Deep-linking naar contract detail page
2. Caching/optimalisatie van alerts data
3. Real-time updates wanneer contracten wijzigen

## Gerelateerde Commits
- `feat(STORY-059): Add ExpiringContractsWidget to beheerder dashboard`

## Bronverwijzingen
- [STORY-059 Definitie](../stories/STORY-059-dashboard-widget-aflopen-contracten.md)
- [FEAT-027 Contract Alerts & Herinneringen](../features/FEAT-027-contract-alerts-herinneringen.md)
- [STORY-058 Implementatie](STORY-058-implementatie.md) - alerts API
