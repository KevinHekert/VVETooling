# EPIC-005: Veiligheid & compliance

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: Review
- **Versie**: 1.1

## Doel / waarde
Gebruikers vertrouwen het platform door aantoonbare security, privacy en compliance (AVG, data isolation, audit logging).

## Scope
- RBAC en data isolation.
- Audit logging voor kritieke acties.
- Privacy by design (bewoners zien alleen eigen data).
- Security & privacy communicatie (policy).
- Toegangscontrole voor leveranciersaccounts (aannemers beperkt tot toegewezen tickets).

## Out-of-scope
- ISO/SOC2 certificering.

## Afhankelijkheden
- ADR-001 (auth), ADR-003 (multi-tenancy), ADR-005 (logging).
- EPIC-009 (auth flow) voor gebruikersrollen.

## Risico’s
- **T-01 Data isolation fout** (kritiek).
- **T-03 AVG compliance schending** (kritiek).

## Open vragen
- **DQ-004**: WCAG niveau & privacy policy detailniveau.
- **DQ-010**: Deployment strategie (blue/green vs rolling).

## Acceptatie (epic-niveau)
- Data is encrypted en tenant-geïsoleerd.
- Rollen hebben correcte toegangsniveaus.
- Audit logging actief voor kritieke acties.

## Bronverwijzingen
- [docs/backlog/epics/01-mvp-epics.md](01-mvp-epics.md) (EP-005)
- [docs/architecture/decisions/ADR-001-authentication-authorization.md](../../architecture/decisions/ADR-001-authentication-authorization.md)
- [docs/architecture/decisions/ADR-003-multi-tenancy-implementation.md](../../architecture/decisions/ADR-003-multi-tenancy-implementation.md)
- [docs/architecture/decisions/ADR-005-observability-logging.md](../../architecture/decisions/ADR-005-observability-logging.md)
