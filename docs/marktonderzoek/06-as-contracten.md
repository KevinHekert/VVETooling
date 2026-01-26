# Markt As: Contract Beheer

## Status
Status: Draft
Laatst bijgewerkt: 2026-01-26

## Samenvatting
Dit document beschrijft het functionele gebied van contractbeheer binnen VVE's, inclusief types contracten, processen en software behoeften.

## Definitie

**Contractbeheer** omvat het beheren van alle overeenkomsten die de VVE heeft afgesloten met externe partijen voor diensten en leveringen.

## Types Contracten

### 1. Doorlopende Diensten
**Energie en Nutsvoorzieningen**
- Elektriciteit gemeenschappelijke ruimtes
- Gas (CV installatie)
- Water
- Gemiddeld: 1-3 contracten per VVE

**Verzekeringen**
- Opstal verzekering (verplicht)
- Aansprakelijkheidsverzekering (verplicht)
- Glas verzekering
- Rechtsbijstand
- Gemiddeld: 2-4 contracten per VVE

**Onderhoudsdiensten**
- Schoonmaak gemeenschappelijke ruimtes
- Tuinonderhoud
- Lift onderhoud (indien aanwezig)
- CV ketel onderhoud
- Glasbewassing
- Gemiddeld: 3-7 contracten per VVE

**Overige Diensten**
- Internetverbinding
- Beveiliging/alarm
- Toegangscontrole
- Gemiddeld: 0-3 contracten

### 2. Projectcontracten
- Renovatie/verbouwing
- Schilderwerk
- Dakonderhoud
- Gevelrenovatie
- Variabel per jaar

### 3. Beheercontract
- Contract met professionele VVE beheerder
- Alleen voor 30-40% van VVE's

## Processen

### Contract Lifecycle

#### 1. Behoeftestelling
- Bestuur identificeert behoefte
- Of: bestaand contract loopt af

#### 2. Aanbesteding
- Offertes aanvragen (vaak 3)
- Vergelijken op prijs en kwaliteit
- Referenties checken
- Presentatie aan bestuur/ALV

#### 3. Besluitvorming
- Kleine contracten (<€2500/jr): Bestuur
- Grote contracten: ALV goedkeuring vereist

#### 4. Ondertekening
- Contractonderhandeling
- Juridische check (bij grote contracten)
- Ondertekening door voorzitter/beheerder

#### 5. Beheer
- Contract opslaan en toegankelijk maken
- Ingangsdatum en einddatum noteren
- Opzegtermijn noteren
- Automatische verlengingsclausules bewaken

#### 6. Monitoring
- Kwaliteit dienstverlening bewaken
- Facturen controleren vs contract
- Performance evaluatie

#### 7. Verlenging/Beëindiging
- Alert voordat opzegtermijn verstrijkt
- Evaluatie: verlengen of nieuwe aanbesteding?
- Opzeggen indien gewenst
- Nieuwe cyclus starten

## Pain Points en Uitdagingen

### Voor Beheerders
1. **Overzicht bewaren**
   - Per VVE 10-20 contracten
   - Bij 50 VVE's = 500-1000 contracten
   - Einddatums en opzegtermijnen bijhouden
   - Verschillende condities per contract

2. **Administratie**
   - Contracten opslaan en vindbaar houden
   - Wijzigingen documenteren
   - Facturen koppelen aan contracten

3. **Tijdige actie**
   - Opzegtermijnen gemist = automatische verlenging
   - Slechte deals voortzetten
   - Geen tijd voor pro-actieve aanbesteding

4. **Compliance**
   - Aanbesteding verplicht boven bepaalde bedragen
   - Goedkeuring ALV nodig
   - Bewaken mandaten

### Voor Bestuur/Penningmeester
1. **Geen overzicht**
   - Waar zijn alle contracten?
   - Wanneer lopen ze af?
   - Wat kosten ze totaal?

2. **Kennisoverdracht**
   - Bij bestuurswissel: welke contracten zijn er?
   - Waarom deze leverancier gekozen?
   - Historische context verloren

3. **Sub-optimale deals**
   - Te lang dezelfde leverancier
   - Geen vergelijking met markt
   - Prijsstijgingen niet opgemerkt

4. **Verspreid**
   - Contracten in emails, fysieke mappen, bij verschillende personen
   - Niet iedereen heeft toegang

### Voor Eigenaren
1. **Geen transparantie**
   - Weten niet welke contracten VVE heeft
   - Kunnen kwaliteit niet beoordelen
   - Vragen waarom bepaalde leverancier

## Huidige Oplossingen

### Document Management
- **Folders/archiefkasten**: Fysieke contracten
- **Email**: Contracten in mailbox
- **Google Drive/Dropbox**: Cloud opslag
- **Problemen**: Geen alerting, geen structuur, geen meta-data

### Professionele VVE Software
- Contractmodule in grote VVE pakketten
- Vaak basis functionaliteit
- Weinig automatisering

### Generic Contract Management
- Tools zoals Contractpand, Mochadocs
- Niet VVE-specific
- Vaak overkill voor kleine VVE's

### Spreadsheets
- Excel overzicht van contracten
- Handmatige alerting
- Foutgevoelig

