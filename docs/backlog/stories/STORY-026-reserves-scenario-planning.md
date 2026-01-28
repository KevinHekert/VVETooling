# STORY-026: Reserves scenario-planning en prognose

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0
- **Prioriteit**: Should (Horizon 2)
- **Geneste nummering**: 1.2.2

## User story
Als **beheerder** wil ik scenario's (basis, optimistisch, conservatief) kunnen toevoegen aan het reserves-overzicht, zodat toekomstige uitgaven zichtbaar zijn zonder het raamwerk te wijzigen.

## Acceptatiecriteria
- Reserves-pagina ondersteunt meerdere scenario's met eigen bedragen en toelichting.
- Switching tussen scenario's gebeurt inline (geen modals) en toont impact op saldo.
- Export gebruikt hetzelfde lists/tables-raamwerk en voegt scenario-label toe.
- Read-only rollen zien alleen gepubliceerde scenario's.

## UX/UI aandachtspunten
- Gebruik tab/segment control voor scenario-wissel; badges voor actieve/publieke scenario's.
- Mobile: enkel actieve scenario; mogelijkheid tot wisselen via dropdown.
- Inline feedback/toasts bij berekeningen.

## Afhankelijkheden / blockers
- FEAT-002
- FEAT-001

## Bronverwijzingen
- [docs/backlog/features/FEAT-002-reserves-overzicht.md](../features/FEAT-002-reserves-overzicht.md)
- [docs/ui/components/lists-tables.md](../../ui/components/lists-tables.md)
