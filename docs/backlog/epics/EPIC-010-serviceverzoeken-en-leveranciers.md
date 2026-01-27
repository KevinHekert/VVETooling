# EPIC-010: Serviceverzoeken & leveranciers

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: Draft
- **Versie**: 0.1

## Doel / waarde
Bestuur en bewoners kunnen onderhoudsproblemen melden en opvolgen met leveranciers, zodat issues traceerbaar zijn en besluitvorming transparant blijft.

## Scope
- Bewoners dienen tickets/klachten in via een wizard.
- Tijdlijn met statusupdates, communicatie en bewijsstukken per ticket.
- Bestuur behandelt tickets en koppelt leveranciers voor opvolging.
- Bonnetjes en facturen zijn gekoppeld aan een specifiek ticket.

## Out-of-scope
- Volledige aanbestedingen of offerte-vergelijkingen.
- Extern leveranciersportaal met eigen login (fase 2).
- Automatische betalingsverwerking van facturen.

## Afhankelijkheden
- EPIC-009 (rollen/toegang).
- EPIC-006 (documenten & opslag).
- EPIC-005 (AVG/compliance).

## Risico’s
- **T-06 Privacy/AVG** bij upload van bonnetjes en facturen.
- **T-07 Rechtebeheer** tussen bewoners, bestuur en leveranciers.

## Open vragen
- **DQ-012**: Welke responstermijnen/SLA’s gelden per type klacht? (Owner: Sales)

## Acceptatie (epic-niveau)
- Bewoners kunnen een ticket indienen en status volgen.
- Bestuur kan tickets behandelen en leveranciers koppelen met audit trail.
- Bewijsstukken zijn gekoppeld aan het juiste ticket.

## Bronverwijzingen
- [docs/ux/design/02-bewoner-flows.md](../../ux/design/02-bewoner-flows.md)
- [docs/ux/design/04-bestuur-flows.md](../../ux/design/04-bestuur-flows.md)
- [docs/ui/components/feedback-notifications.md](../../ui/components/feedback-notifications.md)
- [docs/marktonderzoek/03-gebruikers-bestuur.md](../../marktonderzoek/03-gebruikers-bestuur.md)
