# STORY-025: Notificaties en toasts consistent raamwerk

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.1
- **Prioriteit**: Must (Horizon 1)
- **Geneste nummering**: 9.1.4

## User story
Als **product owner** wil ik een consistent notificatie- en toast-raamwerk over alle features, zodat toekomstige modules zonder extra patronen kunnen aansluiten en gebruikers duidelijke inline feedback krijgen.

## Acceptatiecriteria
- Alle primaire flows (financieel, onboarding, documenten, audit) gebruiken hetzelfde notificatiepatroon (inline/toast, geen modals).
- Configuratie per rol mogelijk (intensiteit, duur) zonder codewijziging.
- Beschikbaar in desktop en mobile; non-blocking.
- Documentatie/patroon vastgelegd in UI components en toegepast op nieuwe stories.

## UX/UI aandachtspunten
- Gebruik bestaande feedback-notifications componenten.
- Plaatsing consistent (rechtsboven desktop, onderaan mobiel).
- Toekomstige typen (info/warning/error/success) passen zonder layout-wijziging.

## Afhankelijkheden / blockers
- FEAT-009
- FEAT-010
- FEAT-015 (logging voor feedback events)

## Bronverwijzingen
- [docs/ui/components/feedback-notifications.md](../../ui/components/feedback-notifications.md)
- [docs/architecture/constraints/01-randvoorwaarden-ux-development.md](../../architecture/constraints/01-randvoorwaarden-ux-development.md)
