# Buttons

## Beschrijving & doel
Buttons zijn primair bedoeld om acties te starten. De component volgt het bestaande design system (kleur, spacing, typografie) en ondersteunt duidelijke feedback zonder de UI te verstoren.

**UX-kader referenties**
- Design System: [Buttons](../../ux/design/01-design-system.md) (sectie 3.1)
- Constraints: [UX-05 Accessibility](../../architecture/constraints/01-randvoorwaarden-ux-development.md#constraint-ux-05-accessibility-minimale-niveau)

## Varianten
- **Primary**: primaire acties (opslaan, toevoegen)
- **Secondary**: alternatieve acties (annuleren, terug)
- **Destructive**: risicovolle acties (verwijderen)
- **Ghost/Tertiary**: laagste prioriteit (details, bewerken)
- **Icon Button**: compacte acties met icoon (menu, sluiten)

## States & gedrag
| State | Visueel | Gedrag |
| --- | --- | --- |
| Default | Standaard kleur volgens variant | Direct klikbaar |
| Hover | Donkerder/lichter achtergrond, subtiele shadow | Geen layout shift |
| Focus | Ring (ring-2) volgens variant | Keyboard focus zichtbaar |
| Active | Donkerdere achtergrond | Kortstondige feedback |
| Disabled | Gray-300/gray-400, cursor-not-allowed | Geen actie, aria-disabled |
| Loading | Spinner links van label, tekst blijft zichtbaar | Klik geblokkeerd, aria-busy |

## Gebruik
**Do's**
- Houd één primaire actie per sectie/scherm.
- Gebruik duidelijke, actiegerichte labels ("Opslaan", "Verwijderen").
- Toon na klik een directe respons: state change, toast of inline status.
- Plaats primaire actie rechts in button group (NL conventie).

**Don'ts**
- Gebruik geen destructive button zonder bevestiging.
- Gebruik geen icon-only button zonder aria-label.
- Gebruik geen loading state zonder zichtbare indicatie (spinner/tekst).

## Variaties & richtlijnen
### Loading state
- **Visueel**: spinner (w-4 h-4) + tekst blijft staan.
- **Gedrag**: button disabled om double-submit te voorkomen.

### Disabled state
- Gebruik alleen als actie tijdelijk niet beschikbaar is; geef indien nodig inline hint.

### Verwachtingsmanagement
- Bij succes: toon toast of inline successtatus (niet-blokkerend).
- Bij fout: toon inline fout of subtiele toast, zonder layout shift.
