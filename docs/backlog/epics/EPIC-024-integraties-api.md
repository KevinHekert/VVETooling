# EPIC-024: Integraties & API

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: Draft
- **Versie**: 0.1

## Doel / waarde
VVE Tooling integreert met externe systemen via API's en webhooks, zodat data kan worden uitgewisseld met boekhoudpakketten, banken, beheerderssoftware en overheidsregisters (KvK, Kadaster).

## Scope
- REST API voor externe integraties
- Webhook ondersteuning voor events
- Bank koppeling (MT940, CAMT.053)
- Boekhoudpakket integratie (Exact, Twinq)
- KvK en Kadaster registratie-export

## Out-of-scope
- GraphQL API
- Real-time streaming API's
- Custom connector development

## Afhankelijkheden
- EPIC-001 (financieel overzicht)
- EPIC-005 (veiligheid & compliance)
- EPIC-021 (betalingen & incasso)

## Risico's
- **T-24 Externe afhankelijkheden** van derde partij API's
- **T-25 Security** bij API authenticatie en data-uitwisseling

## Open vragen
- **DQ-035**: Welke boekhoudpakketten worden prioritair ondersteund? (Owner: PM)
- **DQ-036**: Hoe wordt API rate limiting en throttling geïmplementeerd? (Owner: Architect)

## Acceptatie (epic-niveau)
- REST API is beschikbaar met volledige documentatie
- Bank statements kunnen worden geïmporteerd
- Minimaal één boekhoudpakket is geïntegreerd
- API authenticatie via OAuth2/JWT werkt correct

## Bronverwijzingen
- [docs/architecture/decisions/ADR-002-api-design-patterns.md](../../architecture/decisions/ADR-002-api-design-patterns.md)
- [docs/marktonderzoek/08-as-financiele-administratie.md](../../marktonderzoek/08-as-financiele-administratie.md)
