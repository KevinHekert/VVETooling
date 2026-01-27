# EPIC-027: Digitaal Stemmen & Polls

## Documentinformatie
- **Datum**: 2026-01-27
- **Eigenaar**: Product Owner
- **Status**: Draft
- **Versie**: 0.1

## Doel / waarde
VVE-leden kunnen digitaal stemmen over voorstellen en besluiten, met correcte verwerking van stemrechten en volmachten, zodat besluitvorming efficiënter wordt en opkomst verbetert.

## Scope
- Digitale stemming tijdens en buiten ALV
- Volmacht registratie en verwerking
- Quorum berekening en validatie
- Stemrecht op basis van aandelen/breukdelen
- Resultaten en besluitenregistratie

## Out-of-scope
- Blockchain-based stemming
- Anonieme stemming voor gevoelige zaken
- Real-time video-integratie

## Afhankelijkheden
- EPIC-015 (ALV vergaderbeheer)
- EPIC-016 (juridisch & compliance)
- EPIC-009 (multi-user toegang)

## Risico's
- **T-30 Juridische geldigheid** van digitale stemmingen
- **T-31 Authenticatie** van stemgerechtigden

## Open vragen
- **DQ-041**: Aan welke wettelijke eisen moet digitale stemming voldoen? (Owner: Legal)
- **DQ-042**: Hoe worden meerdere appartementsrechten per eigenaar verwerkt? (Owner: PM)

## Acceptatie (epic-niveau)
- Digitale stemming is mogelijk met correct stemrecht per eigenaar
- Volmachten worden correct verwerkt
- Quorum wordt automatisch berekend en gevalideerd
- Stemmingsresultaten worden opgeslagen in besluitenregister

## Bronverwijzingen
- [docs/marktonderzoek/11-as-vergaderingen.md](../../marktonderzoek/11-as-vergaderingen.md)
- [Stemrecht VvE - Eigen Huis](https://www.eigenhuis.nl/vve/bestuur-vve/vve-vergadering/stemverhoudingen-en-besluitvorming-binnen-de-vve)
