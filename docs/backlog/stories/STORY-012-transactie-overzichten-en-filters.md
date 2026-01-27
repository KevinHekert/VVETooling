# STORY-012: Transactie-overzicht met filters en widgets

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.1
- **Prioriteit**: Must (Horizon 1)
- **Geneste nummering**: 1.1.3

## User story
Als **beheerder** wil ik uitgebreide filter- en widgetmogelijkheden op het transactie-dashboard, zodat ik snel inzicht heb in saldi, trends en afwijkingen zonder aparte exports.

## Acceptatiecriteria
- Dashboard ondersteunt filters op periode, categorie, reserve en status; resultaten laden <2s.
- Widgets voor saldo, openstaand bedrag en recente afwijkingen zijn modulair en kunnen worden toegevoegd/verborgen.
- Exporteerbare tabel volgt hetzelfde lists/tables-raamwerk; inline feedback bij fouten.
- Read-only rollen zien enkel view-widgets (geen bewerken/verwijderen knoppen).

## UX/UI aandachtspunten
- Grid/kaart-indeling consistent met bestaande financieel dashboard.
- Compacte mobiele view met samenvattingskaarten; filters inklapbaar.
- Toasts/inline feedback, geen blocking modals.

## Afhankelijkheden / blockers
- FEAT-001
- FEAT-009
- FEAT-010

## Bronverwijzingen
- [docs/backlog/features/FEAT-001-transactiebeheer.md](../features/FEAT-001-transactiebeheer.md)
- [docs/backlog/features/FEAT-009-rol-specifieke-dashboards.md](../features/FEAT-009-rol-specifieke-dashboards.md)
- [docs/ui/components/lists-tables.md](../../ui/components/lists-tables.md)
