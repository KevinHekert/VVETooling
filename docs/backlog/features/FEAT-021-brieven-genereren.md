# FEAT-021: Brieven genereren

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0
- **Geneste nummering**: 11.2

## Functioneel doel
Bestuur en beheerders kunnen brieven en berichten genereren door een sjabloon te selecteren en ontvangers te kiezen. Het systeem vult automatisch de merge fields in met actuele gegevens van bewoners of leveranciers.

## UX-impact
- Wizard-flow: selecteer sjabloon → kies ontvangers → preview → genereren.
- Ontvanger selectie: individueel, groep (alle bewoners), of gefilterd (bijv. alleen achterstallige betalers).
- Preview per ontvanger met mogelijkheid om individueel aan te passen.
- Batch generatie voor meerdere ontvangers tegelijk.

## Constraints
- Merge fields die niet gevuld kunnen worden tonen waarschuwing.
- Gegenereerde brieven worden opgeslagen in correspondentie-archief.
- Alleen persoonsgegevens waarvoor toestemming is mogen worden gebruikt (AVG).
- Maximum 100 ontvangers per batch (performance).

## Acceptatiecriteria
- Gebruiker kan sjabloon selecteren en ontvangers kiezen.
- Merge fields worden correct ingevuld met ontvangergegevens.
- Preview toont exacte weergave voor elke ontvanger.
- Gegenereerde brief wordt opgeslagen met metadata (datum, sjabloon, ontvanger).
- Ontbrekende gegevens worden duidelijk gemarkeerd vóór generatie.

## Afhankelijkheden
- EPIC-011
- FEAT-020
- FEAT-015
- EPIC-010 (voor leveranciersgegevens)

## Bronverwijzingen
- [docs/backlog/epics/EPIC-011-correspondentie-en-sjablonen.md](../epics/EPIC-011-correspondentie-en-sjablonen.md)
- [docs/backlog/features/FEAT-020-sjablonenbeheer.md](FEAT-020-sjablonenbeheer.md)
- [docs/ux/design/03-beheerder-flows.md](../../ux/design/03-beheerder-flows.md)
