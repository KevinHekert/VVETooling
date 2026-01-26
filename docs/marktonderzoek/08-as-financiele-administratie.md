# Markt As: Financiële Administratie

## Status
Status: Draft
Laatst bijgewerkt: 2026-01-26

## Samenvatting
Dit document beschrijft financiële administratie als kernfunctionaliteit voor VVE beheer, inclusief processen, regelgeving en software requirements.

## Definitie

**Financiële administratie** omvat alle processen rondom het bijhouden, rapporteren en controleren van de financiële huishouding van de VVE.

## Wettelijk Kader

### Verplichtingen
1. **Administratie voeren** volgens BW 2:48
2. **Jaarrekening opstellen** binnen 6 maanden na boekjaar
3. **Goedkeuring ALV** van jaarrekening
4. **Begroting opstellen** voor komend jaar
5. **Reserveren** voor onderhoud (art. 5:112 lid 1c BW)

### Bewaartermijn
- **7 jaar**: Financiële administratie
- **Permanent**: Notulen, belangrijke besluiten

### Controle
- **Kascommissie**: Interne controle (2 eigenaren)
- **Accountant**: Optioneel, bij grote VVE's

## Financiële Structuur VVE

### Bankrekeningen
Meeste VVE's hebben 2-3 rekeningen:
1. **Betaalrekening**: Dagelijkse betalingen
2. **Spaarrekening exploitatie**: Buffer exploitatie
3. **Spaarrekening reserves**: Onderhoudsfonds

Sommige VVE's hebben meerdere reserves:
- Algemeen onderhoud
- Specifieke reserves (dak, lift, kozijnen)
- Noodfonds

### Kasstromen

#### Inkomsten
1. **Contributies** (95-98% van inkomsten)
   - Maandelijks/kwartaal/jaarlijks
   - Exploitatie deel
   - Reserves deel

2. **Overige inkomsten** (2-5%)
   - Rente op spaargeld
   - Verhuur gemeenschappelijke ruimte
   - Boetes bij overtreding reglement
   - Vergoedingen (parkeerplaats, etc.)

#### Uitgaven
1. **Vaste lasten** (40-60% van exploitatie)
   - Energie
   - Verzekeringen
   - Gemeentelijke lasten
   - Administratiekosten

2. **Onderhoud** (30-50% van exploitatie)
   - Klein onderhoud
   - Servicecontracten
   - Schoonmaak, tuinonderhoud

3. **Beheer** (10-20% van totaal, indien extern beheer)
   - Beheervergoeding

4. **Reserves** (uit contributie reserves deel)
   - Geen uitgave, maar overschrijving naar reserve

5. **Groot onderhoud** (uit reserves)
   - Projecten uit MJOP

## Processen

### Jaarlijkse Cyclus

#### Q1: Jaarrekening Vorig Jaar
**Januari-Maart**
1. **Afsluiten boeken**
   - Alle transacties verwerken
   - Correcties doorvoeren
   - Afschrijvingen

2. **Balans opstellen**
   - Activa (bankrekeningen, vorderingen)
   - Passiva (reserves, schulden)

3. **Resultatenrekening**
   - Inkomsten vs uitgaven
   - Per categorie
   - Vergelijking met begroting

4. **Toelichting**
   - Afwijkingen verklaren
   - Bijzonderheden toelichten

5. **Kascommissie**
   - Controle administratie
   - Goedkeuring of opmerkingen

#### Q2: ALV en Goedkeuring
**April-Mei**
1. **ALV Voorbereiding**
   - Jaarrekening definitief maken
   - Presentatie voorbereiden
   - Decharge bestuur

2. **ALV**
   - Jaarrekening presenteren
   - Vragen beantwoorden
   - Stemming goedkeuring

3. **Opvolging**
   - Definitieve jaarrekening publiceren
   - Eventuele correcties doorvoeren

#### Q3: Tussentijdse Rapportages
**Juli-Augustus**
1. **Halfjaarcijfers**
   - Stand per 30 juni
   - Vergelijking met begroting
   - Prognose heel jaar

2. **Bijstelling**
   - Eventueel begroting aanpassen
   - Contributie wijziging voorstellen

