# STORY-005: Rol-gebaseerd inloggen

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.1
- **Geneste nummering**: 5.1.1

## User story
Als **gebruiker** wil ik veilig kunnen inloggen en direct mijn rol-specifieke dashboard zien, zodat ik zonder extra stappen kan starten.

## Acceptatiecriteria
- Login flow ondersteunt rol-based access.
- Onjuiste inloggegevens tonen inline errors (geen errorbox).
- Redirect naar juiste dashboard per rol.

## UX/UI aandachtspunten
- Gebruik UX flows voor bewoners/bestuur/beheerder.
- Feedback via toast of inline.

## Afhankelijkheden / blockers
- FEAT-010
- FEAT-009

## Bronverwijzingen
- [docs/backlog/features/FEAT-010-auth-rbac.md](../features/FEAT-010-auth-rbac.md)
- [docs/ux/design/02-bewoner-flows.md](../../ux/design/02-bewoner-flows.md)
- [docs/ux/design/04-bestuur-flows.md](../../ux/design/04-bestuur-flows.md)
