# STORY-028: Mobile-first reserves dashboard

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.1
- **Prioriteit**: Must (Horizon 1)
- **Geneste nummering**: 1.2.4

## User story
Als **bewoner** wil ik op mobiel een compact reserves-overzicht zien met alleen relevante saldi, zodat het raamwerk uitbreidbaar blijft zonder overvolle schermen.

## Acceptatiecriteria
- Mobile view toont beperkte kaartjes (reserve, saldo, datum); geen tabellen.
- Read-only, geen bewerkknoppen; inline toasts bij errors.
- Zelfde navigatie-item als desktop, maar responsive layout.
- Laadt <2s met caching.

## UX/UI aandachtspunten
- Gebruik bestaande kaartcomponenten met grote tap targets.
- Prioriteer typografie voor leesbaarheid; actieknoppen alleen indien toegestaan.
- Breidbaar met extra kaarten zonder redesign.

## Afhankelijkheden / blockers
- FEAT-002
- FEAT-009

## Bronverwijzingen
- [docs/backlog/features/FEAT-002-reserves-overzicht.md](../features/FEAT-002-reserves-overzicht.md)
- [docs/ux/design/02-bewoner-flows.md](../../ux/design/02-bewoner-flows.md)
