# Geneste backlog: epics → features → stories

Onderstaande structuur toont alle epics met hun features en bijbehorende stories (1–n). Nummering volgt strikt `Epic.Feature.Story` (bijv. Feature 1 onder Epic 1 = **1.1**, Story 3 onder Feature 1 van Epic 2 = **2.1.3**).

## Legenda
- ✅ = Geïmplementeerd (implementatierapport aanwezig)
- ⬜ = Nog te implementeren (backlog)
- ⚠️ = Gedeeltelijk geïmplementeerd

---

1. **EPIC-001 Financieel overzicht beheren** ✅
   - 1.1 **FEAT-001 Transactiebeheer** ✅
     - 1.1.1 ✅ STORY-001 Transactie toevoegen (Must)
     - 1.1.2 ✅ STORY-011 Transacties importeren en valideren (Must)
     - 1.1.3 ✅ STORY-012 Transactie-overzicht met filters en widgets (Must)
   - 1.2 **FEAT-002 Reserves & saldo-overzicht** ✅
     - 1.2.1 ✅ STORY-013 Reserves overzicht en allocatie (Must)
     - 1.2.2 ✅ STORY-026 Reserves scenario-planning en prognose (Should)
     - 1.2.3 ✅ STORY-027 Reserves herclassificatie en audit trail (Should)
     - 1.2.4 ✅ STORY-028 Mobile-first reserves dashboard (Must)
   - 1.3 **FEAT-018 Reservefonds prognoses** ✅
     - 1.3.1 ✅ STORY-033 Reservefonds prognose dashboard (Should)
     - 1.3.2 ✅ STORY-039 Reservefonds prognose export en scenario (Should)
     - 1.3.3 ✅ STORY-040 Reservefonds prognose waarschuwingen (Should)

2. **EPIC-002 Splitsingen beheren** ✅
   - 2.1 **FEAT-003 Splitsingssleutel configuratie** ✅
     - 2.1.1 ✅ STORY-002 Splitsingssleutel valideren (Must)
     - 2.1.2 ✅ STORY-016 Splitsingssleutel configureren met UI-wizard (Must)
   - 2.2 **FEAT-004 Contributieberekening** ✅
     - 2.2.1 ✅ STORY-003 Bewoner ziet eigen betalingsstatus (Must)
     - 2.2.2 ✅ STORY-014 Contributie berekenen en status delen (Must)

3. **EPIC-003 Jaarrekening & begroting** ✅
   - 3.1 **FEAT-005 Jaarrekening rapportage** ✅
     - 3.1.1 ✅ STORY-015 Jaarrekening genereren en delen (Should)
   - 3.2 **FEAT-006 Begroting** ✅
     - 3.2.1 ✅ STORY-006 Begroting opstellen en exporteren (Must)

4. **EPIC-004 Onboarding alle rollen** ✅
   - 4.1 **FEAT-007 Onboarding wizard** ✅
     - 4.1.1 ✅ STORY-007 Onboarding wizard voor meerdere rollen (Must)
     - 4.1.2 ✅ STORY-017 Onboarding uitnodigingen en herinneringen (Must)
   - 4.2 **FEAT-008 Gebruikers uitnodigen** ✅
     - 4.2.1 ✅ STORY-017 Onboarding uitnodigingen en herinneringen (Must) *(gedeeld)*

5. **EPIC-005 Veiligheid & compliance** ✅
   - 5.1 **FEAT-010 Authenticatie & RBAC** ✅
     - 5.1.1 ✅ STORY-005 Rol-gebaseerd inloggen (Must)
     - 5.1.2 ✅ STORY-021 Auth & RBAC UI beheer (Must)
   - 5.2 **FEAT-015 Audit logging** ✅
     - 5.2.1 ✅ STORY-010 Audit logging zichtbaar in UI (Should)
     - 5.2.2 ✅ STORY-023 Audit logging filters en export (Should)

