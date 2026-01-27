# Implementatierapport STORY-060: Leverancier registreren met contactgegevens

## Documentinformatie
- **Story ID**: STORY-060
- **Datum implementatie**: 2026-01-27
- **Implementatie door**: AI Development Agent
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0

## User Story (Origineel)
Als **beheerder** wil ik een leverancier kunnen registreren met contactgegevens en specialisatie, zodat ik een centrale leveranciersdatabase opbouw.

## Acceptatiecriteria Status

| # | Criterium | Status | Implementatie Details |
|---|-----------|--------|----------------------|
| 1 | Formulier bevat: bedrijfsnaam, contactpersoon, telefoon, email, adres, specialisatie | ✅ | Alle velden aanwezig in form |
| 2 | Leverancier wordt opgeslagen en is zichtbaar in overzicht | ✅ | CRUD API + frontend list |
| 3 | Duplicaat detectie op bedrijfsnaam | ✅ | Case-insensitive check met ilike |
| 4 | Categorisering per diensttype | ✅ | specialty field met vrije invoer |

## Technische Implementatie

### Backend
- **Model wijzigingen**: 
  - Added `address` field to Supplier model
- **Endpoint wijzigingen**: 
  - `POST /api/v1/vves/{vve_id}/suppliers` - Added duplicate detection
- **Schema wijzigingen**:
  - Added `address` field to SupplierBase, SupplierCreate, SupplierUpdate
- **Validatie**:
  - Duplicate check returns HTTP 409 Conflict

### Frontend
- **Pagina(s)**: `frontend/src/app/instellingen/leveranciers/page.tsx`
- **Wijzigingen**: 
  - Added `newSupplierAddress` state
  - Added address input field in form
  - Reset address on form submit
- **Types**: Added `address` field to Supplier, SupplierCreate, SupplierUpdate

## UX/UI Compliance

| Vereiste | Status | Toelichting |
|----------|--------|-------------|
| Inline validatie op email/telefoon format | ✅ | HTML5 input types (email, tel) |
| Success toast bij opslaan | ✅ | Success message met auto-fade |
| Suggesties bij mogelijke duplicaten | ⚠️ | Error op exact match, geen suggesties |

## Bekende Beperkingen
1. Duplicaat detectie is exact match (case-insensitive), geen fuzzy matching
2. Geen suggesties bij bijna-duplicaten
3. specialty is vrije tekst, geen dropdown met categorieën

## Openstaande Items
1. Fuzzy duplicaat suggesties
2. Dropdown voor specialty categorieën
3. STORY-061: Leverancier evaluatie

## Gerelateerde Commits
- `feat(STORY-060): Add address field and duplicate detection to supplier registration`

## Bronverwijzingen
- [STORY-060 Definitie](../stories/STORY-060-leverancier-registreren.md)
- [FEAT-028 Leveranciersbeheer](../features/FEAT-028-leveranciersbeheer.md)
- [STORY-035 Implementatie](STORY-035-implementatie.md) - Basis leverancier functionaliteit
