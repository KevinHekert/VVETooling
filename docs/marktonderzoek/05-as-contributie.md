# Markt As: Contributie Beheer en Incasso

## Status
Status: Draft
Laatst bijgewerkt: 2026-01-26

## Samenvatting
Dit document beschrijft het functionele gebied van contributie beheer en incasso binnen VVE beheer, inclusief processen, uitdagingen en software requirements.

## Definitie

**Contributie** is de periodieke bijdrage die eigenaren betalen aan de VVE voor:
- Gemeenschappelijke kosten (energie, verzekeringen, klein onderhoud)
- Reservering voor groot onderhoud (onderhoudsfonds)
- Administratiekosten

## Markt Karakteristieken

### Frequentie
- **Maandelijks** (meest voorkomend): 60%
- **Per kwartaal**: 25%
- **Per jaar**: 10%
- **Anders** (bijv. halfjaarlijks): 5%

### Bedragen
- **Klein complex** (5-20 app): €50-150 per maand per eigenaar
- **Middel complex** (20-50 app): €75-200 per maand per eigenaar
- **Groot complex** (50+ app): €100-300+ per maand per eigenaar

### Betaalmethoden
1. **Automatische incasso** (70% voorkeur)
2. **Handmatige overschrijving** (25%)
3. **Acceptgiro/factuur** (5%)

## Processen

### Standaard Workflow
1. **Vaststellen contributie**
   - Jaarlijks bij begroting
   - Berekening per eigenaar obv splitsingsakte
   - Goedkeuring door ALV

2. **Facturering**
   - Periodieke factuur genereren
   - Versturen naar eigenaren (email/post)
   - Splitsing tussen exploitatie en reserves

3. **Incasso**
   - Automatische incasso triggeren (indien van toepassing)
   - Of wachten op betaling

4. **Matching**
   - Betalingen matchen aan facturen
   - Bankafschriften verwerken
   - Open posten bijwerken

5. **Debiteuren beheer**
   - Herinneringen versturen bij niet-betaling
   - Aanmaningen
   - Eventueel incassobureau inschakelen

### Splitsingslogica
Contributie wordt verdeeld volgens splitsingsakte:
- **Per appartement**: Verschillende bedragen mogelijk
- **Basis factoren**: 
  - Oppervlakte (m2)
  - Aantal kamers
  - Type appartement
  - Historische afspraken

### Reserves en Fondsen
Vaak meerdere potten:
1. **Exploitatie**: Lopende kosten
2. **Onderhoudsfonds**: Groot onderhoud
3. **Specifieke reserves**: Bijv. lift, dak, kozijnen

## Pain Points en Uitdagingen

### Voor Beheerders
1. **Handmatig werk**
   - Facturen maken per eigenaar
   - Betalingen matchen
   - Achterstalligen opvolgen

2. **Fouten risico**
   - Verkeerde splitsing toepassen
   - Betalingen verkeerd matchen
   - Administratieve fouten

3. **Tijd intensief**
   - Bij veel VVE's veel transacties
   - Debiteuren beheer kost veel tijd
   - Rapportage is werk

4. **Communicatie**
   - Veel vragen van eigenaren over bedragen
   - Uitleg over splitsing
   - Discussies over achterstanden

### Voor Penningmeesters
1. **Complexiteit**
   - Splitsingsakte is ingewikkeld
   - Meerdere rekeningen/reserves
   - Bankkoppelingen lastig

2. **Handmatig**
   - Excel-administratie
   - Veel copy-paste werk
   - Foutgevoelig

3. **Achterstalligen**
   - Ongemakkelijk om aan te spreken
   - Onduidelijk hoe juridisch aan te pakken
   - Spanning in de VVE

### Voor Eigenaren
1. **Onduidelijkheid**
   - Waarom betaal ik dit bedrag?
   - Waarom verschilt mijn contributie van buren?
   - Waar gaat het geld naar toe?

2. **Betaalgemak**
   - Automatische incasso niet altijd mogelijk
   - Handmatig betalen vergeten

## Huidige Markt Oplossingen

### Professionele VVE Software
- **Voorbeelden**: Tobias, VvE Admin, Unit4
- **Features**: Volledig contributie beheer, SEPA incasso, rapportages
- **Prijs**: €5-15 per VVE per maand
- **Target**: Professionele beheerders

