# STORY-060: Leverancier registreren met contactgegevens

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0
- **Prioriteit**: Should (Horizon 2)
- **Geneste nummering**: 13.3.1

## User story
Als **beheerder** wil ik een leverancier kunnen registreren met contactgegevens en specialisatie, zodat ik een centrale leveranciersdatabase opbouw.

## Acceptatiecriteria
- Formulier bevat: bedrijfsnaam, contactpersoon, telefoon, email, adres, specialisatie
- Leverancier wordt opgeslagen en is zichtbaar in overzicht
- Duplicaat detectie op bedrijfsnaam
- Categorisering per diensttype

## UX/UI aandachtspunten
- Inline validatie op email/telefoon format
- Success toast bij opslaan
- Suggesties bij mogelijke duplicaten

## Afhankelijkheden / blockers
- FEAT-028

## Bronverwijzingen
- [docs/backlog/features/FEAT-028-leveranciersbeheer.md](../features/FEAT-028-leveranciersbeheer.md)
