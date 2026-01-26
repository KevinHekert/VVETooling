# STORY-016: Splitsingssleutel configureren met UI-wizard

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Product Owner
- **Status**: Ready
- **Versie**: 1.0
- **Prioriteit**: Must (Horizon 1)

## User story
Als **beheerder** wil ik een wizard om de splitsingssleutel te configureren en te valideren binnen het instellingenmenu, zodat toekomstige aanpassingen en extra velden zonder breuk in dezelfde UI kunnen worden toegevoegd.

## Acceptatiecriteria
- Instellingenmenu bevat een **Splitsingssleutel**-wizard entry.
- Wizard valideert gewichten op 100% en detecteert inconsistenties inline (geen modals).
- Bewaart versies en laat herpubliceren vanuit dezelfde pagina.
- Integreert met contributieberekening en toont impact-samenvatting binnen hetzelfde raamwerk.

## UX/UI aandachtspunten
- Stapsgewijze wizard met progress-indicator; inline errors en toasts.
- Mobile: per stap één sectie zichtbaar; desktop toont samenvatting.
- Hergebruik form-controls en feedback components.

## Afhankelijkheden / blockers
- FEAT-003
- FEAT-004
- EPIC-002

## Bronverwijzingen
- [docs/backlog/features/FEAT-003-splitsingssleutel.md](../features/FEAT-003-splitsingssleutel.md)
- [docs/ux/design/03-beheerder-flows.md](../../ux/design/03-beheerder-flows.md)
- [docs/ui/components/form-controls.md](../../ui/components/form-controls.md)
- [docs/ui/components/feedback-notifications.md](../../ui/components/feedback-notifications.md)
