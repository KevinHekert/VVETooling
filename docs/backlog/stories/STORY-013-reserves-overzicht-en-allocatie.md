# STORY-013: Reserves overzicht en allocatie

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Product Owner
- **Status**: Ready
- **Versie**: 1.0
- **Prioriteit**: Must (Horizon 1)

## User story
Als **beheerder** wil ik een overzicht van alle reserves met allocaties en saldi, zodat ik transparant kan rapporteren en toekomstige uitbreidingen (scenario’s) kan opnemen zonder het raamwerk te wijzigen.

## Acceptatiecriteria
- Financieel menu bevat een **Reserves**-sectie binnen hetzelfde dashboardraamwerk.
- Overzicht toont saldo per reserve, toegewezen transacties en openstaande bedragen.
- Inline acties voor allocatie/wijziging, met inline validatie en toasts.
- Mobile-first samenvatting; desktop toont uitgebreide tabel/kaartlayout.

## UX/UI aandachtspunten
- Hergebruik lists/tables componenten; badges voor status.
- Geen modals; side-panel of inline edit.
- Voorbereid op extra kolommen (scenario, prognose) zonder breken van layout.

## Afhankelijkheden / blockers
- FEAT-002
- FEAT-001

## Bronverwijzingen
- [docs/backlog/features/FEAT-002-reserves-overzicht.md](../features/FEAT-002-reserves-overzicht.md)
- [docs/backlog/features/FEAT-001-transactiebeheer.md](../features/FEAT-001-transactiebeheer.md)
- [docs/ui/components/lists-tables.md](../../ui/components/lists-tables.md)
