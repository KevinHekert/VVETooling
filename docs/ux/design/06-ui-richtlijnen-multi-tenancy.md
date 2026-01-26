# UI Richtlijnen - Multi-Tenancy

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: UX Design  
- **Status**: Final
- **Versie**: 1.0
- **Doel**: Multi-tenancy awareness zonder data lekkage in UI

## Bronverwijzingen
- [Constraint UX-01: Multi-Tenancy Awareness](../../architecture/constraints/01-randvoorwaarden-ux-development.md#constraint-ux-01-multi-tenancy-awareness)
- [Design System](01-design-system.md)

---

## 1. Multi-Tenancy Principe

### 1.1 Kern Regel

**VVE Context moet ALTIJD zichtbaar zijn voor gebruikers.**

**Rationale:**
- Voorkomt verwarring (vooral voor bestuursleden die mogelijk in meerdere VVE's zitten - toekomstige feature)
- Security: user moet zich bewust zijn van welke VVE's data hij/zij bekijkt
- Geen cross-tenant data lekkage mogelijk via UI

### 1.2 Design Implications

1. **VVE Name in Header** (altijd zichtbaar)
2. **VVE Context Card** (profiel pagina)
3. **Geen cross-tenant widgets** (geen aggregaties over meerdere VVE's)
4. **Tenant-scoped URLs** (optioneel: `/vve/{slug}/dashboard`)

---

## 2. VVE Context in Header

### 2.1 Desktop Header

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [☰] VVE Tooling  [🏢 VVE De Plataan ▾]     Jan de Vries [👤]│
└─────────────────────────────────────────────────────────────┘
```

**Specificaties:**
```html
<header class="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-50">
  <!-- Left: Logo + Menu -->
  <div class="flex items-center gap-4">
    <button class="lg:hidden" aria-label="Menu">
      <Bars3Icon class="w-6 h-6" />
    </button>
    <div class="flex items-center gap-3">
      <img src="/logo.svg" alt="VVE Tooling" class="h-8" />
      <span class="text-xl font-bold text-gray-900 hidden sm:block">VVE Tooling</span>
    </div>
  </div>
  
  <!-- Center: VVE Context (CRITICAL) -->
  <div class="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-md border border-gray-200">
    <BuildingOffice2Icon class="w-5 h-5 text-gray-400" />
    <span class="text-sm font-semibold text-gray-900 truncate max-w-xs">
      VVE De Plataan
    </span>
    
    <!-- Future: VVE Switcher (if user belongs to multiple VVE's) -->
    <!-- <ChevronDownIcon class="w-4 h-4 text-gray-400 ml-1" /> -->
  </div>
  
  <!-- Right: User Menu -->
  <div class="flex items-center gap-3">
    <span class="text-sm text-gray-700 hidden md:block">Jan de Vries</span>
    <button class="flex items-center">
      <img src="/avatar.jpg" alt="" class="w-10 h-10 rounded-full" />
    </button>
  </div>
</header>
```

**Visual Emphasis:**
```
VVE Name Container:
  - bg-gray-50 (subtle background voor emphasis)
  - border border-gray-200 (border voor definitie)
  - px-4 py-2 rounded-md
  - Icon: BuildingOffice2Icon (building icon)
  - Font: text-sm font-semibold (emphasized)
  - Max width: max-w-xs truncate (als naam te lang)

Position:
  - Desktop: center of header (most prominent)
  - Mobile: kan naar sidebar verplaatst worden (ruimte beperkt)
```

### 2.2 Mobile Header

**Layout (meer compact):**
```
┌─────────────────────────────────┐
│ [☰] VVE De Plataan        [👤] │
└─────────────────────────────────┘
```

**Specs:**
```html
<header class="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
  <button aria-label="Menu">
    <Bars3Icon class="w-6 h-6" />
  </button>
  
  <!-- VVE Name (truncated if needed) -->
  <div class="flex items-center gap-2">
    <BuildingOffice2Icon class="w-4 h-4 text-gray-500" />
    <span class="text-sm font-semibold text-gray-900 truncate max-w-[180px]">
      VVE De Plataan
    </span>
  </div>
  
  <button>
    <img src="/avatar.jpg" alt="" class="w-8 h-8 rounded-full" />
  </button>
</header>
```

---

## 3. VVE Context in Sidebar

### 3.1 Sidebar Header (Desktop)

**Layout:**
```
┌───────────────────────────┐
│ ┌───────────────────────┐ │
│ │ 🏢 VVE De Plataan     │ │
│ │ Hoofdstraat 123       │ │
│ │ Amsterdam             │ │
│ └───────────────────────┘ │
│                           │
│ 🏠 Dashboard              │
│ 💰 Transacties            │
│ ...                       │
└───────────────────────────┘
```

**Specs:**
```html
<aside class="w-64 bg-white border-r border-gray-200 h-full">
  <!-- VVE Context Card (top of sidebar) -->
  <div class="p-4 bg-gray-50 border-b border-gray-200">
    <div class="flex items-start gap-3">
      <div class="flex-shrink-0">
        <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <BuildingOffice2Icon class="w-6 h-6 text-primary-600" />
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-gray-900 truncate">
          VVE De Plataan
        </p>
        <p class="text-xs text-gray-500 truncate">
          Hoofdstraat 123
        </p>
        <p class="text-xs text-gray-500 truncate">
          Amsterdam
        </p>
      </div>
      
      <!-- Future: Switcher icon -->
      <!-- <ChevronUpDownIcon class="w-4 h-4 text-gray-400" /> -->
    </div>
  </div>
  
  <!-- Navigation Items -->
  <nav class="p-4">
    {/* ... menu items ... */}
  </nav>
</aside>
```

**Purpose:**
- Prominent VVE context (always visible when sidebar open)
- Reinforces tenant isolation
- Prepares for future multi-VVE feature (switcher)

---

## 4. VVE Context in Profile

### 4.1 Profile Page - VVE Membership

**Layout:**
```
┌─────────────────────────────────────────┐
│ Profiel                                 │
├─────────────────────────────────────────┤
│                                         │
│   [Avatar]                              │
│                                         │
│   Jan de Vries                          │
│   jan.devries@email.com                 │
│                                         │
│   ┌───────────────────────────────────┐ │
│   │ 🏢 VVE Lidmaatschap               │ │
│   ├───────────────────────────────────┤ │
│   │ VVE De Plataan                    │ │
│   │ Hoofdstraat 123                   │ │
│   │ 1012 AB Amsterdam                 │ │
│   │                                   │ │
│   │ Appartement: 4B                   │ │
│   │ Rol: Bewoner                      │ │
│   └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

**Specs:**
```html
<div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
  <div class="flex items-center gap-3 mb-4">
    <BuildingOffice2Icon class="w-6 h-6 text-gray-400" />
    <h3 class="text-lg font-semibold text-gray-900">
      VVE Lidmaatschap
    </h3>
  </div>
  
  <div class="space-y-2">
    <p class="text-base font-semibold text-gray-900">
      VVE De Plataan
    </p>
    <p class="text-sm text-gray-600">
      Hoofdstraat 123
    </p>
    <p class="text-sm text-gray-600">
      1012 AB Amsterdam
    </p>
    
    <div class="pt-4 border-t border-gray-200 mt-4 space-y-2">
      <div class="flex justify-between text-sm">
        <span class="text-gray-500">Appartement:</span>
        <span class="font-medium text-gray-900">4B</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-500">Rol:</span>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase bg-gray-100 text-gray-700">
          Bewoner
        </span>
      </div>
    </div>
  </div>
</div>
```

**Purpose:**
- Explicit communication of VVE membership
- Shows all relevant context (address, apartment, role)
- User can verify they're in correct VVE

---

## 5. Data Isolation Guards

### 5.1 No Cross-Tenant Widgets

**WRONG (Don't Do This):**
```html
<!-- ❌ WRONG: Aggregating across tenants -->
<div class="metric-card">
  <h3>Alle VVE's</h3>
  <p>Totaal saldo: € 250.000</p>
  <p>15 VVE's actief</p>
</div>
```

**RIGHT (Do This):**
```html
<!-- ✅ CORRECT: Single tenant only -->
<div class="metric-card">
  <h3>VVE De Plataan</h3>
  <p>Saldo: € 12.450</p>
  <p>12 appartementen</p>
</div>
```

**Rule:**
- NEVER show aggregated data across tenants in UI
- Even for admin users (system admins should use separate admin panel)
- Each page shows ONE tenant's data only

### 5.2 Tenant Filtering (Backend)

**All API calls must include tenant_id:**

```typescript
// Frontend API call (automatic tenant inclusion)
async function getTransactions() {
  // Tenant ID included automatically via session/JWT
  const response = await fetch('/api/v1/transactions', {
    headers: {
      'Authorization': `Bearer ${token}`,
      // Tenant ID extracted from token server-side
    },
  });
  return response.json();
}
```

```python
# Backend API (FastAPI example)
@router.get("/transactions")
async def get_transactions(
    current_user: User = Depends(get_current_user)
):
    # CRITICAL: Filter by tenant_id
    transactions = await db.transactions.find({
        "tenant_id": current_user.tenant_id  # MUST filter
    })
    return transactions
```

**Security Layer:**
- Backend ALWAYS enforces tenant_id filtering
- Database Row-Level Security (RLS) as additional layer
- UI never requests cross-tenant data

### 5.3 Visual Boundaries

**Consistent VVE Context:**

Every page should have ONE of these:
1. VVE name in header (always)
2. VVE name in sidebar (desktop)
3. VVE context card (profile, settings)

**Page Title Pattern:**

```html
<!-- Option 1: VVE in breadcrumb -->
<nav class="breadcrumb">
  <a href="/dashboard">VVE De Plataan</a>
  <span>/</span>
  <span>Transacties</span>
</nav>

<!-- Option 2: VVE in page title -->
<h1 class="text-2xl font-bold text-gray-900">
  Transacties - VVE De Plataan
</h1>

<!-- Option 3: Just rely on header (simplest) -->
<h1 class="text-2xl font-bold text-gray-900">
  Transacties
</h1>
<!-- VVE context is in header, no need to repeat -->
```

**Recommendation:** Option 3 (rely on header)
- Less repetition
- Cleaner UI
- Header provides context globally

---

## 6. Future: Multi-VVE Support

### 6.1 VVE Switcher (Phase 2+)

**When user belongs to multiple VVE's:**

```html
<!-- VVE Switcher Dropdown -->
<div class="relative">
  <button class="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-100">
    <BuildingOffice2Icon class="w-5 h-5 text-gray-400" />
    <span class="text-sm font-semibold text-gray-900">
      VVE De Plataan
    </span>
    <ChevronDownIcon class="w-4 h-4 text-gray-400" />
  </button>
  
  <!-- Dropdown Menu -->
  <div class="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200">
    <div class="p-2">
      <!-- Current VVE -->
      <div class="px-3 py-2 bg-primary-50 rounded-md border border-primary-200">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold text-gray-900">VVE De Plataan</p>
            <p class="text-xs text-gray-500">Hoofdstraat 123</p>
          </div>
          <CheckIcon class="w-5 h-5 text-primary-600" />
        </div>
      </div>
      
      <!-- Other VVE's -->
      <button class="w-full px-3 py-2 rounded-md hover:bg-gray-50 text-left mt-1">
        <p class="text-sm font-medium text-gray-900">VVE Het Plein</p>
        <p class="text-xs text-gray-500">Pleinstraat 45</p>
      </button>
      
      <button class="w-full px-3 py-2 rounded-md hover:bg-gray-50 text-left">
        <p class="text-sm font-medium text-gray-900">VVE De Toren</p>
        <p class="text-xs text-gray-500">Torenweg 12</p>
      </button>
    </div>
  </div>
</div>
```

**Switching Behavior:**
```typescript
async function switchVVE(vveId: string) {
  // 1. Update session/context
  await updateUserContext({ currentVVEId: vveId });
  
  // 2. Invalidate all cached data (critical!)
  queryClient.clear();
  
  // 3. Reload page to refresh all data
  window.location.reload();
  
  // OR: Navigate to dashboard of new VVE
  router.push(`/vve/${vveId}/dashboard`);
}
```

**Security:**
- Backend verifies user has access to target VVE
- All data re-fetched with new tenant_id
- No stale data from previous VVE

### 6.2 URL Structure (Future)

**Option 1: Tenant in Path**
```
/vve/de-plataan/dashboard
/vve/de-plataan/transacties
/vve/het-plein/dashboard
```

**Option 2: Tenant in Subdomain**
```
https://de-plataan.vvetooling.nl/dashboard
https://het-plein.vvetooling.nl/dashboard
```

**Option 3: Tenant in Session Only**
```
/dashboard (tenant from session/JWT)
/transacties (tenant from session/JWT)
```

**Recommendation for MVP:** Option 3 (session-based)
- Simplest implementation
- No URL complexity
- Easy to switch later if needed

**Recommendation for Production:** Option 1 (path-based)
- Clear tenant context in URL
- Shareable links are tenant-specific
- Better for SEO/bookmarking

---

## 7. Testing Checklist

### 7.1 Visual Verification

- [ ] VVE name visible in header (all pages)
- [ ] VVE name visible in sidebar (desktop)
- [ ] VVE membership card on profile page
- [ ] No cross-tenant data visible anywhere
- [ ] Switching VVE (future) invalidates all data

### 7.2 Data Isolation

- [ ] Dashboard metrics: single tenant only
- [ ] Transaction list: single tenant only
- [ ] User list: single tenant only
- [ ] Documents: single tenant only
- [ ] Reports: single tenant only
- [ ] No global/aggregated stats visible

### 7.3 Backend Security

- [ ] All API endpoints filter by tenant_id
- [ ] Database queries include tenant_id WHERE clause
- [ ] Row-Level Security (RLS) enabled on database
- [ ] Cross-tenant access attempts return 404 (not 403 - security through obscurity)

---

## 8. Acceptance Criteria

- [x] VVE context always visible (header or sidebar)
- [x] VVE membership details on profile page
- [x] No cross-tenant data aggregation in UI
- [x] All data scoped to current tenant
- [x] Backend enforces tenant isolation (all queries)
- [x] Visual boundaries clear (one VVE per page)
- [x] Future-ready for multi-VVE feature

---

## 9. Changelog

| Datum | Versie | Wijziging |
|-------|--------|-----------|
| 2026-01-26 | 1.0 | Initiële versie - Multi-tenancy UI richtlijnen |

---

**Development kan nu starten.**
All multi-tenancy UI patterns documented with security considerations and future-proofing.
