# STORY-072: RSVP registreren voor ALV

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0
- **Prioriteit**: Must (Horizon 2)
- **Geneste nummering**: 15.2.1

## User story
Als **eigenaar** wil ik mijn aanwezigheid voor de ALV kunnen bevestigen of afmelden, zodat het bestuur weet op hoeveel mensen te rekenen.

## Acceptatiecriteria
- ✅ RSVP opties: aanwezig, afwezig, met volmacht
- ✅ Directe bevestiging na RSVP
- ✅ Overzicht voor secretaris van alle RSVP's
- ⚠️ Herinnering naar niet-reageerders (email infrastructure needed)

## UX/UI aandachtspunten
- ✅ Eenvoudige knoppen voor keuze
- ✅ Bevestiging toast
- ✅ Wijziging mogelijk tot 24 uur voor vergadering (backend validation)

## Afhankelijkheden / blockers
- FEAT-033
- STORY-071

## Bronverwijzingen
- [docs/backlog/features/FEAT-033-presentie-volmachten.md](../features/FEAT-033-presentie-volmachten.md)

## Implementatie Details
- **Backend Model**: `MeetingRsvp`, `MeetingRsvpStatus` in `backend/app/db/models/models.py`
- **Backend Schemas**: `RsvpCreate`, `RsvpResponse`, `RsvpSummary` in `backend/app/schemas/meeting.py`
- **Backend API Routes**: `/vves/{vve_id}/meetings/{meeting_id}/rsvp` endpoints in `backend/app/api/routes/meetings.py`
- **Frontend Types**: `MeetingRsvp`, `RsvpCreate`, `RsvpSummary` in `frontend/src/types/index.ts`
- **Frontend API**: `createOrUpdateRsvp`, `getMyRsvp`, `listRsvps`, `getRsvpSummary` in `frontend/src/lib/api.ts`
- **Frontend UI**: RSVP modal with summary and list in `frontend/src/app/dashboard/beheerder/alv/page.tsx`
