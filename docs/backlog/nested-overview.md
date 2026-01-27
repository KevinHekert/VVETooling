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

12. **EPIC-012 E-mail Integraties** ⬜
    - 12.1 **FEAT-023 E-mail Provider Configuratie** ⬜
      - 12.1.1 ⬜ STORY-048 E-mail provider configureren via Settings (Must)
    - 12.2 **FEAT-024 E-mail Provider Abstractie** ⬜
      - 12.2.1 ⬜ STORY-049 Mailchimp integratie implementeren (Must)
      - 12.2.2 ⬜ STORY-050 Amazon SES integratie implementeren (Must)
      - 12.2.3 ⬜ STORY-051 SendGrid integratie implementeren (Must)
      - 12.2.4 ⬜ STORY-052 E-mail provider abstractie laag (Must)
    - 12.3 **FEAT-025 E-mail Verzending API** ⬜
      - 12.3.1 ⬜ STORY-053 E-mail verzenden via geconfigureerde provider (Must)
      - 12.3.2 ⬜ STORY-054 E-mail verzending monitoring en logging (Should)

---

## Voortgang Samenvatting

| Niveau | Totaal | ✅ Gereed | ⬜ Backlog | % Gereed |
|--------|--------|-----------|-----------|----------|
| Epics | 12 | 11 | 1 | 92% |
| Features | 25 | 22 | 3 | 88% |
| Stories | 54 | 47 | 7 | 87% |

**Volledig afgeronde Epics:** EPIC-001, EPIC-002, EPIC-003, EPIC-004, EPIC-005, EPIC-006, EPIC-007, EPIC-008, EPIC-009, EPIC-010, EPIC-011

---
- Prioriteitlabels komen uit de individuele stories (Must/Should). Waar een story meerdere features raakt, is de primaire plaatsing hierboven opgenomen en gemarkeerd als *gedeeld* wanneer relevant.
- Status-indicatoren worden bijgewerkt zodra implementatierapporten beschikbaar zijn in `docs/backlog/implementation-reports/`.
