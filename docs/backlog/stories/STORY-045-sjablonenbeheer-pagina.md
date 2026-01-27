# STORY-045: Sjablonenbeheer pagina

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ⬜ Backlog
- **Versie**: 1.0
- **Prioriteit**: Must (EPIC-011)
- **Geneste nummering**: 11.1.1

## User story
Als **beheerder** wil ik sjablonen kunnen aanmaken, bewerken en categoriseren, zodat ik herbruikbare templates heb voor verschillende typen correspondentie.

## Acceptatiecriteria
- Gebruiker kan nieuw sjabloon aanmaken met titel, categorie en inhoud.
- Sjablonen bibliotheek met zoek- en filterfunctie per categorie.
- Merge fields ({{voornaam}}, {{achternaam}}, {{adres}}) worden visueel gemarkeerd.
- Sjablonen kunnen worden gedupliceerd en verwijderd (met bevestiging).
- Standaard sjablonen (welkom, herinnering, ALV-uitnodiging) zijn beschikbaar.
- Preview functie om sjabloon met voorbeelddata te bekijken.

## UX/UI aandachtspunten
- Consistente card/list weergave voor sjablonen.
- Inline edit of apart formulier (geen modals).
- Badge per categorie type.
- Mobile: samenvattingskaarten met uitklapdetails.
- Toast feedback bij acties.

## Afhankelijkheden / blockers
- FEAT-020
- EPIC-009 (rollen)
- FEAT-015 (audit logging)

## Bronverwijzingen
- [docs/backlog/features/FEAT-020-sjablonenbeheer.md](../features/FEAT-020-sjablonenbeheer.md)
- [docs/backlog/epics/EPIC-011-correspondentie-en-sjablonen.md](../epics/EPIC-011-correspondentie-en-sjablonen.md)
- [docs/ui/components/form-controls.md](../../ui/components/form-controls.md)
