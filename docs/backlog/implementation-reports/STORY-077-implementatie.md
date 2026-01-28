# Implementatierapport STORY-077: Actiepunten toewijzen vanuit notulen

## Documentinformatie
- **Story ID**: STORY-077
- **Datum implementatie**: 2026-01-28
- **Implementatie door**: AI Development Agent
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0

## User Story (Origineel)
Als **secretaris** wil ik actiepunten uit de notulen kunnen omzetten naar taken met verantwoordelijke en deadline, zodat opvolging wordt geborgd.

## Acceptatiecriteria Status

| # | Criterium | Status | Implementatie Details |
|---|-----------|--------|----------------------|
| 1 | Gemarkeerde actiepunten worden omgezet naar taken | ✅ | Create form in action items modal |
| 2 | Verantwoordelijke kan worden toegewezen | ⚠️ | Backend support, UI TODO |
| 3 | Deadline kan worden ingesteld | ✅ | Date picker in create form |
| 4 | Link naar originele notulen behouden | ✅ | meeting_id koppeling behouden |

## Technische Implementatie

### Backend (reeds geïmplementeerd)
- **Endpoint**: `POST /api/v1/vves/{vve_id}/meetings/{meeting_id}/decisions`
- **Endpoint**: `GET /api/v1/vves/{vve_id}/meetings/{meeting_id}/decisions?type=actiepunt`
- **Schema's**: `DecisionCreate`, `MeetingDecision`

### Frontend (nieuw geïmplementeerd)
- **Pagina**: `frontend/src/app/dashboard/beheerder/alv/page.tsx`
- **Component(en)**:
  - "Actiepunten" button per vergadering
  - Action items modal met:
    - Create form (titel, beschrijving, deadline)
    - Lijst van bestaande actiepunten
    - Status indicatie (open/afgerond)
    - Type badges
- **State**: `showActionItemModal`, `actionItems`, `newActionItem`, `isSubmittingActionItem`
- **Functions**: `openActionItemModal`, `closeActionItemModal`, `loadActionItems`, `handleCreateActionItem`

## UX/UI Compliance

| Vereiste | Status | Toelichting |
|----------|--------|-------------|
| Inline verantwoordelijke toewijzing | ⚠️ | Backend ondersteunt, UI TODO |
| Datum picker voor deadline | ✅ | HTML5 date input |
| Notificatie naar verantwoordelijke | ⚠️ | Backend infrastructure needed |

## Bekende Beperkingen
1. VVE ID is momenteel hardcoded als demo-vve-id
2. Verantwoordelijke toewijzing UI nog niet geïmplementeerd (backend support aanwezig)
3. Notificatie naar verantwoordelijke vereist email infrastructure

## Bronverwijzingen
- [STORY-077 Definitie](../stories/STORY-077-actiepunten-toewijzen-notulen.md)
- [FEAT-034 Notulen & Besluiten](../features/FEAT-034-notulen-besluiten.md)
- [FEAT-031 Onderhoudstaak Beheer](../features/FEAT-031-onderhoudstaak-beheer.md)