6. **EPIC-006 Documenten delen** ✅
   - 6.1 **FEAT-011 Documentbeheer** ✅
     - 6.1.1 ✅ STORY-004 Bestuur uploadt document (Must)
     - 6.1.2 ✅ STORY-018 Document versiebeheer en rol-specifiek delen (Must)
   - 6.2 **FEAT-012 Documenten downloaden** ✅
     - 6.2.1 ✅ STORY-008 Documenten delen en downloaden (Should)
     - 6.2.2 ✅ STORY-019 Document download-links en notificaties (Should)
   - 6.3 **FEAT-019 Splitsingsakte versiebeheer** ✅
     - 6.3.1 ✅ STORY-032 Splitsingsakte versie en aanvullingen (Should)
     - 6.3.2 ✅ STORY-041 Splitsingsakte versies overzicht (Must)
     - 6.3.3 ✅ STORY-042 Splitsingsakte aanvullingen log (Should)
     - 6.3.4 ✅ STORY-043 Splitsingsakte publicatie en toegang (Should)

7. **EPIC-007 Data export & backup** ✅
   - 7.1 **FEAT-013 Export & backup** ✅
     - 7.1.1 ✅ STORY-022 Export en back-up UI (Should)

8. **EPIC-008 Betaling & abonnement** ✅
   - 8.1 **FEAT-014 Pricing & billing** ✅
     - 8.1.1 ✅ STORY-020 Pricing- en abonnementenbeheer UI (Should)

9. **EPIC-009 Multi-user toegang & dashboards** ✅
   - 9.1 **FEAT-009 Rol-specifieke dashboards** ✅
     - 9.1.1 ✅ STORY-009 Rol-specifiek dashboard raamwerk (Must)
     - 9.1.2 ✅ STORY-012 Transactie-overzicht met filters en widgets (Must) *(dashboards)*
     - 9.1.3 ✅ STORY-024 Multi-tenant toegang en context switcher (Must)
     - 9.1.4 ✅ STORY-025 Notificaties en toasts consistent raamwerk (Must)

10. **EPIC-010 Serviceverzoeken & leveranciers** ✅
    - 10.1 **FEAT-016 Bewoner tickets & klachten** ✅
      - 10.1.1 ✅ STORY-029 Bewoner ticket wizard en tijdlijn (Must)
      - 10.1.2 ✅ STORY-030 Ticket bewijsstukken (bonnen en facturen) (Must)
      - 10.1.3 ✅ STORY-031 Bestuur ticket inzicht en behandeling (Must)
      - 10.1.4 ✅ STORY-037 Ticket communicatie en notities (Must)
      - 10.1.5 ✅ STORY-038 Ticket prioriteit en SLA (Should)
    - 10.2 **FEAT-017 Leveranciers & onderhoudsopvolging** ✅
      - 10.2.1 ✅ STORY-034 Leveranciers koppelen aan tickets (Should)
      - 10.2.2 ✅ STORY-035 Leveranciersprofiel beheren (Should)
      - 10.2.3 ✅ STORY-036 Leveranciers opvolgacties loggen (Should)
      - 10.2.4 ✅ STORY-044 Ticket supplier collaboration status (Must)

11. **EPIC-011 Correspondentie & sjablonen** ✅
    - 11.1 **FEAT-020 Sjablonenbeheer** ✅
      - 11.1.1 ✅ STORY-045 Sjablonenbeheer pagina (Must)
    - 11.2 **FEAT-021 Brieven genereren** ✅
      - 11.2.1 ✅ STORY-046 Brieven genereren wizard (Must)
    - 11.3 **FEAT-022 Multi-channel verzending** ✅
      - 11.3.1 ✅ STORY-047 Multi-channel verzending (Should)

12. **EPIC-012 E-mail Integraties** ✅
    - 12.1 **FEAT-023 E-mail Provider Configuratie** ✅
      - 12.1.1 ✅ STORY-048 E-mail provider configureren via Settings (Must)
    - 12.2 **FEAT-024 E-mail Provider Abstractie** ✅
      - 12.2.1 ✅ STORY-049 Mailchimp integratie implementeren (Must)
      - 12.2.2 ✅ STORY-050 Amazon SES integratie implementeren (Must)
      - 12.2.3 ✅ STORY-051 SendGrid integratie implementeren (Must)
      - 12.2.4 ✅ STORY-052 E-mail provider abstractie laag (Must)
    - 12.3 **FEAT-025 E-mail Verzending API** ✅
      - 12.3.1 ✅ STORY-053 E-mail verzenden via geconfigureerde provider (Must)
      - 12.3.2 ✅ STORY-054 E-mail verzending monitoring en logging (Should)

