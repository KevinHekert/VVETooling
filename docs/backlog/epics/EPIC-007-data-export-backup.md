# EPIC-007: Data export & backup

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Product Owner
- **Status**: Ready
- **Versie**: 1.0

## Doel / waarde
VVE's kunnen data exporteren en back-uppen om ownership en compliance te waarborgen.

## Scope
- Export van financiële data (CSV/PDF).
- Basis backup/export voor documenten.

## Out-of-scope
- Volledige data portability automatisering.

## Afhankelijkheden
- EPIC-001 t/m EPIC-006 leveren data.
- EPIC-005 (security & audit log).

## Risico’s
- AVG compliance: export bevat privacy-gevoelige data.

## Open vragen
- **DQ-006**: Verwachte piekbelasting (concurrente users) bij maandafsluiting.

## Acceptatie (epic-niveau)
- Penningmeester kan exports genereren.
- Export acties worden gelogd.

## Bronverwijzingen
- [docs/backlog/epics/01-mvp-epics.md](01-mvp-epics.md) (EP-007)
- [docs/architecture/decisions/ADR-005-observability-logging.md](../../architecture/decisions/ADR-005-observability-logging.md)
