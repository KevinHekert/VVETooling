# STORY-071: ALV uitnodiging versturen

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0
- **Prioriteit**: Must (Horizon 2)
- **Geneste nummering**: 15.1.3

## User story
Als **secretaris** wil ik uitnodigingen voor de ALV kunnen versturen naar alle eigenaren met agenda en documenten, zodat iedereen tijdig is geïnformeerd.

## Acceptatiecriteria
- ✅ Email met uitnodiging en agenda wordt verstuurd
- ✅ Documenten als bijlage of link (backend support)
- ⚠️ RSVP link in email (infrastructure needed)
- ✅ Validatie dat minimaal 8 dagen voor vergadering

## UX/UI aandachtspunten
- ✅ Preview van email voor versturen
- ✅ Selectie van ontvangers (alle eigenaren)
- ✅ Bevestiging na versturen

## Afhankelijkheden / blockers
- FEAT-032
- STORY-070
- EPIC-012

## Bronverwijzingen
- [docs/backlog/features/FEAT-032-alv-planning-uitnodigingen.md](../features/FEAT-032-alv-planning-uitnodigingen.md)

## Implementatie Details
- **Backend Schemas**: `MeetingInvitationCreate`, `MeetingInvitationResponse`, `MeetingInvitationPreview` in `backend/app/schemas/meeting.py`
- **Backend API Routes**: `/vves/{vve_id}/meetings/{meeting_id}/invitation/preview` and `/invitation/send` in `backend/app/api/routes/meetings.py`
- **Frontend Types**: `MeetingInvitationCreate`, `MeetingInvitationResponse`, `MeetingInvitationPreview` in `frontend/src/types/index.ts`
- **Frontend API**: `previewInvitation`, `sendInvitation` methods in `frontend/src/lib/api.ts`
- **Frontend UI**: Invitation preview modal in `frontend/src/app/dashboard/beheerder/alv/page.tsx`