13. **EPIC-013 Contractbeheer** ✅
    - 13.1 **FEAT-026 Contractregistratie & Opslag** ✅
      - 13.1.1 ✅ STORY-055 Contract registreren met metadata (Should)
      - 13.1.2 ✅ STORY-056 Contract document uploaden (Should)
      - 13.1.3 ✅ STORY-057 Contracten doorzoeken en filteren (Should)
    - 13.2 **FEAT-027 Contract Alerts & Herinneringen** ✅
      - 13.2.1 ✅ STORY-058 Opzegtermijn alert configureren (Should)
      - 13.2.2 ✅ STORY-059 Dashboard widget aflopen contracten (Should)
    - 13.3 **FEAT-028 Leveranciersbeheer** ✅
      - 13.3.1 ✅ STORY-060 Leverancier registreren (Should)
      - 13.3.2 ✅ STORY-061 Leverancier evaluatie (Could)

14. **EPIC-014 MJOP & Onderhoudsplanning** ✅
    - 14.1 **FEAT-029 MJOP Import & Beheer** ✅
      - 14.1.1 ✅ STORY-062 MJOP importeren vanuit Excel (Should)
      - 14.1.2 ✅ STORY-063 Onderhoudselement handmatig toevoegen (Should)
      - 14.1.3 ✅ STORY-064 MJOP timeline visualisatie (Should)
    - 14.2 **FEAT-030 Reserveberekening & Prognose** ✅
      - 14.2.1 ✅ STORY-065 Reserveberekening automatisch (Should)
      - 14.2.2 ⬜ STORY-066 What-if scenario doorrekenen (Could)
    - 14.3 **FEAT-031 Onderhoudstaak Beheer** ✅
      - 14.3.1 ✅ STORY-067 Onderhoudstaak aanmaken en toewijzen (Should)
      - 14.3.2 ✅ STORY-068 Onderhoudstaak status bijwerken (Should)

15. **EPIC-015 ALV & Vergaderbeheer** ✅
    - 15.1 **FEAT-032 ALV Planning & Uitnodigingen** ✅
      - 15.1.1 ✅ STORY-069 ALV plannen met datum en locatie (Must)
      - 15.1.2 ✅ STORY-070 ALV agenda opstellen (Must)
      - 15.1.3 ✅ STORY-071 ALV uitnodiging versturen (Must)
    - 15.2 **FEAT-033 Presentie & Volmachten** ✅
      - 15.2.1 ✅ STORY-072 RSVP registreren voor ALV (Must)
      - 15.2.2 ✅ STORY-073 Volmacht digitaal afgeven (Must)
      - 15.2.3 ✅ STORY-074 Quorum automatisch berekenen (Must)
    - 15.3 **FEAT-034 Notulen & Besluiten** ✅
      - 15.3.1 ✅ STORY-075 Notulen opstellen met template (Must)
      - 15.3.2 ✅ STORY-076 Besluiten extraheren naar register (Should)
      - 15.3.3 ✅ STORY-077 Actiepunten toewijzen vanuit notulen (Should)
      - 15.3.4 ✅ STORY-120 Notulen delen met eigenaren (Must)

16. **EPIC-016 Juridisch & Compliance** ✅
    - 16.1 **FEAT-035 Compliance Dashboard** ✅
      - 16.1.1 ✅ STORY-078 Compliance status per categorie (Should)
      - 16.1.2 ✅ STORY-079 Compliance checklist afvinken (Should)
      - 16.1.3 ✅ STORY-121 Compliance deadline alert ontvangen (Should)
    - 16.2 **FEAT-036 AVG Module** ⬜
      - 16.2.1 ⬜ STORY-080 Privacy statement genereren (Should)
      - 16.2.2 ⬜ STORY-122 Eigenaar data-export aanvragen (Should)
    - 16.3 **FEAT-037 Besluiten Register** ⬜
      - 16.3.1 ⬜ STORY-081 Besluit doorzoeken in register (Should)

