# Backlog-structuur

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Product Owner
- **Status**: Final
- **Versie**: 1.0

## Doel
Deze structuur borgt dat backlog-items consistent, traceerbaar en uitvoerbaar zijn. De backlog vormt de single source of truth voor delivery.

## Structuur
- **Epic** → **Feature** → **Story** → **Acceptatiecriteria**.
- Elk item heeft een uniek ID en verwijst naar bron-documentatie (`docs/...`).

## Templates (verplicht)

### Epic
- **Doel/waarde**
- **Scope & out-of-scope**
- **Afhankelijkheden**
- **Risico’s** (met verwijzing naar architectuur-risico’s)
- **Open vragen + eigenaar**
- **Acceptatie op epic-niveau**
- **Bronverwijzingen**

### Feature
- **Functioneel doel**
- **UX-impact** (flows, componenten, rollen)
- **Constraints** (architectuur/UX/UI)
- **Acceptatiecriteria**
- **Afhankelijkheden**
- **Bronverwijzingen**

### Story
- **User story** (rol + doel + waarde)
- **Acceptatiecriteria** (testbaar)
- **UX/UI aandachtspunten** (componenten, states, toasts, errors)
- **Afhankelijkheden / blockers**
- **Bronverwijzingen**

## Naming & ID’s
- Epics: `EPIC-001` (verwijst naar bestaande EP-001 uit `docs/backlog/epics/01-mvp-epics.md`)
- Features: `FEAT-001`
- Stories: `STORY-001`

## Traceerbaarheid
- Elk item bevat een sectie **Bronverwijzingen** met directe links naar relevante `docs/...` bronnen.
- De traceability matrix in `docs/backlog/README.md` koppelt epics/features/stories aan hun bronnen.
