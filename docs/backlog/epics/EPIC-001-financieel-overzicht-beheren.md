# EPIC-001: Financieel overzicht beheren

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: Review
- **Versie**: 1.1

## Doel / waarde
Penningmeesters kunnen inkomsten en uitgaven efficiënt registreren en direct financieel inzicht krijgen, met minder handwerk dan Excel.

## Scope
- Transacties toevoegen, wijzigen en verwijderen.
- Categoriseren per VVE-categorie en reserve.
- Financieel overzicht met filters en basisrapportages.
- Financieel dashboard met KPI's en managementsamenvattingen.

## Out-of-scope
- Bankkoppelingen (roadmap).
- Geavanceerde forecasting/budgettering buiten MVP.

## Afhankelijkheden
- EPIC-009 (multi-user login + rollen).
- EPIC-005 (security, RBAC, audit logging).
- FEAT-011/FEAT-012 (documenten voor factuurupload optioneel in EPIC-006).

## Risico’s
- **T-01 Data isolation fout** (kritiek) → strikt tenant_id + RLS.
- **T-02 VVE-berekeningen incorrect** (hoog) → validatie vereist.

## Open vragen
- **DQ-001**: Edge cases in VVE-berekeningen en categorie-structuur.
- **DQ-012**: Werkelijke penningmeester workflow (batch vs realtime).

## Acceptatie (epic-niveau)
- Penningmeester kan transacties beheren met duidelijke feedback (toast/inline).
- Financieel overzicht geeft saldo per reserve en basisrapportage.
- Alle data is tenant-gebonden en rol-geautoriseerd.

## Bronverwijzingen
- [docs/backlog/epics/01-mvp-epics.md](01-mvp-epics.md) (EP-001)
- [docs/product/discovery/01-probleemdefinitie-productrichting.md](../../product/discovery/01-probleemdefinitie-productrichting.md)
- [docs/ux/design/03-beheerder-flows.md](../../ux/design/03-beheerder-flows.md)
- [docs/architecture/risks/01-risicos-complexiteit-afhankelijkheden.md](../../architecture/risks/01-risicos-complexiteit-afhankelijkheden.md)
