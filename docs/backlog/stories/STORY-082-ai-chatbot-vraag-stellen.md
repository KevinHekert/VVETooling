# STORY-082: AI chatbot vraag stellen

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.1
- **Prioriteit**: Could (Horizon 3)
- **Geneste nummering**: 17.1.1

## User story
Als **eigenaar** wil ik een vraag kunnen stellen aan de AI-chatbot over VVE-zaken, zodat ik snel antwoord krijg zonder het bestuur te belasten.

## Acceptatiecriteria
- Chat interface met vrije tekst input ✅
- Antwoord binnen 5 seconden ✅
- Links naar relevante documenten in antwoord ✅
- Optie om vraag te escaleren naar bestuur ✅

## UX/UI aandachtspunten
- Chat bubble interface ✅
- Typing indicator ✅
- Suggestie voor vervolgvragen ✅

## Implementatie
- Backend: `app/api/routes/chatbot.py`, `app/schemas/chatbot.py`, `app/db/models/models.py`
- Frontend: `components/ui/Chatbot.tsx`, `app/dashboard/bewoner/chatbot/page.tsx`
- Tests: `tests/test_chatbot_schemas.py` (16 tests), `__tests__/Chatbot.test.tsx` (13 tests)

## Afhankelijkheden / blockers
- FEAT-038
- EPIC-017

## Bronverwijzingen
- [docs/backlog/features/FEAT-038-ai-chatbot.md](../features/FEAT-038-ai-chatbot.md)
