# STORY-046: Brieven genereren wizard

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0
- **Prioriteit**: Must (EPIC-011)
- **Geneste nummering**: 11.2.1

## User story
Als **beheerder** wil ik brieven genereren door een sjabloon te selecteren en ontvangers te kiezen, zodat ik gepersonaliseerde correspondentie kan versturen.

## Acceptatiecriteria
- Wizard-flow: selecteer sjabloon → kies ontvangers → preview → genereren.
- Ontvanger selectie: individueel, alle bewoners, of gefilterd.
- Merge fields worden automatisch ingevuld met ontvangergegevens.
- Preview per ontvanger met mogelijkheid om individueel aan te passen.
- Gegenereerde brief wordt opgeslagen met metadata (datum, sjabloon, ontvanger).
- Ontbrekende gegevens worden duidelijk gemarkeerd vóór generatie.

## UX/UI aandachtspunten
- Stap-indicator (ProgressIndicator component).
- Inline filters voor ontvangersselectie.
- Preview naast/onder formulier.
- Toast bij succesvolle generatie.
- Mobile: stappenflow met duidelijke navigatie.

## Afhankelijkheden / blockers
- FEAT-021
- STORY-045 (sjablonenbeheer)
- FEAT-015 (audit logging)

## Bronverwijzingen
- [docs/backlog/features/FEAT-021-brieven-genereren.md](../features/FEAT-021-brieven-genereren.md)
- [docs/backlog/stories/STORY-045-sjablonenbeheer-pagina.md](STORY-045-sjablonenbeheer-pagina.md)
- [docs/ux/design/03-beheerder-flows.md](../../ux/design/03-beheerder-flows.md)
