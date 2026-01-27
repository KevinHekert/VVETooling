# FEAT-025: E-mail Verzending API

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ⬜ Backlog
- **Versie**: 1.0
- **Geneste nummering**: 12.3

## Functioneel doel
Een interne API waarmee applicatie-componenten e-mails kunnen versturen. De API handelt verzending, logging, retry-logica en foutafhandeling af, zodat andere modules zich niet hoeven bezig te houden met provider-specifieke details.

## UX-impact
- E-mail verzendstatus zichtbaar in relevante UI's (correspondentie, uitnodigingen, notificaties).
- Toast/notificatie bij verzending success of failure.
- Verzendhistorie beschikbaar in audit log.
- Retry-status zichtbaar bij tijdelijke fouten.

## Constraints
- E-mails worden asynchroon verwerkt via queue (niet-blocking voor gebruiker).
- Retry met exponential backoff bij tijdelijke fouten (max 3 attempts).
- Permanente fouten (invalid email, rejected) worden direct gerapporteerd.
- Rate limiting respecteert provider-limieten.
- Bulk verzending verwerkt in batches.

## Acceptatiecriteria
- API accepteert e-mail verzendverzoeken (to, cc, bcc, subject, body, attachments).
- E-mails worden verstuurd via geconfigureerde provider (FEAT-024).
- Verzendstatus (queued, sent, failed) wordt gelogd en is opvraagbaar.
- Bij tijdelijke fout wordt automatisch retry uitgevoerd.
- Bij permanente fout wordt caller genotificeerd.
- Bulk verzending wordt ondersteund met batch-verwerking.
- E-mail bounce/delivery status wordt (indien beschikbaar) teruggekoppeld.

## Afhankelijkheden
- EPIC-012
- FEAT-023 (provider configuratie)
- FEAT-024 (provider abstractie)
- FEAT-015 (audit logging)

## Bronverwijzingen
- [docs/backlog/epics/EPIC-012-email-integraties.md](../epics/EPIC-012-email-integraties.md)
- [docs/backlog/features/FEAT-022-multi-channel-verzending.md](FEAT-022-multi-channel-verzending.md)
- [docs/backlog/features/FEAT-015-audit-logging.md](FEAT-015-audit-logging.md)
