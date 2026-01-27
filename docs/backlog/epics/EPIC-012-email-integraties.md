# EPIC-012: E-mail Integraties

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner / PM
- **Status**: ⬜ Backlog
- **Versie**: 1.0

## Doel / waarde
De applicatie verstuurt e-mails via configureerbare externe providers, zodat VVE's professionele e-mailcommunicatie kunnen versturen zonder afhankelijk te zijn van één specifieke dienst. Door provider-keuze via Settings kunnen verschillende omgevingen of tenants de meest geschikte provider gebruiken op basis van kosten, compliance of functionele vereisten.

## Scope
- Configuratie van e-mail provider via Settings (per omgeving/tenant).
- Provider abstractielaag voor uniforme e-mail verzending ongeacht onderliggende provider.
- Implementatie van minimaal drie providers:
  - Mailchimp (Transactional Email / Mandrill)
  - Amazon Simple Email Service (SES)
  - SendGrid
- Uitbreidbare architectuur voor toekomstige providers.
- E-mail verzending API voor interne applicatie-componenten.
- Logging en monitoring van verzonden e-mails.
- Foutafhandeling en retry-mechanisme bij verzendfouten.

## Out-of-scope
- Marketing automation en bulk campagnes (Mailchimp marketing features).
- E-mail template editor (zie EPIC-011 voor sjablonenbeheer).
- Inkomende e-mail verwerking (ontvangen van e-mails).
- E-mail hosting of mailbox management.
- Fysieke postverzending.
- SMS/WhatsApp integraties.

## Afhankelijkheden
- EPIC-011 (correspondentie & sjablonen voor e-mail templates).
- EPIC-005 (security & compliance voor credentials opslag en AVG).
- EPIC-009 (multi-tenant voor tenant-specifieke configuratie).
- EPIC-015 Audit logging (voor e-mail verzend logging).

## Risico's
- **T-09 Provider lock-in**: Mitigatie via abstractielaag die provider-specifieke logica isoleert.
- **T-10 API rate limits**: Externe providers hebben verzendlimieten; batch-verwerking en queuing nodig.
- **T-11 Credential security**: API keys moeten veilig worden opgeslagen (encrypted, niet in code).
- **T-06 Privacy/AVG**: E-mailadressen en inhoud zijn persoonsgegevens; logging moet compliant zijn.
- **T-12 Deliverability**: SPF/DKIM/DMARC configuratie nodig voor goede deliverability.

## Open vragen
- **DQ-016**: Welke provider wordt de standaard voor nieuwe tenants? (Owner: PM)
- **DQ-017**: Moeten we een fallback-provider configureren bij storingen? (Owner: Architectuur)
- **DQ-018**: Welke e-mail statistieken (opens, clicks, bounces) moeten worden bijgehouden? (Owner: PM)
- **DQ-019**: Hoe gaan we om met provider-specifieke rate limits en kosten? (Owner: PM/Finance)
- **DQ-020**: Moeten tenants eigen SMTP/provider credentials kunnen gebruiken? (Owner: PM)

## Acceptatie (epic-niveau)
- Beheerder kan via Settings een e-mail provider kiezen (Mailchimp, SES, SendGrid).
- E-mails worden succesvol verstuurd via de geconfigureerde provider.
- Bij provider-wijziging blijft e-mail verzending functioneren zonder code-aanpassingen.
- Nieuwe providers kunnen worden toegevoegd zonder wijzigingen aan bestaande verzendlogica.
- Alle verzonden e-mails worden gelogd met status (success/failed) en timestamp.
- API credentials worden veilig opgeslagen en zijn niet zichtbaar in logs of UI.
- Foutmeldingen bij verzendproblemen worden duidelijk gecommuniceerd naar gebruiker.

## Niet-functionele eisen
- **Uitbreidbaarheid**: Nieuwe e-mail providers kunnen worden toegevoegd door implementatie van een gestandaardiseerde interface.
- **Configuratie**: Provider-keuze is configureerbaar per omgeving of tenant zonder code deployment.
- **Security**: API credentials worden encrypted opgeslagen; geen plaintext in configuratie of logs.
- **Reliability**: Retry-mechanisme bij tijdelijke verzendfouten met exponential backoff.
- **Observability**: Metrics beschikbaar voor verzendvolume, success rate en latency per provider.

## Bronverwijzingen
- [docs/backlog/epics/EPIC-011-correspondentie-en-sjablonen.md](EPIC-011-correspondentie-en-sjablonen.md)
- [docs/backlog/epics/EPIC-005-security-compliance.md](EPIC-005-security-compliance.md)
- [docs/backlog/features/FEAT-022-multi-channel-verzending.md](../features/FEAT-022-multi-channel-verzending.md)
- [docs/architecture/decisions/ADR-001-authentication-authorization.md](../../architecture/decisions/ADR-001-authentication-authorization.md)