### Boekhoud Software
- **Voorbeelden**: Exact Online, Twinfield, Moneybird
- **Features**: Algemeen factureren en boekhouding
- **Prijs**: €10-50 per maand
- **Target**: Penningmeesters met financiële kennis

### Excel/Handmatig
- **Features**: Zelf gebouwde sheets
- **Prijs**: Gratis
- **Target**: Kleine VVE's, penningmeesters
- **Problemen**: Foutgevoelig, tijdrovend, geen automatisering

## Software Requirements

### Must-Have Features
1. **Contributie Configuratie**
   - Instelbaar per eigenaar
   - Splitsing in fondsen/reserves
   - Wijzigingen met ingangsdatum

2. **Facturering**
   - Automatisch genereren periodiek
   - Template aanpasbaar
   - Email verzending
   - PDF generatie

3. **Incasso**
   - SEPA incasso bestand genereren
   - Automatische incasso via bank API
   - Configureerbaar per eigenaar

4. **Betaling Matching**
   - Bankkoppeling (MT940, API)
   - Automatisch matchen
   - Handmatig matchen voor uitzonderingen

5. **Debiteuren Beheer**
   - Overzicht openstaande posten
   - Automatische herinneringen
   - Rapportage achterstanden
   - Incasso-flow ondersteuning

6. **Rapportage**
   - Debiteuren overzicht
   - Liquiditeit overzicht
   - Per eigenaar overzicht
   - Export naar Excel/PDF

### Nice-to-Have Features
- Eigenaren portal met betaalstatus
- Betaallink in factuur (iDeal)
- Automatische reconciliatie
- Voorspelling cashflow
- Herinneringen via SMS/WhatsApp
- Integr atie met boekhoudpakket

### Compliance Requirements
- SEPA incasso licentie
- AVG compliance (privacy eigenaren)
- Bewaren facturen (7 jaar)
- Audit trail van wijzigingen

## Business Model Overwegingen

### Value Proposition
- **Tijdsbesparing**: Automatisering bespaart uren werk
- **Minder fouten**: Geautomatiseerd = minder menselijke fouten
- **Snellere incasso**: Minder achterstalligen door automatisering
- **Professionele uitstraling**: Verzorgde facturen

### Pricing Modellen
1. **Per VVE per maand**: €5-10
2. **Per eigenaar per jaar**: €1-3
3. **Percentage van geïncasseerd bedrag**: 0.5-1%
4. **Eenmalig + support**: €200-500 + €50/jaar

### ROI voor Klant
- **Beheerder**: 2-4 uur per maand per VVE bespaard
- **Penningmeester**: 3-6 uur per maand bespaard
- **Betere incasso**: 1-5% minder achterstalligen

## Concurrentie Analyse

### Gevestigde Spelers
- **Tobias VvE**: Marktleider, compleet, duur
- **VvE Admin**: Midrange, goed, matige UX
- **Unit4**: Enterprise, zeer duur

### Zwakke Punten Concurrentie
- Te duur voor kleine VVE's
- Te complex voor penningmeesters
- Slechte gebruikerservaring
- Geen moderne bankkoppelingen
- Geen eigenaren self-service

### Differentiatie Mogelijkheden
- **Freemium model** voor kleine VVE's
- **Moderne UX** - mobile first
- **Open Banking API** integraties
- **Eigenaren app** met transparantie
- **AI-powered** matching en herinneringen

## Conclusies

### Belangrijkste Inzichten
1. Contributie beheer is **core** functionaliteit voor elke VVE
2. Automatisering is key voor professionele beheerders
3. Simpliciteit is key voor penningmeesters
4. Achterstalligen is groot pain point
5. Bankkoppelingen zijn essentieel maar complex

### Market Opportunity
- **Professionele markt**: Verzadigd, maar ruimte voor betere oplossing
- **Penningmeester markt**: Ondergeserveerd, grote kans
- **Eigenaren self-service**: Nieuw, differentiatie mogelijk

### Product Strategie
1. **MVP**: Basis contributie + facturen + simpele matching
2. **V2**: Automatische incasso + herinneringen
3. **V3**: Bankkoppeling API + eigenaren portal
4. **V4**: AI matching + voorspellingen

### Sales Benadering
- **Beheerders**: Focus op tijdsbesparing en schaalbaarheid
- **Penningmeesters**: Focus op simpliciteit en compliance
- **VVE's**: Focus on cost savings vs professional management