#### Q4: Begroting Nieuw Jaar
**Oktober-November**
1. **Kosten inventarisatie**
   - Verwachte vaste lasten
   - Geplande onderhoud (MJOP)
   - Contracten (wijzigingen)

2. **Begroting opstellen**
   - Per kostensoort
   - Exploitatie en reserves gescheiden
   - Vergelijking met voorgaand jaar

3. **Contributie berekening**
   - Benodigde inkomsten
   - Splitsing over eigenaren
   - Voorstel contributie

4. **ALV Goedkeuring**
   - Begroting presenteren
   - Stemming
   - Contributie vaststellen

### Maandelijkse Cyclus

#### Week 1
- Bankafschriften downloaden
- Betalingen matchen aan facturen
- Debiteuren bijwerken

#### Week 2
- Openstaande facturen controleren
- Betalingen uitvoeren
- Facturen boeken

#### Week 3
- Contributies controleren
- Herinneringen achterstanden
- Nieuwe facturen verwerken

#### Week 4
- Maandafsluiting
- Saldi controleren
- Rapportage aan bestuur (optioneel)

## Pain Points en Uitdagingen

### Voor Beheerders
1. **Veel VVE's**
   - Parallelle boekhouding 50+ VVE's
   - Verschillende rekeningen per VVE
   - Veel transacties per maand

2. **Tijdrovend**
   - Bankmutaties verwerken
   - Facturen matchen
   - Rapportages maken

3. **Complexe splitsingen**
   - Per VVE eigen splitsingsakte
   - Meerdere reserves/fondsen
   - Correcties en bijzonderheden

4. **Accountantscontrole**
   - Bij grotere VVE's verplicht
   - Veel tijd in documentatie
   - Administratie moet kloppen

### Voor Penningmeesters
1. **Kennis beperkt**
   - Geen professionele achtergrond
   - Onzeker over correctheid
   - Angst voor fouten bij jaarrekening

2. **Tijdrovend**
   - 4-8 uur per maand
   - Piekperiodes rond jaarrekening
   - Te veel handmatig werk

3. **Software complex**
   - Professionele software te moeilijk
   - Excel is foutgevoelig
   - Geen goede tool voor penningmeester

4. **Druk en verantwoordelijkheid**
   - Veel vragen van eigenaren
   - Verantwoordelijk voor geld VVE
   - Controle door kascommissie

### Voor Eigenaren
1. **Ondoorzichtig**
   - Jaarrekening is complex
   - Begrippen onbekend (depreciation, etc.)
   - Te veel details, geen overzicht

2. **Wantrouwen**
   - Klopt het wel?
   - Waar gaat geld naartoe?
   - Zijn reserves voldoende?

## Huidige Oplossingen

### Professionele Boekhoud Software
- **Exact Online, Twinfield, Unit4**
- **Pro's**: Compleet, betrouwbaar, goedkopecountants support
- **Con's**: Duur (€30-100/maand), complex, overkill voor kleine VVE

### VVE Specifieke Software
- **Tobias, VvE Admin**
- **Pro's**: VVE specifiek, splitsingen ingebouwd
- **Con's**: Duur, vaak alleen voor professionele beheerders

### Eenvoudige Boekhoud Tools
- **Moneybird, InformerOnline**
- **Pro's**: Betaalbaar (€10-20/maand), gebruiksvriendelijk
- **Con's**: Niet VVE specifiek, mist splitsingen, mist reserves logic

### Excel
- **Pro's**: Gratis, flexibel
- **Con's**: Foutgevoelig, geen bankkoppeling, tijdrovend, geen audit trail

## Software Requirements

### Must-Have Features

#### 1. Dubbel Boekhouden
- Debet/credit systeem
- Grootboek structuur
- Dagboeken (bank, kas, memoriaal)
- Balans en resultatenrekening

#### 2. VVE Specifieke Structuur
- **Exploitatie rekening**
- **Reserves (meerdere mogelijk)**
- **Splitsingslogica** per eigenaar
- **Contributie beheer** (zie apart document)

#### 3. Bankkoppeling
- Import MT940 / CAMT053
- API koppeling met banken (Open Banking)
- Automatisch transacties ophalen
- Matching transacties aan facturen

