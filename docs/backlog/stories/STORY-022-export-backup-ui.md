# STORY-022: Export en back-up UI

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0
- **Prioriteit**: Should (Horizon 2)
- **Geneste nummering**: 7.1.1

## User story
Als **beheerder** wil ik een export/back-up pagina binnen het instellingenmenu waarmee ik data kan exporteren of herstellen, zodat toekomstige export-formaten en schema’s passen in hetzelfde UI-raamwerk.

## Acceptatiecriteria
- Instellingenmenu bevat een **Export & Back-up**-pagina met acties voor export (CSV/PDF) en back-up trigger.
- Acties volgen het bestaande lijst/paneel-patroon; feedback via toasts (geen modals).
- Downloadlinks verschijnen inline na voltooiing; audit hooks aanwezig.
- Performance: exports starten binnen <2s; statuspolling inline.

## UX/UI aandachtspunten
- Gebruik lists/tables voor beschikbare exports; badges voor status.
- Mobile: compacte lijst; desktop detailkolommen.
- Toekomstige schema’s (geplande export) moeten zonder layout-breuk toegevoegd kunnen worden.

## Afhankelijkheden / blockers
- FEAT-013
- FEAT-015 (logging)
- EPIC-007

## Bronverwijzingen
- [docs/backlog/features/FEAT-013-export-backup.md](../features/FEAT-013-export-backup.md)
- [docs/backlog/features/FEAT-015-audit-logging.md](../features/FEAT-015-audit-logging.md)
- [docs/backlog/epics/EPIC-007-data-export-backup.md](../epics/EPIC-007-data-export-backup.md)
