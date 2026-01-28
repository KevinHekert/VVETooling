# Implementatierapport STORY-076: Besluiten extraheren naar register

## Documentinformatie
- **Story ID**: STORY-076
- **Datum implementatie**: 2026-01-28
- **Implementatie door**: AI Development Agent
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0

## User Story (Origineel)
Als **secretaris** wil ik gemarkeerde besluiten kunnen extraheren naar het besluitenregister, zodat alle besluiten centraal en doorzoekbaar zijn.

## Acceptatiecriteria Status

| # | Criterium | Status | Implementatie Details |
|---|-----------|--------|----------------------|
| 1 | Gemarkeerde besluiten worden geëxtraheerd | ✅ | POST endpoint `/meetings/{id}/decisions/extract` |
| 2 | Besluit bevat: tekst, datum, stemresultaat | ✅ | Backend model bevat alle velden |
| 3 | Koppeling naar originele notulen behouden | ✅ | meeting_id wordt behouden |
| 4 | Besluit krijgt uniek volgnummer | ✅ | Backend genereert register_number |

## Technische Implementatie

### Backend (reeds geïmplementeerd)
- **Endpoint**: `POST /api/v1/vves/{vve_id}/meetings/{meeting_id}/decisions/extract`
- **Schema's**: `DecisionExtractRequest`, `DecisionExtractResponse`
- **Validatie**: Alleen niet-eerder-geëxtraheerde besluiten worden verwerkt

### Frontend (nieuw geïmplementeerd)
- **Pagina**: `frontend/src/app/dashboard/beheerder/besluiten/page.tsx`
- **Component(en)**:
  - "Extraheren uit vergadering" button in header
  - Extraction modal met vergaderingenlijst
  - Selectie van vergadering
  - Extractie met bevestiging toast
- **API Client**: `extractDecisions(vveId, meetingId, decisionIds?)` toegevoegd aan `api.ts`
- **Types**: `DecisionExtractResponse` toegevoegd aan `types/index.ts`

## UX/UI Compliance

| Vereiste | Status | Toelichting |
|----------|--------|-------------|
| One-click extractie na voltooiing notulen | ✅ | Button in header, modal voor selectie |
| Preview van te extraheren besluiten | ⚠️ | Vergaderingenlijst getoond, besluitenpreview TODO |
| Bevestiging toast | ✅ | Success toast met aantal geëxtraheerde besluiten |

## Bekende Beperkingen
1. VVE ID is momenteel hardcoded als demo-vve-id
2. Preview van individuele besluiten voor extractie nog niet geïmplementeerd
3. Besluitenregister pagina gebruikt nog mock data

## Bronverwijzingen
- [STORY-076 Definitie](../stories/STORY-076-besluiten-extraheren-register.md)
- [FEAT-034 Notulen & Besluiten](../features/FEAT-034-notulen-besluiten.md)
- [FEAT-037 Besluiten Register](../features/FEAT-037-besluiten-register.md)
