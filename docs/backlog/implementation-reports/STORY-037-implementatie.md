# Implementatierapport STORY-037: Ticket communicatie en notities

## Documentinformatie
- **Story ID**: STORY-037
- **Datum implementatie**: 2026-01-27
- **Implementatie door**: GitHub Copilot Coding Agent
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0

## User Story (Origineel)
Als **bewoner** wil ik aanvullende berichten en notities kunnen toevoegen aan mijn ticket, zodat ik context kan geven tijdens de opvolging.

## Acceptatiecriteria Status

| # | Criterium | Status | Implementatie Details |
|---|-----------|--------|----------------------|
| 1 | Bewoner kan een bericht toevoegen aan een bestaand ticket | ✅ | Comment form in ticket detail page |
| 2 | Ticket-tijdlijn toont berichten met auteur, datum en status | ✅ | Timeline met comment_added events |
| 3 | Bestuur kan berichten markeren als beantwoord | ✅ | is_answered flag + UI button |

## Technische Implementatie

### Backend

#### Schema Updates
- **Bestand**: `backend/app/schemas/ticket.py`
- **Nieuwe types**:
  - `TicketCommentUpdate`: Schema voor is_answered update
- **Uitgebreid TicketCommentResponse** met:
  - `is_answered`: Boolean
  - `answered_by_id`: UUID
  - `answered_by_name`: String
  - `answered_at`: DateTime

#### Database Model Updates
- **Bestand**: `backend/app/db/models/models.py`
- **Nieuwe velden in TicketComment**:
  - `is_answered`: Boolean (default: false)
  - `answered_by_id`: UUID (FK naar users)
  - `answered_at`: DateTime

#### API Endpoints
- **Bestand**: `backend/app/api/routes/tickets.py`
- **Nieuw endpoint**:
  - `PUT /vves/{vve_id}/tickets/{ticket_id}/comments/{comment_id}` - Reactie markeren als beantwoord
- **Bestaande endpoints** (geïmplementeerd in STORY-029):
  - `POST /vves/{vve_id}/tickets/{ticket_id}/comments` - Reactie toevoegen
  - `GET /vves/{vve_id}/tickets/{ticket_id}/comments` - Reacties ophalen

### Frontend

#### Types Updates
- **Bestand**: `frontend/src/types/index.ts`
- **Uitgebreid TicketComment interface** met:
  - `is_answered`, `answered_by_id`, `answered_by_name`, `answered_at`
- **Nieuwe type**: `TicketCommentUpdate`

#### API Client
- **Bestand**: `frontend/src/lib/api.ts`
- **Nieuwe methode**:
  - `updateTicketComment()` - Voor is_answered updates

#### UI Updates
- **Bestand**: `frontend/src/app/dashboard/beheerder/tickets/[id]/page.tsx`
- **Nieuwe features**:
  - "Beantwoord" badge bij reacties die als beantwoord zijn gemarkeerd
  - "Markeren als beantwoord" button voor niet-interne, onbeantwoorde reacties
  - Success feedback na markeren

## UX/UI Compliance

| Vereiste | Status | Toelichting |
|----------|--------|-------------|
| Gebruik inline composer onder de tijdlijn | ✅ | Comment form onder reacties sectie |
| Toon statusbadge voor "beantwoord" | ✅ | Groene badge "✓ Beantwoord" |
| Inline feedback/toasts; geen modals | ✅ | Success messages inline |

## Bekende Beperkingen
1. Geen notificatie naar bewoner wanneer reactie als beantwoord wordt gemarkeerd
2. VVE ID is hardcoded (context/session nog niet geïmplementeerd)

## Openstaande Items
1. Email/push notificatie bij beantwoorde reactie
2. Mogelijkheid om beantwoord status ongedaan te maken

## Gerelateerde Stories
- **STORY-029**: Ticket wizard en tijdlijn basis
- **STORY-031**: Bestuur ticket behandeling (comments UI reeds aanwezig)

## Bronverwijzingen
- [STORY-037 Definitie](../stories/STORY-037-ticket-communicatie-en-notities.md)
- [FEAT-016 Bewoner tickets & klachten](../features/FEAT-016-bewoner-tickets-en-klachten.md)
- [STORY-029 Implementatie](./STORY-029-implementatie.md)
- [STORY-031 Implementatie](./STORY-031-implementatie.md)
