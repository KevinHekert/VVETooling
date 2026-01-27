# STORY-040: Reservefonds prognose waarschuwingen

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0
- **Prioriteit**: Should (Horizon 2)
- **Geneste nummering**: 1.3.3

## User story
Als **bestuurslid** wil ik waarschuwingen ontvangen wanneer prognoses een negatief saldo tonen, zodat ik tijdig bijstuur op onderhoudsplannen.

## Acceptatiecriteria
- Prognose-grafiek markeert periodes met negatief saldo.
- Dashboard toont waarschuwing met impact en aanbeveling.
- Waarschuwingen zijn exporteerbaar in het prognoserapport.

## UX/UI aandachtspunten
- Gebruik warning kleur en iconen in grafiek.
- Inline alert boven de grafiek; geen modals.
- Consistente notificatie met bestaande toast component.

## Afhankelijkheden / blockers
- FEAT-018
- FEAT-015

## Bronverwijzingen
- [docs/backlog/features/FEAT-018-reservefonds-prognoses.md](../features/FEAT-018-reservefonds-prognoses.md)
- [docs/ui/components/feedback-notifications.md](../../ui/components/feedback-notifications.md)
- [docs/ux/design/04-bestuur-flows.md](../../ux/design/04-bestuur-flows.md)
