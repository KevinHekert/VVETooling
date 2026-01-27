# STORY-020: Pricing- en abonnementenbeheer UI

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ⬜ Backlog
- **Versie**: 1.0
- **Prioriteit**: Should (Horizon 2)
- **Geneste nummering**: 8.1.1

## User story
Als **beheerder** wil ik abonnementen en facturatie-instellingen beheren in een dedicated menu, zodat pricingwijzigingen en toekomstige modules (kortingen/add-ons) passen in hetzelfde UI-raamwerk.

## Acceptatiecriteria
- Menu-item **Abonnementen** onder Instellingen/Beheer toont plannen, prijzen en facturatiegegevens.
- Inline mutaties (plan wisselen, betaalmethode updaten) zonder modals; feedback via toasts.
- Export van facturen via bestaande export/back-up raamwerk (FEAT-013).
- Read-only view voor bestuur; bewoners zien geen pricing-sectie.

## UX/UI aandachtspunten
- Gebruik lijst/kaart componenten en badges voor status.
- Mobile: samenvattingskaarten, actieknoppen onderaan; desktop uitgebreide tabellen.
- Voorbereid op extra kolommen (korting, add-ons) zonder layout-breekwerk.

## Afhankelijkheden / blockers
- FEAT-014
- FEAT-013 (export)
- EPIC-008

## Bronverwijzingen
- [docs/backlog/features/FEAT-014-pricing-billing.md](../features/FEAT-014-pricing-billing.md)
- [docs/backlog/features/FEAT-013-export-backup.md](../features/FEAT-013-export-backup.md)
- [docs/product/strategy/01-productstrategie-keuzes.md](../../product/strategy/01-productstrategie-keuzes.md)
