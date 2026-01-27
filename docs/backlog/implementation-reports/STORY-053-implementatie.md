# Implementatierapport STORY-053: E-mail verzenden via geconfigureerde provider

## Documentinformatie
- **Story ID**: STORY-053
- **Datum implementatie**: 2026-01-27
- **Implementatie door**: GitHub Copilot Coding Agent
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0

## User Story (Origineel)
Als **beheerder** wil ik e-mails kunnen versturen via de geconfigureerde provider, zodat correspondentie en notificaties automatisch via de juiste dienst worden verzonden.

## Acceptatiecriteria Status

| # | Criterium | Status | Implementatie Details |
|---|-----------|--------|----------------------|
| 1 | E-mail API endpoint accepteert verzendverzoeken | ✅ | `POST /api/v1/email/send` |
| 2 | Verzoeken bevatten: to, subject, body, cc, bcc, replyTo, attachments | ✅ | `EmailSendRequest` schema |
| 3 | Provider wordt automatisch geselecteerd op basis van tenant config | ✅ | Factory haalt config op per VVE |
| 4 | Bij ontbrekende configuratie wordt duidelijke foutmelding geretourneerd | ✅ | 400 Bad Request met melding |
| 5 | Verzendstatus wordt bijgewerkt: queued → sending → sent/failed | ✅ | `EmailStatus` enum in response |
| 6 | Caller kan status opvragen via messageId | ✅ | `GET /api/v1/email/status/{message_id}` |
| 7 | Bestaande functionaliteit kan API aanroepen | ✅ | REST API beschikbaar |

## Technische Implementatie

### Backend
- **Endpoint(s)**: 
  - `POST /api/v1/email/send` - Verzend email
  - `GET /api/v1/email/status/{message_id}` - Status opvragen
- **Bestand(en)**: `backend/app/api/routes/email.py`
- **Schema(s)**: `EmailSendRequest`, `EmailSendResponse`, `EmailStatusQuery`, `EmailStatusResponse`
- **Autorisatie**: `RoleChecker([UserRole.BEHEERDER, UserRole.BESTUURSLID])`

### Request/Response Schemas

#### EmailSendRequest
```python
class EmailSendRequest(BaseModel):
    to: list[EmailStr]           # Verplicht, minimaal 1
    subject: str                  # Verplicht, max 998 chars
    body: str                     # Verplicht
    cc: list[EmailStr] = []
    bcc: list[EmailStr] = []
    reply_to: EmailStr | None = None
    is_html: bool = True
    attachments: list[AttachmentInput] = []
    tags: list[str] = []
```

#### EmailSendResponse
```python
class EmailSendResponse(BaseModel):
    success: bool
    message_id: str | None
    status: EmailStatus           # queued, sending, sent, failed, rejected, bounced
    error_message: str | None
    error_code: str | None
    provider: EmailProviderType | None
    queued_at: datetime
```

### Flow
1. Valideer request data
2. Haal VVE email configuratie op
3. Controleer of configuratie actief is
4. Maak provider instance via factory
5. Converteer attachments van base64
6. Bouw EmailOptions object
7. Roep provider.send_email() aan
8. Log resultaat (STORY-054)
9. Retourneer response met status

## Tests

### Backend Tests
- Onderdeel van `test_email_providers.py`:
  - Factory tests valideren provider creatie
  - Schema tests valideren request/response structuur

## UX/UI Compliance

| Vereiste | Status | Toelichting |
|----------|--------|-------------|
| Toast bij handmatige verzending | ✅ | Frontend toont status toasts |
| Status update in UI | ✅ | Polling op message_id mogelijk |
| Error toast bij falen met "Opnieuw proberen" | ✅ | Error response bevat details voor retry |

## Bekende Beperkingen
1. Emails worden synchroon verzonden (geen echte queue)
2. Geen echte background job processing

## Openstaande Items
1. Async queue implementatie (Celery of similar)
2. Retry mechanisme voor failed emails
3. Bulk sending optimalisatie
4. Rate limiting per tenant

## Bronverwijzingen
- [STORY-053 Definitie](../stories/STORY-053-email-verzenden-via-provider.md)
- [FEAT-025 Email Verzending API](../features/FEAT-025-email-verzending-api.md)
