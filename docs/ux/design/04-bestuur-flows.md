# Core User Flows - Bestuur (Hybrid Design)

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: UX Design  
- **Status**: Final
- **Versie**: 1.0
- **Doel**: Hybrid UX concepten voor bestuursleden (collaborator rol)

## Bronverwijzingen
- [Constraint UX-02: Role-Based UI](../../architecture/constraints/01-randvoorwaarden-ux-development.md#constraint-ux-02-role-based-ui-verschillen)
- [Constraint UX-01: Multi-Tenancy Awareness](../../architecture/constraints/01-randvoorwaarden-ux-development.md#constraint-ux-01-multi-tenancy-awareness)
- [EP-006: Documenten inzien en delen](../../backlog/epics/01-mvp-epics.md)
- [EP-009: Bestuursleden en Bewoners kunnen inloggen](../../backlog/epics/01-mvp-epics.md)

---

## 1. Rol Definitie: Bestuurslid

### 1.1 Rol Kenmerken

**Permissions:**
- ✅ Read access tot alle VVE data (financiën, documenten, gebruikers)
- ✅ Documenten uploaden en beheren
- ✅ Opmerkingen toevoegen (comments/notes)
- ❌ Geen financiële transacties wijzigen (read-only)
- ❌ Geen gebruikers beheren (alleen inzien)
- ❌ Geen VVE instellingen wijzigen

**Gebruikerscontext:**
- Primair gebruik: **Desktop** (maar ook regelmatig tablet/mobile)
- Gebruiksfrequentie: **Regelmatig** (wekelijks)
- Digitale vaardigheid: **Gemiddeld** (variërend)
- Motivatie: **Toezicht en samenwerking** met penningmeester

**User Jobs-to-be-Done:**
1. "Ik wil het financieel overzicht kunnen inzien (zonder te wijzigen)"
2. "Ik wil documenten kunnen uploaden en delen met bewoners"
3. "Ik wil kunnen samenwerken met de penningmeester (opmerkingen, vragen)"
4. "Ik wil de status van de VVE kunnen monitoren (reserves, betalingen)"
5. "Ik wil rapporten kunnen genereren voor ALV's"

### 1.2 Design Constraints

**Hybrid Approach:**
- ✅ Desktop-first maar met sterke mobile/tablet support
- ✅ Eenvoudiger dan Beheerder, complexer dan Bewoner
- ✅ Read-only voor financiële data (duidelijk gevisualiseerd)
- ✅ Write access voor documenten en comments
- ✅ Responsive sidebar navigation (collapsible op tablet)

**UI Verschillen vs Beheerder:**
- Geen "Bewerken" knoppen bij financiële transacties
- Geen "Verwijderen" opties bij critical data
- Restricted navigation menu (minder items)
- Visual indicators: "Alleen lezen" badges waar relevant

**UI Verschillen vs Bewoner:**
- Sidebar navigation (niet bottom nav)
- Meer data toegankelijk (extended views)
- Documenten uploaden mogelijk
- Rapportages toegankelijk

---

## 2. Flow 1: Dashboard Overzicht (Bestuur)

### 2.1 Flow Overzicht

**User Story:**
> Als bestuurslid wil ik een overzicht van de VVE status (financieel, bewoners, openstaande zaken), zodat ik mijn toezichthoudende rol goed kan uitvoeren.

**Entry Point:**
- After login → Dashboard
- Sidebar → "Dashboard"

**Success Criteria:**
- Key metrics zichtbaar (maar zonder edit mogelijkheden)
- Duidelijk welke zaken aandacht vereisen
- Documenten snel toegankelijk

### 2.2 Schermen & Interacties

#### Scherm: Dashboard (Bestuur)

**Layout (Desktop):**
```
┌───────────────────────────────────────────────────────────────────┐
│ [☰] VVE Tooling                               Anna de Jong [👤]   │
├──────┬────────────────────────────────────────────────────────────┤
│      │ [🏢 VVE De Plataan]                                        │
│ 🏠   ├────────────────────────────────────────────────────────────┤
│ Dash │                                                            │
│ board│ Dashboard                                                  │
│      │                                                            │
│ 📊   │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│ Finan│ │ Saldo    │ │ Reserves │ │ Openst.  │ │ Bewoners │      │
│ ciën │ │ € 12.450 │ │ € 73.730 │ │ € 1.250  │ │ 12 total │      │
│      │ │ ✓ Positief│ │ ✓ Gezond │ │ ⚠️ 3 open │ │ 9 actief │      │
│ 📄   │ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│ Docum│                                                            │
│ enten│ ─────────────────────────────────────────────────          │
│      │                                                            │
│ 👥   │ Recente Activiteit                                        │
│ Gebrui│                                                           │
│ kers │ ✓ Jan Jansen heeft € 125 betaald - 22 jan 2026           │
│      │ �� Penningmeester heeft begroting 2026 geüpload           │
│      │ ⚠️ 3 bewoners hebben nog niet betaald                     │
│      │                                                            │
│      │ ─────────────────────────────────────────────────          │
│      │                                                            │
│      │ Mijn Taken                                                │
│      │                                                            │
│      │ ☐ Notulen ALV controleren en uploaden                     │
│      │ ☐ Begroting 2026 reviewen                                 │
│      │                                                            │
└──────┴────────────────────────────────────────────────────────────┘
```

**Specificaties:**
```
Sidebar Navigation:
  - Width: 256px (collapsible op tablet/mobile)
  - Items (subset van Beheerder):
    - Dashboard
    - Financiën (read-only indicator)
    - Documenten
    - Gebruikers (read-only)

Metric Cards:
  - Same design as Beheerder dashboard
  - But: NO edit/add buttons
  - Clickable: navigate to read-only detail view
  - Tooltip: "Alleen lezen - neem contact op met penningmeester om wijzigingen aan te brengen"

Recente Activiteit:
  - Activity feed (chronological)
  - Icons per type:
    - Payment: CheckCircleIcon (green)
    - Document: DocumentTextIcon (blue)
    - Alert: ExclamationTriangleIcon (orange)
  - Max 5 items, "Meer →" link

Mijn Taken:
  - Checkbox list (interactive)
  - Bestuurslid kan eigen taken toevoegen
  - Shared with penningmeester (collaboration feature)
  - Checkmark: completes task
```

---

## 3. Flow 2: Financiën Inzien (Read-Only)

### 3.1 Flow Overzicht

**User Story:**
> Als bestuurslid wil ik financiële transacties en overzichten kunnen inzien (maar niet wijzigen), zodat ik toezicht kan houden op de financiën.

**Entry Point:**
- Dashboard → "Financiën" card click
- Sidebar → "Financiën"

**Success Criteria:**
- All financial data visible (same as Beheerder view)
- Clear indicators that editing is not allowed
- Export/rapportage possible

### 3.2 Schermen & Interacties

#### Scherm: Financieel Overzicht (Read-Only)

**Layout:**
```
┌────────────────────────────────────────────────────────────────────┐
│ Sidebar │ Financieel Overzicht           [📊 Alleen Lezen]         │
│         ├──────────────────────────────────────────────────────────┤
│         │                                                          │
│         │ ℹ️ U heeft alleen leesrechten voor financiële data.     │
│         │   Neem contact op met de penningmeester voor wijzigingen│
│         │                                                          │
│         │ [Filters] [2026 ▾]                    [Exporteren ↓]    │
│         │                                                          │
│         │ ┌────────────────────────────────────────────────────────┐│
│         │ │ Datum     Omschrijving        Bedrag      Categorie  ││
│         │ ├────────────────────────────────────────────────────────┤│
│         │ │ 24 jan 26 Gas & Licht       -€ 450,00    Energie     ││
│         │ │ 22 jan 26 Bijdrage Jan J.   +€ 125,00    Contributie ││
│         │ │ ...                                                   ││
│         │ └────────────────────────────────────────────────────────┘│
│         │                                                          │
│         │ Note: Geen "+ Transactie" button (disabled voor Bestuur)│
│         │       Geen "Bewerken/Verwijderen" in row actions        │
│         │       Wel: Exporteren, Rapporten genereren              │
│         │                                                          │
└────────────────────────────────────────────────────────────────────┘
```

**Specificaties:**
```
Read-Only Indicator:
  - Badge: "📊 Alleen Lezen" 
  - bg-blue-100 text-blue-700 px-3 py-1 rounded-full
  - Position: header (top right)

Info Banner:
  - bg-blue-50 border-l-4 border-blue-400 p-4 mb-6
  - InformationCircleIcon text-blue-400
  - Text: explains read-only permissions
  - Dismissible (X button)

Table:
  - Same design as Beheerder view
  - But:
    - No checkboxes (no bulk actions)
    - No row actions (no •••menu)
    - No "+ Transactie" button
  - Export button available
  - Filtering/searching enabled

Tooltips:
  - Hover over disabled areas: "Alleen beheerders kunnen transacties bewerken"
```

---

## 4. Flow 3: Documenten Beheren

### 4.1 Flow Overzicht

**User Story:**
> Als bestuurslid wil ik documenten kunnen uploaden, bewerken en delen met bewoners, zodat ik mijn bestuurstaken (notulen, vergaderstukken) kan vervullen.

**Entry Point:**
- Sidebar → "Documenten"
- Dashboard → "Documenten" card (if exists)

**Success Criteria:**
- Bestuurslid kan documenten uploaden
- Kan beschrijvingen toevoegen/bewerken
- Kan documenten verwijderen (alleen eigen uploads)

### 4.2 Schermen & Interacties

#### Scherm: Documenten Beheer

**Layout:**
```
┌────────────────────────────────────────────────────────────────────┐
│ Sidebar │ Documenten                          [+ Document Uploaden]│
│         ├──────────────────────────────────────────────────────────┤
│         │                                                          │
│         │ [🔍 Zoeken...] [Type ▾] [2026 ▾]        [Grid] [List ✓]│
│         │                                                          │
│         │ ┌────────────────────────────────────────────────────────┐│
│         │ │ Document              Toegevoegd door   Datum     ⋮   ││
│         │ ├────────────────────────────────────────────────────────┤│
│         │ │ 📄 Notulen ALV dec    Anna de Jong     24 jan 26  •••││
│         │ │ 📊 Begroting 2026     Penningmeester   20 jan 26  •••││
│         │ │ 📄 Vergaderstukken    Anna de Jong     15 jan 26  •••││
│         │ │ 📄 Jaarrekening 2025  Penningmeester   10 jan 26  •••││
│         │ └────────────────────────────────────────────────────────┘│
│         │                                                          │
│         │ Note: Bestuurslid kan eigen documenten bewerken/verwijde│
│         │       Penningmeester documenten: alleen downloaden      │
│         │                                                          │
└────────────────────────────────────────────────────────────────────┘
```

**Specificaties:**
```
Upload Button:
  - "+ Document Uploaden" (primary button)
  - Opens upload modal
  - Permission: allowed for Bestuurslid

Table/List:
  - "Toegevoegd door" column shows uploader
  - Row actions (•••):
    - If uploader = current user:
      - Downloaden
      - Bewerken (description/naam)
      - Verwijderen
    - If uploader = other user:
      - Downloaden only
      - Other actions disabled (grayed out with tooltip)

Upload Modal:
  - Drag & drop zone
  - File picker button
  - Supported formats: PDF, DOCX, XLSX, PNG, JPG
  - Max size: 10MB per file
  - Fields:
    - Document naam *
    - Type * (dropdown: Notulen, Vergaderstukken, Overig)
    - Beschrijving (optional, textarea)
    - Zichtbaar voor (checkboxes: Bestuur only, Alle bewoners)
  - Upload progress bar
  - Success: closes modal, refreshes list, shows toast

Permissions Visual:
  - Own documents: full menu (edit, delete)
  - Other's documents: restricted menu (download only)
  - Tooltip explains: "U kunt alleen uw eigen documenten bewerken"
```

---

## 5. Flow 4: Gebruikers Inzien (Read-Only)

### 5.1 Flow Overzicht

**User Story:**
> Als bestuurslid wil ik een overzicht van bewoners en hun contactgegevens kunnen inzien, zodat ik kan communiceren met bewoners.

**Entry Point:**
- Sidebar → "Gebruikers"

**Success Criteria:**
- All users visible (naam, appartement, contact)
- Contact info exportable
- NO editing allowed (read-only)

### 5.2 Schermen & Interacties

#### Scherm: Gebruikers Overzicht

**Layout:**
```
┌────────────────────────────────────────────────────────────────────┐
│ Sidebar │ Gebruikers                      [📊 Alleen Lezen]        │
│         ├──────────────────────────────────────────────────────────┤
│         │                                                          │
│         │ ℹ️ U heeft alleen leesrechten. Neem contact op met de   │
│         │   penningmeester om gebruikers uit te nodigen of te     │
│         │   beheren.                                               │
│         │                                                          │
│         │ [🔍 Zoeken...]                      [Exporteren ↓]       │
│         │                                                          │
│         │ ┌────────────────────────────────────────────────────────┐│
│         │ │ App  Naam          Rol        Email           Status  ││
│         │ ├────────────────────────────────────────────────────────┤│
│         │ │ 1A   Jan Jansen    Bewoner    jan@email.com    Actief││
│         │ │ 1B   (Leeg)        -          -                -      ││
│         │ │ 2A   Piet Pieters  Bewoner    piet@email.nl    Actief││
│         │ │ 2B   (Leeg)        -          -                -      ││
│         │ │ 3A   Anna de Jong  Bestuur    anna@email.com   Actief││
│         │ │ ...                                                   ││
│         │ └────────────────────────────────────────────────────────┘│
│         │                                                          │
│         │ Note: Geen "+ Uitnodigen" button voor Bestuurslid       │
│         │       Wel: Contactgegevens exporteren mogelijk          │
│         │                                                          │
└────────────────────────────────────────────────────────────────────┘
```

**Specificaties:**
```
Read-Only Indicator:
  - Same as Financiën view
  - Banner explains limitation

Table:
  - All columns visible (same as Beheerder)
  - No row actions (no •••)
  - No "+ Uitnodigen" button
  - Export button: generates CSV with contact info

Privacy:
  - Contact info visible (unlike Bewoner role)
  - Email/phone shown (business need for Bestuur)
  - Betalingsstatus NOT shown (privacy - only Penningmeester sees this)

Export:
  - CSV format
  - Columns: Appartement, Naam, Rol, Email, Telefoonnummer
  - For communication purposes (mailings, emergency contact)
```

---

## 6. Cross-Cutting Concerns

### 6.1 Read-Only Indicators

**Consistent Visual Language:**

1. **Badge in Header:**
   - "📊 Alleen Lezen" badge
   - bg-blue-100 text-blue-700
   - Shown on Financiën and Gebruikers pages

2. **Info Banners:**
   - bg-blue-50 border-l-4 border-blue-400
   - InformationCircleIcon
   - Explains limitation + who to contact (penningmeester)

3. **Disabled Buttons:**
   - opacity-50 cursor-not-allowed
   - Tooltip on hover: "Alleen beheerders kunnen..."

4. **Missing Actions:**
   - "+ Transactie" button not rendered
   - Row actions menu limited or hidden
   - Clear why (permissions)

### 6.2 Collaboration Features (Nice-to-Have MVP, Must-Have Phase 2)

**Comments/Notes:**
- Bestuurslid kan opmerkingen toevoegen bij transacties
- Penningmeester ziet deze opmerkingen
- Use case: "Waarom is deze factuur zo hoog?" → Penningmeester antwoordt

**Tasks/To-Do's:**
- Bestuurslid kan taken aanmaken (eigen of gedeeld)
- Dashboard widget: "Mijn Taken"
- Penningmeester kan taken toewijzen aan Bestuurslid

**Activity Feed:**
- All changes logged (audit trail)
- Bestuurslid ziet: "Penningmeester heeft transactie toegevoegd"
- Real-time updates (optional: websockets or polling)

---

## 7. Acceptance Criteria

### 7.1 Functional Requirements

- [x] Bestuurslid kan inloggen en dashboard zien
- [x] Dashboard toont financiële metrics (read-only)
- [x] Financiële transacties inzichtelijk (geen edit/delete)
- [x] Documenten uploaden, bewerken (eigen), verwijderen (eigen)
- [x] Gebruikers inzien (contact info, geen betalingsstatus)
- [x] Rapportages exporteren (PDF, Excel)
- [x] Duidelijke read-only indicators waar relevant
- [x] Multi-tenancy: alleen VVE data zichtbaar

### 7.2 Non-Functional Requirements

**Hybrid Design:**
- [x] Desktop-first maar responsive (tablet, mobile)
- [x] Sidebar navigation (collapsible)
- [x] Simpler than Beheerder, richer than Bewoner

**Performance:**
- [x] Page load <2s
- [x] Responsive interactions <500ms

**Accessibility:**
- [x] WCAG 2.0 Level A compliant
- [x] Keyboard navigation
- [x] Screen reader compatible
- [x] Disabled states clearly communicated

**Usability:**
- [x] Clear permission model (read-only vs read-write)
- [x] Helpful error messages when action not allowed
- [x] Export functionality for data sharing

---

## 8. Implementation Notes

**Technology Stack:**
- Same as Beheerder/Bewoner (React, Next.js, TypeScript, Tailwind)

**Permission Checks:**
```typescript
// Frontend permission checks
const canEdit = user.role === 'beheerder';
const canUploadDocuments = user.role === 'bestuur' || user.role === 'beheerder';
const canDeleteDocument = (doc) => doc.uploadedBy === user.id || user.role === 'beheerder';

// Backend enforces same rules
// API returns 403 Forbidden if permission check fails
```

**API Endpoints:**
```
GET /api/v1/dashboard (filtered by role)
GET /api/v1/transactions (read-only for bestuur)
POST /api/v1/transactions (403 for bestuur)
PATCH /api/v1/transactions/:id (403 for bestuur)
DELETE /api/v1/transactions/:id (403 for bestuur)

GET /api/v1/documents (all documents)
POST /api/v1/documents (allowed for bestuur)
PATCH /api/v1/documents/:id (only if uploaded by user)
DELETE /api/v1/documents/:id (only if uploaded by user)

GET /api/v1/users (read-only for bestuur)
POST /api/v1/users/invite (403 for bestuur)
```

---

## 9. Changelog

| Datum | Versie | Wijziging |
|-------|--------|-----------|
| 2026-01-26 | 1.0 | Initiële versie - bestuur flows (hybrid design) |

---

**Development kan nu starten.**
Complete specifications for Bestuur role with hybrid (desktop-first but responsive) design and clear read-only patterns.
