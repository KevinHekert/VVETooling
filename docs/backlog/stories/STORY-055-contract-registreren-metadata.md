# STORY-055: Contract registreren met metadata

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0
- **Prioriteit**: Should (Horizon 2)
- **Geneste nummering**: 13.1.1

## User story
Als **beheerder** wil ik een nieuw contract kunnen registreren met leveranciergegevens, looptijd, opzegtermijn en kosten, zodat ik alle contractinformatie centraal beschikbaar heb.

## Acceptatiecriteria
- Formulier bevat velden: leverancier, type, ingangsdatum, einddatum, opzegtermijn, kosten
- Contracttype kan worden geselecteerd uit voorgedefinieerde categorieën
- Contract wordt opgeslagen en is zichtbaar in contractoverzicht
- Validatie op verplichte velden voorkomt incomplete registraties

## UX/UI aandachtspunten
- Inline validatie, geen modals
- Success toast bij opslaan
- Categorieën: energie, verzekering, onderhoud, overig

## Afhankelijkheden / blockers
- FEAT-026
- EPIC-013

## Bronverwijzingen
- [docs/backlog/features/FEAT-026-contractregistratie-opslag.md](../features/FEAT-026-contractregistratie-opslag.md)
