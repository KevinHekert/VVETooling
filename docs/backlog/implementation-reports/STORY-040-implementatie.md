# Implementatierapport STORY-040: Reservefonds prognose waarschuwingen

## Documentinformatie
- **Story ID**: STORY-040
- **Datum implementatie**: 2026-01-27
- **Implementatie door**: GitHub Copilot Coding Agent
- **Status**: ✅ Geïmplementeerd
- **Versie**: 1.0

## User Story (Origineel)
Als **bestuurslid** wil ik waarschuwingen ontvangen wanneer prognoses een negatief saldo tonen, zodat ik tijdig bijstuur op onderhoudsplannen.

## Acceptatiecriteria Status

| # | Criterium | Status | Implementatie Details |
|---|-----------|--------|----------------------|
| 1 | Prognose-grafiek markeert periodes met negatief saldo | ✅ | Waarschuwingen berekend en visueel gemarkeerd |
| 2 | Dashboard toont waarschuwing met impact en aanbeveling | ✅ | Alert box boven scenario selector met details |
| 3 | Waarschuwingen zijn exporteerbaar in het prognoserapport | ✅ | CSV export bevat waarschuwingen sectie |

## Technische Implementatie

### Frontend
- **Pagina(s)**: `frontend/src/app/dashboard/penningmeester/reserves/prognose/page.tsx`
- **Component(en)**: 
  - Warning alert box
  - Warning calculation logic
  - Export met waarschuwingen

### Features
1. **Waarschuwingsberekening**
   - Detecteert negatief saldo in elk projectiejaar
   - Detecteert wanneer doelbedrag niet bereikt wordt
   - Herberekening bij scenario wijziging
   - Per reserve specifieke aanbevelingen

2. **Visuele Waarschuwingen**
   - Rode alert box boven prognose pagina
   - Aantal waarschuwingen in header
   - Per type icoon: ⛔ negatief saldo, 📉 doel niet bereikt
   - Maximaal 3 waarschuwingen getoond, rest collapsed

3. **Waarschuwingstypen**
   - **Negatief saldo**: "Verhoog bijdrage of verlaag geplande uitgaven voor [reserve]"
   - **Doel niet bereikt**: "Doel voor [reserve] wordt niet gehaald. Tekort: €X"

4. **Export Integratie**
   - Aparte sectie "Waarschuwingen" in CSV
   - Kolommen: Type, Reserve, Jaar, Bedrag, Aanbeveling
   - Alleen wanneer waarschuwingen aanwezig

## UX/UI Compliance

| Vereiste | Status | Toelichting |
|----------|--------|-------------|
| Gebruik warning kleur en iconen in grafiek | ✅ | Rode/oranje kleuren, emoji iconen |
| Inline alert boven de grafiek; geen modals | ✅ | Alert box fixed boven scenario cards |
| Consistente notificatie met bestaande toast component | ✅ | Toast bij scenario wijziging |

## Bekende Beperkingen
1. Waarschuwingen alleen op frontend berekend
2. Geen notificatie systeem (alleen inline alerts)
3. Geen email alerts voor kritieke situaties

## Openstaande Items
1. Backend berekening voor realtime waarschuwingen
2. Push notificaties voor kritieke drempels
3. Historische waarschuwingen log
4. Configureerbare drempelwaarden

## Bronverwijzingen
- [STORY-040 Definitie](../stories/STORY-040-reservefonds-prognose-waarschuwingen.md)
- [FEAT-018 Reservefonds prognoses](../features/FEAT-018-reservefonds-prognoses.md)
- [docs/ui/components/feedback-notifications.md](../../ui/components/feedback-notifications.md)
- [docs/ux/design/04-bestuur-flows.md](../../ux/design/04-bestuur-flows.md)
