# Backlog - VVE Tooling

## Doel
Deze backlog is de single source of truth voor uitvoering van VVE Tooling MVP. Alle items zijn traceerbaar naar `docs/*` en houden rekening met architectuur- en UX-kaders.

## Navigatie
- **Ways of working**
  - [Backlog-structuur](ways-of-working/01-backlog-structuur.md)
  - [Prioritering](ways-of-working/02-prioritering.md)
  - [Definition of Ready/Done](ways-of-working/03-definition-of-ready-done.md)
  - [Decision-log aanpak](ways-of-working/04-decision-log-aanpak.md)
  - [AI Development Guidelines](ways-of-working/05-ai-development-guidelines.md) ✨ **NIEUW**
- **Implementatierapporten** ✨ **NIEUW**
  - [Overzicht](implementation-reports/README.md) - Alle implementatierapporten
  - [Template](implementation-reports/TEMPLATE-implementatierapport.md) - Template voor nieuwe rapporten
- **Screenshots & Visuele Documentatie**
  - [Screenshots Directory](../screenshots/README.md) - Alle UI screenshots en test output
- **Epics**
  - [EPIC-001 Financieel overzicht beheren](epics/EPIC-001-financieel-overzicht-beheren.md)
  - [EPIC-002 Splitsingen beheren](epics/EPIC-002-splitsingen-beheren.md)
  - [EPIC-003 Jaarrekening & begroting](epics/EPIC-003-jaarrekening-begroting.md)
  - [EPIC-004 Onboarding alle rollen](epics/EPIC-004-onboarding-multi-user.md)
  - [EPIC-005 Veiligheid & compliance](epics/EPIC-005-security-compliance.md)
  - [EPIC-006 Documenten delen](epics/EPIC-006-documenten-delen.md)
  - [EPIC-007 Data export & backup](epics/EPIC-007-data-export-backup.md)
  - [EPIC-008 Betaling & abonnement](epics/EPIC-008-betaling-en-abonnement.md)
  - [EPIC-009 Multi-user toegang & rollen](epics/EPIC-009-multi-user-toegang.md)
- **Features**
  - [FEAT-001 Transactiebeheer](features/FEAT-001-transactiebeheer.md)
  - [FEAT-002 Reserves & saldo-overzicht](features/FEAT-002-reserves-overzicht.md)
  - [FEAT-003 Splitsingssleutel configuratie](features/FEAT-003-splitsingssleutel.md)
  - [FEAT-004 Contributieberekening](features/FEAT-004-contributieberekening.md)
  - [FEAT-005 Jaarrekening rapportage](features/FEAT-005-jaarrekening-rapportage.md)
  - [FEAT-006 Begroting](features/FEAT-006-begroting.md)
  - [FEAT-007 Onboarding wizard](features/FEAT-007-onboarding-wizard.md)
  - [FEAT-008 Gebruikers uitnodigen](features/FEAT-008-uitnodigen-gebruikers.md)
  - [FEAT-009 Rol-specifieke dashboards](features/FEAT-009-rol-specifieke-dashboards.md)
  - [FEAT-010 Authenticatie & RBAC](features/FEAT-010-auth-rbac.md)
  - [FEAT-011 Documentbeheer](features/FEAT-011-documentbeheer.md)
  - [FEAT-012 Documenten downloaden](features/FEAT-012-documenten-downloaden.md)
  - [FEAT-013 Export & backup](features/FEAT-013-export-backup.md)
  - [FEAT-014 Pricing & billing](features/FEAT-014-pricing-billing.md)
  - [FEAT-015 Audit logging](features/FEAT-015-audit-logging.md)
- **Stories**
  - [STORY-001 Transactie toevoegen](stories/STORY-001-transactie-toevoegen.md)
  - [STORY-002 Splitsingssleutel valideren](stories/STORY-002-splitsingssleutel-valideren.md)
  - [STORY-003 Bewoner ziet eigen status](stories/STORY-003-bewoner-ziet-eigen-status.md)
  - [STORY-004 Bestuur uploadt document](stories/STORY-004-bestuur-upload-document.md)
  - [STORY-005 Rol-gebaseerd inloggen](stories/STORY-005-inloggen-rol-gebaseerd.md)
- **Decision log**
  - [Open vragen](decision-log/01-open-vragen.md)
  - [Besluiten](decision-log/02-besluiten.md)
- **Roadmap**
  - [Horizon 1 - MVP](roadmap/01-horizon-1.md)
  - [Horizon 2 - uitbreiding](roadmap/02-horizon-2.md)

## Hoe de backlog is opgebouwd
1. **Inrichting**: ways of working, DoR/DoD en decision-log afspraken.
2. **Epics**: doelen en grenzen per domein.
3. **Features**: functionele capability’s per epic.
4. **Stories**: uitvoerbare items met acceptatiecriteria.
5. **Roadmap**: prioritering in two horizons.

