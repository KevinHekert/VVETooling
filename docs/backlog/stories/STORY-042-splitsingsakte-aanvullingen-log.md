# STORY-042: Splitsingsakte aanvullingen log

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ⬜ Backlog
- **Versie**: 1.0
- **Prioriteit**: Should (Horizon 2)
- **Geneste nummering**: 6.3.3

## User story
Als **bestuurslid** wil ik aanvullingen op een splitsingsakte kunnen registreren, zodat wijzigingen traceerbaar zijn per versie.

## Acceptatiecriteria
- Bestuur kan aanvullingen toevoegen met datum, type en documentlink.
- Aanvullingen worden gekoppeld aan een specifieke versie en zichtbaar in het detailpaneel.
- Bewoners zien een samenvatting van aanvullingen bij de actieve versie.

## UX/UI aandachtspunten
- Gebruik accordion/list voor aanvullingen.
- Inline validatie en toasts bij opslaan.
- Geen modals; detailpaneel in dezelfde pagina.

## Afhankelijkheden / blockers
- FEAT-019
- FEAT-011
- FEAT-015

## Bronverwijzingen
- [docs/backlog/features/FEAT-019-splitsingsakte-versiebeheer.md](../features/FEAT-019-splitsingsakte-versiebeheer.md)
- [docs/backlog/features/FEAT-011-documentbeheer.md](../features/FEAT-011-documentbeheer.md)
- [docs/ui/components/feedback-notifications.md](../../ui/components/feedback-notifications.md)
