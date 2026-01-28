# STORY-050: Amazon SES integratie implementeren

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0
- **Prioriteit**: Must (EPIC-012)
- **Geneste nummering**: 12.2.2

## User story
Als **ontwikkelaar** wil ik een Amazon SES provider implementatie hebben, zodat de applicatie e-mails kan versturen via Amazon's Simple Email Service.

## Acceptatiecriteria
- Amazon SES provider implementeert de e-mail provider interface (FEAT-024).
- Verbinding met AWS SES API via geconfigureerde credentials (Access Key ID, Secret Access Key).
- Region configuratie wordt ondersteund (eu-west-1, us-east-1, etc.).
- Ondersteuning voor:
  - Eenvoudige e-mails (to, subject, body).
  - HTML en plain text body.
  - CC en BCC ontvangers.
  - Bijlagen (attachments).
  - Reply-to adres.
- AWS SDK of directe API calls worden correct geïmplementeerd.
- API response wordt vertaald naar uniforme status (sent, failed, rejected).
- SES-specifieke fouten (sandbox mode, unverified sender) worden duidelijk gecommuniceerd.
- Rate limiting en throttling worden correct afgehandeld.
- Unit tests valideren correcte API aanroepen.
- Integration tests met AWS SES sandbox mode.

## UX/UI aandachtspunten
- N.v.t. (technische implementatie)
- Indirect: duidelijke foutmeldingen bij sandbox-beperkingen ("Sender e-mailadres is niet geverifieerd in AWS SES").

## Afhankelijkheden / blockers
- FEAT-024 (provider abstractie interface)
- STORY-048 (configuratie om credentials op te halen)
- AWS SES documentatie en SDK

## Bronverwijzingen
- [docs/backlog/features/FEAT-024-email-provider-abstractie.md](../features/FEAT-024-email-provider-abstractie.md)
- [docs/backlog/epics/EPIC-012-email-integraties.md](../epics/EPIC-012-email-integraties.md)
- [AWS SES Developer Guide](https://docs.aws.amazon.com/ses/)
