# STORY-031: Bestuur ticket inzicht en behandeling

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: Draft
- **Versie**: 0.1
- **Prioriteit**: Must (Horizon 2)

## User story
Als **bestuurslid** wil ik tickets kunnen inzien, filteren en behandelen, zodat klachten van bewoners snel en gestructureerd worden opgevolgd.

## Acceptatiecriteria
- Bestuur heeft een ticket-overzicht met filters (status, prioriteit, leverancier).
- Ticketdetail toont tijdlijn, bewijsstukken en bewonersreacties.
- Bestuur kan status aanpassen en een opvolgactie toevoegen.
- Bewoners worden geïnformeerd via notificatie bij statuswijziging.

## UX/UI aandachtspunten
- Gebruik tabel/list component voor overzicht; detail in panel.
- Inline status updates met toasts; geen modals.
- Beschikbare acties afhankelijk van rol (bestuur vs beheerder).

## Afhankelijkheden / blockers
- FEAT-016
- FEAT-017
- FEAT-015
- EPIC-009

## Bronverwijzingen
- [docs/backlog/features/FEAT-016-bewoner-tickets-en-klachten.md](../features/FEAT-016-bewoner-tickets-en-klachten.md)
- [docs/backlog/features/FEAT-017-leveranciers-en-onderhoud.md](../features/FEAT-017-leveranciers-en-onderhoud.md)
- [docs/ui/components/lists-tables.md](../../ui/components/lists-tables.md)
- [docs/ux/design/04-bestuur-flows.md](../../ux/design/04-bestuur-flows.md)
