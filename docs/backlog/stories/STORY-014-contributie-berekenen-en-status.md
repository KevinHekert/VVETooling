# STORY-014: Contributie berekenen en status delen

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Product Owner
- **Status**: Ready
- **Versie**: 1.0
- **Prioriteit**: Must (Horizon 1)

## User story
Als **beheerder** wil ik contributies automatisch laten berekenen op basis van de splitsingssleutel en de status per eigenaar delen, zodat alle rollen dezelfde menu- en dashboardstructuur gebruiken en toekomstige aanpassingen eenvoudig zijn.

## Acceptatiecriteria
- Financieel menu heeft een **Contributies**-sectie die het bestaande dashboardraamwerk gebruikt.
- Automatische berekening op basis van splitsingssleutel, met inline validatie bij afwijkingen.
- Bewoners zien uitsluitend hun eigen status in een compacte view; bestuur read-only KPI’s.
- Rekentijd <2s voor MVP-volume; inline feedback/toasts bij fouten.

## UX/UI aandachtspunten
- Consistente tabellen/kaarten; badges voor status (betaald/openstaand).
- Mobile-first voor bewoners; desktop toont uitgebreide filters.
- Geen blocking modals; acties inline of in-page.

## Afhankelijkheden / blockers
- FEAT-004
- FEAT-009
- FEAT-010
- EPIC-002

## Bronverwijzingen
- [docs/backlog/features/FEAT-004-contributieberekening.md](../features/FEAT-004-contributieberekening.md)
- [docs/ux/design/02-bewoner-flows.md](../../ux/design/02-bewoner-flows.md)
- [docs/architecture/constraints/01-randvoorwaarden-ux-development.md](../../architecture/constraints/01-randvoorwaarden-ux-development.md)
