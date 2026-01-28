# STORY-023: Audit logging filters en export

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0
- **Prioriteit**: Should (Horizon 2)
- **Geneste nummering**: 5.2.2

## User story
Als **beheerder** wil ik audit logs kunnen filteren en exporteren vanuit hetzelfde UI-raamwerk, zodat ik snel wijzigingen kan controleren en toekomstige kolommen of filters zonder breuk kan toevoegen.

## Acceptatiecriteria
- Audit log pagina toont filters (periode, rol, actie) en gebruikt lists/tables componenten.
- Exportknop (CSV/PDF) gebruikt dezelfde action-bar als andere lijsten; inline feedback bij fouten.
- Kolommen uitbreidbaar (bijv. IP, tenant) zonder layout-breekwerk.
- Read-only rollen hebben view-only; beheerder kan exporteren.

## UX/UI aandachtspunten
- Responsieve tabel; badges voor status.
- Mobile: kernkolommen, swipe voor extra info.
- Geen modals; toasts/inline feedback.

## Afhankelijkheden / blockers
- FEAT-015
- FEAT-013
- EPIC-005
- EPIC-007

## Bronverwijzingen
- [docs/backlog/features/FEAT-015-audit-logging.md](../features/FEAT-015-audit-logging.md)
- [docs/backlog/features/FEAT-013-export-backup.md](../features/FEAT-013-export-backup.md)
- [docs/backlog/epics/EPIC-005-security-compliance.md](../epics/EPIC-005-security-compliance.md)
