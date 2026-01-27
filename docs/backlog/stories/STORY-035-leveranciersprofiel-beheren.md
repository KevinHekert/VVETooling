# STORY-035: Leveranciersprofiel beheren

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ⬜ Backlog
- **Versie**: 1.0
- **Prioriteit**: Should (Horizon 2)
- **Geneste nummering**: 10.2.2

## User story
Als **bestuurslid** wil ik leveranciersprofielen kunnen aanmaken en beheren, zodat contactgegevens en expertise eenduidig beschikbaar zijn voor opvolging.

## Acceptatiecriteria
- Bestuur kan een leveranciersprofiel aanmaken met naam, contactpersoon, bereikbaarheid en specialisme.
- Leveranciersprofiel kan worden bijgewerkt of gearchiveerd; gearchiveerde leveranciers zijn niet selecteerbaar voor nieuwe tickets.
- Leveranciersoverzicht toont status (actief/inactief) en gekoppelde tickets.

## UX/UI aandachtspunten
- Gebruik list/table component met statusbadge.
- Inline validatie op contactgegevens; geen modals.
- Detailpaneel toont gekoppelde tickets en laatste contactmoment.

## Afhankelijkheden / blockers
- FEAT-017
- FEAT-015

## Bronverwijzingen
- [docs/backlog/features/FEAT-017-leveranciers-en-onderhoud.md](../features/FEAT-017-leveranciers-en-onderhoud.md)
- [docs/ui/components/lists-tables.md](../../ui/components/lists-tables.md)
- [docs/ui/components/form-controls.md](../../ui/components/form-controls.md)
- [docs/marktonderzoek/06-as-contracten.md](../../marktonderzoek/06-as-contracten.md)
