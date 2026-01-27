# FEAT-018: Reservefonds prognoses

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: Draft
- **Versie**: 0.1

## Functioneel doel
Bestuur kan prognoses van groei/afname van het reservefonds inzien met scenario’s en trends.

## UX-impact
- Dashboard kaarten met prognose per reserve.
- Grafiek met trend en scenario-keuze (basis/optimistisch/conservatief).
- Exporteerbare prognose tabel.

## Constraints
- Read-only voor bewoners.
- Performance: grafiek laadt <2s.
- Inline toelichting bij scenario-keuze.

## Acceptatiecriteria
- Bestuur kan prognose per reserve zien met scenario-selectie.
- Trendgrafiek toont effect op saldo over tijd.
- Prognose kan worden geëxporteerd.

## Afhankelijkheden
- FEAT-002
- FEAT-006
- STORY-026
- STORY-033
- STORY-039
- STORY-040

## Bronverwijzingen
- [docs/backlog/features/FEAT-002-reserves-overzicht.md](../features/FEAT-002-reserves-overzicht.md)
- [docs/backlog/stories/STORY-026-reserves-scenario-planning.md](../stories/STORY-026-reserves-scenario-planning.md)
- [docs/ux/design/04-bestuur-flows.md](../../ux/design/04-bestuur-flows.md)
