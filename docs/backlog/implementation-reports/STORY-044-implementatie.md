# Implementatierapport STORY-044: Ticket supplier collaboration status

## Documentinformatie
- **Story ID**: STORY-044
- **Datum implementatie**: 2026-01-27
- **Implementatie door**: GitHub Copilot Coding Agent
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0

## User Story (Origineel)
Als **bestuurslid** wil ik zien welke status een leverancier heeft in de opvolging van een ticket, zodat bewoners weten waar hun verzoek staat.

## Acceptatiecriteria Status

| # | Criterium | Status | Implementatie Details |
|---|-----------|--------|----------------------|
| 1 | Ticketdetail toont een leveranciersstatus (ingepland/bezig/afgerond) | ✅ | StatusBadge met kleur-codering in ticket detail pagina |
| 2 | Bestuur kan status bijwerken met datum en korte toelichting | ✅ | Formulier in sidebar met leverancier selectie, status en notitie velden |
| 3 | Bewoners zien de actuele leveranciersstatus in hun ticket-tijdlijn | ✅ | Read-only weergave in bewoner ticket detail + timeline entries |

## Technische Implementatie

### Backend

#### Database Model Updates
- **Bestand**: `backend/app/db/models/models.py`
- **Nieuwe enum**: `SupplierStatus` (scheduled/in_progress/completed)
- **Nieuw model**: `Supplier` met velden:
  - `id`, `vve_id`, `name`, `contact_person`, `email`, `phone`, `specialty`, `notes`, `is_active`, `created_at`, `updated_at`
- **Uitgebreid Ticket model** met:
  - `supplier_id`: FK naar suppliers
  - `supplier_status`: SupplierStatus enum
  - `supplier_status_note`: String (max 500 tekens)
  - `supplier_status_updated_at`: DateTime
  - `supplier_status_updated_by_id`: FK naar users
  - `supplier`: Relationship naar Supplier model

#### Schema Updates
- **Bestand**: `backend/app/schemas/ticket.py`
- **Nieuwe schemas**:
  - `SupplierStatus`: Enum (scheduled/in_progress/completed)
  - `TicketSupplierStatusUpdate`: Schema voor status updates
  - `SupplierBase`, `SupplierCreate`, `SupplierUpdate`, `SupplierResponse`: CRUD schemas
- **Uitgebreid TicketResponse** met:
  - `supplier_id`, `supplier_name`, `supplier_status`, `supplier_status_note`
  - `supplier_status_updated_at`, `supplier_status_updated_by_id`, `supplier_status_updated_by_name`
- **Uitgebreid TicketListResponse** met:
  - `supplier_id`, `supplier_name`, `supplier_status`

#### API Endpoints
- **Bestand**: `backend/app/api/routes/tickets.py`
- **Nieuwe endpoints**:
  - `PUT /vves/{vve_id}/tickets/{ticket_id}/supplier-status` - Leveranciersstatus bijwerken
  - `GET /vves/{vve_id}/suppliers` - Leveranciers ophalen
  - `POST /vves/{vve_id}/suppliers` - Leverancier toevoegen
  - `GET /vves/{vve_id}/suppliers/{supplier_id}` - Leverancier ophalen
  - `PUT /vves/{vve_id}/suppliers/{supplier_id}` - Leverancier bijwerken
- **Autorisatie**: require_bestuurslid (alleen bestuur/beheerder)

### Frontend

#### Types Updates
- **Bestand**: `frontend/src/types/index.ts`
- **Nieuwe types**:
  - `SupplierStatus`: 'scheduled' | 'in_progress' | 'completed'
  - `Supplier`, `SupplierCreate`, `SupplierUpdate` interfaces
  - `TicketSupplierStatusUpdate` interface
- **Uitgebreid Ticket interface** met supplier velden

#### API Client
- **Bestand**: `frontend/src/lib/api.ts`
- **Nieuwe methodes**:
  - `updateTicketSupplierStatus()` - Status bijwerken
  - `getSuppliers()` - Leveranciers ophalen
  - `createSupplier()` - Leverancier toevoegen
  - `getSupplier()` - Leverancier ophalen
  - `updateSupplier()` - Leverancier bijwerken

#### UI Updates
- **Bestand**: `frontend/src/app/dashboard/beheerder/tickets/[id]/page.tsx`
- **Nieuwe features**:
  - Leveranciersstatus sectie in sidebar
  - Huidige status weergave met badge en details
  - Formulier voor leverancier selectie en status update
  - Success/error feedback inline (geen modals)
  - Timeline icon voor supplier_status_changed

- **Bestand**: `frontend/src/app/dashboard/bewoner/tickets/[id]/page.tsx`
- **Nieuwe features**:
  - Read-only weergave van leveranciersstatus in ticket header
  - Leveranciersnaam, status badge, notitie en update timestamp
  - Timeline icon voor supplier_status_changed

## UX/UI Compliance

| Vereiste | Status | Toelichting |
|----------|--------|-------------|
| Statusbadge in tijdlijn en overzicht | ✅ | Paars voor scheduled, geel voor in_progress, groen voor completed |
| Inline status update met toasts; geen modals | ✅ | Inline formulier met success/error messages |
| Gebruik bestaande statuskleuren uit ticketoverzicht | ✅ | Consistente kleurschema's toegepast |

## Bekende Beperkingen
1. Leveranciers moeten eerst handmatig worden toegevoegd (geen initiële seed data)
2. VVE ID is hardcoded (context/session nog niet geïmplementeerd)
3. Geen email/push notificaties bij statuswijzigingen

## Openstaande Items
1. Notificatie naar bewoner bij leveranciersstatus wijziging
2. Leveranciers importeren/exporteren functionaliteit
3. Leveranciers overzicht pagina voor beheer

## Gerelateerde Stories
- **STORY-029**: Ticket wizard en tijdlijn basis (timeline entries)
- **STORY-031**: Bestuur ticket behandeling (sidebar UI)
- **STORY-035**: Leveranciersprofiel beheren (basis CRUD nu geïmplementeerd)

## Bronverwijzingen
- [STORY-044 Definitie](../stories/STORY-044-ticket-supplier-collaboration-status.md)
- [FEAT-017 Leveranciers & onderhoudsopvolging](../features/FEAT-017-leveranciers-en-onderhoud.md)
- [FEAT-016 Bewoner tickets & klachten](../features/FEAT-016-bewoner-tickets-en-klachten.md)