#### 4. Factuur Verwerking
- Facturen scannen (OCR)
- Handmatig invoeren
- Goedkeuring workflow
- Betaling schedulen
- Koppeling aan contracten

#### 5. Rapportages
**Standaard Rapportages**:
- Balans
- Resultatenrekening
- Debiteuren overzicht
- Crediteuren overzicht
- Kasstroomoverzicht
- Budget vs werkelijk

**VVE Specifiek**:
- Reserves per fonds
- Per eigenaar overzicht
- Splitsingsoverzicht

**Export**:
- PDF
- Excel
- Accountants formaat (XML, Coda)

#### 6. Jaarrekening
- Template volgens wettelijke eisen
- Automatisch genereren
- Versie beheer
- Goedkeuring workflow
- Archivering

#### 7. Begroting
- Opstellen per kostensoort
- Vergelijking met vorig jaar
- Contributie calculator
- Scenario's (wat als)
- Import uit MJOP

### Nice-to-Have Features
- **Dashboard**: Real-time financiële positie
- **AI categorisatie**: Automatisch transacties categoriseren
- **Notificaties**: Lage saldi, afwijkingen budget
- **Multi-year view**: Trends over jaren
- **Consolidatie**: Over meerdere VVE's (beheerders)
- **API**: Integratie met andere tools
- **Mobile**: Facturen scannen, goedkeuren onderweg

### Compliance Features
- **Audit trail**: Alle wijzigingen loggen
- **Rechten**: Wie mag wat (four-eyes principe)
- **Backup**: Automatisch dagelijks
- **Archivering**: 7 jaar bewaren
- **Beveiliging**: 2FA, encryptie
- **AVG**: Privacy eigenaren

## Business Model Overwegingen

### Value Proposition
- **Tijd besparen**: 50% minder tijd aan administratie
- **Minder fouten**: Automatisering = minder fouten
- **Compliance**: Voldoen aan wettelijke eisen
- **Inzicht**: Real-time financiële positie
- **Professioneel**: Verzorgde rapportages

### Pricing Modellen
1. **Per VVE per maand**: €8-15 (beheerders)
2. **Per jaar**: €100-200 (penningmeesters)
3. **Freemium**: Basis gratis, premium €5/maand
4. **Accountant bundle**: Via accountantskantoor

### ROI voor Klant
- **Beheerder**: 3-5 uur per VVE per maand = €150-300/maand
- **Penningmeester**: 2-4 uur per maand = €50-100/maand waarde
- **Accountant**: 2-4 uur per jaar minder = €200-500 besparing

## Concurrentie Analyse

### Established Players
- **Tobias**: Marktleider, duur, compleet
- **Unit4**: Enterprise, zeer duur
- **Exact/Twinfield**: Algemeen, niet VVE specifiek

### Gaps in Market
1. **Penningmeester segment**: Ondergeserveerd
2. **Modern UX**: Meeste tools zijn verouderd
3. **Cloud-first**: Veel tools zijn nog desktop
4. **Mobile**: Weinig mobiele oplossingen
5. **Betaalbaar**: Mid-market VVE's hebben geen goede optie

## Conclusies

### Belangrijkste Inzichten
1. Financiële administratie is **core** en **verplicht**
2. Professionele markt is wel bediend maar duur
3. Penningmeester markt is groot en ondergeserveerd
4. Compliance is non-negotiable
5. Automatisering (bankkoppeling) is key differentiator

### Market Opportunity
- **Large market**: Elke VVE heeft dit nodig
- **Recurring**: Jaarlijks terugkerende behoefte
- **Sticky**: Switch costs zijn hoog
- **Upsell**: Start met financiën, voeg functionaliteit toe

### Product Strategie
1. **MVP**: Basis boekhouding + VVE structuur + rapportages
2. **V2**: Bankkoppeling + factuur OCR
3. **V3**: Jaarrekening automatisering + dashboard
4. **V4**: AI categorisatie + voorspellingen

### Sales Benadering
- **Compliance**: "Voldoe aan wettelijke eisen"
- **Tijd**: "Bespaar X uur per maand"
- **Fouten**: "Geen fouten meer in jaarrekening"
- **Inzicht**: "Real-time weten waar je staat"
- **Professioneel**: "Maak indruk op eigenaren met mooie rapportages"
