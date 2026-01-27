# STORY-030: Ticket bewijsstukken (bonnen en facturen)

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0
- **Prioriteit**: Must (Horizon 2)
- **Geneste nummering**: 10.1.2
- **Implementatierapport**: [STORY-030-implementatie.md](../implementation-reports/STORY-030-implementatie.md)

## User story
Als **bewoner** wil ik bonnetjes of facturen aan een ticket toevoegen (mits tijdig aangevraagd), zodat het bestuur bewijsstukken kan verwerken binnen hetzelfde dossier.

## Acceptatiecriteria
- Bewoner kan bewijsstukken uploaden tijdens of na het indienen van een ticket.
- Het systeem markeert bewijsstukken als "tijdig aangevraagd" of "te laat" op basis van aanvraagdatum.
- Bewijsstukken zijn zichtbaar in de ticket-tijdlijn met statusbadge.
- Bestuur kan bewijsstukken accepteren of afwijzen met reden.

## UX/UI aandachtspunten
- Upload component toont bestandstype/limiet en status.
- Tijdlijn gebruikt badges voor "tijdig" en "te laat".
- Geen modals; inline feedback/toasts.

## Afhankelijkheden / blockers
- FEAT-016
- FEAT-011
- FEAT-015

## Bronverwijzingen
- [docs/backlog/features/FEAT-016-bewoner-tickets-en-klachten.md](../features/FEAT-016-bewoner-tickets-en-klachten.md)
- [docs/backlog/features/FEAT-011-documentbeheer.md](../features/FEAT-011-documentbeheer.md)
- [docs/ui/components/feedback-notifications.md](../../ui/components/feedback-notifications.md)
