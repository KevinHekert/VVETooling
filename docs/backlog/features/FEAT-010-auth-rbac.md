# FEAT-010: Authenticatie & RBAC

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.1
- **Geneste nummering**: 5.1

## Functioneel doel
Gebruikers kunnen veilig inloggen en krijgen rolgebaseerde toegang.

## UX-impact
- Login flows per rol.
- Duidelijke feedback bij login errors (inline).

## Constraints
- ADR-001 authentication + RBAC.
- Geen errorboxen; toast/inline.

## Acceptatiecriteria
- Login werkt met role-based access.
- Access denied meldingen zijn inline/toast.

## Afhankelijkheden
- EPIC-009
- EPIC-005

## Bronverwijzingen
- [docs/architecture/decisions/ADR-001-authentication-authorization.md](../../architecture/decisions/ADR-001-authentication-authorization.md)
- [docs/ux/design/02-bewoner-flows.md](../../ux/design/02-bewoner-flows.md)
