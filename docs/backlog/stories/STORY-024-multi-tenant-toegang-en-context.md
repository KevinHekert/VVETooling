# STORY-024: Multi-tenant toegang en context switcher

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Product Owner
- **Status**: Ready
- **Versie**: 1.0
- **Prioriteit**: Must (Horizon 1)

## User story
Als **beheerder** wil ik tussen VvE’s kunnen switchen via een context-switcher in het menu, zodat data en dashboards per tenant gescheiden blijven en nieuwe tenants zonder herbouw kunnen worden toegevoegd.

## Acceptatiecriteria
- Navigatie bevat een context-switcher voor tenant-selectie; laadt rol-specifieke dashboards zonder refresh.
- Toegang is strikt tenant-gebonden; geen data-lek tussen tenants.
- Inline melding bij tenant-scope wissel; caching voor snelle laadtijd <2s.
- Voorbereid op toekomstige modules per tenant zonder herstructurering.

## UX/UI aandachtspunten
- Duidelijke indicator van actieve tenant in header/menu.
- Mobile: switcher als sheet/dropdown bovenaan; desktop in header.
- Geen modals; gebruik inline/slide-over interacties.

## Afhankelijkheden / blockers
- FEAT-009
- FEAT-010
- EPIC-009
- ADR-003 (multi-tenancy)

## Bronverwijzingen
- [docs/backlog/features/FEAT-009-rol-specifieke-dashboards.md](../features/FEAT-009-rol-specifieke-dashboards.md)
- [docs/backlog/features/FEAT-010-auth-rbac.md](../features/FEAT-010-auth-rbac.md)
- [docs/architecture/decisions/ADR-003-multi-tenancy-implementation.md](../../architecture/decisions/ADR-003-multi-tenancy-implementation.md)
