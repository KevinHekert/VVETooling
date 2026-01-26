# STORY-007: Onboarding wizard voor meerdere rollen

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Product Owner
- **Status**: Ready
- **Versie**: 1.0
- **Prioriteit**: Must (Horizon 1)

## User story
Als **beheerder** wil ik een onboarding wizard doorlopen die per stap menu-items en dashboards klaarzet voor beheerder, bestuur en bewoners, zodat rollen direct met een passend raamwerk starten.

## Acceptatiecriteria
- Wizard is toegankelijk vanuit het hoofdmenu onder **Instellingen > Onboarding**.
- Stappen bevatten: basisgegevens VvE, rollen & uitnodigingen, splitsingssleutel, financieel startpakket (reserves/begroting), documenten.
- Elke stap valideert inline en bewaart de voortgang; gebruikers kunnen hervatten.
- Resultaat activeert rol-specifieke dashboards en menu-structuren conform FEAT-009 (beheerder uitgebreid, bestuur read-only, bewoner compact).
- Toekomstige stappen (bijv. modules) kunnen worden toegevoegd zonder UI-breekwerk dankzij het wizard-raamwerk.

## UX/UI aandachtspunten
- Gebruik progress-indicator met duidelijke states (actief, voltooid).
- Mobiel: wizard-stappen stapelen, primaire actie altijd onderaan zichtbaar.
- Feedback via toasts/inline, geen blocking modals.

## Afhankelijkheden / blockers
- FEAT-007
- FEAT-008
- FEAT-009
- EPIC-004

## Bronverwijzingen
- [docs/backlog/features/FEAT-007-onboarding-wizard.md](../features/FEAT-007-onboarding-wizard.md)
- [docs/backlog/features/FEAT-008-uitnodigen-gebruikers.md](../features/FEAT-008-uitnodigen-gebruikers.md)
- [docs/backlog/features/FEAT-009-rol-specifieke-dashboards.md](../features/FEAT-009-rol-specifieke-dashboards.md)
- [docs/ux/design/03-beheerder-flows.md](../../ux/design/03-beheerder-flows.md)
- [docs/ux/design/04-bestuur-flows.md](../../ux/design/04-bestuur-flows.md)
- [docs/ux/design/02-bewoner-flows.md](../../ux/design/02-bewoner-flows.md)
