# STORY-059: Dashboard widget aflopen contracten

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0
- **Prioriteit**: Should (Horizon 2)
- **Geneste nummering**: 13.2.2

## User story
Als **beheerder** wil ik in het dashboard een widget zien met contracten die binnenkort aflopen, zodat ik direct overzicht heb van te ondernemen acties.

## Acceptatiecriteria
- Widget toont contracten die binnen 90 dagen aflopen
- Sortering op einddatum (eerst aflopend)
- Klik op contract navigeert naar detail
- Aantal items configureerbaar (5, 10, 15)

## UX/UI aandachtspunten
- Kleurcodering op urgentie (rood < 30 dagen, oranje < 60, geel < 90)
- Compacte weergave met key info
- Lege state indien geen aflopen contracten

## Afhankelijkheden / blockers
- FEAT-027
- FEAT-057

## Bronverwijzingen
- [docs/backlog/features/FEAT-027-contract-alerts-herinneringen.md](../features/FEAT-027-contract-alerts-herinneringen.md)