## Traceability matrix
| Item | Bronverwijzingen |
|---|---|
| EPIC-001 | docs/backlog/epics/01-mvp-epics.md (EP-001), docs/product/discovery/01-probleemdefinitie-productrichting.md, docs/ux/design/03-beheerder-flows.md, docs/architecture/risks/01-risicos-complexiteit-afhankelijkheden.md |
| EPIC-002 | docs/backlog/epics/01-mvp-epics.md (EP-002), docs/architecture/risks/01-risicos-complexiteit-afhankelijkheden.md, docs/ux/design/03-beheerder-flows.md |
| EPIC-003 | docs/backlog/epics/01-mvp-epics.md (EP-003), docs/product/discovery/01-probleemdefinitie-productrichting.md |
| EPIC-004 | docs/backlog/epics/01-mvp-epics.md (EP-004), docs/ux/design/02-bewoner-flows.md, docs/ux/design/03-beheerder-flows.md, docs/ux/design/04-bestuur-flows.md |
| EPIC-005 | docs/backlog/epics/01-mvp-epics.md (EP-005), docs/architecture/decisions/ADR-001-authentication-authorization.md, docs/architecture/decisions/ADR-003-multi-tenancy-implementation.md, docs/architecture/decisions/ADR-005-observability-logging.md |
| EPIC-006 | docs/backlog/epics/01-mvp-epics.md (EP-006), docs/ux/design/04-bestuur-flows.md, docs/ui/components/feedback-notifications.md |
| EPIC-007 | docs/backlog/epics/01-mvp-epics.md (EP-007), docs/architecture/decisions/ADR-005-observability-logging.md |
| EPIC-008 | docs/backlog/epics/01-mvp-epics.md (EP-008), docs/product/strategy/01-productstrategie-keuzes.md |
| EPIC-009 | docs/backlog/epics/01-mvp-epics.md (EP-009), docs/ux/design/02-bewoner-flows.md, docs/ux/design/04-bestuur-flows.md, docs/architecture/constraints/01-randvoorwaarden-ux-development.md |
| FEAT-001 | docs/backlog/features/FEAT-001-transactiebeheer.md, docs/ux/design/03-beheerder-flows.md, docs/ui/components/feedback-notifications.md |
| FEAT-002 | docs/backlog/features/FEAT-002-reserves-overzicht.md, docs/ux/design/04-bestuur-flows.md |
| FEAT-003 | docs/backlog/features/FEAT-003-splitsingssleutel.md, docs/ux/design/03-beheerder-flows.md |
| FEAT-004 | docs/backlog/features/FEAT-004-contributieberekening.md, docs/architecture/constraints/01-randvoorwaarden-ux-development.md |
| FEAT-005 | docs/backlog/features/FEAT-005-jaarrekening-rapportage.md, docs/backlog/epics/01-mvp-epics.md |
| FEAT-006 | docs/backlog/features/FEAT-006-begroting.md, docs/backlog/epics/EPIC-003-jaarrekening-begroting.md |
| FEAT-007 | docs/backlog/features/FEAT-007-onboarding-wizard.md, docs/ux/design/03-beheerder-flows.md |
| FEAT-008 | docs/backlog/features/FEAT-008-uitnodigen-gebruikers.md, docs/ux/design/02-bewoner-flows.md |
| FEAT-009 | docs/backlog/features/FEAT-009-rol-specifieke-dashboards.md, docs/ux/design/02-bewoner-flows.md, docs/ux/design/03-beheerder-flows.md, docs/ux/design/04-bestuur-flows.md |
| FEAT-010 | docs/backlog/features/FEAT-010-auth-rbac.md, docs/architecture/decisions/ADR-001-authentication-authorization.md |
| FEAT-011 | docs/backlog/features/FEAT-011-documentbeheer.md, docs/ui/components/feedback-notifications.md |
| FEAT-012 | docs/backlog/features/FEAT-012-documenten-downloaden.md |
| FEAT-013 | docs/backlog/features/FEAT-013-export-backup.md |
| FEAT-014 | docs/backlog/features/FEAT-014-pricing-billing.md, docs/product/strategy/01-productstrategie-keuzes.md |
| FEAT-015 | docs/backlog/features/FEAT-015-audit-logging.md, docs/product/decisions/01-productbesluiten-aannames-randvoorwaarden.md |
| STORY-001 | docs/backlog/stories/STORY-001-transactie-toevoegen.md, docs/ui/components/form-controls.md |
| STORY-002 | docs/backlog/stories/STORY-002-splitsingssleutel-valideren.md, docs/ui/components/feedback-notifications.md |
| STORY-003 | docs/backlog/stories/STORY-003-bewoner-ziet-eigen-status.md, docs/ux/design/02-bewoner-flows.md |
| STORY-004 | docs/backlog/stories/STORY-004-bestuur-upload-document.md, docs/ui/components/feedback-notifications.md |
| STORY-005 | docs/backlog/stories/STORY-005-inloggen-rol-gebaseerd.md, docs/ux/design/02-bewoner-flows.md |