17. **EPIC-017 AI-Assistent** ⬜
    - 17.1 **FEAT-038 AI Chatbot** ⬜
      - 17.1.1 ⬜ STORY-082 AI chatbot vraag stellen (Could)
      - 17.1.2 ⬜ STORY-123 Chatbot escalatie naar bestuur (Could)
    - 17.2 **FEAT-039 Document AI Analyse** ⬜
      - 17.2.1 ⬜ STORY-083 Factuur automatisch analyseren (Could)
    - 17.3 **FEAT-040 Slimme Alerts & Suggesties** ⬜
      - 17.3.1 ⬜ STORY-084 Proactieve alert ontvangen (Could)

18. **EPIC-018 Eigenaren Mobile App** ⬜
    - 18.1 **FEAT-041 Mobile Eigenaren Portal** ⬜
      - 18.1.1 ⬜ STORY-085 Mobile portal documenten inzien (Should)
      - 18.1.2 ⬜ STORY-086 Mobile contributiestatus bekijken (Should)
    - 18.2 **FEAT-042 Mobile Meldingen & Tickets** ⬜
      - 18.2.1 ⬜ STORY-087 Mobile melding maken met foto (Should)
      - 18.2.2 ⬜ STORY-088 Mobile ticket voortgang volgen (Should)
    - 18.3 **FEAT-043 Mobile Stemmen & Polls** ⬜
      - 18.3.1 ⬜ STORY-089 Mobile stemmen op poll (Should)

19. **EPIC-019 VVE Verduurzaming** ⬜
    - 19.1 **FEAT-044 Verduurzaming Projectbeheer** ⬜
      - 19.1.1 ⬜ STORY-090 Verduurzamingsproject aanmaken (Should)
      - 19.1.2 ⬜ STORY-119 Kosten-baten analyse verduurzaming (Could)
    - 19.2 **FEAT-045 Subsidie Overzicht & Ondersteuning** ⬜
      - 19.2.1 ⬜ STORY-091 Subsidie-mogelijkheden bekijken (Should)
    - 19.3 **FEAT-046 Energielabel & Duurzaamheid Roadmap** ⬜
      - 19.3.1 ⬜ STORY-092 Energielabel registreren (Should)

20. **EPIC-020 Benchmark & Analytics** ⬜
    - 20.1 **FEAT-047 Benchmark Dashboard** ⬜
      - 20.1.1 ⬜ STORY-093 Benchmark positie bekijken (Could)
    - 20.2 **FEAT-048 VVE Analytics & Trends** ⬜
      - 20.2.1 ⬜ STORY-094 Kosten trend analyseren (Could)

21. **EPIC-021 Betalingen & Incasso** ⬜
    - 21.1 **FEAT-049 Automatische Contributie-inning** ⬜
      - 21.1.1 ⬜ STORY-095 SEPA-incasso instellen (Should)
    - 21.2 **FEAT-050 Betalingsherinneringen & Aanmaningen** ⬜
      - 21.2.1 ⬜ STORY-096 Betalingsherinnering versturen (Should)
    - 21.3 **FEAT-051 Incasso Workflow** ⬜
      - 21.3.1 ⬜ STORY-097 Incasso case starten (Could)

22. **EPIC-022 Notificaties & Alerts** ⬜
    - 22.1 **FEAT-052 Push Notificaties** ⬜
      - 22.1.1 ⬜ STORY-098 Push notificatie ontvangen (Should)
    - 22.2 **FEAT-053 Notificatie Voorkeuren** ⬜
      - 22.2.1 ⬜ STORY-099 Notificatie voorkeuren instellen (Should)
    - 22.3 **FEAT-054 SMS Notificaties** ⬜
      - 22.3.1 ⬜ STORY-100 SMS versturen voor urgente alerts (Could)

23. **EPIC-023 Rapportages & Inzichten** ⬜
    - 23.1 **FEAT-055 Financiële Rapportages** ⬜
      - 23.1.1 ⬜ STORY-101 Jaarrekening genereren (Must)
      - 23.1.2 ⬜ STORY-124 Begroting rapport genereren (Must)
    - 23.2 **FEAT-056 Eigenaar Rapportages** ⬜
      - 23.2.1 ⬜ STORY-102 Box 3 verklaring genereren (Should)
    - 23.3 **FEAT-057 Dashboard & KPI's** ⬜
      - 23.3.1 ⬜ STORY-103 Dashboard widgets configureren (Should)

