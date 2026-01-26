# Epic Alignment Review - 2026-01-26

## Context
Als PM viel op dat de Epics niet optimaal aansloten bij de doelstellingen van het multi-user platform. Specifiek was er onvoldoende aandacht voor het onboarden van de complete VvE (niet alleen penningmeester, maar ook voorzitter en bewoners).

## Probleem Analyse

### Belangrijkste Issues:
1. **EP-004** was te gefocust op penningmeester onboarding, terwijl het platform multi-user is
2. **EP-005** leek alleen over penningmeester trust te gaan, maar alle gebruikers hebben security concerns
3. **EP-006** suggereerde alleen penningmeester kan documenten beheren, maar voorzitter en bewoners moeten ook toegang hebben

### Alignment met Doelstellingen
De core doelstelling van het platform is (uit `01-productstrategie-keuzes.md`):
> "VVE Tooling brengt transparantie en samenwerking naar zelfbeheer VVE's. We geloven dat elke VVE-lid - van penningmeester tot bewoner - **toegang moet hebben tot informatie** en **kan samenwerken**."

De Epics waren nog te veel geschreven vanuit "penningmeester tool" perspectief, niet "VvE platform" perspectief.

## Wijzigingen Doorgevoerd

### EP-004: VVE kan snel en foutloos onboarden met alle gebruikers
**Was**: "Penningmeester kan snel en foutloos onboarden"

**Wijzigingen**:
- ✅ Titel aangepast naar complete VvE onboarding
- ✅ Probleemomschrijving uitgebreid met pain points van alle rollen
- ✅ Doelstelling nu voor alle 3 rollen (penningmeester, voorzitter, bewoners)
- ✅ In Scope uitgebreid met:
  - Gebruikers activeren (penningmeester nodigt anderen uit)
  - Voorzitter onboarding flow
  - Bewoner onboarding flow (mobile-first)
  - Rol-specifieke help & tutorials
- ✅ Succesindicatoren opgesplitst in 3 categorieën:
  - VVE Setup (penningmeester)
  - Gebruikers Activatie (uitnodigingen, acceptatie rates)
  - Time to Value (per rol)
- ✅ Acceptance criteria toegevoegd voor elke rol

**Rationale**: 
Een VvE is pas succesvol ge-onboard als niet alleen de penningmeester werkt, maar ook voorzitter en bewoners actief zijn. Dit is essentieel voor de transparantie en samenwerking doelstelling.

### EP-005: Alle gebruikers hebben vertrouwen in veiligheid en compliance
**Was**: "Penningmeester heeft vertrouwen in veiligheid en compliance"

**Wijzigingen**:
- ✅ Titel aangepast naar alle gebruikers
- ✅ Probleemomschrijving uitgebreid met bewoner privacy concerns
- ✅ Pain points toegevoegd voor bewoners (bijv. "Kunnen andere bewoners mijn betalingsgegevens zien?")
- ✅ Doelstelling nu voor 100% gebruikers (alle rollen)
- ✅ In Scope toegevoegd:
  - Rol-gebaseerde toegangscontrole
  - Privacy by design voor bewoners
  - Duidelijke communicatie over wie wat kan zien
- ✅ Succesindicatoren uitgebreid met privacy violations metric
- ✅ Acceptance criteria toegevoegd voor:
  - Privacy bescherming tussen bewoners
  - Rol-specifieke uitleg in privacy policy
  - Bewoner onboarding met privacy uitleg

**Rationale**:
Als bewoners geen vertrouwen hebben in de security of privacy van hun gegevens, zullen ze geen account aanmaken. Security is voor alle rollen belangrijk, niet alleen penningmeester.

### EP-006: Bestuur en bewoners kunnen documenten inzien en delen
**Was**: "Penningmeester kan documenten beheren en delen"

**Wijzigingen**:
- ✅ Titel aangepast naar bestuur en bewoners toegang
- ✅ Probleemomschrijving uitgebreid met voorzitter en bewoner pain points
- ✅ Doelstelling nu voor alle rollen (bestuur upload, bewoners self-service)
- ✅ In Scope toegevoegd:
  - Voorzitter/bestuur upload rechten (bijv. notulen)
  - Bewoners read access (self-service, geen vragen meer)
  - Automatisch delen (transparantie)
  - Mobile document viewing
- ✅ Succesindicatoren uitgebreid met:
  - Voorzitter upload metrics
  - Bewoner engagement metrics (documenten openen)
- ✅ Herleidbaarheid gelinkt aan transparantie doelstelling
- ✅ Acceptance criteria toegevoegd voor:
  - Voorzitter upload flow
  - Bewoner self-service access
  - Mobile document support

**Rationale**:
Documenten zijn een key transparantie enabler. Bewoners moeten zelfstandig jaarrekeningen, notulen, etc. kunnen inzien zonder steeds te moeten vragen. Voorzitter moet notulen kunnen uploaden zonder alles via penningmeester te laten gaan.

## Nieuwe Versie
Document versie verhoogd van 2.0 naar 2.1

**Changelog toegevoegd**:
> v2.1 - Epics herbekeken vanuit PM perspectief: EP-004, EP-005, EP-006 ge-update om beter aan te sluiten bij multi-user doelstellingen en VvE onboarding voor alle rollen

## Impact Analysis

### Positive Impact:
- ✅ **Betere alignment** met product visie (transparantie & samenwerking)
- ✅ **Complete VvE onboarding** nu expliciet gedekt
- ✅ **Alle gebruikersgroepen** nu goed gerepresenteerd in Epics
- ✅ **Bewoner activatie** nu meetbaar gemaakt met duidelijke metrics
- ✅ **Privacy by design** nu expliciet opgenomen

### Geen Breaking Changes:
- ✅ Alle originele functionaliteit blijft intact
- ✅ Alleen uitbreidingen/verduidelijkingen, geen verwijderingen
- ✅ Critical path blijft hetzelfde (EP-001 t/m EP-006, EP-008, EP-009)
- ✅ Timeline blijft 4-6 maanden

### Risico's Gemitigeerd:
- ✅ Risico van lage bewoner activatie nu expliciet geadresseerd in EP-004
- ✅ Privacy concerns van bewoners nu expliciet geadresseerd in EP-005
- ✅ Document transparantie nu expliciet geadresseerd in EP-006

## Next Steps

### Voor Engineering:
- Review updated Epics (vooral EP-004, EP-005, EP-006)
- Story mapping sessie moet nu alle 3 rollen dekken
- Architecture design moet rol-specifieke onboarding flows ondersteunen

### Voor Design:
- User flows maken voor alle 3 onboarding flows (EP-004)
- Privacy UX design voor bewoners (EP-005)
- Document sharing UX voor alle rollen (EP-006)
- Mobile-first design voor bewoner flows

### Voor Product:
- Beta recruitment moet nu alle 3 rollen includeren
- Success metrics dashboard moet per rol rapporteren
- User research moet nu ook voorzitters en bewoners includeren

## Conclusie

De Epics sluiten nu **veel beter aan** bij de doelstellingen van een multi-user platform met transparantie en samenwerking als core value proposition. 

De focus op **complete VvE onboarding** (niet alleen penningmeester) is nu expliciet gemaakt en meetbaar. Dit is essentieel voor het succes van het platform, omdat de value proposition pas echt werkt als alle rollen actief zijn.

De wijzigingen zijn **additief** (geen functionaliteit verwijderd) en **aligned** met de bestaande product strategie en discovery documenten.
