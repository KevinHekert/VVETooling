# AI Development Guidelines

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Development Team
- **Status**: Final
- **Versie**: 1.0

## Doel
Dit document beschrijft de richtlijnen voor AI-assisted development (GitHub Copilot Agent) binnen het VVE Tooling project. Alle AI-gegenereerde code moet voldoen aan dezelfde kwaliteitseisen als handgeschreven code.

## Documentatie Routekaart (waar vind je wat?)
Gebruik deze routekaart om snel de juiste documentatie te vinden voor AI-werkzaamheden, ontwerp en productbeslissingen.

### 1. Startpunten
- **Projectoverzicht**: `README.md` (root) – high-level intro, tech stack, en hoofdnavigatie door docs.
- **Backlog-overzicht**: `docs/backlog/README.md` – epics, features, stories en procesdocumenten.
- **Architectuur-index**: `docs/architecture/README.md` – technische kaders en besluiten.

### 2. Product & Strategie
- **Productrichting**: `docs/product/discovery/01-probleemdefinitie-productrichting.md`
- **Strategie**: `docs/product/strategy/01-productstrategie-keuzes.md`
- **Epics**: `docs/backlog/epics/`

### 3. UX & UI
- **UX flows & designs**: `docs/ux/design/`
- **UX discovery & vraagstukken**: `docs/ux/discovery/`
- **UI componenten**: `docs/ui/components/`
- **Screenshots & naming**: `docs/screenshots/README.md`

### 4. Backlog proces & templates
- **Ways of working**: `docs/backlog/ways-of-working/`
- **Story templates**: `docs/backlog/stories/`
- **Implementatierapporten**: `docs/backlog/implementation-reports/`

### 5. Onderzoek & Markt
- **Marktonderzoek**: `docs/marktonderzoek/` (start: `docs/marktonderzoek/00-overzicht.md`)

### 6. Code & runtime
- **Frontend**: `frontend/` (Next.js)
- **Backend**: `backend/` (FastAPI)
- **Docs**: `docs/` (alle documentatie)

## Verplichte Testing Requirements

### 1. Unit Tests
- **Elke nieuwe functie** moet voorzien zijn van unit tests
- **Minimale code coverage**: 80% voor nieuwe code
- Tests moeten draaien voordat code wordt gecommit
- Test naming convention: `test_<functie_naam>_<scenario>`

### 2. Integration Tests
- API endpoints moeten getest worden met echte database calls (test database)
- Frontend componenten moeten getest worden met mocked API responses
- E2E tests voor kritieke user flows (login, transacties, uploads)

### 3. Test Execution
```bash
# Backend tests
cd backend && pytest -v --cov=app --cov-report=html

# Frontend tests
cd frontend && npm run test

# E2E tests (indien beschikbaar)
cd frontend && npm run test:e2e
```

## Verplichte Screenshot Requirements

### 1. Wanneer Screenshots Verplicht Zijn
Screenshots zijn **verplicht** bij:
- Nieuwe UI componenten
- Wijzigingen aan bestaande UI
- Nieuwe pagina's of flows
- Error states en feedback messages (toasts, inline errors)
- Responsive design validatie (mobile + desktop)
- Succesvolle test runs (terminal output)

### 2. Screenshot Locatie
Alle screenshots moeten worden opgeslagen in:
```
docs/screenshots/
├── features/
│   ├── STORY-001-transactie-toevoegen/
│   ├── STORY-002-splitsingssleutel/
│   ├── STORY-003-bewoner-status/
│   ├── STORY-004-document-upload/
│   └── STORY-005-login/
├── components/
│   ├── forms/
│   ├── navigation/
│   └── feedback/
├── tests/
│   ├── backend/
│   └── frontend/
└── responsive/
    ├── mobile/
    └── desktop/
```

### 3. Screenshot Naming Convention
```
<story-id>_<beschrijving>_<viewport>_<datum>.png

Voorbeelden:
- STORY-001_transactie-form_desktop_2026-01-26.png
- STORY-003_bewoner-dashboard_mobile_2026-01-26.png
- test_backend-auth-tests-passed_2026-01-26.png
```

### 4. Screenshot Verificatie Checklist
Voordat een PR wordt gemerged, verifieer:

- [ ] Alle nieuwe UI features hebben screenshots
- [ ] Screenshots zijn opgeslagen in `docs/screenshots/`
- [ ] Screenshots zijn gecommit naar de repository
- [ ] Screenshot bestandsnamen volgen de naming convention
- [ ] Mobile en desktop versies zijn aanwezig (waar relevant)
- [ ] Error states zijn gedocumenteerd
- [ ] Test output screenshots zijn aanwezig

