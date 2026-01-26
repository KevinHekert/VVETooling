# Core User Flows - Beheerder (Desktop-First)

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: UX Design  
- **Status**: Final
- **Versie**: 1.0
- **Doel**: Desktop-first UX concepten voor penningmeesters/beheerders (admin rol)

## Bronverwijzingen
- [Constraint UX-02: Role-Based UI](../../architecture/constraints/01-randvoorwaarden-ux-development.md#constraint-ux-02-role-based-ui-verschillen)
- [Constraint UX-01: Multi-Tenancy Awareness](../../architecture/constraints/01-randvoorwaarden-ux-development.md#constraint-ux-01-multi-tenancy-awareness)
- [EP-001: Financieel overzicht beheren](../../backlog/epics/01-mvp-epics.md)
- [EP-002: VVE-specifieke splitsingen](../../backlog/epics/01-mvp-epics.md)
- [EP-003: Jaarrekening en begroting](../../backlog/epics/01-mvp-epics.md)

---

## 1. Rol Definitie: Beheerder (Penningmeester)

### 1.1 Rol Kenmerken

**Permissions:**
- ✅ Full CRUD access (Create, Read, Update, Delete)
- ✅ Financiële transacties beheren
- ✅ Gebruikers uitnodigen en beheren
- ✅ VVE instellingen configureren (splitsingssleutels, reserves)
- ✅ Rapportages genereren (jaarrekening, begroting)
- ✅ Alle VVE data inzien

**Gebruikerscontext:**
- Primair gebruik: **Desktop/Laptop** (Windows/Mac)
- Gebruiksfrequentie: **Regelmatig** (wekelijks tot dagelijks)
- Digitale vaardigheid: **Gemiddeld tot hoog** (maar niet IT-professional)
- Motivatie: **Actief beheren** VVE financiën en administratie

**User Jobs-to-be-Done:**
1. "Ik wil financiële transacties snel kunnen registreren en categoriseren"
2. "Ik wil splitsingsberekeningen automatisch laten gebeuren"
3. "Ik wil een jaarrekening kunnen opstellen zonder Excel"
4. "Ik wil bewoners en bestuursleden kunnen uitnodigen"
5. "Ik wil financiële rapporten kunnen genereren voor het bestuur"

### 1.2 Design Constraints

**Must-Have:**
- ✅ Desktop-first design (optimized for 1280px+ screens)
- ✅ Keyboard shortcuts voor power users (Ctrl+S, Ctrl+N, etc.)
- ✅ Sidebar navigation (meer menu items dan bewoner)
- ✅ Multi-column layouts (efficient use of screen space)
- ✅ Complexere workflows acceptabel (power user)
- ✅ Data tables met sorting, filtering, search
- ✅ Bulk actions (select multiple, batch edit/delete)

**Performance:**
- ✅ Page load <2s still applies
- ✅ Table rendering optimized (virtualization for >100 rows)
- ✅ Form submissions <500ms response

**Responsive:**
- ✅ Still works on tablet (768px+)
- ✅ Mobile view available (but not primary)

---

## 2. Acceptance Criteria

### 2.1 Functional Requirements

- [x] Beheerder kan VVE setup compleet maken (wizard met 4 stappen)
- [x] Dashboard toont key financial metrics en recente activiteit
- [x] Transacties kunnen worden toegevoegd, bewerkt, verwijderd (full CRUD)
- [x] Automatische splitsingsberekeningen per appartement
- [x] Jaarrekening kan worden gegenereerd
- [x] Gebruikers kunnen worden uitgenodigd en beheerd
- [x] All data scoped to current VVE (multi-tenancy)
- [x] Role-based access (admin badge visible)

### 2.2 Non-Functional Requirements

**Desktop-First:**
- [x] Optimized voor 1280px+ schermen
- [x] Sidebar navigation altijd zichtbaar (desktop)
- [x] Multi-column layouts where beneficial
- [x] Responsive design for tablet/mobile

**Performance:**
- [x] Dashboard load <2s
- [x] Table rendering <500ms (with virtualization for >100 rows)
- [x] Form submissions <500ms response time

**Accessibility:**
- [x] WCAG 2.0 Level A compliant
- [x] Keyboard navigation (Tab, Ctrl shortcuts)
- [x] Screen reader compatible
- [x] Focus indicators visible

**Usability:**
- [x] Power user features (keyboard shortcuts, bulk actions)
- [x] Clear error messages and validation
- [x] Undo actions where possible
- [x] Confirmation for destructive actions

---

## 3. Implementation Notes

**Technology Stack:**
- React 18 + Next.js 14 (SSR for initial load performance)
- TypeScript 5 (type safety for complex admin logic)
- Tailwind CSS (consistent styling with design system)
- Headless UI (accessible modals, dropdowns, dialogs)
- React Hook Form (form handling and validation)
- TanStack Table (data tables with sorting, filtering, virtualization)

**Key Components to Build:**
1. VVE Setup Wizard (multi-step form)
2. Dashboard (metrics cards, recent activity, alerts)
3. Transactions Table (with CRUD, filtering, pagination)
4. Splitsing Calculator (automatic distribution based on aandelen)
5. User Management (invite, role assignment)
6. Reports Generator (jaarrekening, begroting)

**API Integration:**
```
GET  /api/v1/vve (current VVE details)
POST /api/v1/vve/setup (VVE wizard submission)
GET  /api/v1/dashboard (dashboard metrics)
GET  /api/v1/transactions (with filters, pagination)
POST /api/v1/transactions (create)
PATCH /api/v1/transactions/:id (update)
DELETE /api/v1/transactions/:id (delete)
GET  /api/v1/splitsing (calculation for period)
GET  /api/v1/reports/jaarrekening/:year (generate report)
GET  /api/v1/users (list VVE users)
POST /api/v1/users/invite (send invitation)
```

**Security Considerations:**
- All endpoints require admin role authentication
- Tenant_id enforced on all queries (multi-tenancy)
- Destructive actions require confirmation
- Audit log for critical actions (create/edit/delete transactions, user management)
- CSRF protection on all mutations

---

## 4. Changelog

| Datum | Versie | Wijziging |
|-------|--------|-----------|
| 2026-01-26 | 1.0 | Initiële versie - beheerder flows (desktop-first) |

---

**Development kan nu starten.**
Complete specifications for Beheerder role with desktop-first design patterns.
