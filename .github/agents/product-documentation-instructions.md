# AI Instructies: VVE Tooling Product Documentatie

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: Product Management
- **Status**: Living Document
- **Versie**: 1.0

## Doel van dit Document

Dit document bevat **instructies voor AI-assistenten** die werken aan VVE Tooling. Het documenteert:
1. **Documentatiestructuur** en waar welke informatie te vinden is
2. **Afspraken** over hoe documentatie wordt beheerd
3. **Processen** voor product development en besluitvorming
4. **Richtlijnen** voor het werken met en updaten van documentatie

**Belangrijk**: Dit is een **living document**. Toekomstige opdrachten aan AI kunnen resulteren in nieuwe afspraken die in dit document vastgelegd moeten worden.

## Documentatiestructuur

### Overzicht

Alle productgerelateerde documentatie is georganiseerd onder `docs/` volgens onderstaande structuur:

```
docs/
├── marktonderzoek/          # Sales-input (READ-ONLY voor Product)
│   ├── 00-overzicht.md
│   ├── 01-04-gebruikers-*.md
│   ├── 05-11-as-*.md
│   ├── 12-concurrentie-analyse.md
│   └── 13-markt-kansen.md
│
├── product/
│   ├── intake/              # Sales → Product analyse
│   │   └── 01-sales-intake-analyse.md
│   │
│   ├── discovery/           # Probleemdefinitie & productrichting
│   │   └── 01-probleemdefinitie-productrichting.md
│   │
│   └── strategy/            # Strategische keuzes
│       └── 01-productstrategie-keuzes.md
│
├── ux/
│   └── discovery/           # UX-vraagstukken & onderzoek
│       ├── 01-ux-vraagstukken-validatie.md
│       └── research-reports/   # Toekomstige UX research rapporten
│
└── backlog/
    └── epics/               # Epics & backlog
        └── 01-mvp-epics.md
```

### Documentverantwoordelijkheden

| Map/Document | Eigenaar | Doel | Muteerbaar door AI? |
|--------------|----------|------|---------------------|
| `docs/marktonderzoek/` | Sales | Marktinzichten, gebruikersonderzoek, concurrentie | ❌ Nee (Sales-eigendom) |
| `docs/product/intake/` | Product Manager | Analyse van Sales-input | ✅ Ja (bij nieuwe Sales-docs) |
| `docs/product/discovery/` | Product Manager | Probleemstatement, scope, doelgroepen | ✅ Ja (bij nieuwe inzichten) |
| `docs/product/strategy/` | Product Manager | Productvisie, strategische keuzes | ✅ Ja (bij strategy wijzigingen) |
| `docs/ux/discovery/` | Product Manager + UX | UX-vraagstukken, hypotheses | ✅ Ja (bij UX research) |
| `docs/ux/discovery/research-reports/` | UX Team | UX research resultaten | ✅ Ja (nieuwe research) |
| `docs/backlog/epics/` | Product Manager | Epics, backlog items | ✅ Ja (bij scope wijzigingen) |

## Afspraken over Documentatie

### 1. Documentstructuur Standaarden

**Elk document moet bevatten**:
```markdown
# [Titel]

## Documentinformatie
- **Datum**: YYYY-MM-DD
- **Eigenaar**: [Rol/Persoon]
- **Status**: [Draft/Review/Final/Deprecated]
- **Versie**: X.Y

## Bronverwijzingen
- [Link naar bron 1]
- [Link naar bron 2]
```

**Waarom**: Herleidbaarheid en transparantie. Elk document moet traceerbaar zijn naar bronnen.

### 2. Herleidbaarheid Principe

**Regel**: Elke bewering, aanname of beslissing moet herleidbaar zijn naar:
- Een brondocument (Sales, UX research, etc.)
- Specifieke sectie/regelnummer indien mogelijk
- Of expliciet gemarkeerd als aanname (⚠️)

