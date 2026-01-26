# Decision Log - Open vragen

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Product Owner
- **Status**: Open
- **Versie**: 1.0

## Open vragen
| ID | Vraag | Impact | Urgentie | Eigenaar | Geblokkeerde items | Bron |
|---|---|---|---|---|---|---|
| DQ-001 | Welke edge cases bestaan er voor VVE-berekeningen (splitsing/reserves)? | Hoog | Nu | PM + Expert | EPIC-002, EPIC-003 | docs/architecture/discovery/01-architecturale-verkenning.md#3-2-technische-onzekerheden |
| DQ-002 | Juridische/financiële validatie VVE-berekeningen (wetgeving). | Hoog | Nu | PM + Legal | EPIC-002, EPIC-003 | docs/architecture/risks/01-risicos-complexiteit-afhankelijkheden.md#risico-t-02 |
| DQ-003 | Onboarding benodigde data (minimaal benodigd voor starten). | Midden | Soon | UX | EPIC-004, FEAT-007 | docs/ux/discovery/01-ux-vraagstukken-validatie.md#vraagstuk-7-onboarding-migratie |
| DQ-004 | Gewenst accessibility niveau + eventuele NL-overheidsnormen (WCAG 2.0 AA?). | Midden | Soon | UX + Legal | EPIC-005 | docs/architecture/discovery/01-architecturale-verkenning.md#vraag-3-accessibility-a11y-niveau |
| DQ-005 | Real-time vs near-real-time verwachtingen voor financiële inzichten. | Midden | Later | PM + UX | EPIC-001, EPIC-002 | docs/architecture/discovery/01-architecturale-verkenning.md#vraag-4-real-time-vs-eventual-consistency |
| DQ-006 | Verwachte piekbelasting (concurrente users) bij maandafsluiting. | Midden | Later | PM + DevOps | EPIC-001, EPIC-005 | docs/architecture/discovery/01-architecturale-verkenning.md#onzekerheid-4-piekbelasting-tijdens-maandafsluiting |
| DQ-007 | Support load (FTE) en benodigde self-service features. | Laag | Later | PM | EPIC-004 | docs/architecture/discovery/01-architecturale-verkenning.md#onzekerheid-5-support-load-en-operationele-complexiteit |
| DQ-008 | Offline functionaliteit (PWA) gewenst voor bewoners? | Midden | Later | UX | EPIC-004, EPIC-009 | docs/architecture/discovery/01-architecturale-verkenning.md#vraag-1-offline-functionaliteit |
| DQ-009 | Notificatie strategie: push notifications gewenst? | Laag | Later | UX | EPIC-004 | docs/architecture/discovery/01-architecturale-verkenning.md#vraag-2-notificatie-strategie |
| DQ-010 | Deployment strategie (blue/green vs rolling). | Midden | Soon | DevOps | EPIC-005 | docs/architecture/constraints/01-randvoorwaarden-ux-development.md#open-05-deployment-strategie |
| DQ-011 | Payment provider selectie en contractuele eisen. | Midden | Later | PM + Legal | EPIC-008, FEAT-014 | docs/product/strategy/01-productstrategie-keuzes.md#keuze-3-flat-fee-pricing |
| DQ-012 | Penningmeester workflow (batch vs realtime) valideren. | Laag | Later | UX | EPIC-001 | docs/ux/discovery/01-ux-vraagstukken-validatie.md#vraagstuk-2-hoe-werken-penningmeesters-nu-workflow |
