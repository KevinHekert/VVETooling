# EPIC-002: VVE-specifieke splitsingen beheren

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: Review
- **Versie**: 1.1

## Doel / waarde
Automatische en correcte splitsingsberekeningen voor contributies, zodat penningmeesters geen handmatige Excel-formules meer nodig hebben.

## Scope
- Splitsingssleutel vastleggen per eigenaar.
- Automatische berekening contributies.
- Overzichten per eigenaar.
- Herberekening bij mutaties (wisseling eigenaar of percentage).

## Out-of-scope
- Meerdere splitsingssleutels per VVE (roadmap).
- Complexe formules buiten simpele percentages.

## Afhankelijkheden
- EPIC-001 (transactie- en overzichtsmodel).
- EPIC-005 (compliance, audit logging).
- DQ-002 (juridische validatie VVE-berekeningen).

## Risico’s
- **T-02 VVE-berekeningen incorrect** (kritiek) → expert validatie vereist.

## Open vragen
- **DQ-002**: Edge cases in VVE wetgeving/boekhouding.
- **DQ-005**: Real-time vs near-real-time verwachtingen voor financiële inzichten.

## Acceptatie (epic-niveau)
- Splitsingssleutel kan worden ingesteld en valideert naar 100%.
- Contributies worden automatisch berekend en inzichtelijk gemaakt.
- Transparantie in berekening voor controle door penningmeester.

## Bronverwijzingen
- [docs/backlog/epics/01-mvp-epics.md](01-mvp-epics.md) (EP-002)
- [docs/architecture/risks/01-risicos-complexiteit-afhankelijkheden.md](../../architecture/risks/01-risicos-complexiteit-afhankelijkheden.md)
- [docs/ux/design/03-beheerder-flows.md](../../ux/design/03-beheerder-flows.md)
