# Implementatierapport STORY-035: Leveranciersprofiel beheren

## Documentinformatie
- **Story ID**: STORY-035
- **Datum implementatie**: 2026-01-27
- **Implementatie door**: GitHub Copilot Coding Agent
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0

## User Story (Origineel)
Als **bestuurslid** wil ik leveranciersprofielen kunnen aanmaken en beheren, zodat contactgegevens en expertise eenduidig beschikbaar zijn voor opvolging.

## Acceptatiecriteria Status

| # | Criterium | Status | Implementatie Details |
|---|-----------|--------|----------------------|
| 1 | Bestuur kan een leveranciersprofiel aanmaken met naam, contactpersoon, bereikbaarheid en specialisme | ✅ | Formulier met alle velden + inline validatie |
| 2 | Leveranciersprofiel kan worden bijgewerkt of gearchiveerd; gearchiveerde leveranciers zijn niet selecteerbaar voor nieuwe tickets | ✅ | Inline bewerken + is_active toggle voor archivering |
| 3 | Leveranciersoverzicht toont status (actief/inactief) en gekoppelde tickets | ⚠️ | Status badges aanwezig, gekoppelde tickets nog niet getoond |

## Technische Implementatie

### Backend (geïmplementeerd met STORY-044)

#### Database Model
- **Bestand**: `backend/app/db/models/models.py`
- **Model**: `Supplier` met velden:
  - `id`, `vve_id`, `name`, `contact_person`, `email`, `phone`
  - `specialty`, `notes`, `is_active`
  - `created_at`, `updated_at`

#### Schema's
- **Bestand**: `backend/app/schemas/ticket.py`
- **Types**: `SupplierBase`, `SupplierCreate`, `SupplierUpdate`, `SupplierResponse`

#### API Endpoints
- **Bestand**: `backend/app/api/routes/tickets.py`
- **Endpoints**:
  - `GET /vves/{vve_id}/suppliers` - Lijst ophalen (met filter active_only)
  - `POST /vves/{vve_id}/suppliers` - Nieuwe leverancier
  - `GET /vves/{vve_id}/suppliers/{supplier_id}` - Details ophalen
  - `PUT /vves/{vve_id}/suppliers/{supplier_id}` - Leverancier bijwerken

### Frontend

#### Types
- **Bestand**: `frontend/src/types/index.ts`
- **Types**: `Supplier`, `SupplierCreate`, `SupplierUpdate`

#### API Client
- **Bestand**: `frontend/src/lib/api.ts`
- **Methodes**: `getSuppliers()`, `createSupplier()`, `getSupplier()`, `updateSupplier()`

#### UI Pagina
- **Bestand**: `frontend/src/app/instellingen/leveranciers/page.tsx`
- **Features**:
  - Leveranciersoverzicht met status badges
  - Nieuw leverancier formulier (inline, geen modal)
  - Inline bewerken van bestaande leveranciers
  - Activeren/deactiveren toggle
  - Filter voor actieve/inactieve leveranciers
  - Success/error feedback inline

## UX/UI Compliance

| Vereiste | Status | Toelichting |
|----------|--------|-------------|
| Gebruik list/table component met statusbadge | ✅ | Card-based lijst met status badges |
| Inline validatie op contactgegevens; geen modals | ✅ | HTML5 validatie, geen modals |
| Detailpaneel toont gekoppelde tickets en laatste contactmoment | ⚠️ | Niet geïmplementeerd in v1 |

## Bekende Beperkingen
1. Gekoppelde tickets per leverancier worden nog niet getoond
2. Laatste contactmoment wordt nog niet bijgehouden
3. VVE ID is hardcoded

## Openstaande Items
1. Gekoppelde tickets tonen in leveranciersdetail
2. Contacthistorie/logging functionaliteit
3. Navigatielink toevoegen naar instellingen menu

## Gerelateerde Stories
- **STORY-044**: Ticket supplier collaboration status (backend basis)
- **STORY-034**: Leveranciers koppelen aan tickets
- **STORY-036**: Leveranciers opvolgacties loggen

## Bronverwijzingen
- [STORY-035 Definitie](../stories/STORY-035-leveranciersprofiel-beheren.md)
- [FEAT-017 Leveranciers & onderhoudsopvolging](../features/FEAT-017-leveranciers-en-onderhoud.md)
