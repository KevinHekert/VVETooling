# STORY-053: E-mail verzenden via geconfigureerde provider

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ⬜ Backlog
- **Versie**: 1.0
- **Prioriteit**: Must (EPIC-012)
- **Geneste nummering**: 12.3.1

## User story
Als **beheerder** wil ik e-mails kunnen versturen via de geconfigureerde provider, zodat correspondentie en notificaties automatisch via de juiste dienst worden verzonden.

## Acceptatiecriteria
- E-mail API endpoint accepteert verzendverzoeken van interne applicatie-componenten.
- Verzoeken bevatten: to (verplicht), subject (verplicht), body (verplicht), cc, bcc, replyTo, attachments.
- Provider wordt automatisch geselecteerd op basis van tenant/omgeving configuratie.
- Bij ontbrekende configuratie wordt duidelijke foutmelding geretourneerd.
- E-mails worden asynchroon verwerkt via queue (non-blocking).
- Verzendstatus wordt bijgewerkt: queued → sending → sent/failed.
- Caller kan status opvragen via messageId.
- Bestaande functionaliteit (uitnodigingen, notificaties) kan API aanroepen.
- Integration test: e-mail wordt succesvol verstuurd via geconfigureerde provider.

## UX/UI aandachtspunten
- Toast bij handmatige verzending: "E-mail wordt verstuurd...".
- Status update in UI wanneer verzending voltooid is.
- Error toast bij falen met actie "Opnieuw proberen".

## Afhankelijkheden / blockers
- FEAT-025
- STORY-048 (provider configuratie)
- STORY-052 (abstractie laag)
- Minstens één provider story (STORY-049/050/051)

## Bronverwijzingen
- [docs/backlog/features/FEAT-025-email-verzending-api.md](../features/FEAT-025-email-verzending-api.md)
- [docs/backlog/epics/EPIC-012-email-integraties.md](../epics/EPIC-012-email-integraties.md)
