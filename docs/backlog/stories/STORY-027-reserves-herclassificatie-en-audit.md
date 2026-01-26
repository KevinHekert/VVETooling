# STORY-027: Reserves herclassificatie en audit trail

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Product Owner
- **Status**: Ready
- **Versie**: 1.0
- **Prioriteit**: Should (Horizon 2)

## User story
Als **beheerder** wil ik reserves kunnen herclassificeren met audit trail, zodat wijzigingen traceerbaar zijn en toekomstige classificaties zonder nieuwe UI-patronen kunnen worden toegevoegd.

## Acceptatiecriteria
- Inline herclassificatie van reserves met bevestiging via toast (geen modals).
- Audit trail vastgelegd en zichtbaar in dezelfde pagina (lijst/kaart component).
- Read-only rollen zien alleen de historie; geen bewerkacties.
- Export van historie via dezelfde export action-bar.

## UX/UI aandachtspunten
- Gebruik lists/tables met badges voor type wijziging.
- Mobile: samenvattingsregels met uitklapdetails.
- Consistente action-bar voor herclassificatie en export.

## Afhankelijkheden / blockers
- FEAT-002
- FEAT-015 (logging)
- FEAT-013 (export)

## Bronverwijzingen
- [docs/backlog/features/FEAT-002-reserves-overzicht.md](../features/FEAT-002-reserves-overzicht.md)
- [docs/backlog/features/FEAT-015-audit-logging.md](../features/FEAT-015-audit-logging.md)
- [docs/backlog/features/FEAT-013-export-backup.md](../features/FEAT-013-export-backup.md)
