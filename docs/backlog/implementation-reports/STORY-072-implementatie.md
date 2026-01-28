# Implementatierapport STORY-072: RSVP registreren voor ALV

## Documentinformatie
- **Story ID**: STORY-072
- **Datum implementatie**: 2026-01-28
- **Implementatie door**: AI Development Agent
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0

## User Story (Origineel)
Als **eigenaar** wil ik mijn aanwezigheid voor de ALV kunnen bevestigen of afmelden, zodat het bestuur weet op hoeveel mensen te rekenen.

## Acceptatiecriteria Status

| # | Criterium | Status | Implementatie Details |
|---|-----------|--------|----------------------|
| 1 | RSVP opties: aanwezig, afwezig, met volmacht | ✅ | RsvpStatus enum met alle opties |
| 2 | Directe bevestiging na RSVP | ✅ | Toast notification na registratie |
| 3 | Overzicht voor secretaris van alle RSVP's | ✅ | RSVP modal met lijst en summary |
| 4 | Herinnering naar niet-reageerders | ⚠️ | Backend prepared, email infrastructure needed |

## Technische Implementatie

### Backend
- **Model**: `MeetingRsvp` in `backend/app/db/models/models.py`
  - RsvpStatus enum (aanwezig, afwezig, met_volmacht, onbekend)
  - Koppeling naar user_id en meeting_id
- **Endpoint(s)**: 
  - `GET /api/v1/vves/{vve_id}/meetings/{meeting_id}/rsvp` - RSVP lijst
  - `POST /api/v1/vves/{vve_id}/meetings/{meeting_id}/rsvp` - RSVP registreren/bijwerken
  - `GET /api/v1/vves/{vve_id}/meetings/{meeting_id}/rsvp/me` - Eigen RSVP ophalen
  - `GET /api/v1/vves/{vve_id}/meetings/{meeting_id}/rsvp/summary` - Samenvatting
- **Schema(s)**: `RsvpCreate`, `RsvpResponse`, `RsvpSummary`
- **Validatie**: Wijziging mogelijk tot 24 uur voor vergadering

### Frontend
- **Pagina(s)**: `frontend/src/app/dashboard/beheerder/alv/page.tsx`
- **Component(en)**: 
  - RSVP modal met status keuze
  - RSVP lijst met alle responses
  - Summary met totalen per status
  - Filter op status
- **API Client**: `createOrUpdateRsvp`, `getMyRsvp`, `listRsvps`, `getRsvpSummary`
- **Types**: `MeetingRsvp`, `RsvpCreate`, `RsvpSummary`, `RsvpStatus`

## UX/UI Compliance

| Vereiste | Status | Toelichting |
|----------|--------|-------------|
| Eenvoudige knoppen voor keuze | ✅ | Toggle buttons voor RSVP status |
| Bevestiging toast | ✅ | Success toast na registratie |
| Wijziging mogelijk tot 24 uur voor vergadering | ✅ | Backend validatie |

## Bekende Beperkingen
1. Herinnering functionaliteit vereist email infrastructure
2. VVE ID is momenteel hardcoded

## Bronverwijzingen
- [STORY-072 Definitie](../stories/STORY-072-rsvp-registreren-alv.md)
- [FEAT-033 Presentie & Volmachten](../features/FEAT-033-presentie-volmachten.md)