**Voorbeeld**:
```markdown
**Aanname**: Penningmeesters zijn bereid €5-15/maand te betalen.
**Bron**: docs/marktonderzoek/13-markt-kansen.md, regel 37-40
**Validatie status**: ⚠️ Te valideren via UX research
```

### 3. Versionering

**Versie nummering**: `MAJOR.MINOR`
- **MAJOR**: Significante wijziging in strategie/richting (bijv. 1.0 → 2.0)
- **MINOR**: Updates, toevoegingen, correcties (bijv. 1.0 → 1.1)

**Git commits**: Elk document update moet gecommit worden met duidelijke commit message:
```
docs: Update probleemdefinitie met nieuwe UX inzichten

- Toegevoegd: Hypothese 6 over mobile usage
- Gewijzigd: Prioriteit van EP-006 naar P0 op basis van research
- Bron: docs/ux/discovery/research-reports/2026-02-usability-test.md
```

### 4. Status Labels

- **Draft**: Work in progress, niet finaal
- **Review**: Klaar voor review door stakeholders
- **Final**: Goedgekeurd, gebruikt voor beslissingen
- **Deprecated**: Niet meer actueel, vervangen door nieuwer document

### 5. Cross-Referencing

**Gebruik relatieve links** voor cross-references:
```markdown
[docs/product/discovery/01-probleemdefinitie-productrichting.md](../../product/discovery/01-probleemdefinitie-productrichting.md)
```

**Waarom**: Links blijven werken bij repository moves.

## Processen

### Process 1: Van Sales Input naar Product Documentatie

**Flow**:
```
Sales docs (marktonderzoek/) 
  → Product Intake (intake/)
  → Problem Discovery (discovery/)
  → UX Discovery (ux/discovery/)
  → Strategy (strategy/)
  → Epics (backlog/epics/)
```

**Wanneer Sales nieuwe documenten toevoegt**:
1. AI leest nieuwe Sales docs
2. AI update `docs/product/intake/01-sales-intake-analyse.md`
   - Voeg nieuwe inzichten toe
   - Markeer nieuwe aannames
   - Update herleidbaarheid matrix
3. AI evalueert impact op downstream docs (discovery, strategy, epics)
4. AI voorstelt updates (of maakt updates met commit)

### Process 2: UX Research → Product Updates

**Wanneer UX research compleet is**:
1. UX team plaatst rapport in `docs/ux/discovery/research-reports/`
2. AI leest rapport
3. AI update `docs/ux/discovery/01-ux-vraagstukken-validatie.md`
   - Hypotheses validatie status (groen/rood/oranje)
   - Nieuwe inzichten toevoegen
4. AI evalueert impact op:
   - Problem discovery (zijn doelgroepen/behoeften gewijzigd?)
   - Strategy (moeten keuzes heroverwogen?)
   - Epics (moet prioriteit/scope aangepast?)
5. AI voorstelt updates met rationale

### Process 3: Product Beslissingen Documenteren

**Wanneer strategische beslissing genomen wordt**:
1. AI documenteert in relevante sectie (strategy/, discovery/, etc.)
2. AI include:
   - **Besluit**: Wat is besloten?
   - **Rationale**: Waarom?
   - **Trade-offs**: Wat zijn de nadelen?
   - **Alternatieven overwogen**: Wat is NIET gekozen en waarom?
   - **Bronverwijzing**: Welke data/docs onderbouwen dit?
3. AI update gerelateerde docs (bijv. epics als strategy wijzigt)

### Process 4: Epic Creatie/Wijziging

**Wanneer nieuwe epic nodig is**:
1. AI start vanuit probleem (niet oplossing)
2. AI check herleidbaarheid naar discovery/strategy docs
3. AI definieert volgens epic template:
   - Probleemomschrijving (user pain points)
   - Doelstelling
   - In/Out of scope
   - Succesindicatoren (quantitative + qualitative)
   - Herleidbaarheid (links naar discovery/UX docs)
   - Acceptance criteria (high-level)
