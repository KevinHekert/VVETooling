# Formulieronderdelen & Validatie

## Beschrijving & doel
Formuliercomponenten verzamelen gebruikersinput. Ze volgen het design system en zijn ontworpen voor toegankelijkheid en voorspelbare validatie feedback.

**UX-kader referenties**
- Design System: [Form Inputs](../../ux/design/01-design-system.md#32-form-inputs)
- Constraints: [UX-05 Accessibility](../../architecture/constraints/01-randvoorwaarden-ux-development.md#constraint-ux-05-accessibility-minimale-niveau)

## Componenten
- Text input (single line)
- Textarea
- Select (native voorkeur)
- Checkbox
- Radio buttons
- Toggle (indien nodig, anders checkbox)

## States & gedrag
| State | Visueel | Gedrag |
| --- | --- | --- |
| Default | Border gray-300, background white | Direct invoerbaar |
| Focus | Border + ring primary-500 | Keyboard navigatie zichtbaar |
| Error | Border error-500 + error icon + tekst | Foutmelding onder input |
| Disabled | Background gray-100, tekst gray-500 | Geen invoer |
| Read-only | Background gray-50 | Alleen lezen |

## Validatie & feedback
- **Trigger**: validatie op blur (niet per keypress).
- **Melding**: korte, actiegerichte fouttekst onder het veld.
- **Layout**: foutmelding mag geen grote verschuiving veroorzaken (max 1 regel waar mogelijk).
- **Succes**: gebruik spaarzaam, bij voorkeur subtiele indicator (groene rand of check).

### Inline foutmelding (voorbeeld)
- "Voer een geldig bedrag in" i.p.v. "Ongeldig"
- Koppel via `aria-describedby` aan input

## Gebruik
**Do's**
- Gebruik altijd een label gekoppeld aan het inputveld.
- Houd inputhoogte ≥ 44px (touch targets).
- Gebruik native select waar mogelijk voor accessibility.
- Gebruik fieldsets + legend bij radio groepen.

**Don'ts**
- Geen foutboodschappen bovenaan het formulier die layout verstoren.
- Geen validatie die workflow blokkeert zonder noodzaak.
- Geen placeholder als vervanging voor label.

## Varianten
### Compacte variant (optioneel)
- Alleen gebruiken in tabellen of filters.
- Min hoogte 36px, labels compact maar zichtbaar.

### Meervoudige selectie
- Gebruik checkbox lijst of native multi-select.
- Toon selectie in context (bijv. badge of summary).
