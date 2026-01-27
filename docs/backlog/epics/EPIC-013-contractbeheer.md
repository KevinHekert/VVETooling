# EPIC-013: Contractbeheer

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: Draft
- **Versie**: 0.1

## Doel / waarde
VVE beheerders en bestuurders kunnen alle contracten centraal beheren, met automatische alerts voor opzegtermijnen en verlengingen, zodat geen belangrijke deadlines worden gemist en betere deals kunnen worden behaald.

## Scope
- Centrale registratie en opslag van alle VVE-contracten
- Automatische alerts voor opzegtermijnen en verlengingen
- Categorisatie per type dienst (energie, verzekering, onderhoud)
- Koppeling van facturen aan contracten
- Overzicht van contractwaarde en -kosten per jaar

## Out-of-scope
- Digitale handtekening workflows (fase 2)
- AI contract analyse en data extractie (fase 2)
- Aanbesteding workflow met offertevergelijking (fase 2)

## Afhankelijkheden
- EPIC-006 (documenten & opslag)
- EPIC-005 (AVG/compliance)
- EPIC-001 (financieel overzicht)

## Risico's
- **T-06 Privacy/AVG** bij opslag van contractdocumenten met persoonsgegevens
- **T-04 Complexiteit** door variatie in contracttypes en -voorwaarden

## Open vragen
- **DQ-013**: Welke standaard categorieën contracten worden ondersteund? (Owner: PM)
- **DQ-014**: Hoe worden contractwijzigingen en verlengingen geregistreerd? (Owner: Architect)

## Acceptatie (epic-niveau)
- Gebruiker kan contracten registreren met alle relevante metadata
- Systeem genereert automatisch alerts voor opzegtermijnen
- Contracten zijn doorzoekbaar en gecategoriseerd
- Financieel overzicht toont totale contractkosten per jaar

## Bronverwijzingen
- [docs/marktonderzoek/06-as-contracten.md](../../marktonderzoek/06-as-contracten.md)
- [docs/architecture/constraints/01-randvoorwaarden-ux-development.md](../../architecture/constraints/01-randvoorwaarden-ux-development.md)