4. AI voegt toe aan `docs/backlog/epics/` met duidelijke ID (EP-XXX)

## AI Instructies per Taak Type

### Taak: "Analyseer nieuwe Sales documenten"

**Stappen**:
1. ✅ Lees alle documenten in `docs/marktonderzoek/`
2. ✅ Update `docs/product/intake/01-sales-intake-analyse.md`:
   - Nieuwe inzichten in relevante secties
   - Nieuwe aannames in "Aannames & Onduidelijkheden"
   - Update herleidbaarheid matrix
3. ✅ Check impact op `docs/product/discovery/` en `docs/product/strategy/`
4. ✅ Voorstellen voor updates met rationale
5. ✅ Commit met duidelijke message

### Taak: "Valideer UX hypothese"

**Stappen**:
1. ✅ Lees UX research rapport in `docs/ux/discovery/research-reports/`
2. ✅ Update `docs/ux/discovery/01-ux-vraagstukken-validatie.md`:
   - Hypothese validatie status (groen/rood/oranje)
   - Samenvatting van bevindingen
3. ✅ Check impact op product beslissingen:
   - Moet probleemdefinitie aangepast?
   - Moet strategie heroverwogen?
   - Moet epic prioriteit gewijzigd?
4. ✅ Voorstellen met onderbouwing
5. ✅ Commit

### Taak: "Maak nieuwe epic"

**Stappen**:
1. ✅ Identificeer probleem (uit discovery docs of nieuwe inzichten)
2. ✅ Check of epic herleidbaar is naar discovery/strategy
3. ✅ Schrijf epic volgens template in `docs/backlog/epics/`
4. ✅ Wijs prioriteit toe (P0/P1/P2/P3)
5. ✅ Link naar relevante discovery/UX docs
6. ✅ Update epic overzicht tabel
7. ✅ Commit

### Taak: "Update product strategie"

**Stappen**:
1. ✅ Identificeer wijziging (nieuwe data, markt shift, etc.)
2. ✅ Update `docs/product/strategy/01-productstrategie-keuzes.md`:
   - Wijzig relevante keuze/prioriteit
   - Documenteer rationale
   - Update trade-offs indien van toepassing
3. ✅ Check cascade effect:
   - Moeten epics hergeprioriteerd?
   - Moet discovery doc updated?
4. ✅ Update versienummer (MAJOR of MINOR)
5. ✅ Commit met uitgebreide message

### Taak: "Genereer product status rapport"

**Stappen**:
1. ✅ Lees alle relevante docs (discovery, strategy, epics)
2. ✅ Genereer rapport met:
   - Huidige status (welke epics in welke fase)
   - Belangrijkste beslissingen (uit strategy)
   - Open vragen/risico's (uit discovery/UX)
   - Volgende stappen
3. ✅ Plaats in `docs/product/reports/YYYY-MM-status.md` (nieuwe map)
4. ✅ Commit

## Belangrijke Do's and Don'ts

### ✅ DO's

1. **DO** altijd bronverwijzingen includeren
2. **DO** aannames expliciet markeren (⚠️)
3. **DO** beslissingen documenteren met rationale
4. **DO** cross-references gebruiken tussen docs
5. **DO** commits maken per logische wijziging
6. **DO** impact evalueren op gerelateerde docs
7. **DO** vragen stellen als iets onduidelijk is
8. **DO** versienummers updaten bij significante wijzigingen
9. **DO** status labels gebruiken (Draft/Review/Final)
10. **DO** nieuwe afspraken toevoegen aan dit document

### ❌ DON'Ts

1. **DON'T** Sales docs wijzigen (read-only voor Product)
2. **DON'T** beslissingen nemen zonder onderbouwing
3. **DON'T** aannames presenteren als feiten
4. **DON'T** documenten maken zonder duidelijk doel
5. **DON'T** links breken bij refactoring
6. **DON'T** informatie dupliceren (gebruik references)
7. **DON'T** commits maken zonder message
8. **DON'T** status "Final" gebruiken zonder review
9. **DON'T** oude docs verwijderen (markeer als Deprecated)
10. **DON'T** dit instructiedocument negeren

