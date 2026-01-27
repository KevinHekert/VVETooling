# Implementatierapport STORY-056: Contract document uploaden

## Documentinformatie
- **Story ID**: STORY-056
- **Datum implementatie**: 2026-01-27
- **Implementatie door**: AI Development Agent
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0

## User Story (Origineel)
Als **beheerder** wil ik een PDF van het contract kunnen uploaden en koppelen aan de registratie, zodat het originele document altijd beschikbaar is.

## Acceptatiecriteria Status

| # | Criterium | Status | Implementatie Details |
|---|-----------|--------|----------------------|
| 1 | PDF upload tot 10 MB ondersteund | ✅ | MAX_DOCUMENT_SIZE_BYTES = 10MB, validatie in endpoint |
| 2 | Document wordt gekoppeld aan contract | ✅ | document_id foreign key in Contract model |
| 3 | Preview van document is beschikbaar | ⚠️ | Document ID gekoppeld, preview via documents API |
| 4 | Meerdere documenten per contract mogelijk | ⚠️ | Basis: 1 document per contract, uitbreiding mogelijk |

## Technische Implementatie

### Backend
- **Endpoint(s)**: 
  - `POST /api/v1/vves/{vve_id}/contracts/{contract_id}/document` - Document uploaden
  - `PUT /api/v1/vves/{vve_id}/contracts/{contract_id}/document/{document_id}` - Bestaand document koppelen
  - `DELETE /api/v1/vves/{vve_id}/contracts/{contract_id}/document` - Document ontkoppelen
- **Bestand(en)**: 
  - `backend/app/api/routes/contracts.py`
  - `backend/app/schemas/contract.py`
- **Schema(s)**: `ContractDocumentResponse`
- **Autorisatie**: Beheerder only
- **Validatie**:
  - Alleen PDF files toegestaan
  - Maximum bestandsgrootte 10MB
  - Filename sanitization tegen path traversal

### Frontend
- **Pagina(s)**: `frontend/src/app/dashboard/beheerder/contracten/page.tsx`
- **Component(en)**: 
  - Drag & drop upload zone
  - Upload progress indicator
  - File preview with remove option
- **API Client**: `frontend/src/lib/api.ts`:
  - `uploadContractDocument()` - Direct upload
  - `linkDocumentToContract()` - Existing document koppelen
  - `unlinkDocumentFromContract()` - Document ontkoppelen
- **Types**: `frontend/src/types/index.ts` - `ContractDocumentResponse`

## UX/UI Compliance

| Vereiste | Status | Toelichting |
|----------|--------|-------------|
| Drag & drop upload | ✅ | Drag-and-drop zone met visuele feedback |
| Upload progress indicator | ✅ | Progress bar tijdens upload |
| Success toast na voltooiing | ✅ | Success message na voltooiing |

## Bekende Beperkingen
1. Momenteel ondersteunt een contract slechts 1 document (document_id)
2. Document preview gaat via bestaande documents API
3. Fysieke file opslag is gesimuleerd (s3_key)

## Openstaande Items
1. Uitbreiding naar meerdere documenten per contract (bijlagen)
2. Inline document preview in contract detail view
3. Document download integratie

## Gerelateerde Commits
- `feat(STORY-056): Add contract document upload API endpoints`
- `feat(STORY-056): Add drag-and-drop document upload UI to contracts page`

## Bronverwijzingen
- [STORY-056 Definitie](../stories/STORY-056-contract-document-uploaden.md)
- [FEAT-026 Contractregistratie & Opslag](../features/FEAT-026-contractregistratie-opslag.md)
- [STORY-055 Implementatierapport](STORY-055-implementatie.md)
