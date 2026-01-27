# STORY-017: Onboarding uitnodigingen en herinneringen

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.1
- **Prioriteit**: Must (Horizon 1)
- **Geneste nummering**: 4.1.2

## User story
Als **beheerder** wil ik tijdens onboarding gebruikers kunnen uitnodigen en herinneren vanuit hetzelfde wizardraamwerk, zodat rollen direct toegang hebben tot hun dashboards zonder losse flows.

## Acceptatiecriteria
- Onboarding wizard bevat een **Uitnodigen**-stap die rollen koppelt en invites verstuurt.
- Herinneringen kunnen inline worden verstuurd; status zichtbaar in dezelfde stap.
- Bewoners krijgen mobile-first bevestiging; bestuur read-only status; beheerder volledige controle.
- Geen modals; feedback via toasts/inline states.

## UX/UI aandachtspunten
- Progress indicator toont invite-stap als voltooid/open.
- Inline lijst met uitgenodigde gebruikers en statussen; responsief ontwerp.
- Acties in action-bar; geen overvolle forms.

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
