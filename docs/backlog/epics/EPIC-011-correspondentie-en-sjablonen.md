# EPIC-011: Correspondentie & Sjablonen

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner / Sales
- **Status**: ✅ Geïmplementeerd
- **Versie**: 0.1

## Doel / waarde
Bestuur en beheerders kunnen professionele brieven en berichten genereren vanuit voorgedefinieerde sjablonen, en deze versturen via meerdere kanalen (post, email, app) naar bewoners en leveranciers. Dit bespaart tijd, zorgt voor consistente communicatie en professionaliseert de VVE-uitstraling.

## Scope
- Sjablonenbeheer: aanmaken, bewerken en categoriseren van herbruikbare templates.
- Brieven genereren met merge fields (naam, adres, bedragen, datums).
- Multi-channel verzending: email, post (PDF-export), in-app notificaties.
- Communicatie naar zowel bewoners als leveranciers.
- Verstuurde correspondentie archiveren met audit trail.

## Out-of-scope
- Fysieke postverzending via externe dienst (integratie fase 2).
- E-signing van documenten (zie EPIC-006).
- Geautomatiseerde bulk mailing campagnes.
- SMS/WhatsApp integratie (fase 2).

## Afhankelijkheden
- EPIC-009 (rollen/toegang voor wie mag sjablonen beheren).
- EPIC-006 (documenten opslag voor gegenereerde brieven).
- EPIC-010 (leverancierscommunicatie).
- EPIC-005 (AVG/compliance voor persoonsgegevens in brieven).

## Risico's
- **T-06 Privacy/AVG**: Persoonsgegevens in merge fields moeten compliant verwerkt worden.
- **T-08 Template complexiteit**: Te veel variabelen kunnen onderhoud bemoeilijken.

## Open vragen
- **DQ-013**: Welke standaard sjablonen moeten out-of-the-box beschikbaar zijn? (Owner: Sales/PM)
- **DQ-014**: Moet er een goedkeuringsworkflow zijn voor sjablonen? (Owner: PM)
- **DQ-015**: Welke externe postdiensten overwegen we voor fase 2? (Owner: Architectuur)

## Acceptatie (epic-niveau)
- Bestuur/beheerder kan sjablonen aanmaken en beheren.
- Brieven kunnen worden gegenereerd met automatische invulling van ontvangersgegevens.
- Verzending is mogelijk via minimaal email en PDF-export (voor post).
- Verstuurde correspondentie is terug te vinden in een archief.
- Communicatie kan gericht zijn aan bewoners én leveranciers.

## Bronverwijzingen
- [docs/marktonderzoek/09-as-communicatie.md](../../marktonderzoek/09-as-communicatie.md)
- [docs/ux/design/03-beheerder-flows.md](../../ux/design/03-beheerder-flows.md)
- [docs/ux/design/04-bestuur-flows.md](../../ux/design/04-bestuur-flows.md)
- [docs/backlog/epics/EPIC-006-documenten-delen.md](EPIC-006-documenten-delen.md)
