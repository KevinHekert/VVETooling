# STORY-054: E-mail verzending monitoring en logging

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ⬜ Backlog
- **Versie**: 1.0
- **Prioriteit**: Should (EPIC-012)
- **Geneste nummering**: 12.3.2

## User story
Als **beheerder** wil ik inzicht hebben in verzonden e-mails en hun status, zodat ik kan monitoren of communicatie succesvol wordt afgeleverd en problemen kan identificeren.

## Acceptatiecriteria
- Alle e-mail verzendingen worden gelogd in audit log met:
  - Timestamp
  - Ontvanger(s) (geanonimiseerd in overzicht, volledig in detail)
  - Onderwerp
  - Provider gebruikt
  - Status (sent, failed, bounced)
  - Message ID
  - Foutmelding (indien van toepassing)
- E-mail log pagina in admin sectie toont verzendhistorie.
- Filters beschikbaar: datum range, status, provider, ontvanger.
- Export naar CSV mogelijk.
- Dashboard widget toont verzend statistieken:
  - Aantal verzonden vandaag/week/maand
  - Success rate percentage
  - Aantal failures
- Alerts bij hoog failure percentage (>5% in laatste 24 uur).
- AVG-compliant: e-mail inhoud wordt niet gelogd, alleen metadata.

## UX/UI aandachtspunten
- Tabel met sorteerbare kolommen.
- Status badges met kleurcodering (groen=sent, rood=failed, geel=pending).
- Klikbare rij voor detail weergave.
- Datum picker voor range selectie.
- Chart voor trend visualisatie.
- Mobile: gestapelde kaarten i.p.v. tabel.

## Afhankelijkheden / blockers
- FEAT-025
- FEAT-015 (audit logging infrastructuur)
- STORY-053 (verzending genereert log entries)

## Bronverwijzingen
- [docs/backlog/features/FEAT-025-email-verzending-api.md](../features/FEAT-025-email-verzending-api.md)
- [docs/backlog/features/FEAT-015-audit-logging.md](../features/FEAT-015-audit-logging.md)
- [docs/backlog/epics/EPIC-012-email-integraties.md](../epics/EPIC-012-email-integraties.md)