### 5. Screenshot Commit Message Format
```
docs: add screenshots for STORY-XXX

- Added desktop screenshot for [feature]
- Added mobile screenshot for [feature]
- Added test output screenshot
```

## Verplichte Implementatierapporten

### Vereiste
**Elke voltooide user story MOET een implementatierapport hebben.**

### Locatie
Rapporten worden opgeslagen in:
```
docs/backlog/implementation-reports/
├── README.md
├── TEMPLATE-implementatierapport.md
├── STORY-001-implementatie.md
├── STORY-002-implementatie.md
└── ...
```

### Inhoud Implementatierapport
Elk rapport moet bevatten:
1. **Documentinformatie** - Story ID, datum, implementatie door, status
2. **Acceptatiecriteria Status** - Tabel met elk criterium en status (✅/⚠️/❌)
3. **Technische Implementatie** - Backend endpoints, frontend pagina's, bestanden
4. **Tests** - Lijst van tests, coverage, resultaten
5. **Screenshots** - Links naar alle relevante screenshots
6. **UX/UI Compliance** - Tabel met UX vereisten en status
7. **Bekende Beperkingen** - Openstaande issues of limitaties
8. **Gerelateerde Commits** - Commit hashes met beschrijving

### Naming Convention
```
STORY-XXX-implementatie.md
```

### Template
Gebruik altijd de template: [TEMPLATE-implementatierapport.md](../implementation-reports/TEMPLATE-implementatierapport.md)

## Definition of Done - AI Ontwikkeling

Een AI-gegenereerde feature is **Done** wanneer:

### Code Kwaliteit
- [ ] Code voldoet aan project coding standards
- [ ] Linting passed zonder errors
- [ ] Type checking passed (TypeScript/Python types)
- [ ] Geen security vulnerabilities geïntroduceerd

### Testing
- [ ] Unit tests geschreven en passing
- [ ] Integration tests geschreven en passing (waar relevant)
- [ ] Test coverage ≥ 80% voor nieuwe code
- [ ] Screenshot van test output gecommit

### Documentatie & Screenshots
- [ ] UI screenshots gecommit naar `docs/screenshots/`
- [ ] Screenshots aanwezig voor alle viewports (mobile/desktop)
- [ ] Error states en feedback gedocumenteerd met screenshots
- [ ] README of relevante docs bijgewerkt

### Implementatierapport
- [ ] Implementatierapport aangemaakt in `docs/backlog/implementation-reports/`
- [ ] Alle acceptatiecriteria gedocumenteerd met status
- [ ] Technische implementatie beschreven
- [ ] Screenshots gelinkt in rapport
- [ ] Bekende beperkingen gedocumenteerd

### Verificatie
- [ ] Handmatige verificatie van functionaliteit
- [ ] Screenshots geverifieerd in repository
- [ ] Implementatierapport geverifieerd in repository
- [ ] PR beschrijving bevat links naar screenshots

## Voorbeeld Workflow

```
1. Implementeer feature (STORY-XXX)
   ↓
2. Schrijf unit tests
   ↓
3. Run tests en maak screenshot van output
   ↓
4. Start development server
   ↓
5. Navigeer naar feature
   ↓
6. Maak screenshots (desktop + mobile)
   ↓
7. Test error states en maak screenshots
   ↓
8. Sla screenshots op in docs/screenshots/features/STORY-XXX/
   ↓
9. Maak implementatierapport (gebruik TEMPLATE)
   ↓
10. Commit code + tests + screenshots + implementatierapport
   ↓
11. Verifieer screenshots en rapport aanwezig in repository
   ↓
12. Update PR beschrijving met screenshot links
```

## Tools voor Screenshots

### Browser Screenshots
- Playwright: `await page.screenshot({ path: 'screenshot.png' })`
- Chrome DevTools: `Ctrl+Shift+P` → "Capture screenshot"
- Firefox: `Ctrl+Shift+S`

### Terminal Screenshots
- Gebruik de ingebouwde screenshot tool van de AI agent
- Of redirect output: `pytest -v 2>&1 | tee test-output.txt`

### Responsive Testing
- Chrome DevTools Device Mode
- Firefox Responsive Design Mode
- Playwright viewport settings

## Bronverwijzingen
- [Definition of Ready/Done](03-definition-of-ready-done.md)
- [Backlog Structuur](01-backlog-structuur.md)
- [UI Components](../../ui/components/)
- [UX Flows](../../ux/design/)
