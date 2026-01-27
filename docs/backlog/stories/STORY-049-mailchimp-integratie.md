# STORY-049: Mailchimp integratie implementeren

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ⬜ Backlog
- **Versie**: 1.0
- **Prioriteit**: Must (EPIC-012)
- **Geneste nummering**: 12.2.1

## User story
Als **ontwikkelaar** wil ik een Mailchimp (Mandrill) provider implementatie hebben, zodat de applicatie e-mails kan versturen via Mailchimp's transactional email service.

## Acceptatiecriteria
- Mailchimp provider implementeert de e-mail provider interface (FEAT-024).
- Verbinding met Mailchimp/Mandrill Transactional API via geconfigureerde API key.
- Ondersteuning voor:
  - Eenvoudige e-mails (to, subject, body).
  - HTML en plain text body.
  - CC en BCC ontvangers.
  - Bijlagen (attachments).
  - Reply-to adres.
- API response wordt vertaald naar uniforme status (sent, failed, rejected).
- Foutmeldingen worden vertaald naar leesbare Nederlandse berichten.
- Rate limiting wordt gerespecteerd (429 responses triggeren retry).
- Unit tests valideren correcte API aanroepen.
- Integration tests met Mailchimp sandbox/test mode.

## UX/UI aandachtspunten
- N.v.t. (technische implementatie)
- Indirect: foutmeldingen moeten gebruiksvriendelijk zijn ("E-mail kon niet worden verstuurd, probeer later opnieuw").

## Afhankelijkheden / blockers
- FEAT-024 (provider abstractie interface)
- STORY-048 (configuratie om API key op te halen)
- Mailchimp/Mandrill API documentatie

## Bronverwijzingen
- [docs/backlog/features/FEAT-024-email-provider-abstractie.md](../features/FEAT-024-email-provider-abstractie.md)
- [docs/backlog/epics/EPIC-012-email-integraties.md](../epics/EPIC-012-email-integraties.md)
- [Mailchimp Transactional API](https://mailchimp.com/developer/transactional/)
