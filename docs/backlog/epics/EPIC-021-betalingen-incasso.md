# EPIC-021: Betalingen & Incasso

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: Draft
- **Versie**: 0.1

## Doel / waarde
VVE's kunnen contributies automatisch innen via diverse betaalmethoden, met geautomatiseerde herinneringen en incasso-workflows, zodat betalingsachterstanden worden verminderd en administratieve last wordt verlaagd.

## Scope
- Automatische contributie-inning via iDEAL, SEPA-incasso
- Betalingsherinneringen en aanmaningen
- Incasso-workflow voor wanbetalers
- Betalingsstatus per eigenaar
- Koppeling met boekhoudmodule

## Out-of-scope
- Juridisch incasso via derden
- Conservatoir beslag procedures
- Internationale betalingen

## Afhankelijkheden
- EPIC-001 (financieel overzicht)
- EPIC-008 (betaling & abonnement)
- EPIC-011 (correspondentie & sjablonen)

## Risico's
- **T-18 Payment provider** integratie en kosten
- **T-19 Wanbetaling** escalatie vereist zorgvuldig proces

## Open vragen
- **DQ-029**: Welke payment providers worden ondersteund (Mollie, Stripe, etc.)? (Owner: Architect)
- **DQ-030**: Hoe wordt de incasso-workflow juridisch gecompliant gehouden? (Owner: Legal)

## Acceptatie (epic-niveau)
- Contributies kunnen automatisch worden geïnd
- Betalingsherinneringen worden automatisch verstuurd
- Incasso-workflow is beschikbaar voor wanbetalers
- Betalingsstatus per eigenaar is inzichtelijk

## Bronverwijzingen
- [docs/marktonderzoek/05-as-contributie.md](../../marktonderzoek/05-as-contributie.md)
- [docs/backlog/epics/EPIC-008-betaling-en-abonnement.md](EPIC-008-betaling-en-abonnement.md)
