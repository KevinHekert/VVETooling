# Screenshots Directory

Dit is de centrale locatie voor alle visuele documentatie van VVE Tooling.

## Directory Structuur

```
screenshots/
├── features/              # Screenshots per user story
│   ├── STORY-001-transactie-toevoegen/
│   ├── STORY-002-splitsingssleutel/
│   ├── STORY-003-bewoner-status/
│   ├── STORY-004-document-upload/
│   └── STORY-005-login/
├── components/            # UI component screenshots
│   ├── forms/
│   ├── navigation/
│   └── feedback/
├── tests/                 # Test output screenshots
│   ├── backend/
│   └── frontend/
└── responsive/            # Viewport-specifieke screenshots
    ├── mobile/
    └── desktop/
```

## Naming Convention

```
<story-id>_<beschrijving>_<viewport>_<datum>.png
```

Voorbeelden:
- `STORY-001_transactie-form_desktop_2026-01-26.png`
- `STORY-003_bewoner-dashboard_mobile_2026-01-26.png`
- `test_backend-auth-tests-passed_2026-01-26.png`

## Verificatie Checklist

Bij elke PR met UI wijzigingen:

- [ ] Screenshots aanwezig voor nieuwe features
- [ ] Mobile en desktop versies waar relevant
- [ ] Error states gedocumenteerd
- [ ] Test output screenshots aanwezig
- [ ] Bestandsnamen volgen naming convention

## Zie Ook

- [AI Development Guidelines](../backlog/ways-of-working/05-ai-development-guidelines.md)
- [Definition of Done](../backlog/ways-of-working/03-definition-of-ready-done.md)
