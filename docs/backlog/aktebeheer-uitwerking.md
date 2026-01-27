# Uitwerking backlog: VvE-aktedocumenten (AS-IS + review)

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner / PM
- **Status**: Draft
- **Versie**: 1.0

## AS-IS inventarisatie (kort, feitelijk)

### Documentopslag
- Documenten worden opgeslagen via **FEAT-011 Documentbeheer** met S3 storage en versiebeheer (STORY-018).
- Metadata bevat titel, categorie, zichtbaarheid per rol en versievelden; er is geen aparte akte-type classificatie.
- Splitsingsakte-versies verwijzen optioneel naar een document via `document_id` (FEAT-019 / STORY-041).

### Juridische metadata
- **SplitsingsakteVersion** bevat `status` (draft/active/archived) en `effective_date` als juridische peildatum.
- Aanvullingen op splitsingsakte worden functioneel vastgelegd in UI (STORY-032/042), maar niet als aparte juridische akte-entiteit.

### VvE-structuren (appartementsrechten / breukdelen / stemrechten)
- **Splitsingssleutel** is vastgelegd per appartement als `share_percentage` (FEAT-003, STORY-002).
- Contributieberekeningen gebruiken deze breukdelen (FEAT-004); er is geen koppeling naar een specifieke akte of jaar.

### Ondersteunde aktes
- **Splitsingsakte**: versiebeheer aanwezig (FEAT-019).
- **Wijzigingsakte / Modelreglement**: impliciet als document bijlagen; geen dedicated type/jaar-velden.

### Jaartallen (impliciet / expliciet)
- **Expliciet**: begroting/jaarrekening hanteren `year` in financiële modules (FEAT-006/FEAT-005).
- **Impliciet**: splitsingsakte gebruikt `effective_date` en documentnamen; jaartal is niet verplicht veld in documentbeheer.

## Backlog koppeling
- [EPIC-013 Aktebeheer & juridische geldigheid](epics/EPIC-013-aktebeheer-en-geldigheid.md)
- [FEAT-026 Aktebibliotheek met type en jaartal](features/FEAT-026-aktebibliotheek-type-jaartal.md)
- [FEAT-027 Juridische geldigheidsketen](features/FEAT-027-juridische-geldigheidsketen.md)
- [FEAT-028 Historie & raadpleegbaarheid aktes](features/FEAT-028-historie-raadpleegbaarheid-aktedocumenten.md)

## Review & consistentiecheck (PM & PO)
- **Samenhang**: features bouwen voort op FEAT-011 documentbeheer en FEAT-019 splitsingsakte-versiebeheer; geen overlap met financiële berekeningen.
- **Juridische volgorde**: basisakte → wijzigingsaktes → (model)reglement wordt expliciet vastgelegd; meerdere aktes kunnen tegelijk geldig zijn.
- **Geen impliciete aannames**: de backlog vermijdt “laatste akte = leidend”; filtering is altijd op type + jaar/peildatum.
- **Realistische VvE-case**:
  - Basisakte 1998, wijzigingsaktes 2008 en 2015, modelreglement 1992 en 2006.
  - Peildatum **2014** toont basisakte 1998 + wijzigingsakte 2008 + modelreglement 2006.
  - Peildatum **2016** toont basisakte 1998 + wijzigingsaktes 2008/2015 + modelreglement 2006.

## Bronverwijzingen
- [FEAT-011 Documentbeheer](features/FEAT-011-documentbeheer.md)
- [FEAT-019 Splitsingsakte versiebeheer](features/FEAT-019-splitsingsakte-versiebeheer.md)
- [STORY-041 Splitsingsakte versies overzicht](stories/STORY-041-splitsingsakte-versies-overzicht.md)
- [Markt As Juridische Zaken](../marktonderzoek/10-as-juridische-zaken.md)
