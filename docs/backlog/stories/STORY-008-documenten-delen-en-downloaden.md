# STORY-008: Documenten delen en downloaden

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.1
- **Prioriteit**: Should (Horizon 2)
- **Geneste nummering**: 6.2.1

## User story
Als **bestuurslid** wil ik documenten veilig kunnen delen met bestuur en bewoners vanuit een consistent documenten-menu, zodat iedereen altijd de laatste versies kan inzien en downloaden.

## Acceptatiecriteria
- Documenten-menu bevat secties **Bestuur**, **Bewoners** en **Archief** met role-based zichtbaarheid.
- Upload, versiebeheer en gedeelde links volgen het bestaande documentraamwerk uit FEAT-011; downloadknop is inline beschikbaar.
- Download- en deelacties zijn audit-loggable (voorbereiding op FEAT-015).
- Geen blocking modals; gebruik in-page panel/inline feedback.
- Mobile-first view toont alleen titel, datum en download; uitgebreide metadata alleen op desktop.

## UX/UI aandachtspunten
- Gebruik bestaande lijst/kaart componenten en feedback-notifications.
- Beperkte headers; belangrijkste acties bovenaan (download, deel-link).
- Toekomstige uitbreidingen (bijv. watermerk, vervaldatum) passen in hetzelfde lijst/paneel-raamwerk.

## Afhankelijkheden / blockers
- FEAT-011
- FEAT-012
- FEAT-015
- EPIC-006

## Bronverwijzingen
- [docs/backlog/features/FEAT-011-documentbeheer.md](../features/FEAT-011-documentbeheer.md)
- [docs/backlog/features/FEAT-012-documenten-downloaden.md](../features/FEAT-012-documenten-downloaden.md)
- [docs/backlog/features/FEAT-015-audit-logging.md](../features/FEAT-015-audit-logging.md)
- [docs/backlog/epics/EPIC-006-documenten-delen.md](../epics/EPIC-006-documenten-delen.md)
- [docs/ui/components/feedback-notifications.md](../../ui/components/feedback-notifications.md)
