# Implementatierapport STORY-020: Pricing- en abonnementenbeheer UI

## Documentinformatie
- **Story ID**: STORY-020
- **Datum implementatie**: 2026-01-27
- **Implementatie door**: GitHub Copilot Coding Agent
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0

## User Story (Origineel)
Als **beheerder** wil ik abonnementen en facturatie-instellingen beheren in een dedicated menu, zodat pricingwijzigingen en toekomstige modules (kortingen/add-ons) passen in hetzelfde UI-raamwerk.

## Acceptatiecriteria Status

| # | Criterium | Status | Implementatie Details |
|---|-----------|--------|----------------------|
| 1 | Menu-item Abonnementen onder Instellingen toont plannen, prijzen en facturatiegegevens | ✅ | Complete pagina op `/instellingen/abonnementen` |
| 2 | Inline mutaties (plan wisselen, betaalmethode updaten) zonder modals; feedback via toasts | ✅ | Inline confirmatie voor planwijziging, toast feedback |
| 3 | Export van facturen via bestaande export/back-up raamwerk (FEAT-013) | ✅ | Download knoppen per factuur |
| 4 | Read-only view voor bestuur; bewoners zien geen pricing-sectie | ⚠️ | UI klaar, autorisatie nog te implementeren op route level |

## Technische Implementatie

### Frontend

#### Pagina
- `frontend/src/app/instellingen/abonnementen/page.tsx` - Complete abonnement beheer pagina

#### Componenten
- **StatusBadge** - Abonnement status weergave (actief, trial, opgezegd, achterstand)
- **InvoiceStatusBadge** - Factuur status (betaald, openstaand, achterstallig)
- **PaymentIcon** - Iconen voor betaalmethodes

#### Features
1. **Huidig Abonnement**
   - Plan weergave met features
   - Volgende facturatie datum
   - Status badge

2. **Plan Vergelijking**
   - 3 tiers: Basis, Standaard, Premium
   - Maandelijks/jaarlijks toggle met 17% korting
   - Feature lijst per plan
   - Inline plan selectie

3. **Betaalmethode**
   - iDEAL, Creditcard, Factuur per email
   - Inline wijzigen

4. **Factuurhistorie**
   - Lijst met alle facturen
   - Download per factuur
   - Status badges

## UX/UI Compliance

| Vereiste | Status | Toelichting |
|----------|--------|-------------|
| Lijst/kaart componenten | ✅ | Card layout voor plannen, lijst voor facturen |
| Badges voor status | ✅ | Gekleurde badges voor plan en factuur status |
| Mobile samenvattingskaarten | ✅ | Responsive layout met stacking |
| Desktop uitgebreide tabellen | ✅ | Grid layout voor plan vergelijking |
| Geen modals | ✅ | Alle interactie inline |
| Toast feedback | ✅ | Toasts voor alle mutaties |
| Uitbreidbaar voor korting/add-ons | ✅ | Component structuur klaar voor uitbreiding |

## Bekende Beperkingen

1. Backend integratie nog niet geïmplementeerd (mock data)
2. Betalingsverwerking (Stripe/Mollie) niet geïntegreerd
3. Rol-gebaseerde toegang moet op route level worden afgedwongen
4. Factuur PDF's zijn mock (alleen tekst bestand)

## Openstaande Items

1. Backend API voor subscription management
2. Payment provider integratie (Mollie/Stripe)
3. Echte PDF factuur generatie
4. Kortingscodes en add-ons
5. Opzeggen/pauzeren workflow

## Bronverwijzingen
- [STORY-020 Definitie](../stories/STORY-020-pricing-en-abonnementen-ui.md)
- [FEAT-014 Pricing & billing](../features/FEAT-014-pricing-billing.md)
- [FEAT-013 Export & backup](../features/FEAT-013-export-backup.md)
- [Product strategie](../../product/strategy/01-productstrategie-keuzes.md)
