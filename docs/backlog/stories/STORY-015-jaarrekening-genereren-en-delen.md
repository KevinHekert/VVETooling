# STORY-015: Jaarrekening genereren en delen

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.1
- **Prioriteit**: Should (Horizon 2)
- **Geneste nummering**: 3.1.1

## User story
Als **bestuurslid** wil ik de jaarrekening kunnen genereren en delen vanuit hetzelfde documenten- en financieel menu, zodat alle rollen in een consistent raamwerk blijven en toekomstige secties eenvoudig uitbreidbaar zijn.

## Acceptatiecriteria
- Jaarrekening is beschikbaar via het financieel menu en kan als PDF worden geëxporteerd.
- Layout hergebruikt het tabel/kaart-raamwerk van begroting en rapportage.
- Bewoners krijgen een read-only samenvatting; bestuur volledige versie; beheerder kan regenereren.
- Geen blocking modals; inline feedback bij generatie/export.

## UX/UI aandachtspunten
- Gebruik lists/tables componenten en duidelijke sectiekoppen.
- Exportknop in de action-bar, inline statusmeldingen.
- Mobile: samenvattingssecties, geen volledige tabellen.

## Afhankelijkheden / blockers
- FEAT-005
- FEAT-013 (export)
- EPIC-003

## Bronverwijzingen
- [docs/backlog/features/FEAT-005-jaarrekening-rapportage.md](../features/FEAT-005-jaarrekening-rapportage.md)
- [docs/ui/components/lists-tables.md](../../ui/components/lists-tables.md)
