# STORY-021: Auth & RBAC UI beheer

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Product Owner
- **Status**: Ready
- **Versie**: 1.0
- **Prioriteit**: Must (Horizon 1)

## User story
Als **beheerder** wil ik rollen en permissies kunnen beheren in een centraal UI-scherm, zodat dashboards en menu’s per rol consistent blijven en toekomstige permissies kunnen worden toegevoegd zonder refactor van het raamwerk.

## Acceptatiecriteria
- Instellingenmenu bevat een **Rollen & rechten**-pagina binnen het bestaande navigatieraamwerk.
- UI toont rolprofielen, gekoppelde permissies en toegewezen gebruikers; inline wijzigingen met toasts.
- Role-based dashboards (FEAT-009) worden live bijgewerkt na wijziging zonder pagina-refresh.
- Audit hooks voorbereid voor wijzigingen (richting FEAT-015).

## UX/UI aandachtspunten
- Gebruik lists/tables en badges voor permissies; side-panel voor detail.
- Mobile: compacte lijst; desktop uitgebreide matrix.
- Geen modals; inline/side-panel edits.

## Afhankelijkheden / blockers
- FEAT-010
- FEAT-009
- EPIC-009
- ADR-001/ADR-003 constraints

## Bronverwijzingen
- [docs/backlog/features/FEAT-010-auth-rbac.md](../features/FEAT-010-auth-rbac.md)
- [docs/backlog/features/FEAT-009-rol-specifieke-dashboards.md](../features/FEAT-009-rol-specifieke-dashboards.md)
- [docs/architecture/decisions/ADR-001-authentication-authorization.md](../../architecture/decisions/ADR-001-authentication-authorization.md)
- [docs/architecture/decisions/ADR-003-multi-tenancy-implementation.md](../../architecture/decisions/ADR-003-multi-tenancy-implementation.md)
