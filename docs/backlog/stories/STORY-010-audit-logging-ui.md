# STORY-010: Audit logging zichtbaar in UI

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.1
- **Prioriteit**: Should (Horizon 2)
- **Geneste nummering**: 5.2.1

## User story
Als **beheerder** wil ik audit logs kunnen bekijken en filteren vanuit het beheer-menu, zodat ik wijzigingen en downloadacties kan controleren en toekomstige uitbreidingen (filters, export) eenvoudig kan toevoegen.

## Acceptatiecriteria
- Beheer-menu bevat een **Audit logs**-sectie binnen het bestaande navigatieraamwerk.
- Logs tonen minimaal: gebruiker, rol, actie (incl. document-download), timestamp, resultaat.
- Filters op periode, rol en actie zijn inline; export-knop volgt hetzelfde lijst/paneel-patroon.
- Geen modals; gebruik pagina met filters bovenaan en feedback-toasts bij fouten.
- Voorbereid op extra kolommen (bijv. IP, tenant) zonder layout-breekwerk.

## UX/UI aandachtspunten
- Gebruik lijst/tafelcomponent met responsieve kolommen; mobiele view toont kernvelden (actie, datum).
- Leesbare badges voor succes/fout.
- Toekomstige export-knop past in dezelfde action-bar.

## Afhankelijkheden / blockers
- FEAT-015
- FEAT-013 (export)
- EPIC-005
- EPIC-007

## Bronverwijzingen
- [docs/backlog/features/FEAT-015-audit-logging.md](../features/FEAT-015-audit-logging.md)
- [docs/backlog/features/FEAT-013-export-backup.md](../features/FEAT-013-export-backup.md)
- [docs/backlog/epics/EPIC-005-security-compliance.md](../epics/EPIC-005-security-compliance.md)
- [docs/backlog/epics/EPIC-007-data-export-backup.md](../epics/EPIC-007-data-export-backup.md)
- [docs/ui/components/lists-tables.md](../../ui/components/lists-tables.md)