## Nieuwe Afspraken Toevoegen

**Proces voor nieuwe afspraken**:

Wanneer een nieuwe afspraak gemaakt wordt (bijv. "vanaf nu maken we altijd X voor Y"):

1. ✅ Voeg sectie toe aan dit document onder relevant hoofdstuk
2. ✅ Documenteer:
   - **Afspraak**: Wat is de afspraak?
   - **Rationale**: Waarom maken we deze afspraak?
   - **Wanneer toepassen**: In welke situaties?
   - **Voorbeeld**: Concreet voorbeeld
3. ✅ Update "Versie" in documentinformatie (minor bump)
4. ✅ Commit met message: `docs: Nieuwe AI instructie toegevoegd - [korte beschrijving]`

**Voorbeelden van nieuwe afspraken die kunnen ontstaan**:
- "Vanaf nu documenteren we A/B test resultaten in docs/experiments/"
- "Vanaf nu linken we epics aan Jira tickets met format EP-XXX → VVET-YYY"
- "Vanaf nu maken we een changelog per release in docs/releases/"
- "Vanaf nu reviewen we strategy docs met stakeholders voor status Final"

## Changelog van dit Document

| Versie | Datum | Wijziging | Auteur |
|--------|-------|-----------|--------|
| 1.0 | 2026-01-26 | Initiële versie - documentatie structuur en afspraken | Product Management (AI-assisted) |

## Vragen & Antwoorden

**Q: Wat als een document niet meer actueel is?**  
A: Wijzig status naar "Deprecated" en voeg link toe naar nieuw document. Verwijder nooit oude docs.

**Q: Wat als Sales en Product mening verschillen?**  
A: Documenteer beide perspectieven. Product neemt uiteindelijke beslissing maar met expliciete rationale.

**Q: Hoe vaak moeten docs gereviewd worden?**  
A: Discovery/Strategy docs: elke 3 maanden of bij significante nieuwe inzichten. Epics: bij elke sprint planning.

**Q: Wat als AI een fout maakt in documentatie?**  
A: Corrigeer en commit met message "fix: [beschrijving fout]". Learn van fout en update dit instructiedocument indien nodig.

**Q: Kunnen we documentatie in andere talen (Engels) maken?**  
A: Nee, alles in Nederlands tenzij specifiek anders afgesproken. Reden: Nederlands team, Nederlands product.

## Contact & Escalatie

**Voor vragen over**:
- **Documentatie proces**: Product Manager
- **UX research proces**: UX Lead
- **Technical implementation**: Engineering Lead
- **AI instructies**: Dit document (of Product Manager)

**Escalatie**:
Als AI niet zeker is over een beslissing of update:
1. Documenteer vraag/onzekerheid
2. Voorstellen met opties (A, B, C)
3. Tag Product Manager voor review
4. Wacht op goedkeuring voordat status "Final" gezet wordt

## Conclusie

Deze AI instructies vormen de **basis voor gestructureerd werken** aan VVE Tooling product documentatie. Door consistent deze afspraken te volgen, waarborgen we:

- ✅ **Herleidbaarheid**: Elke beslissing traceerbaar naar bronnen
- ✅ **Transparantie**: Duidelijke rationale voor keuzes
- ✅ **Consistentie**: Uniforme documentatie structuur
- ✅ **Traceerbaarheid**: Git history en versioning
- ✅ **Schaalbaarheid**: Proces werkt met groeiend team

**Remember**: Dit is een **living document**. Als je een nieuwe afspraak maakt, documenteer deze hier. Als je een betere manier vindt, update dit document. Als je twijfelt, vraag om verduidelijking.

**Happy documenting! 🚀**
