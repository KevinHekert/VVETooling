# STORY-002: Splitsingssleutel valideren

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.1
- **Geneste nummering**: 2.1.1

## User story
Als **penningmeester** wil ik dat de splitsingssleutel automatisch valideert op 100%, zodat ik zeker weet dat de berekening klopt.

## Acceptatiecriteria
- Systeem toont inline waarschuwing als totaal ≠ 100%.
- Opslaan is pas mogelijk bij 100% totaal.
- Heldere uitleg van fout en gewenste waarde.

## UX/UI aandachtspunten
- Inline statusbericht bij de tabel.
- Geen blokkerende errorbox.

## Afhankelijkheden / blockers
- FEAT-003

## Bronverwijzingen
- [docs/backlog/features/FEAT-003-splitsingssleutel.md](../features/FEAT-003-splitsingssleutel.md)
- [docs/ui/components/feedback-notifications.md](../../ui/components/feedback-notifications.md)