## Software Requirements

### Must-Have Features

#### 1. Contract Registratie
- Naam contract/leverancier
- Type dienst (categorie)
- Contactpersoon leverancier
- Ingangsdatum
- Einddatum
- Opzegtermijn
- Contractbedrag (per maand/jaar)
- Automatische verlenging ja/nee
- Upload contract document (PDF)

#### 2. Alert Systeem
- Waarschuwing X maanden voor einddatum
- Rekening houden met opzegtermijn
- Email/notificatie naar verantwoordelijke
- Dashboard met "binnenkort aflopen"

#### 3. Document Opslag
- Centraal opslaan PDF contracten
- Versiebeheer (wijzigingen, verlengingen)
- Zoekfunctie
- Toegangsrechten per gebruiker

#### 4. Categorisatie
- Per type dienst
- Per leverancier
- Per VVE (voor beheerders)
- Tags/labels

#### 5. Financieel Overzicht
- Totale contract waarde per jaar
- Per categorie kostenoverzicht
- Link naar facturen
- Budgettering

#### 6. Historie
- Vorige contracten met zelfde leverancier
- Offertes die niet gekozen zijn
- Evaluaties
- Redenen voor keuzes

### Nice-to-Have Features
- **Aanbesteding workflow**: Offertes vergelijken tool
- **Leveranciers database**: Standaard leveranciers met reviews
- **Benchmark**: Vergelijk contractkosten met andere VVE's
- **Templates**: Standaard contractteksten
- **Integratie**: Met facturatie module
- **Performance tracking**: Kwaliteit dienstverlening scoren
- **Reminder workflow**: Automatische herinneringen en acties
- **Mobile access**: Contracten onderweg raadplegen

### Compliance Features
- Aanbesteding logging (wie, wanneer, waarom)
- Mandaat checking (ALV goedkeuring?)
- Audit trail (wijzigingen geschiedenis)
- Handtekening workflow (digitaal tekenen)

## Business Model Overwegingen

### Value Proposition
- **Geen gemiste opzegtermijnen**: Bespaart €1000+ per gemiste termijn
- **Betere deals**: Door tijdige heronderhandeling/aanbesteding
- **Tijd besparing**: Geen zoeken naar contracten
- **Compliance**: Voldoen aan aanbesteding eisen
- **Continuïteit**: Bij bestuurswissel blijft kennis behouden

### Pricing
- Kan onderdeel zijn van completer platform
- Of: €2-5 per VVE per maand standalone
- Of: €50-100 per jaar voor penningmeesters

### ROI voor Klant
- **Beheerder**: 1-2 uur per VVE per jaar bespaard
- **Bestuur**: €500-2000 per jaar bespaard door betere deals
- **Risk mitigation**: Voorkomen van automatische verlengingen

## Markt Opportuniteiten

### Ondergeserveerde Segmenten
1. **Zelfbeheer VVE's**
   - Geen goede tools
   - Vaak verspreid over emails/folders
   - Bereid te betalen voor simpele oplossing

2. **Kleine beheerders**
   - Hebben wel veel VVE's maar missen tool
   - Willen niet investeren in enterprise software

### Differentiatie
- **VVE-specific categorieën**: Pre-defined contract types
- **Leveranciers database**: Curated list VVE dienstverleners
- **Benchmark data**: "Je betaalt teveel voor schoonmaak"
- **Simpele UX**: Niet overweldigend
- **Integratie**: Met andere VVE tools (financiën, onderhoud)

## Integratie met Andere Assen

### Met Financiële Administratie
- Contract bedragen in begroting
- Facturen linken aan contract
- Controleer of factuur binnen contract bedrag

### Met Onderhoud
- Onderhoudscontracten triggeren planning
- Gekoppeld aan onderhoudsmeldingen
- Prestatie leverancier tracken

### Met Vergaderingen
- Contractgoedkeuring als agendapunt ALV
- Automatisch genereren voorstel
- Notulen koppelen aan contract

## Conclusies

### Belangrijkste Inzichten
1. Contractbeheer is **kritisch** maar vaak **verwaarloosd**
2. Gemiste opzegtermijnen kosten veel geld
3. Overzicht is het grootste probleem
4. Huidige tools zijn of te simpel (folders) of te complex (enterprise)
5. Sterke behoefte aan alerting en automatisering

### Market Opportunity
- **Grote pijn**: Iedereen heeft dit probleem
- **Weinig goede oplossingen**: Voor mid-market
- **Hoge ROI**: Direct aantoonbaar
- **Sticky**: Eenmaal in systeem, blijven gebruiken

### Product Strategie
1. **MVP**: Contract registratie + document storage + alerts
2. **V2**: Leveranciers database + benchmarking
3. **V3**: Aanbesteding workflow + digitale handtekening
4. **V4**: AI contract analyse + auto-extraction

### Sales Angle
- **Pain-based**: "Hoeveel opzegtermijnen heb je gemist?"
- **ROI**: "1 gemiste opzegtermijn kost meer dan 5 jaar tooling"
- **Compliance**: "Voldoe aan aanbesteding regels"
- **Continuïteit**: "Ook na bestuurswissel weet iedereen wat er speelt"
