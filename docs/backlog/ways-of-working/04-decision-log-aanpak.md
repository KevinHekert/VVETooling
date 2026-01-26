# Decision-log aanpak

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Product Owner
- **Status**: Final
- **Versie**: 1.0

## Doel
Alle open vragen, aannames en besluiten worden schriftelijk beheerd in de repo. Dit voorkomt verborgen afhankelijkheden en bewaakt traceerbaarheid.

## Werkwijze
- **Registratie**: nieuwe open vragen worden toegevoegd in `docs/backlog/decision-log/01-open-vragen.md`.
- **Impact & urgentie**: elk item krijgt impact (hoog/midden/laag) en urgentie (nu/soon/later).
- **Eigenaar**: expliciet wie beslist (PM/Architect/UX/Legal/Stakeholder).
- **Blockers**: koppeling naar backlog-items die geblokkeerd zijn.
- **Besluit**: na besluit wordt het item gemigreerd naar `docs/backlog/decision-log/02-besluiten.md` met datum en rationale.

## UX/UI feedback zonder UI-verstorende meldingen
- Gebruik toast-notificaties voor bevestigingen.
- Gebruik inline error messaging bij het relevante element.
- Geen errorboxen of modale pop-ups voor niet-kritieke fouten.
- Verwijzing: `docs/ui/components/feedback-notifications.md`.
