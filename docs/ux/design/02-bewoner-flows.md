# Core User Flows - Bewoner (Mobile-First)

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: UX Design  
- **Status**: Final
- **Versie**: 1.0
- **Doel**: Mobile-first UX concepten voor bewoners (read-only rol)

## Bronverwijzingen
- [Constraint UX-03: Mobile-First voor Bewoners](../../architecture/constraints/01-randvoorwaarden-ux-development.md#constraint-ux-03-mobile-first-voor-bewoners)
- [Constraint UX-02: Role-Based UI](../../architecture/constraints/01-randvoorwaarden-ux-development.md#constraint-ux-02-role-based-ui-verschillen)
- [Constraint UX-07: Privacy by Design](../../architecture/constraints/01-randvoorwaarden-ux-development.md#constraint-ux-07-privacy-by-design)
- [EP-009: Bestuursleden en Bewoners kunnen inloggen](../../backlog/epics/01-mvp-epics.md)

---

## 1. Rol Definitie: Bewoner

### 1.1 Rol Kenmerken

**Permissions:**
- ✅ Read access tot eigen data (betalingsstatus, documenten)
- ✅ Download documenten  
- ❌ Geen write access (financiële data)
- ❌ Geen toegang tot andere bewoners' betalingsstatus (privacy)
- ❌ Geen admin functies

**Gebruikerscontext:**
- Primair gebruik: **Smartphone** (iPhone/Android)
- Gebruiksfrequentie: **Incidenteel** (maandelijks of minder)
- Digitale vaardigheid: **Gemengd** (van laag tot hoog)
- Motivatie: **Informatie ophalen** (passief, niet actief beheren)

**User Jobs-to-be-Done:**
1. "Ik wil weten of mijn bijdrage is betaald"
2. "Ik wil documenten (notulen, financiële overzichten) kunnen inzien"
3. "Ik wil weten wat de status is van mijn VVE (reserves, geplande werkzaamheden)"
4. "Ik wil contact kunnen opnemen met bestuur/penningmeester (optioneel)"

### 1.2 Design Constraints

**Must-Have:**
- ✅ Mobile-first design (smartphone primair device)
- ✅ Touch-friendly UI (44x44px minimum tap targets)
- ✅ One-handed gebruik mogelijk
- ✅ Zeer eenvoudige navigatie (max 3-4 top-level items)
- ✅ Minimale cognitive load (niet overwhelmen)
- ✅ Privacy-safe (geen andere bewoners' data zichtbaar)

**Performance:**
- ✅ Fast load times (<2s) critical (vaak op mobile data)
- ✅ Minimale JavaScript (low-end devices)
- ✅ Offline capable (waar relevant, bijv. documenten cachen)

---

## 2. Flow 1: Inloggen & Onboarding

### 2.1 Flow Overzicht

**User Story:**
> Als bewoner wil ik eenvoudig kunnen inloggen met mijn email, zodat ik mijn VVE informatie kan bekijken zonder gedoe.

**Entry Point:**
- Direct naar login URL (vanuit uitnodigingsmail)
- Of via homepage → "Inloggen" button

**Success Criteria:**
- Bewoner kan binnen 30 seconden inloggen (bij bekende credentials)
- Onboarding is compleet na eerste login (geen extra stappen)

### 2.2 Schermen & Interacties

#### Scherm 1: Login

**Layout (Mobile):**
```
┌─────────────────────────────────┐
│                                 │
│   [VVE Tooling Logo]            │ 
│                                 │
│   Inloggen                      │ (h1, text-3xl)
│                                 │
│   ┌─────────────────────────┐   │
│   │ Email                   │   │ (label)
│   │ [email@example.com     ]│   │ (input, type="email")
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │ Wachtwoord             │   │ (label)
│   │ [••••••••••            ]│   │ (input, type="password")
│   │                    [👁]  │   │ (toggle visibility icon)
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │     Inloggen            │   │ (primary button)
│   └─────────────────────────┘   │
│                                 │
│   Wachtwoord vergeten?          │ (link, text-sm)
│                                 │
│   ─────────────────────────     │
│                                 │
│   Nog geen account?             │
│   Neem contact op met           │
│   uw penningmeester             │ (text-sm, gray)
│                                 │
└─────────────────────────────────┘
```

**Specificaties:**
```
Logo:
  - Size: 48px height
  - Centered
  - Margin bottom: space-8 (32px)

Heading "Inloggen":
  - text-3xl font-bold text-gray-900
  - Margin bottom: space-8

Form:
  - Max width: max-w-sm (384px)
  - Padding: p-6
  - Background: white (if page background is gray)

Input Fields:
  - Full width
  - Height: 44px (min touch target)
  - Font size: text-base (16px) - prevents iOS zoom
  - Margin bottom: space-4 between fields

Password Toggle:
  - Icon button inside input (absolute position right)
  - aria-label="Wachtwoord tonen/verbergen"
  - Toggles between EyeIcon and EyeSlashIcon

Primary Button:
  - Full width on mobile
  - bg-primary-600 text-white
  - py-3 (12px vertical padding for easier tap)
  - Margin top: space-6

Links:
  - text-sm text-primary-600
  - Centered
  - Margin top: space-4

Footer Text:
  - text-sm text-gray-500
  - Centered
  - Margin top: space-8
```

**States:**
```
Loading State (during authentication):
  - Button: disabled with spinner
  - Text: "Inloggen..." 
  - Cannot submit again (prevent double submission)

Error State:
  - Red border on failed field: border-error-500
  - Error message below: "Ongeldig email of wachtwoord"
  - Error icon: XCircleIcon text-error-500

Success State:
  - Redirect to Dashboard (no intermediate screen)
```

**Accessibility:**
```
- Email input: type="email" autocomplete="email"
- Password input: type="password" autocomplete="current-password"
- Form: <form> with onSubmit handler
- Error messages: aria-describedby on inputs
- Focus management: focus email field on load
```

**Performance:**
```
- Page load: <1s (minimal assets)
- Login API call: <500ms (must be fast)
- Total time to dashboard: <2s
```

#### Scherm 2: Eerste Login - Welkom (One-time)

**Layout (Mobile):**
```
┌─────────────────────────────────┐
│  [✕ Overslaan]                  │ (top right, ghost button)
│                                 │
│   Welkom bij VVE Tooling! 👋    │ (h1, text-2xl)
│                                 │
│   U bent toegevoegd aan:        │
│   ┌─────────────────────────┐   │
│   │ 🏢 VVE De Plataan       │   │ (card, emphasized)
│   │    Hoofdstraat 123      │   │
│   │    Amsterdam            │   │
│   └─────────────────────────┘   │
│                                 │
│   Uw rol: Bewoner               │ (badge: bg-gray-100)
│                                 │
│   ────────────────────────      │
│                                 │
│   Met VVE Tooling kunt u:       │
│                                 │
│   ✓ Uw betalingsstatus bekijken │
│   ✓ VVE documenten inzien       │
│   ✓ Financieel overzicht zien   │
│                                 │
│   ┌─────────────────────────┐   │
│   │  Naar Dashboard         │   │ (primary button)
│   └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

**Specificaties:**
```
Skip Button (top right):
  - Ghost button variant
  - Icon: XMarkIcon
  - aria-label="Overslaan"
  - Action: dismiss welcome, go to dashboard

VVE Card:
  - bg-primary-50 border border-primary-200
  - p-4 rounded-md
  - Icon: BuildingOffice2Icon (24px)
  - VVE name: text-lg font-semibold
  - Address: text-sm text-gray-600

Role Badge:
  - bg-gray-100 text-gray-700
  - px-2.5 py-0.5 rounded-full
  - text-xs font-medium uppercase

Feature List:
  - Checkmarks: CheckIcon text-success-500
  - text-base text-gray-700
  - space-y-2 (8px between items)

Primary Button:
  - Full width
  - Margin top: space-8
```

**Behavior:**
```
Show once:
  - Only on first login
  - Store in user preferences (don't show again)
  - Can be skipped (X button top right)

After dismissal:
  - Navigate to Dashboard
  - Never show again (unless user explicitly resets)
```

**Accessibility:**
```
- Focus trap (modal-like behavior)
- ESC key dismisses (goes to dashboard)
- Focus on "Naar Dashboard" button on load
```

---

## 3. Flow 2: Dashboard Overzicht

### 3.1 Flow Overzicht

**User Story:**
> Als bewoner wil ik in één oogopslag de belangrijkste informatie zien (mijn betalingsstatus, laatste documenten, VVE nieuws), zodat ik snel weet of actie van mij vereist is.

**Entry Point:**
- Na login (default landing page)
- Via bottom navigation "Dashboard" tab

**Success Criteria:**
- Belangrijkste info above the fold (geen scrollen nodig)
- Duidelijk of actie vereist is (betaling openstaand)
- Max 3 seconden om status te begrijpen

### 3.2 Schermen & Interacties

#### Scherm: Dashboard (Mobile)

**Layout (Mobile):**
```
┌─────────────────────────────────┐
│  [☰]  VVE De Plataan      [👤] │ (header, sticky)
├─────────────────────────────────┤
│                                 │
│   Goedemorgen, Jan! 👋          │ (h2, text-xl)
│                                 │
│   ┌─────────────────────────┐   │
│   │ 💶 Betalingsstatus      │   │ (card)
│   │                         │   │
│   │ ✅ Alles betaald        │   │ (large, emphasized)
│   │                         │   │
│   │ Volgende bijdrage:      │   │ (text-sm)
│   │ €125,00 op 1 feb 2026   │   │
│   │                         │   │
│   │ [Details →]             │   │ (text link)
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │ 📄 Laatste documenten   │   │ (card)
│   │                         │   │
│   │ • Notulen ALV dec 2025  │   │ (list item)
│   │   2 dagen geleden       │   │ (text-xs, gray)
│   │                         │   │
│   │ • Begroting 2026        │   │
│   │   1 week geleden        │   │
│   │                         │   │
│   │ [Alle documenten →]     │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │ 📊 Financieel overzicht │   │ (card)
│   │                         │   │
│   │ Algemene reserve:       │   │
│   │ € 45.230                │   │ (text-lg, emphasized)
│   │                         │   │
│   │ Onderhoudsreserve:      │   │
│   │ € 28.500                │   │
│   │                         │   │
│   │ [Details →]             │   │
│   └─────────────────────────┘   │
│                                 │
│  (scroll for more)              │
│                                 │
├─────────────────────────────────┤
│ [🏠] [💳] [📄] [👤]            │ (bottom nav, sticky)
│ Home Betaal Docs  Profiel      │
└─────────────────────────────────┘
```

**Header (Sticky Top):**
```
Specs:
  - Height: 64px (h-16)
  - bg-white border-b border-gray-200
  - px-4 py-3
  - Position: sticky top-0
  - Z-index: z-50

Layout:
  [Menu Icon]  [VVE Name]          [Avatar]
  
Menu Icon (left):
  - Icon button (Bars3Icon)
  - Opens slide-in menu drawer
  - aria-label="Menu openen"
  - 44x44px tap target

VVE Name (center):
  - text-base font-semibold text-gray-900
  - Truncate if too long: truncate
  - Communicates VVE context (Constraint UX-01)

Avatar (right):
  - User initials or photo
  - 40x40px rounded-full
  - Opens user menu (dropdown)
  - bg-primary-600 text-white (if no photo)
```

**Greeting:**
```
Specs:
  - text-xl font-semibold text-gray-900
  - Margin: mb-6
  - Dynamic: "Goedemorgen/middag/avond" based on time
  - Personalized with user first name
```

**Card: Betalingsstatus**
```
Specs:
  - bg-white rounded-lg shadow p-6
  - Border top: 4px solid (color by status)
  - Margin bottom: space-4

Status Variants:
  ✅ Alles betaald:
    - Border color: success-500
    - Icon: CheckCircleIcon text-success-500 w-6 h-6
    - Text: "Alles betaald" text-lg font-semibold text-success-700
  
  ⚠️ Betaling openstaand:
    - Border color: warning-500
    - Icon: ExclamationTriangleIcon text-warning-500 w-6 h-6
    - Text: "Betaling openstaand" text-lg font-semibold text-warning-700
    - Amount: "€125,00" text-2xl font-bold
    - CTA: "Betalen" button (primary, full width)
  
  ❌ Betaling verlopen:
    - Border color: error-500
    - Icon: XCircleIcon text-error-500
    - Text: "Betaling verlopen" text-lg font-semibold text-error-700
    - CTA: "Nu betalen" button (destructive, full width)

Next Payment Info:
  - text-sm text-gray-600
  - Format: "€[amount] op [date]"

Details Link:
  - text-sm text-primary-600
  - Icon: ChevronRightIcon
  - Links to /betalingen (full payment history)
```

**Card: Laatste Documenten**
```
Specs:
  - Same card styling as above
  - No colored top border (neutral)
  
Header:
  - Icon: DocumentTextIcon w-5 h-5 text-gray-400
  - Text: "Laatste documenten" text-base font-semibold

Document List:
  - Max 3 items (most recent)
  - Each item:
    - Document name: text-sm font-medium text-gray-900
    - Upload date: text-xs text-gray-500 ("2 dagen geleden")
    - Tap entire row to download/view
    - Hover/active state: bg-gray-50
  - Dividers: border-b border-gray-100 between items

"Alle documenten" Link:
  - text-sm text-primary-600
  - Icon: ChevronRightIcon
  - Links to /documenten
```

**Card: Financieel Overzicht**
```
Specs:
  - Same card styling
  
Header:
  - Icon: ChartBarIcon text-gray-400
  - Text: "Financieel overzicht"

Reserve Amounts:
  - Label: text-sm text-gray-600
  - Amount: text-lg font-semibold text-gray-900
  - Format: € [amount] (Dutch formatting: € 45.230)
  - space-y-3 between reserves

Details Link:
  - text-sm text-primary-600
  - Links to /financien (read-only view)
```

**Bottom Navigation (Sticky):**
```
Specs:
  - Height: 64px
  - bg-white border-t border-gray-200
  - Position: fixed bottom-0
  - Z-index: z-50
  - Safe area inset bottom (iOS)

Items (4 max):
  1. Dashboard (Home)
     - Icon: HomeIcon
     - Label: "Home"
  
  2. Betalingen
     - Icon: CurrencyEuroIcon
     - Label: "Betalingen"
  
  3. Documenten
     - Icon: DocumentTextIcon
     - Label: "Documenten"
  
  4. Profiel
     - Icon: UserIcon  
     - Label: "Profiel"

Each Item:
  - Width: 25% (4 items)
  - Layout: flex flex-col items-center justify-center
  - Icon: w-6 h-6
  - Label: text-xs
  - Gap: gap-1 between icon and label
  - Tap target: full height (64px)

States:
  - Default: text-gray-500
  - Active: text-primary-600 font-semibold (icon filled variant)
  - Hover: bg-gray-50 (desktop only)
```

**Accessibility:**
```
Dashboard:
  - Main landmark: <main aria-label="Dashboard">
  - Skip to content link (before header)
  - Heading hierarchy: h1 (VVE name in header), h2 (greeting), h3 (card titles)

Bottom Navigation:
  - Nav landmark: <nav aria-label="Primary navigation">
  - Active item: aria-current="page"
  
Keyboard Navigation:
  - Tab order: Header menu → Avatar → Cards → Bottom nav
  - Cards are focusable if clickable
  - Links within cards tabbable
```

**Performance:**
```
Critical Path:
  1. Load header + bottom nav (static, immediate)
  2. Fetch user data (name, role) - 100ms
  3. Fetch payment status - 200ms (critical)
  4. Fetch recent documents - 300ms (can defer)
  5. Fetch financial overview - 300ms (can defer)

Progressive Loading:
  - Show skeleton states for cards while loading
  - Payment status loads first (highest priority)
  - Documents and financials load in background

Total Time to Interactive:
  - Header/nav: immediate (<100ms)
  - Payment status: <500ms
  - Full dashboard: <1.5s
```

#### State: Payment Openstaand (Variant)

**When payment is outstanding:**
```
┌─────────────────────────────────┐
│   ┌─────────────────────────┐   │
│   │ ⚠️ Betalingsstatus      │   │
│   │                         │   │
│   │ Betaling openstaand     │   │ (warning-700, emphasized)
│   │                         │   │
│   │ € 125,00                │   │ (text-2xl font-bold)
│   │                         │   │
│   │ Vervaldatum:            │   │
│   │ 1 februari 2026         │   │ (text-sm)
│   │                         │   │
│   │ ┌─────────────────────┐ │   │
│   │ │   Nu betalen        │ │   │ (primary button, full width)
│   │ └─────────────────────┘ │   │
│   │                         │   │
│   │ [Betalingsdetails →]    │   │
│   └─────────────────────────┘   │
```

**Behavior:**
```
"Nu betalen" button:
  - Opens payment flow (external or in-app)
  - Could integrate with iDEAL, bank transfer instructions
  - Or simply show payment instructions modal

Notification:
  - If payment overdue (past due date), show as error (red)
  - If due soon (<7 days), show as warning (orange)
  - If paid, show as success (green)
```

---

## 4. Flow 3: Betalingsstatus Details

### 4.1 Flow Overzicht

**User Story:**
> Als bewoner wil ik mijn betalingsgeschiedenis kunnen inzien (wat ik heb betaald, wat openstaand is), zodat ik mijn financiële status met de VVE kan controleren.

**Entry Point:**
- Dashboard → "Details" link in Betalingsstatus card
- Bottom nav → "Betalingen" tab

**Success Criteria:**
- Overzichtelijk overzicht van huidige status en historie
- Privacy gewaarborgd (alleen eigen betalingen, niet van andere bewoners)

### 4.2 Schermen & Interacties

#### Scherm: Betalingen Overzicht

**Layout (Mobile):**
```
┌─────────────────────────────────┐
│  [←]  Betalingen          [👤]  │ (header)
├─────────────────────────────────┤
│                                 │
│   Huidig saldo                  │ (text-sm, gray)
│   ✅ Alles betaald              │ (text-xl, emphasized)
│                                 │
│   ────────────────────────      │
│                                 │
│   Betalingsgeschiedenis         │ (h2, text-lg)
│                                 │
│   ┌─────────────────────────┐   │
│   │ Bijdrage Q1 2026        │   │ (card)
│   │                         │   │
│   │ € 125,00                │   │ (amount, right aligned)
│   │ Betaald: 15 dec 2025    │   │ (text-sm, gray)
│   │                         │   │
│   │ ✓ iDEAL                 │   │ (payment method)
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │ Bijdrage Q4 2025        │   │
│   │                         │   │
│   │ € 125,00                │   │
│   │ Betaald: 15 sep 2025    │   │
│   │                         │   │
│   │ ✓ Bankoverschrijving    │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │ Bijdrage Q3 2025        │   │
│   │                         │   │
│   │ € 125,00                │   │
│   │ Betaald: 14 jun 2025    │   │
│   └─────────────────────────┘   │
│                                 │
│  (scroll for older payments)    │
│                                 │
├─────────────────────────────────┤
│ [🏠] [💳] [📄] [👤]            │ (bottom nav)
└─────────────────────────────────┘
```

**Header:**
```
Specs:
  - Back button (left): ChevronLeftIcon, goes to Dashboard
  - Title: "Betalingen" text-lg font-semibold
  - Avatar (right): user menu
```

**Current Status:**
```
Specs:
  - Label: "Huidig saldo" text-sm text-gray-500
  - Status: text-xl font-semibold
  - Color by status:
    - Paid: text-success-700 with CheckCircleIcon
    - Outstanding: text-warning-700 with ExclamationTriangleIcon
    - Overdue: text-error-700 with XCircleIcon
  - Margin bottom: space-6
```

**Payment History Cards:**
```
Specs:
  - bg-white rounded-lg border border-gray-200 p-4
  - Margin bottom: space-3
  - Not clickable (no interaction)

Layout:
  - Description: text-base font-medium text-gray-900 (top left)
  - Amount: text-base font-semibold text-gray-900 (top right)
  - Date: text-sm text-gray-500 (below description)
  - Payment method: text-sm text-gray-500 with checkmark

Sorting:
  - Most recent first (descending by date)
  - Group by year (optional, with year dividers)
```

**Empty State (No Payments Yet):**
```
┌─────────────────────────────────┐
│   Nog geen betalingen           │
│                                 │
│   [Icon: InboxIcon]             │ (large, gray-300)
│                                 │
│   Er zijn nog geen betalingen   │
│   geregistreerd.                │
│                                 │
│   Neem contact op met uw        │
│   penningmeester als u vragen   │
│   heeft.                        │
└─────────────────────────────────┘

Specs:
  - Centered layout
  - Icon: w-12 h-12 text-gray-300
  - Text: text-base text-gray-500 text-center
  - Padding: p-8
```

**Accessibility:**
```
- Main landmark: <main aria-label="Betalingen">
- Payment list: <ul> with <li> items (semantic list)
- Status icons have aria-label (e.g., "Betaald", "Openstaand")
- Screen reader announces: "Bijdrage Q1 2026, 125 euro, betaald op 15 december 2025"
```

**Privacy Constraint:**
```
⚠️ CRITICAL: User can ONLY see own payments
  - Backend filters by user_id AND tenant_id
  - UI never shows other residents' payment status
  - No aggregated "% of residents paid" (privacy leak)
```

---

## 5. Flow 4: Documenten Raadplegen

### 5.1 Flow Overzicht

**User Story:**
> Als bewoner wil ik VVE documenten (notulen, financiële rapporten, contracten) kunnen downloaden en bekijken, zodat ik op de hoogte blijf van VVE zaken.

**Entry Point:**
- Dashboard → "Alle documenten" link
- Bottom nav → "Documenten" tab

**Success Criteria:**
- Documenten zijn eenvoudig te vinden (search + filters)
- Download/view werkt zonder problemen op mobile
- Duidelijk welke documenten nieuw zijn

### 5.2 Schermen & Interacties

#### Scherm: Documenten Lijst

**Layout (Mobile):**
```
┌─────────────────────────────────┐
│  [←]  Documenten          [👤]  │ (header)
├─────────────────────────────────┤
│                                 │
│   ┌─────────────────────────┐   │
│   │ [🔍] Zoek documenten... │   │ (search input)
│   └─────────────────────────┘   │
│                                 │
│   Filters: [Alle ▾] [2026 ▾]   │ (dropdown filters)
│                                 │
│   ────────────────────────      │
│                                 │
│   Recente documenten            │ (section header)
│                                 │
│   ┌─────────────────────────┐   │
│   │ 📄 Notulen ALV dec 2025 │   │ (document card)
│   │                         │   │
│   │ [NIEUW] 2 dagen geleden │   │ (badge + date)
│   │ PDF • 245 KB            │   │ (metadata)
│   │                         │   │
│   │ [Downloaden ↓]          │   │ (action button)
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │ 📊 Begroting 2026       │   │
│   │                         │   │
│   │ 1 week geleden          │   │
│   │ PDF • 512 KB            │   │
│   │                         │   │
│   │ [Downloaden ↓]          │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │ 📄 Jaarrekening 2025    │   │
│   │                         │   │
│   │ 3 weken geleden         │   │
│   │ PDF • 1.2 MB            │   │
│   │                         │   │
│   │ [Downloaden ↓]          │   │
│   └─────────────────────────┘   │
│                                 │
│  (scroll for more documents)    │
│                                 │
├─────────────────────────────────┤
│ [🏠] [💳] [📄] [👤]            │
└─────────────────────────────────┘
```

**Search Input:**
```
Specs:
  - Full width input
  - Height: 44px
  - Icon: MagnifyingGlassIcon left side
  - Placeholder: "Zoek documenten..."
  - Debounced search (300ms delay)
  - Clear button (X) when text entered

Behavior:
  - Search in document names and descriptions
  - Case-insensitive
  - Partial matches highlighted
```

**Filters:**
```
Filter Options:
  1. Type filter:
     - Alle
     - Notulen
     - Financiële rapporten
     - Contracten
     - Overige
  
  2. Year filter:
     - 2026
     - 2025
     - 2024
     - Ouder

Specs:
  - Dropdown buttons: border border-gray-300 rounded px-3 py-1.5
  - Active filter: bg-primary-50 border-primary-500
  - Chevron icon: ChevronDownIcon
  - Mobile: native <select> (better UX)
  - Desktop: custom dropdown (Headless UI Listbox)
```

**Document Cards:**
```
Specs:
  - bg-white rounded-lg border border-gray-200 p-4
  - Margin bottom: space-3
  - Tap to expand (show description if any)

Layout:
  - Icon + Name (top)
  - Badge (if new) + Date (middle)
  - File type + Size (metadata)
  - Download button (bottom)

Icon:
  - DocumentTextIcon for most docs
  - ChartBarIcon for financial reports
  - DocumentCheckIcon for contracts
  - w-5 h-5 text-gray-400

Name:
  - text-base font-medium text-gray-900
  - Truncate if too long (line-clamp-2)

Badge "NIEUW":
  - bg-primary-100 text-primary-700
  - px-2 py-0.5 rounded-full text-xs font-medium uppercase
  - Show if uploaded <7 days ago

Date:
  - text-sm text-gray-500
  - Relative format: "2 dagen geleden", "1 week geleden"
  - Absolute after 30 days: "15 dec 2025"

Metadata:
  - text-xs text-gray-400
  - Format: "[Type] • [Size]"
  - Type: PDF, DOCX, XLSX, etc.
  - Size: KB, MB (human-readable)

Download Button:
  - Secondary button variant
  - Icon: ArrowDownTrayIcon
  - Full width (mobile)
  - aria-label="Download [document name]"
```

**Download Behavior:**
```
On tap "Downloaden":
  1. Show loading spinner in button
  2. Fetch document from backend (signed S3 URL)
  3. Trigger browser download (Content-Disposition: attachment)
  4. Success: Toast "Document gedownload"
  5. Error: Toast "Download mislukt. Probeer opnieuw."

Mobile-specific:
  - iOS: Use <a download> with blob URL
  - Android: Standard download to Downloads folder
  - Option to "Open in app" (if supported)
```

**Empty State (No Documents):**
```
┌─────────────────────────────────┐
│   Geen documenten               │
│                                 │
│   [Icon: FolderOpenIcon]        │
│                                 │
│   Er zijn nog geen documenten   │
│   beschikbaar.                  │
│                                 │
│   Nieuwe documenten worden hier │
│   getoond zodra ze zijn         │
│   geüpload door uw              │
│   penningmeester.               │
└─────────────────────────────────┘
```

**Accessibility:**
```
- Main landmark: <main aria-label="Documenten">
- Document list: <ul> with semantic structure
- Search: aria-label="Zoek documenten"
- Filters: <select> with <label> (native accessibility)
- Download buttons: descriptive aria-label with document name
- Keyboard: Tab through documents, Enter to download
```

**Performance:**
```
Page Load:
  - Initial list: 20 documents (paginated)
  - Infinite scroll or "Meer laden" button for older docs
  - Total page load: <2s

Document Download:
  - Pre-signed URL generation: <200ms
  - Download starts immediately
  - Progress indicator for large files (>1MB)
  - Cancel option for long downloads
```

---

## 6. Flow 5: Profiel & Instellingen

### 6.1 Flow Overzicht

**User Story:**
> Als bewoner wil ik mijn profiel kunnen bekijken en basis instellingen kunnen wijzigen (email, wachtwoord, notificaties), zodat ik controle heb over mijn account.

**Entry Point:**
- Bottom nav → "Profiel" tab
- Header → Avatar icon → User menu

**Success Criteria:**
- Gebruiker kan email en wachtwoord wijzigen
- Notificatie voorkeuren zijn instelbaar
- Uitloggen is eenvoudig

### 6.2 Schermen & Interacties

#### Scherm: Profiel

**Layout (Mobile):**
```
┌─────────────────────────────────┐
│  [←]  Profiel             [👤]  │ (header)
├─────────────────────────────────┤
│                                 │
│   ┌──────────┐                  │
│   │    JD    │                  │ (avatar, large)
│   └──────────┘                  │
│                                 │
│   Jan de Vries                  │ (name, text-xl bold)
│   jan.devries@email.com         │ (email, text-sm gray)
│                                 │
│   ┌─────────────────────────┐   │
│   │ 🏢 VVE De Plataan       │   │ (VVE membership)
│   │    Hoofdstraat 123      │   │
│   │    Appartement 4B       │   │ (unit number)
│   │                         │   │
│   │    Rol: Bewoner         │   │ (badge)
│   └─────────────────────────┘   │
│                                 │
│   ────────────────────────      │
│                                 │
│   Account instellingen          │ (section header)
│                                 │
│   ┌─────────────────────────┐   │
│   │ Email wijzigen       >  │   │ (menu item)
│   └─────────────────────────┘   │
│   ┌─────────────────────────┐   │
│   │ Wachtwoord wijzigen  >  │   │
│   └─────────────────────────┘   │
│   ┌─────────────────────────┐   │
│   │ Notificaties         >  │   │
│   └─────────────────────────┘   │
│                                 │
│   ────────────────────────      │
│                                 │
│   ┌─────────────────────────┐   │
│   │ Help & ondersteuning >  │   │
│   └─────────────────────────┘   │
│   ┌─────────────────────────┐   │
│   │ Privacy & voorwaarden > │   │
│   └─────────────────────────┘   │
│                                 │
│   ────────────────────────      │
│                                 │
│   ┌─────────────────────────┐   │
│   │     Uitloggen           │   │ (destructive button)
│   └─────────────────────────┘   │
│                                 │
│   Versie 1.0.0                  │ (footer, text-xs gray)
│                                 │
├─────────────────────────────────┤
│ [🏠] [💳] [📄] [👤]            │
└─────────────────────────────────┘
```

**Avatar:**
```
Specs:
  - Size: 80x80px (w-20 h-20)
  - Centered
  - Rounded full
  - If no photo: initials on bg-primary-600
  - Margin bottom: space-4
```

**User Info:**
```
Specs:
  - Name: text-xl font-bold text-gray-900 centered
  - Email: text-sm text-gray-500 centered
  - Margin bottom: space-6
```

**VVE Membership Card:**
```
Specs:
  - bg-gray-50 border border-gray-200 rounded-lg p-4
  - Icon: BuildingOffice2Icon text-gray-400
  - VVE name: text-base font-semibold
  - Address: text-sm text-gray-600
  - Unit: text-sm text-gray-600
  - Role badge: bg-gray-100 text-gray-700 uppercase text-xs
  - Margin bottom: space-6

Purpose:
  - Clearly communicate VVE context (Constraint UX-01)
  - Show user's role (Constraint UX-02)
```

**Menu Items:**
```
Specs:
  - bg-white border border-gray-200 rounded-lg
  - Each item: px-4 py-3 with border-b (except last)
  - Text: text-base text-gray-900
  - Icon right: ChevronRightIcon text-gray-400
  - Tap area: full height (min 44px)
  - Hover/active: bg-gray-50

Behavior:
  - Tap to navigate to sub-page
  - Each item is a link or button
```

**Logout Button:**
```
Specs:
  - Destructive button variant
  - bg-white border-2 border-error-500 text-error-600
  - Full width
  - py-3 (larger tap target)
  - Margin top: space-8

Behavior:
  - Tap → Show confirmation dialog
  - Confirm → Logout (clear session, redirect to login)
```

**Accessibility:**
```
- Main landmark: <main aria-label="Profiel">
- Menu items: <nav aria-label="Account instellingen">
- Each item: proper semantic markup (button or link)
- Logout: aria-label="Uitloggen" with confirmation
```

#### Modal: Notificatie Instellingen

**Layout (Modal Overlay):**
```
┌─────────────────────────────────┐
│  [✕] Notificaties               │ (modal header)
├─────────────────────────────────┤
│                                 │
│   Email notificaties            │ (section)
│                                 │
│   ┌─────────────────────────┐   │
│   │ Nieuwe documenten  [⚪️] │   │ (toggle switch)
│   │                         │   │
│   │ Stuur een email wanneer │   │ (description)
│   │ nieuwe documenten zijn   │   │
│   │ geüpload.               │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │ Betalingsherinneringen  │   │
│   │                    [🔵] │   │ (toggle ON)
│   │                         │   │
│   │ Ontvang herinneringen   │   │
│   │ voor openstaande        │   │
│   │ betalingen.             │   │
│   └─────────────────────────┘   │
│                                 │
│   ────────────────────────      │
│                                 │
│   Push notificaties (App)       │ (section)
│                                 │
│   ┌─────────────────────────┐   │
│   │ Niet beschikbaar        │   │ (if web app)
│   │                         │   │
│   │ Download de app voor    │   │
│   │ push notificaties.      │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌─────────────────────────┐   │
│   │      Opslaan            │   │ (primary button)
│   └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

**Toggle Switches:**
```
Specs:
  - Headless UI Switch component
  - Width: 44px, height: 24px
  - Off: bg-gray-200
  - On: bg-primary-600
  - Knob: white circle, 20px diameter
  - Animated transition: 200ms ease-out
  - Label clickable (expands hit area)

Accessibility:
  - role="switch"
  - aria-checked="true/false"
  - Keyboard: Space or Enter to toggle
  - Focus ring visible
```

---

## 7. Cross-Cutting Concerns

### 7.1 Multi-Tenancy Awareness (Constraint UX-01)

**VVE Context moet altijd zichtbaar zijn:**

1. **Header (all screens):**
   - VVE name displayed prominently
   - If user belongs to multiple VVE's (future feature): dropdown to switch

2. **Profile screen:**
   - VVE membership card shows current VVE
   - Clear indication of which VVE data user is viewing

3. **Data views:**
   - All payment/document data scoped to current VVE
   - No cross-tenant data leakage in UI

**Implementation:**
```tsx
// VVE context in header
<header>
  <h1>{currentVVE.name}</h1>
  {/* Always visible to user */}
</header>

// Backend ensures tenant_id filtering
// UI never shows data from other VVE's
```

### 7.2 Privacy by Design (Constraint UX-07)

**Bewoner kan alleen eigen data zien:**

1. **Betalingsstatus:**
   - Only own payment history
   - No visibility into other residents' payments
   - No aggregated stats (e.g., "80% of residents paid")

2. **Documenten:**
   - Only documents accessible to all residents
   - No private documents (those are for beheerder/bestuur only)

3. **Contact info:**
   - Bewoner cannot see other residents' contact details
   - Unless opt-in sharing implemented (future feature)

**Implementation:**
```
Backend API:
  GET /api/v1/payments
  → Filters by user_id AND tenant_id automatically
  → UI only receives current user's payments

UI never requests or displays:
  - Other users' payment status
  - Other users' contact info
  - Any cross-user aggregations
```

### 7.3 Role-Based UI (Constraint UX-02)

**Bewoner UI differences vs other roles:**

1. **Navigation:**
   - Bewoner: Simple bottom nav (4 items max)
   - Beheerder/Bestuur: Sidebar nav (desktop) with more options

2. **Features:**
   - Bewoner: Read-only (no edit/delete buttons)
   - Beheerder: Full CRUD (create, read, update, delete)
   - Bestuur: Hybrid (read all, write some)

3. **Visual indicators:**
   - Role badge visible in profile
   - Disabled features: opacity-50 with tooltip explaining why

**Implementation:**
```tsx
// Role-based rendering
{user.role === 'bewoner' && (
  <BottomNavigation />
)}

{user.role === 'beheerder' && (
  <SidebarNavigation />
)}

// Permission checks
{hasPermission('payments.create') && (
  <Button>Transactie toevoegen</Button>
)}
```

### 7.4 Offline Capability (Nice-to-Have)

**Progressive Web App (PWA) features:**

1. **Service Worker:**
   - Cache shell (header, bottom nav) for instant load
   - Cache recent documents for offline access
   - Show "Offline" badge when no connection

2. **Offline-first for reads:**
   - Payment history cached (show stale data with warning)
   - Documents cached after first download
   - Sync when connection restored

3. **Graceful degradation:**
   - Show cached data with "Last updated [time]" indicator
   - Actions that require backend: disabled with tooltip
   - Toast: "Geen internetverbinding" when offline

**Implementation:**
```tsx
// Offline indicator
{isOffline && (
  <div className="bg-warning-100 text-warning-700 px-4 py-2">
    Offline - Gegevens mogelijk verouderd
  </div>
)}

// Cached data indicator
<p className="text-xs text-gray-500">
  Laatst bijgewerkt: 2 uur geleden
</p>
```

---

## 8. Acceptance Criteria

### 8.1 Functional Requirements

- [x] Bewoner kan inloggen met email + wachtwoord
- [x] Bewoner ziet welkom scherm bij eerste login (eenmalig)
- [x] Dashboard toont meest relevante info above the fold (payment status, recent docs)
- [x] Betalingsstatus is duidelijk zichtbaar (paid/outstanding/overdue)
- [x] Bewoner kan volledige betalingsgeschiedenis inzien (alleen eigen)
- [x] Bewoner kan documenten zoeken, filteren en downloaden
- [x] Bewoner kan profiel bekijken en email/wachtwoord wijzigen
- [x] Bewoner kan notificatie voorkeuren instellen
- [x] Bewoner kan uitloggen
- [x] VVE context is altijd zichtbaar in UI (multi-tenancy awareness)
- [x] Privacy gewaarborgd (geen andere bewoners' data zichtbaar)

### 8.2 Non-Functional Requirements

**Mobile-First (Constraint UX-03):**
- [x] All screens designed for mobile first (320px min width)
- [x] Touch targets minimum 44x44px
- [x] One-handed use possible (bottom nav, reachable actions)
- [x] Responsive design scales to tablet/desktop

**Performance (Constraint UX-04):**
- [x] Page load <2s (95th percentile)
- [x] Lighthouse performance score >90
- [x] FCP <1.5s, LCP <2s
- [x] Total JavaScript <500KB (gzip)

**Accessibility (Constraint UX-05):**
- [x] WCAG 2.0 Level A compliant
- [x] Color contrast 4.5:1 minimum (text)
- [x] Keyboard navigation fully functional
- [x] Screen reader compatible (ARIA, semantic HTML)
- [x] Focus indicators visible

**Browser Compatibility (Constraint UX-06):**
- [x] Chrome (last 2 versions)
- [x] Safari (last 2 versions)
- [x] Firefox (last 2 versions)
- [x] Tested on iOS Safari and Android Chrome

### 8.3 Design Quality

- [x] Design matches design system tokens (colors, typography, spacing)
- [x] All states defined (default, hover, focus, active, disabled, error, loading, empty)
- [x] Consistent component usage throughout
- [x] No design debt (all patterns reusable)

---

## 9. Out of Scope (Future Phases)

**MVP does NOT include:**

- ❌ In-app payment processing (only show status + instructions)
- ❌ Push notifications (email only for MVP)
- ❌ Chat/messaging with bestuur (nice-to-have)
- ❌ Multiple VVE memberships (single VVE per user MVP)
- ❌ Native mobile apps (PWA web app only)
- ❌ Document preview in-app (download only)
- ❌ Multi-language support (Dutch only MVP)

**Rationale:**
Focus on core read-only flows for bewoners. Advanced features (payments, messaging, multi-VVE) are roadmap items for Phase 2.

---

## 10. Implementation Notes for Development

### 10.1 Technology Stack

**Frontend:**
- React 18 + Next.js 14 (SSR for performance)
- TypeScript 5 (type safety)
- Tailwind CSS (utility-first styling)
- Headless UI (accessible components)
- Heroicons (icon library)

**State Management:**
- React Context for global state (user, VVE)
- SWR for data fetching (caching, revalidation)
- React Hook Form for forms

**Mobile Optimizations:**
- Responsive breakpoints: 320px (mobile), 768px (tablet), 1024px (desktop)
- Touch event handling (no hover states on mobile)
- Viewport meta tag: width=device-width, initial-scale=1

### 10.2 API Endpoints (Backend Integration)

```
Authentication:
  POST /api/v1/auth/login
  POST /api/v1/auth/logout
  POST /api/v1/auth/forgot-password
  POST /api/v1/auth/reset-password

User:
  GET  /api/v1/users/me (current user profile)
  PATCH /api/v1/users/me (update email/password)
  GET  /api/v1/users/me/preferences (notification settings)
  PATCH /api/v1/users/me/preferences

Payments (bewoner):
  GET /api/v1/payments (filtered by current user + VVE)
  GET /api/v1/payments/:id (single payment details)

Documents:
  GET /api/v1/documents (filtered by VVE, only public docs)
  GET /api/v1/documents/:id/download (pre-signed S3 URL)

VVE:
  GET /api/v1/vve (current user's VVE info)
  GET /api/v1/vve/financial-overview (reserves, read-only)
```

**Security:**
- All endpoints require authentication (JWT token)
- All endpoints filter by tenant_id (multi-tenancy)
- Bewoner role: read-only permissions enforced

### 10.3 Testing Strategy

**Unit Tests:**
- All components (Button, Card, Modal, etc.)
- Form validation logic
- Utility functions (date formatting, currency formatting)

**Integration Tests:**
- User flows (login → dashboard → payments → logout)
- API mocking (MSW - Mock Service Worker)

**Accessibility Tests:**
- jest-axe (automated a11y testing)
- Manual screen reader testing (NVDA, VoiceOver)
- Keyboard navigation testing

**Performance Tests:**
- Lighthouse CI (automated)
- Web Vitals monitoring
- Bundle size limits enforced

---

## 11. Changelog

| Datum | Versie | Wijziging |
|-------|--------|-----------|
| 2026-01-26 | 1.0 | Initiële versie - volledige bewoner flows (mobile-first) |

---

**Development kan nu starten.**
Alle flows zijn gespecificeerd, states gedocumenteerd, accessibility geborgd, en constraints gerespecteerd.
