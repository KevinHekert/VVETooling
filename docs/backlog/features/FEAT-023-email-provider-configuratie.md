# FEAT-023: E-mail Provider Configuratie

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ⬜ Backlog
- **Versie**: 1.0
- **Geneste nummering**: 12.1

## Functioneel doel
Beheerders kunnen via de Settings-pagina de gewenste e-mail provider selecteren en configureren. De keuze geldt per omgeving of tenant, waardoor verschillende VVE's of deployments hun voorkeursProvider kunnen gebruiken.

## UX-impact
- Settings pagina met sectie "E-mail configuratie".
- Dropdown/selectie voor provider keuze (Mailchimp, Amazon SES, SendGrid).
- Provider-specifieke configuratievelden (API key, region, sender address).
- Test-verzending knop om configuratie te valideren.
- Status indicator (geconfigureerd/niet geconfigureerd/fout).

## Constraints
- API credentials mogen niet zichtbaar zijn na opslaan (masked input).
- Wijziging van provider vereist bevestiging om onbedoelde wijzigingen te voorkomen.
- Minimaal één sender e-mailadres moet geconfigureerd zijn.
- Provider moet gevalideerd worden voordat configuratie actief wordt.

## Acceptatiecriteria
- Beheerder kan provider selecteren uit ondersteunde opties.
- Per provider kunnen de vereiste credentials worden ingevoerd.
- Test e-mail kan worden verstuurd om configuratie te valideren.
- Bij succesvolle test wordt configuratie actief.
- Bij mislukte test wordt foutmelding getoond en blijft vorige configuratie actief.
- Credentials worden encrypted opgeslagen in de database.

## Afhankelijkheden
- EPIC-012
- FEAT-010 (RBAC - alleen beheerder mag configureren)
- EPIC-005 (security voor credential opslag)

## Bronverwijzingen
- [docs/backlog/epics/EPIC-012-email-integraties.md](../epics/EPIC-012-email-integraties.md)
- [docs/architecture/decisions/ADR-001-authentication-authorization.md](../../architecture/decisions/ADR-001-authentication-authorization.md)
