# FEAT-003: Splitsingssleutel configuratie

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Product Owner
- **Status**: Ready
- **Versie**: 1.0

## Functioneel doel
Penningmeester kan de splitsingssleutel per eigenaar vastleggen en valideren.

## UX-impact
- Wizard/stap in onboarding (beheerder).
- Inline validatie bij percentage totalen.

## Constraints
- Correctheid en transparantie in berekeningen.
- UX: inline errors, geen errorbox.

## Acceptatiecriteria
- Som van percentages = 100% (met inline foutmelding).
- Overzicht per eigenaar met aandeel.

## Afhankelijkheden
- EPIC-002
- EPIC-004 (onboarding wizard)

## Bronverwijzingen
- [docs/backlog/epics/EPIC-002-splitsingen-beheren.md](../epics/EPIC-002-splitsingen-beheren.md)
- [docs/ux/design/03-beheerder-flows.md](../../ux/design/03-beheerder-flows.md)
