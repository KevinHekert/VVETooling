# STORY-048: E-mail provider configureren via Settings

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ⬜ Backlog
- **Versie**: 1.0
- **Prioriteit**: Must (EPIC-012)
- **Geneste nummering**: 12.1.1

## User story
Als **beheerder** wil ik de e-mail provider kunnen configureren via de Settings pagina, zodat ik kan bepalen welke externe dienst wordt gebruikt voor e-mailverzending in mijn VVE.

## Acceptatiecriteria
- Settings pagina bevat sectie "E-mail configuratie".
- Dropdown toont beschikbare providers: Mailchimp, Amazon SES, SendGrid.
- Bij selectie van provider worden provider-specifieke velden getoond:
  - Mailchimp: API key, sender e-mail
  - Amazon SES: Access Key ID, Secret Access Key, Region, sender e-mail
  - SendGrid: API key, sender e-mail
- Credentials worden gemaskeerd weergegeven na opslaan (alleen laatste 4 karakters zichtbaar).
- "Opslaan" knop slaat configuratie encrypted op.
- "Test verzending" knop verstuurt test e-mail naar beheerder.
- Bij succesvolle test: success toast en configuratie wordt actief.
- Bij mislukte test: error toast met foutmelding, configuratie wordt niet geactiveerd.
- Alleen gebruikers met beheerder-rol kunnen deze configuratie wijzigen.

## UX/UI aandachtspunten
- Password/secret input fields voor credentials (masked).
- Conditional rendering van provider-specifieke velden.
- Loading state tijdens test verzending.
- Success/error toast na test.
- Confirmation dialog bij wijziging van actieve provider.
- Help text per veld met link naar provider documentatie.
- Status badge: "Actief", "Niet geconfigureerd", "Configuratie ongeldig".

## Afhankelijkheden / blockers
- FEAT-023
- FEAT-010 (RBAC voor toegangscontrole)
- EPIC-005 (security voor credential opslag)

## Bronverwijzingen
- [docs/backlog/features/FEAT-023-email-provider-configuratie.md](../features/FEAT-023-email-provider-configuratie.md)
- [docs/backlog/epics/EPIC-012-email-integraties.md](../epics/EPIC-012-email-integraties.md)
