# FEAT-022: Multi-channel verzending

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ⬜ Backlog
- **Versie**: 1.0
- **Geneste nummering**: 11.3

## Functioneel doel
Bestuur en beheerders kunnen gegenereerde correspondentie versturen via meerdere kanalen: email, PDF-export voor post, en in-app notificaties. Ontvanger voorkeuren worden gerespecteerd waar mogelijk.

## UX-impact
- Kanaal selectie na brief generatie: email, PDF downloaden, of in-app.
- Bulk PDF-export met alle brieven in één document (voor print/post).
- Email preview met onderwerp en bijlagen configuratie.
- Verzendstatus overzicht: verstuurd, geopend (email), mislukt.

## Constraints
- Email verzending via geconfigureerde SMTP of provider (SendGrid/Mailgun).
- PDF-export volgt huisstijl template met VVE logo en contactgegevens.
- In-app notificaties alleen voor gebruikers met actief account.
- Bounced emails worden gelogd en gerapporteerd.

## Acceptatiecriteria
- Gebruiker kan verzendkanaal kiezen per brief of batch.
- Email wordt verstuurd met correcte inhoud en eventuele bijlagen.
- PDF-export genereert professioneel document geschikt voor print.
- Verzendhistorie toont status per ontvanger en kanaal.
- Mislukte verzendingen kunnen opnieuw worden geprobeerd.

## Afhankelijkheden
- EPIC-011
- FEAT-021
- FEAT-015
- EPIC-006 (voor opslag gegenereerde documenten)

## Bronverwijzingen
- [docs/backlog/epics/EPIC-011-correspondentie-en-sjablonen.md](../epics/EPIC-011-correspondentie-en-sjablonen.md)
- [docs/backlog/features/FEAT-021-brieven-genereren.md](FEAT-021-brieven-genereren.md)
- [docs/marktonderzoek/09-as-communicatie.md](../../marktonderzoek/09-as-communicatie.md)
- [docs/ui/components/feedback-notifications.md](../../ui/components/feedback-notifications.md)
