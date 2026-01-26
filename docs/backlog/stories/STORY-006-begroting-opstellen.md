# STORY-006: Begroting opstellen en exporteren

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Product Owner
- **Status**: Ready
- **Versie**: 1.0
- **Prioriteit**: Must (Horizon 1)

## User story
Als **beheerder** wil ik een begroting kunnen opstellen, opslaan en exporteren vanuit het financieel menu, zodat het bestuur actuele plannen kan beoordelen en later uitbreidingen in dezelfde weergave kunnen landen.

## Acceptatiecriteria
- Financieel menu bevat een **Begroting**-item binnen het bestaande navigatieraamwerk.
- Begroting kan worden opgesteld, opgeslagen en later heropend vanuit hetzelfde scherm.
- Export naar PDF is beschikbaar vanuit de pagina (inline actie, geen modals).
- Inline validatie en performance <2s op datasets tot het MVP-volume.
- Layout gebruikt hetzelfde tabel/kaart-raamwerk als jaarrekening, zodat toekomstige regels/sekties eenvoudig zijn toe te voegen.

## UX/UI aandachtspunten
- Hergebruik van bestaand financieel dashboard en table/kaart componenten.
- Inline hints bij velden (geen modals of blocking alerts).
- Beschikbaar in desktop en tablet; mobiele view toont alleen samenvattingen.

## Afhankelijkheden / blockers
- FEAT-006
- FEAT-001
- EPIC-003

## Bronverwijzingen
- [docs/backlog/features/FEAT-006-begroting.md](../features/FEAT-006-begroting.md)
- [docs/backlog/epics/EPIC-003-jaarrekening-begroting.md](../epics/EPIC-003-jaarrekening-begroting.md)
- [docs/ui/components/lists-tables.md](../../ui/components/lists-tables.md)
