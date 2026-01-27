# STORY-044: Ticket supplier collaboration status

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0
- **Prioriteit**: Must (Horizon 2)
- **Geneste nummering**: 10.2.4
- **Implementatierapport**: [STORY-044-implementatie.md](../implementation-reports/STORY-044-implementatie.md)

## User story
Als **bestuurslid** wil ik zien welke status een leverancier heeft in de opvolging van een ticket, zodat bewoners weten waar hun verzoek staat.

## Acceptatiecriteria
- Ticketdetail toont een leveranciersstatus (ingepland/bezig/afgerond).
- Bestuur kan status bijwerken met datum en korte toelichting.
- Bewoners zien de actuele leveranciersstatus in hun ticket-tijdlijn.

## UX/UI aandachtspunten
- Statusbadge in tijdlijn en overzicht.
- Inline status update met toasts; geen modals.
- Gebruik bestaande statuskleuren uit ticketoverzicht.

## Afhankelijkheden / blockers
- FEAT-017
- FEAT-016
- FEAT-015

## Bronverwijzingen
- [docs/backlog/features/FEAT-017-leveranciers-en-onderhoud.md](../features/FEAT-017-leveranciers-en-onderhoud.md)
- [docs/backlog/features/FEAT-016-bewoner-tickets-en-klachten.md](../features/FEAT-016-bewoner-tickets-en-klachten.md)
- [docs/ui/components/feedback-notifications.md](../../ui/components/feedback-notifications.md)
