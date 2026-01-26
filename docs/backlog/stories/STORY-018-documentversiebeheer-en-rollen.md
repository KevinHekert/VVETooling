# STORY-018: Document versiebeheer en rol-specifiek delen

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Product Owner
- **Status**: Ready
- **Versie**: 1.0
- **Prioriteit**: Must (Horizon 1)

## User story
Als **bestuurslid** wil ik documenten met versiebeheer kunnen delen per rol vanuit hetzelfde documenten-menu, zodat toekomstige uitbreidingen (watermerken, vervaldatums) passen in het bestaande raamwerk.

## Acceptatiecriteria
- Documenten-menu heeft secties voor bestuur/bewoners/archief met rolgebaseerde zichtbaarheid.
- Versies kunnen worden geüpload en teruggezet; downloadknop inline beschikbaar.
- Audit-log hooks aanwezig voor download/restore (voorbereiding op FEAT-015).
- Geen modals; gebruik paneel/inline feedback binnen documentraamwerk.

## UX/UI aandachtspunten
- Gebruik lijst/kaart componenten; duidelijk label voor versie en datum.
- Mobiel: compacte view met laatste versie en download.
- Action-bar met download/restore; feedback via toasts.

## Afhankelijkheden / blockers
- FEAT-011
- FEAT-012
- FEAT-015
- EPIC-006

## Bronverwijzingen
- [docs/backlog/features/FEAT-011-documentbeheer.md](../features/FEAT-011-documentbeheer.md)
- [docs/backlog/features/FEAT-012-documenten-downloaden.md](../features/FEAT-012-documenten-downloaden.md)
- [docs/backlog/features/FEAT-015-audit-logging.md](../features/FEAT-015-audit-logging.md)
- [docs/backlog/epics/EPIC-006-documenten-delen.md](../epics/EPIC-006-documenten-delen.md)
- [docs/ui/components/feedback-notifications.md](../../ui/components/feedback-notifications.md)
