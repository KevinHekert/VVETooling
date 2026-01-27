# STORY-037: Ticket communicatie en notities

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0
- **Prioriteit**: Must (Horizon 2)
- **Geneste nummering**: 10.1.4
- **Implementatierapport**: [STORY-037-implementatie.md](../implementation-reports/STORY-037-implementatie.md)

## User story
Als **bewoner** wil ik aanvullende berichten en notities kunnen toevoegen aan mijn ticket, zodat ik context kan geven tijdens de opvolging.

## Acceptatiecriteria
- Bewoner kan een bericht toevoegen aan een bestaand ticket.
- Ticket-tijdlijn toont berichten met auteur, datum en status.
- Bestuur kan berichten markeren als beantwoord.

## UX/UI aandachtspunten
- Gebruik inline composer onder de tijdlijn.
- Toon statusbadge voor "beantwoord".
- Inline feedback/toasts; geen modals.

## Afhankelijkheden / blockers
- FEAT-016
- FEAT-015
- EPIC-009

## Bronverwijzingen
- [docs/backlog/features/FEAT-016-bewoner-tickets-en-klachten.md](../features/FEAT-016-bewoner-tickets-en-klachten.md)
- [docs/ui/components/feedback-notifications.md](../../ui/components/feedback-notifications.md)
- [docs/ux/design/02-bewoner-flows.md](../../ux/design/02-bewoner-flows.md)
