# FEAT-020: Sjablonenbeheer

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ⬜ Backlog
- **Versie**: 1.0
- **Geneste nummering**: 11.1

## Functioneel doel
Bestuur en beheerders kunnen herbruikbare sjablonen aanmaken, bewerken en categoriseren voor verschillende typen correspondentie (welkomstbrieven, betalingsherinneringen, onderhoudsmeldingen, leverancierscommunicatie).

## UX-impact
- Sjablonen bibliotheek met zoek- en filterfunctie per categorie.
- WYSIWYG editor voor opmaken van sjablonen met merge fields.
- Preview functie om sjabloon met voorbeelddata te bekijken.
- Sjabloon-versies met mogelijkheid om terug te vallen op eerdere versie.

## Constraints
- Alleen bestuur/beheerder kan sjablonen aanmaken en bewerken.
- Bewoners hebben geen toegang tot sjablonenbeheer.
- Merge fields volgen vaste naamconventie (bijv. {{voornaam}}, {{achternaam}}, {{adres}}).
- Maximale template grootte: 500KB (D-004 richtlijn).

## Acceptatiecriteria
- Gebruiker kan nieuw sjabloon aanmaken met titel, categorie en inhoud.
- Merge fields worden visueel gemarkeerd in de editor.
- Sjablonen kunnen worden gedupliceerd en aangepast.
- Verwijderen van sjabloon vraagt om bevestiging en logt actie in audit trail.
- Standaard sjablonen (welkom, herinnering, ALV-uitnodiging) zijn beschikbaar.

## Afhankelijkheden
- EPIC-011
- EPIC-009
- FEAT-015

## Bronverwijzingen
- [docs/backlog/epics/EPIC-011-correspondentie-en-sjablonen.md](../epics/EPIC-011-correspondentie-en-sjablonen.md)
- [docs/marktonderzoek/09-as-communicatie.md](../../marktonderzoek/09-as-communicatie.md)
- [docs/ui/components/form-controls.md](../../ui/components/form-controls.md)
