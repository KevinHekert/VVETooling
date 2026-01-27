# STORY-047: Multi-channel verzending

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0
- **Prioriteit**: Should (EPIC-011)
- **Geneste nummering**: 11.3.1

## User story
Als **beheerder** wil ik gegenereerde correspondentie kunnen versturen via meerdere kanalen (email, PDF-export, in-app), zodat ik bewoners en leveranciers op hun voorkeurskanaal kan bereiken.

## Acceptatiecriteria
- Kanaal selectie na brief generatie: email, PDF downloaden, of in-app notificatie.
- Bulk PDF-export met alle brieven in één document.
- Email preview met onderwerp en bijlagen configuratie.
- Verzendstatus overzicht: verstuurd, geopend (email), mislukt.
- Mislukte verzendingen kunnen opnieuw worden geprobeerd.

## UX/UI aandachtspunten
- Kanaal keuze via segmented control of dropdown.
- Status badges per ontvanger.
- Toast bij verzending success/failure.
- Verzendhistorie in aparte sectie.
- Mobile: compacte status weergave.

## Afhankelijkheden / blockers
- FEAT-022
- STORY-046 (brieven genereren)
- FEAT-015 (audit logging)
- EPIC-006 (documenten opslag)

## Bronverwijzingen
- [docs/backlog/features/FEAT-022-multi-channel-verzending.md](../features/FEAT-022-multi-channel-verzending.md)
- [docs/backlog/stories/STORY-046-brieven-genereren-wizard.md](STORY-046-brieven-genereren-wizard.md)
- [docs/ui/components/feedback-notifications.md](../../ui/components/feedback-notifications.md)
