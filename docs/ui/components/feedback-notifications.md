# Feedback & Meldingen

## Beschrijving & doel
Feedbackcomponenten informeren de gebruiker zonder de workflow te onderbreken. Meldingen zijn subtiel, tijdelijk en contextueel waar mogelijk.

**UX-kader referenties**
- Design System: [Toast Notifications](../../ux/design/01-design-system.md) (sectie 3.8)
- Constraints: [UX-05 Accessibility](../../architecture/constraints/01-randvoorwaarden-ux-development.md#constraint-ux-05-accessibility-minimale-niveau)

## Componenten
- Toast notifications
- Inline status messages
- Status indicator (badge of label)
- Empty/error hint (inline)

## Gedrag & states
### Toast
- **Gebruik**: bevestiging van acties (opslaan, toevoegen, verwijderen).
- **Duur**: auto-dismiss na 5s, maximaal 3 tegelijk.
- **Toegankelijkheid**: aria-live="polite" of role="status".

### Inline status
- **Gebruik**: direct bij het relevante element (form field, tabel rij).
- **Visueel**: subtiele kleur + icoon + korte tekst.
- **Gedrag**: geen layout shift; gebruik vaste ruimte waar mogelijk.

### Error feedback
- **Gebruik**: naast het element waar de fout optreedt.
- **Toon**: duidelijke, korte actiegerichte boodschap.
- **Geen**: grote foutboxen die de pagina domineren.

## Do's / Don'ts
**Do's**
- Gebruik toasts voor tijdelijke bevestiging.
- Plaats foutmeldingen inline bij de oorzaak.
- Gebruik badges voor status (betaald, openstaand).

**Don'ts**
- Geen modale pop-ups voor niet-kritieke fouten.
- Geen blokkeren van workflow zonder expliciete noodzaak.
- Geen lange tekstblokken voor meldingen.

## Varianten
### Success
- Groen accent + check icon.

### Warning
- Oranje accent + warning icon.

### Error
- Rood accent + error icon, maar subtiel geplaatst.

### Info
- Blauw accent + info icon.
