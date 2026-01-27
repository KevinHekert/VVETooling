# STORY-051: SendGrid integratie implementeren

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ⬜ Backlog
- **Versie**: 1.0
- **Prioriteit**: Must (EPIC-012)
- **Geneste nummering**: 12.2.3

## User story
Als **ontwikkelaar** wil ik een SendGrid provider implementatie hebben, zodat de applicatie e-mails kan versturen via SendGrid's e-mail platform.

## Acceptatiecriteria
- SendGrid provider implementeert de e-mail provider interface (FEAT-024).
- Verbinding met SendGrid Web API v3 via geconfigureerde API key.
- Ondersteuning voor:
  - Eenvoudige e-mails (to, subject, body).
  - HTML en plain text body.
  - CC en BCC ontvangers.
  - Bijlagen (attachments).
  - Reply-to adres.
  - Categories/tags voor tracking.
- API response wordt vertaald naar uniforme status (sent, failed, rejected).
- SendGrid-specifieke fouten worden duidelijk gecommuniceerd.
- Rate limiting (429 responses) triggert retry met backoff.
- Bounce en delivery webhooks worden ondersteund (optioneel, fase 2).
- Unit tests valideren correcte API aanroepen.
- Integration tests met SendGrid sandbox mode.

## UX/UI aandachtspunten
- N.v.t. (technische implementatie)
- Indirect: gebruiksvriendelijke foutmeldingen.

## Afhankelijkheden / blockers
- FEAT-024 (provider abstractie interface)
- STORY-048 (configuratie om API key op te halen)
- SendGrid API documentatie

## Bronverwijzingen
- [docs/backlog/features/FEAT-024-email-provider-abstractie.md](../features/FEAT-024-email-provider-abstractie.md)
- [docs/backlog/epics/EPIC-012-email-integraties.md](../epics/EPIC-012-email-integraties.md)
- [SendGrid API Documentation](https://docs.sendgrid.com/)
