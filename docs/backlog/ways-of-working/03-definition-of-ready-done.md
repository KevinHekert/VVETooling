# Definition of Ready & Definition of Done

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Product Owner
- **Status**: Final
- **Versie**: 1.1

## Definition of Ready (DoR)
Een backlog-item is **Ready** wanneer:
- Doel, scope en waarde zijn beschreven.
- Acceptatiecriteria zijn testbaar en eenduidig.
- UX/UI kaders zijn expliciet (geen UI-verstorende meldingen; toast/inline errors).
- Afhankelijkheden en blockers zijn benoemd.
- Bronverwijzingen naar `docs/...` zijn opgenomen.
- Open vragen (indien aanwezig) zijn gekoppeld aan decision-log.

## Definition of Done (DoD)
Een backlog-item is **Done** wanneer:
- Acceptatiecriteria zijn voldaan en aantoonbaar getest.
- UX/UI gedrag voldoet aan design system en UI feedback richtlijnen.
- Security & privacy constraints zijn toegepast (multi-tenancy, RBAC, AVG).
- Documentatie is bijgewerkt waar nodig.
- Open vragen zijn gesloten of gemotiveerd uitgezonderd.

### Testing Requirements ✨
- [ ] Unit tests geschreven en passing
- [ ] Integration tests geschreven (waar relevant)
- [ ] Test coverage ≥ 80% voor nieuwe code
- [ ] Screenshot van test output gecommit naar `docs/screenshots/tests/`

### Screenshot Requirements ✨
- [ ] UI screenshots gecommit naar `docs/screenshots/features/<STORY-ID>/`
- [ ] Desktop en mobile viewports gedocumenteerd (waar relevant)
- [ ] Error states en feedback messages gescreenshot
- [ ] Screenshots geverifieerd aanwezig in repository

## Zie Ook
- [AI Development Guidelines](05-ai-development-guidelines.md) - Volledige testing en screenshot richtlijnen
