# STORY-070: ALV agenda opstellen

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0
- **Prioriteit**: Must (Horizon 2)
- **Geneste nummering**: 15.1.2

## User story
Als **secretaris** wil ik een agenda kunnen opstellen met agendapunten en tijdsindicaties, zodat de vergadering gestructureerd verloopt.

## Acceptatiecriteria
- ✅ Agendapunten toevoegen met titel en tijdsduur
- ✅ Standaard agendapunten (opening, notulen, jaarrekening) als template
- ✅ Drag & drop voor volgorde aanpassen (omhoog/omlaag knoppen)
- ✅ Documenten koppelen per agendapunt (backend support)

## UX/UI aandachtspunten
- ✅ Intuïtieve volgorde-aanpassing (omhoog/omlaag knoppen)
- ✅ Template keuze bij start (standaard ALV agenda)
- ✅ Preview van complete agenda met totale duur

## Afhankelijkheden / blockers
- FEAT-032
- STORY-069

## Bronverwijzingen
- [docs/backlog/features/FEAT-032-alv-planning-uitnodigingen.md](../features/FEAT-032-alv-planning-uitnodigingen.md)

## Implementatie Details
- **Backend Model**: `MeetingAgendaItem` in `backend/app/db/models/models.py`
- **Backend Schemas**: `AgendaItemCreate`, `AgendaItemUpdate`, `AgendaItemResponse`, `AgendaItemReorder` in `backend/app/schemas/meeting.py`
- **Backend API Routes**: `/vves/{vve_id}/meetings/{meeting_id}/agenda` endpoints in `backend/app/api/routes/meetings.py`
- **Frontend Types**: `AgendaItem`, `AgendaItemCreate`, `AgendaItemUpdate`, `AgendaItemReorder` in `frontend/src/types/index.ts`
- **Frontend API**: Agenda methods in `frontend/src/lib/api.ts`
- **Frontend UI**: Agenda modal with reordering in `frontend/src/app/dashboard/beheerder/alv/page.tsx`
