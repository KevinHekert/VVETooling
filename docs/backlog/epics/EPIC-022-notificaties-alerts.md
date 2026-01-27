# EPIC-022: Notificaties & Alerts

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: Draft
- **Versie**: 0.1

## Doel / waarde
Gebruikers ontvangen tijdige en relevante notificaties via meerdere kanalen (app, email, SMS), zodat belangrijke gebeurtenissen en deadlines niet worden gemist en engagement wordt verhoogd.

## Scope
- Push notificaties via app en browser
- Email notificaties met voorkeuren
- SMS notificaties voor urgente zaken
- Notificatie-instellingen per gebruiker
- Samenvattingen en digests

## Out-of-scope
- WhatsApp integratie
- Voice calls/alerts
- Chatbot notificaties

## Afhankelijkheden
- EPIC-012 (email integraties)
- EPIC-018 (eigenaren mobile app)
- EPIC-009 (multi-user toegang)

## Risico's
- **T-20 Notification fatigue** door te veel berichten
- **T-21 Deliverability** van emails en SMS

## Open vragen
- **DQ-031**: Welke SMS provider wordt geïntegreerd? (Owner: Architect)
- **DQ-032**: Wat zijn de standaard notificatie-voorkeuren per rol? (Owner: UX)

## Acceptatie (epic-niveau)
- Push notificaties werken via app en browser
- Email notificaties respecteren gebruikersvoorkeuren
- SMS is beschikbaar voor urgente notificaties
- Gebruikers kunnen notificatie-instellingen beheren

## Bronverwijzingen
- [docs/marktonderzoek/09-as-communicatie.md](../../marktonderzoek/09-as-communicatie.md)
- [docs/backlog/epics/EPIC-012-email-integraties.md](EPIC-012-email-integraties.md)
