# Prioritering

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Product Owner
- **Status**: Final
- **Versie**: 1.0

## Doel
Een transparante prioritering die waarde, risico en afhankelijkheden zichtbaar maakt en een MVP-horizon mogelijk maakt.

## Methode
**MoSCoW + Risico/Dependency check**:
- **Must**: noodzakelijk voor MVP (Horizon 1)
- **Should**: waardevol na MVP of afhankelijk van besluiten (Horizon 2)
- **Could**: optimalisaties/extra’s
- **Won’t (now)**: buiten scope

Aanvullend:
- **Risico-prioriteit**: items met kritieke architectuur-risico’s worden vroeg gevalideerd.
- **Dependency check**: items die geblokkeerd zijn door besluiten worden expliciet gemarkeerd.

## Toepassing in backlog
- Elk item heeft **Priority** (MoSCoW) en **Horizon**.
- Roadmap items zijn gegroepeerd in `docs/backlog/roadmap/01-horizon-1.md` en `02-horizon-2.md`.

## Richtlijnen
- MVP bevat alleen Must-items die direct waarde leveren en nodig zijn voor validatie.
- Security/AVG en multi-tenancy zijn non-negotiable en krijgen Must-status.
- UX/UI constraints (toast, geen errorbox) zijn onderdeel van acceptatiecriteria.
