# EPIC-009: Multi-user toegang & rollen

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: Review
- **Versie**: 1.1

## Doel / waarde
Bestuursleden en bewoners kunnen veilig inloggen en krijgen rol-specifieke toegang tot het platform.

## Scope
- Authenticatie en uitnodigingen.
- Rollen en role-based UI.
- Bewoners read-only toegang tot eigen data.
- Externe aannemersaccounts voor toegewezen onderhoudstickets.

## Out-of-scope
- Multi-VVE accounts (roadmap).

## Afhankelijkheden
- ADR-001 (auth), ADR-003 (multi-tenancy).
- EPIC-005 (security/compliance).

## Risico’s
- **T-01 Data isolation** bij rolpermissies.

## Open vragen
- **DQ-008**: Offline functionaliteit (PWA) gewenst voor bewoners?

## Acceptatie (epic-niveau)
- Bestuursleden en bewoners kunnen inloggen en dashboard zien.
- Rolgebaseerde UI is consistent met UX constraints.

## Bronverwijzingen
- [docs/backlog/epics/01-mvp-epics.md](01-mvp-epics.md) (EP-009)
- [docs/ux/design/02-bewoner-flows.md](../../ux/design/02-bewoner-flows.md)
- [docs/ux/design/04-bestuur-flows.md](../../ux/design/04-bestuur-flows.md)
- [docs/architecture/constraints/01-randvoorwaarden-ux-development.md](../../architecture/constraints/01-randvoorwaarden-ux-development.md)
