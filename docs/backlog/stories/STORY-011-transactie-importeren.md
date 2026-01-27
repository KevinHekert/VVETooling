# STORY-011: Transacties importeren en valideren

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.1
- **Prioriteit**: Must (Horizon 1)
- **Geneste nummering**: 1.1.2

## User story
Als **penningmeester** wil ik banktransacties kunnen importeren en automatisch laten valideren op duplicaten en categorieën, zodat het financieel overzicht actueel blijft zonder handmatig overtypen.

## Acceptatiecriteria
- Financieel menu bevat een **Import**-actie binnen transactiebeheer.
- Upload ondersteunt CAMT/CSV en toont inline validatie (geen modals) voor ontbrekende velden/duplicaten.
- Mapping van categorie/reserve is herbruikbaar en kan opnieuw worden gebruikt bij volgende imports.
- Geïmporteerde transacties verschijnen direct in hetzelfde dashboardraamwerk als handmatige transacties.

## UX/UI aandachtspunten
- Gebruik tabel/kaart weergave van transactiebeheer; inline errors en toasts.
- Preview-lijst met checkboxen voor selectieve import.
- Mobile: samenvatting per regel, details in uitklap.

## Afhankelijkheden / blockers
- FEAT-001
- FEAT-010 (auth/RBAC)

## Bronverwijzingen
- [docs/backlog/features/FEAT-001-transactiebeheer.md](../features/FEAT-001-transactiebeheer.md)
- [docs/ui/components/lists-tables.md](../../ui/components/lists-tables.md)
- [docs/ui/components/feedback-notifications.md](../../ui/components/feedback-notifications.md)
