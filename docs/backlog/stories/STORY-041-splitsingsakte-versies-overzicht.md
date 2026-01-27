# STORY-041: Splitsingsakte versies overzicht

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: Draft
- **Versie**: 0.1
- **Prioriteit**: Must (Horizon 2)

## User story
Als **bestuurslid** wil ik een overzicht van alle splitsingsakte-versies zien, zodat ik snel kan controleren welke versie actief of gearchiveerd is.

## Acceptatiecriteria
- Versieoverzicht toont status (actief/archief) en geldigheidsdatum.
- Bestuur kan een versie markeren als actief met audit logging.
- Bewoners zien alleen de actieve versie in read-only weergave.

## UX/UI aandachtspunten
- Gebruik list/table component met statusbadges.
- Inline actieknoppen voor activeren/archiveren.
- Detailpaneel toont metadata en bijlagen.

## Afhankelijkheden / blockers
- FEAT-019
- FEAT-015
- FEAT-011

## Bronverwijzingen
- [docs/backlog/features/FEAT-019-splitsingsakte-versiebeheer.md](../features/FEAT-019-splitsingsakte-versiebeheer.md)
- [docs/backlog/features/FEAT-011-documentbeheer.md](../features/FEAT-011-documentbeheer.md)
- [docs/ui/components/lists-tables.md](../../ui/components/lists-tables.md)
