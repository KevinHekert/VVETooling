# Backlog-structuur

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: Final
- **Versie**: 1.1

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

## Geneste Nummering
Naast de unieke ID's wordt in `nested-overview.md` een hiërarchische nummering gebruikt:
- **Epic.Feature.Story** formaat (bijv. 1.2.3 = Epic 1, Feature 2, Story 3)
- Dit maakt de hiërarchie en positie in de backlog direct zichtbaar
- Voorbeeld: STORY-013 heeft geneste nummer **1.2.1** (Epic 1 → Feature 2 → Story 1)

## Implementatiestatus
De `nested-overview.md` toont de implementatiestatus van alle items:
- ✅ = Geïmplementeerd (implementatierapport aanwezig in `implementation-reports/`)
- ⬜ = Nog te implementeren (backlog)
- ⚠️ = Gedeeltelijk geïmplementeerd (sommige stories gereed)

**Regels voor status:**
- Een **Feature** is ✅ als ALLE bijbehorende stories geïmplementeerd zijn
- Een **Epic** is ✅ als ALLE bijbehorende features geïmplementeerd zijn
- Een story is ✅ als er een `STORY-XXX-implementatie.md` rapport bestaat

## Traceerbaarheid
- Elk item bevat een sectie **Bronverwijzingen** met directe links naar relevante `docs/...` bronnen.
- De traceability matrix in `docs/backlog/README.md` koppelt epics/features/stories aan hun bronnen.
- De geneste weergave in `nested-overview.md` toont de volledige hiërarchie met implementatiestatus.
