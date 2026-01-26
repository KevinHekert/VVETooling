# UI Richtlijnen - RBAC (Role-Based Access Control)

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: UX Design  
- **Status**: Final
- **Versie**: 1.0
- **Doel**: Role-based access control zichtbaar maken in UI

## Bronverwijzingen
- [Constraint UX-02: Role-Based UI](../../architecture/constraints/01-randvoorwaarden-ux-development.md#constraint-ux-02-role-based-ui-verschillen)
- [Design System](01-design-system.md)

---

## 1. Rol Overzicht

### 1.1 Rollen en Permissions

**Bewoner (Read-Only)**
```
Permissions:
  ✅ Read: Eigen betalingsstatus, documenten, VVE overzicht
  ❌ Write: Geen
  ❌ Delete: Geen

UI Kenmerken:
  - Geen edit/delete buttons
  - Geen admin menu items
  - Mobile-first interface (bottom navigation)
  - Beperkte navigatie (4 items max)
```

**Bestuurslid (Collaborator)**
```
Permissions:
  ✅ Read: Alle VVE data (financiën, gebruikers, documenten)
  ✅ Write: Documenten (upload, eigen bewerken), comments/notes
  ❌ Write: Financiële transacties, gebruikers beheren, VVE instellingen
  ✅ Delete: Eigen documenten only

UI Kenmerken:
  - Read-only indicators op financiële pages
  - Document management interface
  - Desktop sidebar navigation
  - "Alleen Lezen" badges waar relevant
```

**Beheerder/Penningmeester (Admin)**
```
Permissions:
  ✅ Read: Alles
  ✅ Write: Alles (transacties, gebruikers, instellingen)
  ✅ Delete: Alles (met confirmatie)

UI Kenmerken:
  - Full CRUD interfaces
  - Admin-only menu items (Instellingen, Gebruikersbeheer)
  - Desktop-first (power user interface)
  - Sidebar navigation (extended menu)
```

---

## 2. Visual Indicators

### 2.1 Rol Badges

**Waar getoond:**
- User profile page (always visible)
- Header/navigation (optional, als ruimte)
- Admin pages (bij user lists)

**Badge Designs:**

```html
<!-- Bewoner Badge -->
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase bg-gray-100 text-gray-700">
  Bewoner
</span>

<!-- Bestuurslid Badge -->
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase bg-blue-100 text-blue-700">
  Bestuurslid
</span>

<!-- Beheerder/Penningmeester Badge -->
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase bg-primary-100 text-primary-700">
  <ShieldCheckIcon class="w-3 h-3 mr-1" />
  Beheerder
</span>
```

**Specificaties:**
```
Size: text-xs (12px)
Padding: px-2.5 py-0.5
Border radius: rounded-full
Font: font-medium uppercase
Letter spacing: tracking-wide (optional)

Colors per rol:
  - Bewoner: bg-gray-100 text-gray-700
  - Bestuurslid: bg-blue-100 text-blue-700  
  - Beheerder: bg-primary-100 text-primary-700

Icon (admin only):
  - ShieldCheckIcon w-3 h-3 mr-1
  - Emphasizes admin privileges
```

### 2.2 Read-Only Indicators

**Page-Level Indicator:**

```html
<!-- Header Badge -->
<div class="flex items-center gap-2 mb-6">
  <h1 class="text-2xl font-bold text-gray-900">Financieel Overzicht</h1>
  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
    <EyeIcon class="w-4 h-4 mr-1.5" />
    Alleen Lezen
  </span>
</div>
```

**Info Banner:**

```html
<!-- Banner boven content -->
<div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
  <div class="flex">
    <div class="flex-shrink-0">
      <InformationCircleIcon class="h-5 w-5 text-blue-400" />
    </div>
    <div class="ml-3">
      <p class="text-sm text-blue-800">
        U heeft alleen leesrechten voor deze pagina. 
        Neem contact op met de penningmeester voor wijzigingen.
      </p>
    </div>
    <div class="ml-auto pl-3">
      <div class="-mx-1.5 -my-1.5">
        <button class="inline-flex rounded-md p-1.5 text-blue-500 hover:bg-blue-100">
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</div>
```

**Specificaties:**
```
Badge:
  - Icon: EyeIcon (suggests viewing only)
  - bg-blue-100 text-blue-700
  - Position: next to page title

Banner:
  - bg-blue-50 border-l-4 border-blue-400
  - InformationCircleIcon text-blue-400
  - Dismissible (X button)
  - Saved state: dismissed banners stay hidden per user
  - Text: clear explanation + who can help

Placement:
  - Show on: Financiën, Gebruikers (for Bestuurslid)
  - Don't show on: Documenten (write access), Dashboard (mixed access)
```

---

## 3. Permission-Based UI Rendering

### 3.1 Conditional Rendering

**React Pattern:**

```typescript
// Permission check hook
import { useAuth } from '@/hooks/useAuth';

function TransactionList() {
  const { user, hasPermission } = useAuth();
  
  return (
    <div>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold">Transacties</h2>
        
        {/* Only show for Beheerder */}
        {hasPermission('transactions.create') && (
          <button class="btn-primary">
            <PlusIcon class="w-5 h-5 mr-2" />
            Transactie Toevoegen
          </button>
        )}
      </div>
      
      {/* Table */}
      <table>
        {/* ... */}
      </table>
    </div>
  );
}
```

**Permission Helper:**

```typescript
// hooks/useAuth.ts
export function useAuth() {
  const { user } = useSession();
  
  const permissions = {
    'transactions.create': user?.role === 'beheerder',
    'transactions.update': user?.role === 'beheerder',
    'transactions.delete': user?.role === 'beheerder',
    'documents.create': user?.role === 'beheerder' || user?.role === 'bestuur',
    'documents.update': (docId: string) => {
      // Can update own documents or if beheerder
      return user?.role === 'beheerder' || 
             (user?.role === 'bestuur' && isOwnDocument(docId));
    },
    'users.invite': user?.role === 'beheerder',
    // ... more permissions
  };
  
  const hasPermission = (key: string) => {
    return permissions[key] === true;
  };
  
  return { user, hasPermission };
}
```

### 3.2 Disabled States

**Visual Pattern:**

```html
<!-- Button disabled (insufficient permissions) -->
<button 
  class="btn-secondary opacity-50 cursor-not-allowed" 
  disabled
  title="Alleen beheerders kunnen transacties toevoegen"
>
  <PlusIcon class="w-5 h-5 mr-2" />
  Transactie Toevoegen
</button>

<!-- Link disabled -->
<a 
  class="text-gray-400 cursor-not-allowed pointer-events-none"
  aria-disabled="true"
  title="Geen toegang: alleen beheerders"
>
  Instellingen
</a>

<!-- Input field disabled (read-only view) -->
<input 
  type="text"
  value="€ 450,00"
  class="form-input bg-gray-100 cursor-not-allowed"
  disabled
  readonly
/>
```

**Tooltip Explanations:**

```typescript
// Tooltip component with permission message
function PermissionTooltip({ children, requiredRole }) {
  const { user } = useAuth();
  const hasAccess = user.role === requiredRole;
  
  return (
    <Tooltip 
      content={hasAccess 
        ? undefined 
        : `Alleen ${requiredRole} kan deze actie uitvoeren`
      }
    >
      {children}
    </Tooltip>
  );
}

// Usage
<PermissionTooltip requiredRole="beheerder">
  <button disabled={!canEdit}>
    Bewerken
  </button>
</PermissionTooltip>
```

**Specificaties:**
```
Disabled Styling:
  - opacity-50 (dimmed)
  - cursor-not-allowed
  - pointer-events-none (prevents clicks)
  - aria-disabled="true"

Tooltip:
  - Always explain WHY disabled
  - Format: "Alleen [role] kan [action]"
  - Show on hover (desktop) or tap (mobile)
  - bg-gray-900 text-white px-3 py-2 rounded text-sm

Accessibility:
  - Use aria-disabled instead of removing from DOM
  - Screen reader announces: "Button, disabled, Only administrators can add transactions"
```

---

## 4. Navigation Verschillen

### 4.1 Sidebar Menu (Desktop)

**Bewoner:**
```
No sidebar (uses bottom navigation instead)
Mobile-only interface
```

**Bestuurslid:**
```
Sidebar Items:
  - Dashboard (HomeIcon)
  - Financiën (ChartBarIcon) + "Alleen lezen" badge
  - Documenten (DocumentTextIcon)
  - Gebruikers (UsersIcon) + "Alleen lezen" badge
```

**Beheerder:**
```
Sidebar Items:
  - Dashboard (HomeIcon)
  - Transacties (CurrencyEuroIcon) + counter badge
  - Rapportages (ChartBarIcon)
  - Gebruikers (UsersIcon)
  - Documenten (DocumentTextIcon)
  - Instellingen (Cog6ToothIcon) ← Admin only
```

**Implementation:**

```typescript
// Navigation config per role
const navigationConfig = {
  bewoner: null, // Uses bottom nav
  
  bestuur: [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { 
      name: 'Financiën', 
      href: '/financien', 
      icon: ChartBarIcon,
      badge: 'Alleen lezen',
      badgeType: 'info'
    },
    { name: 'Documenten', href: '/documenten', icon: DocumentTextIcon },
    { 
      name: 'Gebruikers', 
      href: '/gebruikers', 
      icon: UsersIcon,
      badge: 'Alleen lezen',
      badgeType: 'info'
    },
  ],
  
  beheerder: [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { 
      name: 'Transacties', 
      href: '/transacties', 
      icon: CurrencyEuroIcon,
      badge: '3', // counter
      badgeType: 'count'
    },
    { name: 'Rapportages', href: '/rapportages', icon: ChartBarIcon },
    { name: 'Gebruikers', href: '/gebruikers', icon: UsersIcon },
    { name: 'Documenten', href: '/documenten', icon: DocumentTextIcon },
    { name: 'Instellingen', href: '/instellingen', icon: Cog6ToothIcon },
  ],
};

// Render sidebar
function Sidebar() {
  const { user } = useAuth();
  const navItems = navigationConfig[user.role];
  
  if (!navItems) return null; // Bewoner uses bottom nav
  
  return (
    <nav class="sidebar">
      {navItems.map(item => (
        <SidebarItem key={item.href} {...item} />
      ))}
    </nav>
  );
}
```

### 4.2 Bottom Navigation (Mobile - Bewoner Only)

**Layout:**
```html
<nav class="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50">
  <div class="grid grid-cols-4 h-16">
    <!-- Home -->
    <a href="/dashboard" class="flex flex-col items-center justify-center text-primary-600">
      <HomeIcon class="w-6 h-6" />
      <span class="text-xs mt-1 font-semibold">Home</span>
    </a>
    
    <!-- Betalingen -->
    <a href="/betalingen" class="flex flex-col items-center justify-center text-gray-500">
      <CurrencyEuroIcon class="w-6 h-6" />
      <span class="text-xs mt-1">Betalingen</span>
    </a>
    
    <!-- Documenten -->
    <a href="/documenten" class="flex flex-col items-center justify-center text-gray-500">
      <DocumentTextIcon class="w-6 h-6" />
      <span class="text-xs mt-1">Documenten</span>
    </a>
    
    <!-- Profiel -->
    <a href="/profiel" class="flex flex-col items-center justify-center text-gray-500">
      <UserIcon class="w-6 h-6" />
      <span class="text-xs mt-1">Profiel</span>
    </a>
  </div>
</nav>
```

**Specificaties:**
```
Only for: Bewoner role
Position: fixed bottom-0
Height: 64px (h-16)
Columns: 4 items (grid-cols-4)
Safe area: iOS safe-area-inset-bottom padding

Active state:
  - text-primary-600 font-semibold
  - Icon: filled variant (solid instead of outline)

Inactive state:
  - text-gray-500
  - Icon: outline variant

Accessibility:
  - aria-current="page" on active item
  - Each link focusable
  - Keyboard: Tab to navigate
```

---

## 5. Feature Flags & Permission Checks

### 5.1 Frontend Permission Checks

**Always check permissions:**

```typescript
// DON'T: Assume permission based on UI state
function deleteTransaction(id) {
  // Missing permission check!
  await api.delete(`/transactions/${id}`);
}

// DO: Check permission before action
function deleteTransaction(id) {
  if (!hasPermission('transactions.delete')) {
    toast.error('U heeft geen toestemming voor deze actie');
    return;
  }
  
  await api.delete(`/transactions/${id}`);
}
```

**Backend always enforces:**

```python
# Backend API (FastAPI example)
@router.delete("/transactions/{id}")
async def delete_transaction(
    id: str,
    current_user: User = Depends(get_current_user)
):
    # Backend permission check (critical!)
    if current_user.role != "beheerder":
        raise HTTPException(
            status_code=403,
            detail="Alleen beheerders kunnen transacties verwijderen"
        )
    
    # Tenant isolation check
    transaction = await get_transaction(id)
    if transaction.tenant_id != current_user.tenant_id:
        raise HTTPException(status_code=404, detail="Transactie niet gevonden")
    
    await delete(transaction)
    return {"status": "deleted"}
```

### 5.2 Error Handling (403 Forbidden)

**When backend returns 403:**

```typescript
// API client
async function apiRequest(endpoint, options) {
  const response = await fetch(endpoint, options);
  
  if (response.status === 403) {
    const error = await response.json();
    toast.error(error.detail || 'U heeft geen toestemming voor deze actie');
    
    // Optionally: redirect to appropriate page
    if (endpoint.includes('/admin')) {
      router.push('/dashboard');
    }
    
    throw new Error('Forbidden');
  }
  
  return response.json();
}
```

**User-Friendly Error Messages:**

```typescript
const errorMessages = {
  'transactions.create': 'Alleen penningmeesters kunnen transacties toevoegen',
  'transactions.update': 'Alleen penningmeesters kunnen transacties bewerken',
  'transactions.delete': 'Alleen penningmeesters kunnen transacties verwijderen',
  'users.invite': 'Alleen penningmeesters kunnen gebruikers uitnodigen',
  'settings.update': 'Alleen penningmeesters kunnen instellingen wijzigen',
};

function showPermissionError(action: string) {
  const message = errorMessages[action] || 'U heeft geen toestemming voor deze actie';
  toast.error(message);
}
```

---

## 6. Row-Level Permissions

### 6.1 Document Ownership

**Rule:**
- Bestuurslid can edit/delete **only own** documents
- Beheerder can edit/delete **all** documents

**Implementation:**

```typescript
function DocumentRow({ document }) {
  const { user } = useAuth();
  
  const canEdit = 
    user.role === 'beheerder' || 
    (user.role === 'bestuur' && document.uploadedBy === user.id);
  
  const canDelete = canEdit;
  
  return (
    <tr>
      <td>{document.name}</td>
      <td>{document.uploadedBy}</td>
      <td>{document.uploadDate}</td>
      <td>
        <DropdownMenu>
          <DropdownItem icon={ArrowDownTrayIcon}>
            Downloaden
          </DropdownItem>
          
          {canEdit && (
            <DropdownItem icon={PencilIcon} onClick={handleEdit}>
              Bewerken
            </DropdownItem>
          )}
          
          {canDelete && (
            <DropdownItem icon={TrashIcon} onClick={handleDelete} danger>
              Verwijderen
            </DropdownItem>
          )}
          
          {/* Show why disabled if no permission */}
          {!canEdit && (
            <DropdownItem disabled tooltip="U kunt alleen eigen documenten bewerken">
              <PencilIcon class="w-4 h-4 mr-2 opacity-50" />
              <span class="opacity-50">Bewerken</span>
            </DropdownItem>
          )}
        </DropdownMenu>
      </td>
    </tr>
  );
}
```

**Visual Feedback:**

```
Own document:
  - Full menu (Download, Edit, Delete)
  - No restrictions

Other's document (Bestuurslid):
  - Download only (enabled)
  - Edit grayed out with tooltip
  - Delete grayed out with tooltip
  - Tooltip: "U kunt alleen eigen documenten bewerken"

Other's document (Beheerder):
  - Full menu (all enabled)
  - No restrictions
```

---

## 7. Testing Checklist

### 7.1 Permission Testing

**Per Role:**

- [ ] Bewoner:
  - [ ] Cannot see admin menu items (Instellingen, etc.)
  - [ ] Cannot edit transactions (no buttons visible)
  - [ ] Cannot see other bewoners' payment status
  - [ ] Bottom navigation works (mobile)

- [ ] Bestuurslid:
  - [ ] Can view all financial data (read-only)
  - [ ] Cannot edit transactions (disabled/hidden)
  - [ ] Can upload documents
  - [ ] Can edit own documents only
  - [ ] Cannot edit penningmeester's documents
  - [ ] "Alleen Lezen" badge visible on Financiën/Gebruikers

- [ ] Beheerder:
  - [ ] Can see all menu items
  - [ ] Can create/edit/delete transactions
  - [ ] Can invite users
  - [ ] Can edit VVE settings
  - [ ] Can edit all documents (not just own)

### 7.2 Edge Cases

- [ ] User with no role assigned: redirect to error page
- [ ] User switches VVE: permissions re-checked
- [ ] User role changed while logged in: force re-login or permission refresh
- [ ] Stale permissions (cached): invalidate on role change
- [ ] 403 errors handled gracefully (user-friendly message)

---

## 8. Acceptance Criteria

- [x] Role badges visible in profile and user lists
- [x] Read-only indicators shown on restricted pages (Bestuurslid)
- [x] Permission checks before all actions (frontend + backend)
- [x] Disabled states with explanatory tooltips
- [x] Navigation menu adapts per role
- [x] Bottom nav for Bewoner, sidebar for Bestuur/Beheerder
- [x] Row-level permissions (document ownership)
- [x] 403 errors handled with helpful messages
- [x] No security bypasses (backend enforces all rules)

---

## 9. Changelog

| Datum | Versie | Wijziging |
|-------|--------|-----------|
| 2026-01-26 | 1.0 | Initiële versie - RBAC UI richtlijnen |

---

**Development kan nu starten.**
All role-based UI patterns documented with code examples and clear specifications.
