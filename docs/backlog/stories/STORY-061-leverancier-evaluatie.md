# STORY-061: Leverancier evaluatie toevoegen

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0
- **Prioriteit**: Could (Horizon 2)
- **Geneste nummering**: 13.3.2

## User story
Als **bestuurslid** wil ik een evaluatie kunnen toevoegen aan een leverancier na afronding van een project, zodat toekomstige keuzes onderbouwd kunnen worden.

## Acceptatiecriteria
- ✅ Evaluatie met sterren (1-5) en vrije tekst
- ✅ Koppeling aan specifiek project/contract
- ✅ Gemiddelde score per leverancier berekend
- ✅ Evaluaties zijn alleen zichtbaar voor bevoegden

## UX/UI aandachtspunten
- ✅ Sterren rating component
- ✅ Datum van evaluatie automatisch
- ✅ Optioneel anoniem

## Afhankelijkheden / blockers
- FEAT-028
- STORY-060

## Bronverwijzingen
- [docs/backlog/features/FEAT-028-leveranciersbeheer.md](../features/FEAT-028-leveranciersbeheer.md)

## Implementatie Details
- **Backend Model**: `SupplierEvaluation` in `backend/app/db/models/models.py`
- **Backend Schemas**: `SupplierEvaluationCreate`, `SupplierEvaluationResponse` in `backend/app/schemas/ticket.py`
- **Backend API Routes**: `/vves/{vve_id}/suppliers/{supplier_id}/evaluations` endpoints in `backend/app/api/routes/tickets.py`
- **Frontend Types**: `SupplierEvaluation`, `SupplierEvaluationCreate`, `SupplierEvaluationSummary` in `frontend/src/types/index.ts`
- **Frontend API**: Evaluation methods in `frontend/src/lib/api.ts`
- **Frontend UI**: StarRating component and evaluation modal in `frontend/src/app/instellingen/leveranciers/page.tsx`
