# FEAT-016: Bewoner tickets & klachten

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: Draft
- **Versie**: 0.1

## Functioneel doel
Bewoners kunnen klachten/tickets indienen en status volgen, terwijl bestuur de behandeling en communicatie bewaakt.

## UX-impact
- Wizard flow voor bewoners met duidelijke stappen en voortgang.
- Tijdlijn per ticket met status, reacties en gekoppelde bewijsstukken.
- Bestuur ziet ticket-overzicht met filters (status, prioriteit, leverancier).

## Constraints
- Geen modals; inline feedback/toasts.
- Privacy: bewoners zien alleen eigen tickets.
- Bewijsstukken maximaal 10 MB per bestand (D-004).

## Acceptatiecriteria
- Bewoner kan een nieuw ticket starten en afronden via wizard.
- Elke ticket heeft een tijdlijn met statuswijzigingen en opmerkingen.
- Bestuur kan tickets behandelen en status aanpassen.
- Bewijsstukken (bonnetjes/facturen) zijn gekoppeld aan het ticket.

## Afhankelijkheden
- EPIC-010
- EPIC-009
- FEAT-011
- FEAT-015

## Bronverwijzingen
- [docs/backlog/epics/EPIC-010-serviceverzoeken-en-leveranciers.md](../epics/EPIC-010-serviceverzoeken-en-leveranciers.md)
- [docs/ui/components/lists-tables.md](../../ui/components/lists-tables.md)
- [docs/ui/components/feedback-notifications.md](../../ui/components/feedback-notifications.md)
- [docs/ux/design/02-bewoner-flows.md](../../ux/design/02-bewoner-flows.md)
