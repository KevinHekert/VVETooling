# STORY-001: Transactie toevoegen

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.1
- **Prioriteit**: Must (Horizon 1)
- **Geneste nummering**: 1.1.1

## User story
Als **penningmeester** wil ik een transactie toevoegen met bedrag, datum en categorie, zodat mijn financieel overzicht actueel blijft.

## Acceptatiecriteria
- Formulier bevat datum, bedrag, categorie, reserve en beschrijving.
- Validatie gebeurt inline en geeft duidelijke feedback.
- Succesmelding verschijnt als toast (auto-dismiss).

## UX/UI aandachtspunten
- Gebruik form controls en feedback componenten.
- Geen errorboxen of modals voor validatie.

## Afhankelijkheden / blockers
- FEAT-001
- FEAT-010 (auth)

## Bronverwijzingen
- [docs/backlog/features/FEAT-001-transactiebeheer.md](../features/FEAT-001-transactiebeheer.md)
- [docs/ui/components/form-controls.md](../../ui/components/form-controls.md)
- [docs/ui/components/feedback-notifications.md](../../ui/components/feedback-notifications.md)
