# STORY-029: Bewoner ticket wizard en tijdlijn

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0
- **Prioriteit**: Must (Horizon 2)
- **Geneste nummering**: 10.1.1
- **Implementatierapport**: [STORY-029-implementatie.md](../implementation-reports/STORY-029-implementatie.md)

## User story
Als **bewoner** wil ik een ticket-wizard kunnen doorlopen om een klacht in te dienen, zodat ik stap voor stap de juiste informatie toevoeg en de voortgang kan volgen.

## Acceptatiecriteria
- Wizard bevat stappen: klachtcategorie, locatie/omschrijving, bewijsstukken, samenvatting.
- Bewoner kan wizard pauzeren en later hervatten.
- Na indienen wordt een ticket-tijdlijn getoond met statusupdates.
- Bewoner ziet alleen eigen tickets en kan opmerkingen toevoegen.

## UX/UI aandachtspunten
- Gebruik progress-indicator en inline validatie (geen modals).
- Tijdlijn toont status, datum, actor en bijlagen.
- Mobile-first stappenweergave met primary actie onderaan.

## Afhankelijkheden / blockers
- FEAT-016
- FEAT-011
- FEAT-015
- EPIC-009

## Bronverwijzingen
- [docs/backlog/features/FEAT-016-bewoner-tickets-en-klachten.md](../features/FEAT-016-bewoner-tickets-en-klachten.md)
- [docs/ui/components/form-controls.md](../../ui/components/form-controls.md)
- [docs/ui/components/feedback-notifications.md](../../ui/components/feedback-notifications.md)
- [docs/ux/design/02-bewoner-flows.md](../../ux/design/02-bewoner-flows.md)
