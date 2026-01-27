# Implementatierapport STORY-036: Leveranciers opvolgacties loggen

## Documentinformatie
- **Story ID**: STORY-036
- **Datum implementatie**: 2026-01-27
- **Implementatie door**: GitHub Copilot Coding Agent
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0

## User Story (Origineel)
Als **bestuurslid** wil ik opvolgacties met leveranciers kunnen registreren, zodat communicatie en afspraken traceerbaar blijven per ticket.

## Acceptatiecriteria Status

| # | Criterium | Status | Implementatie Details |
|---|-----------|--------|----------------------|
| 1 | Bestuur kan opvolgacties toevoegen met datum, kanaal en korte samenvatting | ✅ | Inline formulier met kanaal selector, datum picker en samenvatting |
| 2 | Opvolgacties verschijnen in de ticket-tijdlijn met leverancier en status | ✅ | Timeline entry automatisch aangemaakt |
| 3 | Export van ticketdossier bevat opvolgacties | ⚠️ | Export nog niet geïmplementeerd |

## Technische Implementatie

### Backend

#### Database Model
- **Bestand**: `backend/app/db/models/models.py`
- **Nieuwe enum**: `SupplierFollowUpChannel` (phone/email/in_person/other)
- **Nieuw model**: `SupplierFollowUp` met velden:
  - `id`, `ticket_id`, `supplier_id`
  - `channel`: communicatiekanaal
  - `summary`: korte samenvatting (max 500 tekens)
  - `contact_date`: datum/tijd van contact
  - `created_by_id`, `created_at`

#### Schema's
- **Bestand**: `backend/app/schemas/ticket.py`
- **Nieuwe types**:
  - `SupplierFollowUpChannel`: Enum
  - `SupplierFollowUpCreate`: Schema voor aanmaken
  - `SupplierFollowUpResponse`: Response schema met leverancier- en gebruikersnaam

#### API Endpoints
- **Bestand**: `backend/app/api/routes/tickets.py`
- **Endpoints**:
  - `GET /vves/{vve_id}/tickets/{ticket_id}/follow-ups` - Opvolgacties ophalen
  - `POST /vves/{vve_id}/tickets/{ticket_id}/follow-ups` - Opvolgactie toevoegen
- **Timeline integratie**: Automatische entry bij toevoegen

### Frontend

#### Types
- **Bestand**: `frontend/src/types/index.ts`
- **Nieuwe types**:
  - `SupplierFollowUpChannel`, `SupplierFollowUp`, `SupplierFollowUpCreate`

#### API Client
- **Bestand**: `frontend/src/lib/api.ts`
- **Methodes**: `getSupplierFollowUps()`, `createSupplierFollowUp()`

#### UI
- **Bestand**: `frontend/src/app/dashboard/beheerder/tickets/[id]/page.tsx`
- **Nieuwe sectie**: "Opvolgacties" in sidebar
  - Kanaal selector met iconen (📞 📧 👤 📋)
  - Datum/tijd picker
  - Samenvatting textarea
  - Chronologische lijst van opvolgacties
  - Timeline icon voor follow-up entries

## UX/UI Compliance

| Vereiste | Status | Toelichting |
|----------|--------|-------------|
| Tijdlijnkaart met iconen per kanaal | ✅ | Iconen in UI en lijst |
| Inline toevoegform; geen modals | ✅ | Collapsible inline form |
| Gebruik toasts bij opslaan | ✅ | Success message na opslaan |

## Bekende Beperkingen
1. Export functionaliteit nog niet geïmplementeerd
2. Bewerken/verwijderen van opvolgacties nog niet mogelijk
3. Alleen zichtbaar voor beheerder (niet voor bewoner)

## Openstaande Items
1. Export ticketdossier met opvolgacties
2. Bewerken en verwijderen van opvolgacties
3. Notificaties bij nieuwe opvolgacties

## Gerelateerde Stories
- **STORY-044**: Ticket supplier collaboration status
- **STORY-035**: Leveranciersprofiel beheren
- **STORY-034**: Leveranciers koppelen aan tickets

## Bronverwijzingen
- [STORY-036 Definitie](../stories/STORY-036-leveranciers-opvolgacties-loggen.md)
- [FEAT-017 Leveranciers & onderhoudsopvolging](../features/FEAT-017-leveranciers-en-onderhoud.md)
