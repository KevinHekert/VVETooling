# FEAT-015: Audit logging

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Product Owner
- **Status**: Ready
- **Versie**: 1.0

## Functioneel doel
Audit logging voor kritieke acties met retention policies.

## UX-impact
- Audit log scherm voor beheerder/bestuur.
- Filter op type actie.

## Constraints
- ADR-005 logging.
- Besluit PM-03 (logging granulariteit).

## Acceptatiecriteria
- Kritieke acties gelogd met actor en timestamp.
- Retention policies toegepast (7 jaar / 1 jaar).

## Afhankelijkheden
- EPIC-005

## Bronverwijzingen
- [docs/product/decisions/01-productbesluiten-aannames-randvoorwaarden.md](../../product/decisions/01-productbesluiten-aannames-randvoorwaarden.md)
- [docs/architecture/decisions/ADR-005-observability-logging.md](../../architecture/decisions/ADR-005-observability-logging.md)
