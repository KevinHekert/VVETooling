# STORY-009: Rol-specifiek dashboard raamwerk

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.1
- **Prioriteit**: Must (Horizon 1)
- **Geneste nummering**: 9.1.1

## User story
Als **product owner** wil ik een uitbreidbaar dashboard-raamwerk per rol, zodat beheerder, bestuur en bewoners elk hun eigen menu en widget-indeling krijgen en we nieuwe modules kunnen toevoegen zonder de navigatiestructuur te breken.

## Acceptatiecriteria
- Navigatie bevat een rol-switcher en laadt het juiste dashboard zonder pagina-refresh.
- Dashboard-raamwerk ondersteunt widgets/kaarten en tabellen die per rol geconfigureerd zijn (beheerder: financieel, bestuur: read-only KPI, bewoner: compacte status).
- Menu- en layoutstructuur is modulair zodat nieuwe secties kunnen worden toegevoegd zonder herstructurering.
- Snelle laadtijd <2s bij rolwissel door caching/async data-lading.
- Inline meldingen (toasts/inline) per widget; geen blocking modals.

## UX/UI aandachtspunten
- Consistente grid/kaart layout; mobile-first voor bewoners.
- Prominente primaire actie alleen voor rollen met bewerkrechten; read-only rollen tonen enkel view-acties.
- Breadcrumbs of section labels per rol zodat gebruikers weten waar ze zijn.

## Afhankelijkheden / blockers
- FEAT-009
- FEAT-010
- EPIC-009
- UX constraints uit `01-randvoorwaarden-ux-development.md`

## Bronverwijzingen
- [docs/backlog/features/FEAT-009-rol-specifieke-dashboards.md](../features/FEAT-009-rol-specifieke-dashboards.md)
- [docs/backlog/features/FEAT-010-auth-rbac.md](../features/FEAT-010-auth-rbac.md)
- [docs/ux/design/02-bewoner-flows.md](../../ux/design/02-bewoner-flows.md)
- [docs/ux/design/03-beheerder-flows.md](../../ux/design/03-beheerder-flows.md)
- [docs/ux/design/04-bestuur-flows.md](../../ux/design/04-bestuur-flows.md)
- [docs/architecture/constraints/01-randvoorwaarden-ux-development.md](../../architecture/constraints/01-randvoorwaarden-ux-development.md)
