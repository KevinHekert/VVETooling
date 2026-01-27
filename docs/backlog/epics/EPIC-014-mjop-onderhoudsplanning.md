# EPIC-014: MJOP & Onderhoudsplanning

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: Draft
- **Versie**: 0.1

## Doel / waarde
VVE's kunnen hun Meerjarenonderhoudsplan (MJOP) digitaal beheren en bewaken, met overzicht van geplande onderhoudsmomenten, kostenramingen en reserveberekeningen, zodat proactief onderhoud mogelijk is en verrassingen worden voorkomen.

## Scope
- Import en beheer van MJOP-gegevens
- Timeline view van geplande onderhoudsmomenten
- Kostenraming en reserveberekening per jaar
- Status tracking van onderhoudstaken
- Koppeling met leveranciers en offertes

## Out-of-scope
- Volledige MJOP opstelling door inspectie (externe service)
- 3D/BIM visualisatie van gebouw
- AI prioritering van onderhoud

## Afhankelijkheden
- EPIC-010 (serviceverzoeken & leveranciers)
- EPIC-001 (financieel overzicht)
- EPIC-013 (contractbeheer)

## Risico's
- **T-04 Complexiteit** bij integratie met diverse MJOP-formaten
- **T-08 Accuraatheid** van kostenramingen en planningen

## Open vragen
- **DQ-015**: Welke MJOP-formaten moeten worden ondersteund voor import? (Owner: Architect)
- **DQ-016**: Hoe worden afwijkingen van het MJOP geregistreerd? (Owner: PM)

## Acceptatie (epic-niveau)
- Gebruiker kan MJOP-data importeren of handmatig invoeren
- Systeem toont timeline met geplande onderhoudsmomenten
- Reserveberekening is beschikbaar per jaar
- Onderhoudstaken kunnen worden gevolgd en afgerond

## Bronverwijzingen
- [docs/marktonderzoek/07-as-onderhoud.md](../../marktonderzoek/07-as-onderhoud.md)
- [docs/backlog/epics/EPIC-010-serviceverzoeken-en-leveranciers.md](EPIC-010-serviceverzoeken-en-leveranciers.md)
