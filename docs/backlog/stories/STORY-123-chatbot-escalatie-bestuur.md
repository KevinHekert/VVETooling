# STORY-123: Chatbot escalatie naar bestuur

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.1
- **Prioriteit**: Could (Horizon 3)
- **Geneste nummering**: 17.1.2

## User story
Als **eigenaar** wil ik mijn vraag kunnen escaleren naar het bestuur als de chatbot geen goed antwoord geeft, zodat ik alsnog hulp krijg.

## Acceptatiecriteria
- Escalatie knop in chat interface ✅
- Vraag en chat-historie worden doorgestuurd ✅
- Bestuur ontvangt notificatie (via escalation_status tracking) ✅
- Eigenaar krijgt bevestiging van escalatie ✅

## UX/UI aandachtspunten
- Duidelijke escalatie optie ✅
- Bevestiging na escalatie ✅
- Response time indicatie ✅

## Implementatie
- Backend: `app/api/routes/chatbot.py` (escalate endpoint)
- Backend: `app/schemas/chatbot.py` (ChatEscalationRequest, ChatEscalationResponse)
- Frontend: `components/ui/Chatbot.tsx` (escalation dialog)

## Afhankelijkheden / blockers
- FEAT-038
- STORY-082

## Bronverwijzingen
- [docs/backlog/features/FEAT-038-ai-chatbot.md](../features/FEAT-038-ai-chatbot.md)
