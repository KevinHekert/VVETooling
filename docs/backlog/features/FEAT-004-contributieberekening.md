# FEAT-004: Contributieberekening

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Product Owner
- **Status**: Ready
- **Versie**: 1.0

## Functioneel doel
Automatische contributieberekening op basis van splitsingssleutel.

## UX-impact
- Overzicht per eigenaar met verschuldigd/betaald/openstaand.
- Read-only view voor bewoners (alleen eigen status).

## Constraints
- Privacy by design (bewoners zien alleen eigen status).
- Performance: berekening binnen <2s.

## Acceptatiecriteria
- Systeem berekent contributies automatisch.
- Bewoner kan alleen eigen status zien.

## Afhankelijkheden
- EPIC-002
- EPIC-009

## Bronverwijzingen
- [docs/backlog/epics/EPIC-002-splitsingen-beheren.md](../epics/EPIC-002-splitsingen-beheren.md)
- [docs/architecture/constraints/01-randvoorwaarden-ux-development.md](../../architecture/constraints/01-randvoorwaarden-ux-development.md)