24. **EPIC-024 Integraties & API** ⬜
    - 24.1 **FEAT-058 REST API** ⬜
      - 24.1.1 ⬜ STORY-104 API key aanmaken (Could)
    - 24.2 **FEAT-059 Bank Integratie** ⬜
      - 24.2.1 ⬜ STORY-105 Bank statement importeren (Should)
    - 24.3 **FEAT-060 Boekhoudpakket Integratie** ⬜
      - 24.3.1 ⬜ STORY-106 Boekhoudpakket koppelen (Could)

25. **EPIC-025 VVE Community & Kennisbank** ⬜
    - 25.1 **FEAT-061 Kennisbank** ⬜
      - 25.1.1 ⬜ STORY-107 Kennisbank artikel zoeken (Could)
    - 25.2 **FEAT-062 Template Bibliotheek** ⬜
      - 25.2.1 ⬜ STORY-108 Template downloaden en personaliseren (Could)
    - 25.3 **FEAT-063 Community Forum** ⬜
      - 25.3.1 ⬜ STORY-109 Forum vraag stellen (Could)

26. **EPIC-026 Energiebeheer & Laadpalen** ⬜
    - 26.1 **FEAT-064 Laadpaal Registratie & Beheer** ⬜
      - 26.1.1 ⬜ STORY-110 Laadpaal registreren (Should)
      - 26.1.2 ⬜ STORY-118 Notificatieregeling aanvraag indienen (Should)
    - 26.2 **FEAT-065 Laadkosten Doorbelasting** ⬜
      - 26.2.1 ⬜ STORY-111 Laadkosten doorbelasten (Should)
    - 26.3 **FEAT-066 Energieverbruik Dashboard** ⬜
      - 26.3.1 ⬜ STORY-112 Energieverbruik invoeren (Could)

27. **EPIC-027 Digitaal Stemmen & Polls** ✅
    - 27.1 **FEAT-067 Digitale Stemming** ✅
      - 27.1.1 ✅ STORY-113 Digitale stemming aanmaken (Must)
      - 27.1.2 ✅ STORY-114 Stem uitbrengen op voorstel (Must)
      - 27.1.3 ✅ STORY-115 Stemresultaten bekijken (Must)
    - 27.2 **FEAT-068 Polls & Peilingen** ⬜
      - 27.2.1 ⬜ STORY-116 Poll aanmaken voor draagvlakmeting (Should)
    - 27.3 **FEAT-069 Volmacht Beheer** ✅
      - 27.3.1 ✅ STORY-117 Digitale volmacht registreren (Must)

---

## Voortgang Samenvatting

| Niveau | Totaal | ✅ Gereed | ⬜ Backlog | % Gereed |
|--------|--------|-----------|-----------|----------|
| Epics | 27 | 16 | 11 | 59% |
| Features | 69 | 35 | 34 | 51% |
| Stories | 124 | 78 | 46 | 63% |

**Volledig afgeronde Epics (Horizon 1 - MVP):** EPIC-001, EPIC-002, EPIC-003, EPIC-004, EPIC-005, EPIC-006, EPIC-007, EPIC-008, EPIC-009, EPIC-010, EPIC-011, EPIC-012, EPIC-013, EPIC-014, EPIC-015

**Deels afgeronde Epics:** EPIC-016 (FEAT-035 Compliance Dashboard), EPIC-027 (FEAT-067 Digitale Stemming, FEAT-069 Volmacht Beheer)

**Nieuwe Epics (Horizon 2 - Uitbreiding):** EPIC-017, EPIC-018, EPIC-019, EPIC-020, EPIC-021, EPIC-022, EPIC-023, EPIC-024, EPIC-025, EPIC-026

---
- Prioriteitlabels komen uit de individuele stories (Must/Should). Waar een story meerdere features raakt, is de primaire plaatsing hierboven opgenomen en gemarkeerd als *gedeeld* wanneer relevant.
- Status-indicatoren worden bijgewerkt zodra implementatierapporten beschikbaar zijn in `docs/backlog/implementation-reports/`.
