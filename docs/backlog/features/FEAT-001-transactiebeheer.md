# FEAT-001: Transactiebeheer

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Product Owner
- **Status**: Ready
- **Versie**: 1.0

## Functioneel doel
Penningmeester kan inkomsten en uitgaven registreren, categoriseren en beheren.

## UX-impact
- Beheerder flow: transactietabel met CRUD acties.
- Feedback via toast en inline validation (geen errorbox).

## Constraints
- Performance budget <2s.
- Tenant-isolatie en RBAC.

## Acceptatiecriteria
- Transacties kunnen worden toegevoegd/bewerkt/verwijderd.
- Filters op periode, categorie, reserve.

## Afhankelijkheden
- EPIC-001
- EPIC-009 (auth/rollen)

## Bronverwijzingen
- [docs/backlog/epics/EPIC-001-financieel-overzicht-beheren.md](../epics/EPIC-001-financieel-overzicht-beheren.md)
- [docs/ux/design/03-beheerder-flows.md](../../ux/design/03-beheerder-flows.md)
- [docs/ui/components/feedback-notifications.md](../../ui/components/feedback-notifications.md)
