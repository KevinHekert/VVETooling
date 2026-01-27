# Implementatierapport STORY-029: Bewoner ticket wizard en tijdlijn

## Documentinformatie
- **Story ID**: STORY-029
- **Datum implementatie**: 2026-01-27
- **Implementatie door**: GitHub Copilot Coding Agent
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0

## User Story (Origineel)
Als **bewoner** wil ik een ticket-wizard kunnen doorlopen om een klacht in te dienen, zodat ik stap voor stap de juiste informatie toevoeg en de voortgang kan volgen.

## Acceptatiecriteria Status

| # | Criterium | Status | Implementatie Details |
|---|-----------|--------|----------------------|
| 1 | Wizard bevat stappen: klachtcategorie, locatie/omschrijving, bewijsstukken, samenvatting | ✅ | 4-stap wizard geïmplementeerd met ProgressIndicator |
| 2 | Bewoner kan wizard pauzeren en later hervatten | ✅ | Draft opgeslagen in localStorage |
| 3 | Na indienen wordt een ticket-tijdlijn getoond met statusupdates | ✅ | Timeline component met chronologische events |
| 4 | Bewoner ziet alleen eigen tickets en kan opmerkingen toevoegen | ✅ | Backend filtering op submitted_by_id, commentaar functionaliteit |

## Technische Implementatie

### Backend

#### Schema's
- **Bestand**: `backend/app/schemas/ticket.py`
- **Schema's**:
  - `TicketStatus` (Enum): draft, submitted, in_progress, awaiting_info, resolved, closed
  - `TicketCategory` (Enum): maintenance, noise, safety, cleaning, facilities, other
  - `TicketPriority` (Enum): low, medium, high, urgent
  - `TicketCreate`, `TicketUpdate`, `TicketResponse`, `TicketListResponse`
  - `TicketAttachmentResponse`, `TicketTimelineEntryResponse`
  - `TicketCommentCreate`, `TicketCommentResponse`
  - `TicketDraft`, `TicketSummary`

#### Database Modellen
- **Bestand**: `backend/app/db/models/models.py`
- **Modellen**:
  - `Ticket` - Hoofdmodel voor tickets met relaties
  - `TicketAttachment` - Bijlagen bij tickets (max 10MB per D-004)
  - `TicketTimelineEntry` - Chronologische events
  - `TicketComment` - Reacties (met is_internal flag voor bestuur)

#### API Endpoints
- **Bestand**: `backend/app/api/routes/tickets.py`
- **Endpoints**:
  - `POST /vves/{vve_id}/tickets` - Ticket aanmaken
  - `GET /vves/{vve_id}/tickets` - Tickets ophalen (gefilterd per rol)
  - `GET /vves/{vve_id}/tickets/summary` - Statistieken (bestuur only)
  - `GET /vves/{vve_id}/tickets/{ticket_id}` - Ticket details
  - `PUT /vves/{vve_id}/tickets/{ticket_id}` - Ticket bijwerken
  - `POST /vves/{vve_id}/tickets/{ticket_id}/attachments` - Bijlage uploaden
  - `GET /vves/{vve_id}/tickets/{ticket_id}/attachments` - Bijlagen ophalen
  - `POST /vves/{vve_id}/tickets/{ticket_id}/comments` - Reactie toevoegen
  - `GET /vves/{vve_id}/tickets/{ticket_id}/comments` - Reacties ophalen
  - `GET /vves/{vve_id}/tickets/{ticket_id}/timeline` - Tijdlijn ophalen
- **Autorisatie**: 
  - Bewoners: alleen eigen tickets zichtbaar
  - Bestuurslid/beheerder: alle tickets + interne notities

### Frontend

#### Types
- **Bestand**: `frontend/src/types/index.ts`
- **Types toegevoegd**:
  - `TicketStatus`, `TicketCategory`, `TicketPriority`
  - `Ticket`, `TicketCreate`, `TicketUpdate`
  - `TicketAttachment`, `TicketTimelineEntry`
  - `TicketComment`, `TicketCommentCreate`, `TicketDraft`

#### API Client
- **Bestand**: `frontend/src/lib/api.ts`
- **Methoden toegevoegd**:
  - `getTickets()`, `getTicket()`, `createTicket()`, `updateTicket()`
  - `getTicketTimeline()`
  - `uploadTicketAttachment()`, `getTicketAttachments()`
  - `addTicketComment()`, `getTicketComments()`

#### Pagina's
1. **Tickets Overzicht**: `frontend/src/app/dashboard/bewoner/tickets/page.tsx`
   - Lijst van alle tickets
   - Status filter knoppen
   - Link naar nieuwe ticket wizard
   
2. **Nieuwe Ticket Wizard**: `frontend/src/app/dashboard/bewoner/tickets/new/page.tsx`
   - 4-stap wizard met ProgressIndicator
   - Stap 1: Categorie selectie (6 categorieën met iconen)
   - Stap 2: Titel, locatie en beschrijving
   - Stap 3: Bewijsstukken uploaden (optioneel)
   - Stap 4: Samenvatting en indienen
   - Draft opslag in localStorage
   - Inline validatie

3. **Ticket Detail**: `frontend/src/app/dashboard/bewoner/tickets/[id]/page.tsx`
   - Ticket informatie (status, categorie, beschrijving)
   - Bijlagen lijst
   - Tijdlijn met chronologische events
   - Reacties sectie met formulier

## UX/UI Compliance

| Vereiste | Status | Toelichting |
|----------|--------|-------------|
| Progress indicator | ✅ | ProgressIndicator component hergebruikt |
| Inline validatie (geen modals) | ✅ | Inline error messages, toasts voor succes |
| Tijdlijn toont status, datum, actor | ✅ | Timeline component met verticale layout |
| Mobile-first stappenweergave | ✅ | Responsive grid, primary actie onderaan |
| Primary actie onderaan | ✅ | Volgende/Indienen knop onderaan wizard |

## Bekende Beperkingen
1. Mock VVE ID gebruikt (`demo-vve-id`) - echte context switching nog niet geïmplementeerd
2. Bestand upload naar S3 is placeholder (s3_key wordt gegenereerd maar niet daadwerkelijk geüpload)
3. Download functionaliteit voor bijlagen nog niet geïmplementeerd

## Openstaande Items
1. VVE context uit sessie/auth halen
2. S3 integratie voor bestand uploads
3. Push notificaties bij status wijzigingen
4. Email notificaties

## Gerelateerde Stories
- **STORY-030**: Ticket bewijsstukken (bonnen en facturen) - Gedeeltelijk geïmplementeerd (upload flow)
- **STORY-037**: Ticket communicatie en notities - Geïmplementeerd (comments endpoint)

## Bronverwijzingen
- [STORY-029 Definitie](../stories/STORY-029-bewoner-ticket-wizard-en-tijdlijn.md)
- [FEAT-016 Bewoner tickets & klachten](../features/FEAT-016-bewoner-tickets-en-klachten.md)
- [UI Components - ProgressIndicator](../../ui/components/ProgressIndicator.tsx)
