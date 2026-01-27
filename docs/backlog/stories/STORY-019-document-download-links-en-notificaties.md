# STORY-019: Document download-links en notificaties

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ⬜ Backlog
- **Versie**: 1.0
- **Prioriteit**: Should (Horizon 2)
- **Geneste nummering**: 6.2.2

## User story
Als **bewoner** wil ik veilige download-links ontvangen met notificaties, zodat ik documenten vanuit het bestaande menu kan openen zonder nieuwe flows en toekomstige uitbreidingen (vervaldatum, watermerk) passen in hetzelfde raamwerk.

## Acceptatiecriteria
- Downloadknoppen en gedeelde links zijn inline beschikbaar in het documenten-menu.
- Notificaties (toast/email trigger) volgen hetzelfde feedbackpatroon; geen modals.
- Links zijn rolgebaseerd (bewoner ziet alleen gedeelde items), bestuur kan alle gedeelde links beheren.
- Audit logging voor download/kliks voorbereid.

## UX/UI aandachtspunten
- Gebruik feedback-notifications en lijst/kaart componenten.
- Mobiel: minimale metadata (titel, datum, download); desktop toont extra velden.
- Acties in action-bar; heldere statuslabels.

## Afhankelijkheden / blockers
- FEAT-012
- FEAT-011
- FEAT-015
- EPIC-006

## Bronverwijzingen
- [docs/backlog/features/FEAT-012-documenten-downloaden.md](../features/FEAT-012-documenten-downloaden.md)
- [docs/backlog/features/FEAT-011-documentbeheer.md](../features/FEAT-011-documentbeheer.md)
- [docs/ui/components/feedback-notifications.md](../../ui/components/feedback-notifications.md)
