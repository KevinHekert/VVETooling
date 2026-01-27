# EPIC-017: AI-Assistent

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: Draft
- **Versie**: 0.1

## Doel / waarde
VVE gebruikers krijgen AI-ondersteuning voor veelgestelde vragen, document analyse en slimme suggesties, zodat tijd wordt bespaard en complexe taken worden vereenvoudigd.

## Scope
- AI-chatbot voor FAQ's van eigenaren
- Automatische email categorisatie en routering
- Document analyse voor facturen en contracten
- Slimme samenvattingen van notulen en financiën
- Predictive alerts voor issues

## Out-of-scope
- Volledige autonome besluitvorming door AI
- Juridisch advies door AI
- Real-time vertaling van vergaderingen

## Afhankelijkheden
- EPIC-005 (veiligheid & compliance)
- EPIC-006 (documenten delen)
- EPIC-012 (email integraties)

## Risico's
- **T-11 AI accuracy** moet betrouwbaar zijn voor gebruikersvertrouwen
- **T-06 Privacy/AVG** bij verwerking van gevoelige data door AI
- **T-12 Kosten** van AI-services kunnen oplopen

## Open vragen
- **DQ-021**: Welke AI-provider wordt gebruikt (OpenAI, Azure, eigen model)? (Owner: Architect)
- **DQ-022**: Hoe wordt AI-training data privacy-safe gehouden? (Owner: Security)

## Acceptatie (epic-niveau)
- AI-chatbot beantwoordt veelgestelde vragen van eigenaren
- Email wordt automatisch gecategoriseerd en gerouteerd
- Documenten worden geanalyseerd voor data-extractie
- Gebruikers ontvangen slimme alerts en suggesties

## Bronverwijzingen
- [docs/marktonderzoek/13-markt-kansen.md](../../marktonderzoek/13-markt-kansen.md)
- [docs/architecture/constraints/01-randvoorwaarden-ux-development.md](../../architecture/constraints/01-randvoorwaarden-ux-development.md)
