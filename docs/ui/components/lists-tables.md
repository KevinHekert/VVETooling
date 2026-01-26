# Lijsten & Tabellen

## Beschrijving & doel
Lijsten en tabellen presenteren data in overzichtelijke vorm. Ze volgen het design system en bevatten duidelijk gedefinieerde states voor laden, leeg en fout.

**UX-kader referenties**
- Design System: [Tables](../../ux/design/01-design-system.md) (sectie 3.7)
- Constraints: [UX-04 Performance](../../architecture/constraints/01-randvoorwaarden-ux-development.md#constraint-ux-04-performance-budget)

## Componenten
- Data table (desktop)
- Responsive list (mobile)
- Empty state panel
- Loading state row/skeleton
- Error state (inline)

## States & gedrag
### Empty state
- **Visueel**: rustige tekst + eventueel icon (subtle).
- **Tekst**: "Nog geen transacties" + korte uitleg.
- **Actie**: optionele primary button (indien relevant).
- **Layout**: geen grote panelen die het scherm domineren.

### Loading state
- **Visueel**: skeleton rows of subtiele spinner in table header.
- **Gedrag**: behoud layout om verschuiving te voorkomen.
- **Tijd**: bij lange load, toon voortgangstekst ("Gegevens laden...").

### Error state
- **Visueel**: inline message boven tabel of in eerste row.
- **Gedrag**: niet-blokkerend, met retry link/button.
- **Voorbeeld**: "Gegevens konden niet worden geladen. Probeer opnieuw."

## Gebruik
**Do's**
- Gebruik semantische tabelmarkup (`<table>`, `<thead>`, `<tbody>`).
- Laat kolomtitels duidelijk en sorteerbaar indien relevant.
- Houd row height ≥ 48px.
- Gebruik hover state bij clickable rows.

**Don'ts**
- Geen modals of full-page errors voor tabel errors.
- Geen lege tabellen zonder context of uitleg.

## Varianten
### Responsive lijst (mobile)
- Laat elke rij als kaart zien met key/value.
- Gebruik consistent spacing (p-4/p-6).
- Toon primary actie inline of via overflow menu.
