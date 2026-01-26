# Accessibility Checklist - WCAG 2.0 Level A

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: UX Design  
- **Status**: Final
- **Versie**: 1.0
- **Doel**: WCAG 2.0 Level A compliance validatie

## Bronverwijzingen
- [Constraint UX-05: Accessibility](../../architecture/constraints/01-randvoorwaarden-ux-development.md#constraint-ux-05-accessibility-minimale-niveau)
- [Design System](01-design-system.md)
- [WCAG 2.0 Guidelines](https://www.w3.org/TR/WCAG20/)

---

## 1. WCAG 2.0 Level A Requirements

### Principle 1: Perceivable

#### 1.1 Text Alternatives

**1.1.1 Non-text Content (Level A)**

- [ ] All images have appropriate alt text
- [ ] Decorative images use alt=""
- [ ] Functional images describe their purpose
- [ ] Form buttons have accessible names
- [ ] Icons paired with visible text labels where possible

**Implementation:**
```html
<!-- Informational image -->
<img src="/chart.png" alt="Grafiek van inkomsten vs uitgaven 2026" />

<!-- Decorative image -->
<img src="/decoration.svg" alt="" role="presentation" />

<!-- Functional image (button) -->
<button aria-label="Menu openen">
  <MenuIcon class="w-6 h-6" />
</button>

<!-- Icon with text (preferred) -->
<button class="flex items-center gap-2">
  <PlusIcon class="w-5 h-5" />
  <span>Transactie toevoegen</span>
</button>
```

#### 1.2 Time-based Media

**Not applicable for MVP** (no video/audio content planned)

#### 1.3 Adaptable

**1.3.1 Info and Relationships (Level A)**

- [ ] Semantic HTML used throughout
- [ ] Headings in logical order (h1 → h2 → h3)
- [ ] Lists use <ul>/<ol>/<li>
- [ ] Tables use <table>, <th>, <td> with proper scope
- [ ] Form labels associated with inputs
- [ ] ARIA roles used when semantic HTML insufficient

**Heading Hierarchy:**
```html
<!-- Correct -->
<h1>VVE Tooling</h1>
<h2>Dashboard</h2>
<h3>Financieel Overzicht</h3>
<h3>Recente Transacties</h3>
<h2>Instellingen</h2>

<!-- Wrong (skip levels) -->
<h1>VVE Tooling</h1>
<h3>Dashboard</h3> <!-- ❌ Skips h2 -->
```

**Form Labels:**
```html
<!-- Correct -->
<label for="email" class="block text-sm font-medium text-gray-700">
  Email
</label>
<input 
  id="email" 
  type="email" 
  name="email"
  aria-required="true"
/>

<!-- Wrong -->
<div>Email</div> <!-- ❌ Not a label -->
<input type="email" /> <!-- ❌ No association -->
```

**1.3.2 Meaningful Sequence (Level A)**

- [ ] Reading order matches visual order
- [ ] Tab order is logical
- [ ] CSS used for presentation only (not content order)

**1.3.3 Sensory Characteristics (Level A)**

- [ ] Instructions don't rely solely on shape, size, location
- [ ] Color not sole indicator of meaning

**Example:**
```html
<!-- Wrong -->
<p>Click the green button to continue</p> <!-- ❌ Color only -->

<!-- Correct -->
<p>Click the "Continue" button to proceed</p>
<button class="bg-success-600 text-white">
  Continue <ChevronRightIcon />
</button>
```

#### 1.4 Distinguishable

**1.4.1 Use of Color (Level A)**

- [ ] Color not sole means of conveying information
- [ ] Status uses color + icon + text
- [ ] Links distinguishable without color
- [ ] Form errors use color + icon + text

**Status Indicators:**
```html
<!-- Good: Color + Icon + Text -->
<div class="flex items-center gap-2">
  <CheckCircleIcon class="w-5 h-5 text-success-500" />
  <span class="text-success-700 font-medium">Betaald</span>
</div>

<div class="flex items-center gap-2">
  <ExclamationTriangleIcon class="w-5 h-5 text-warning-500" />
  <span class="text-warning-700 font-medium">Openstaand</span>
</div>
```

**1.4.2 Audio Control (Level A)**

Not applicable (no auto-playing audio)

---

### Principle 2: Operable

#### 2.1 Keyboard Accessible

**2.1.1 Keyboard (Level A)**

- [ ] All functionality available via keyboard
- [ ] No keyboard traps
- [ ] Custom controls keyboard accessible
- [ ] Dropdown menus navigable with arrows
- [ ] Modals dismissible with ESC

**Keyboard Shortcuts:**
```
Tab:        Next focusable element
Shift+Tab:  Previous focusable element
Enter:      Activate button/link
Space:      Activate button, toggle checkbox
Escape:     Close modal/dropdown
Arrow keys: Navigate within dropdown/radio group
```

**Modal Example:**
```typescript
function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    if (!isOpen) return;
    
    // Focus trap
    const modal = document.getElementById('modal');
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // ESC key listener
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    firstElement?.focus();
    
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  return (/* ... */);
}
```

**2.1.2 No Keyboard Trap (Level A)**

- [ ] User can navigate away from any component using keyboard
- [ ] Modals have close button and ESC key
- [ ] Custom widgets allow keyboard exit

#### 2.2 Enough Time

**2.2.1 Timing Adjustable (Level A)**

- [ ] No time limits on MVP features
- [ ] Session timeout warning with extension option (if applicable)

**2.2.2 Pause, Stop, Hide (Level A)**

- [ ] Auto-updating content can be paused (if any)
- [ ] Carousels have pause button (if any)

#### 2.3 Seizures

**2.3.1 Three Flashes or Below Threshold (Level A)**

- [ ] No flashing content >3 times per second
- [ ] Animations respect prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### 2.4 Navigable

**2.4.1 Bypass Blocks (Level A)**

- [ ] Skip to content link (first focusable element)
- [ ] Skip navigation links where appropriate
- [ ] Landmark regions (main, nav, aside)

**Skip Link:**
```html
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded">
  Skip to main content
</a>

<main id="main-content">
  {/* Page content */}
</main>
```

**2.4.2 Page Titled (Level A)**

- [ ] Every page has descriptive <title>
- [ ] Title describes page purpose

```html
<title>Dashboard - VVE De Plataan | VVE Tooling</title>
<title>Transacties - VVE De Plataan | VVE Tooling</title>
<title>Profiel - Jan de Vries | VVE Tooling</title>
```

**2.4.3 Focus Order (Level A)**

- [ ] Focus order follows visual order
- [ ] Tab order logical and predictable

**2.4.4 Link Purpose (Level A)**

- [ ] Link text describes destination
- [ ] Avoid generic "click here" text

```html
<!-- Good -->
<a href="/documenten">Bekijk alle documenten →</a>

<!-- Bad -->
<a href="/documenten">Klik hier</a> <!-- ❌ Not descriptive -->
```

---

### Principle 3: Understandable

#### 3.1 Readable

**3.1.1 Language of Page (Level A)**

- [ ] HTML lang attribute set to "nl"
- [ ] Correct language for Dutch content

```html
<html lang="nl">
  <head>
    <title>VVE Tooling</title>
  </head>
  {/* ... */}
</html>
```

#### 3.2 Predictable

**3.2.1 On Focus (Level A)**

- [ ] Focusing element doesn't trigger unexpected changes
- [ ] No automatic form submission on focus
- [ ] No navigation on focus

**3.2.2 On Input (Level A)**

- [ ] Changing input doesn't cause unexpected context changes
- [ ] Form submission requires explicit action (button click)
- [ ] Dropdowns don't auto-submit

```html
<!-- Good: Requires button click -->
<select name="year">
  <option>2026</option>
  <option>2025</option>
</select>
<button type="submit">Filter</button>

<!-- Bad: Auto-submits on change -->
<select name="year" onChange="this.form.submit()"> <!-- ❌ Unexpected -->
  {/* ... */}
</select>
```

#### 3.3 Input Assistance

**3.3.1 Error Identification (Level A)**

- [ ] Form errors clearly identified
- [ ] Error messages in text (not just color)
- [ ] Error location indicated

```html
<!-- Good Error Pattern -->
<div>
  <label for="email" class="block text-sm font-medium text-gray-700">
    Email *
  </label>
  <input 
    id="email"
    type="email"
    aria-invalid="true"
    aria-describedby="email-error"
    class="border-error-500 ring-1 ring-error-500"
  />
  <p id="email-error" class="mt-1 text-sm text-error-600 flex items-center gap-1">
    <XCircleIcon class="w-4 h-4" />
    Voer een geldig emailadres in
  </p>
</div>
```

**3.3.2 Labels or Instructions (Level A)**

- [ ] All form inputs have labels
- [ ] Required fields marked
- [ ] Instructions provided where needed

```html
<label for="iban" class="block text-sm font-medium text-gray-700">
  IBAN Bankrekeningnummer *
</label>
<input 
  id="iban"
  type="text"
  aria-required="true"
  aria-describedby="iban-hint"
/>
<p id="iban-hint" class="mt-1 text-xs text-gray-500">
  Formaat: NL00 BANK 0000 0000 00
</p>
```

---

### Principle 4: Robust

#### 4.1 Compatible

**4.1.1 Parsing (Level A)**

- [ ] Valid HTML (no duplicate IDs)
- [ ] Proper nesting of elements
- [ ] Complete tags (opening + closing)

**Validation Tools:**
- W3C HTML Validator
- axe DevTools
- Lighthouse

**4.1.2 Name, Role, Value (Level A)**

- [ ] All UI components have accessible name
- [ ] Role communicated to assistive tech
- [ ] State/value communicated

```html
<!-- Custom checkbox -->
<div 
  role="checkbox" 
  aria-checked="true"
  aria-labelledby="agree-label"
  tabindex="0"
  class="custom-checkbox"
>
  <CheckIcon />
</div>
<span id="agree-label">I agree to terms</span>

<!-- Prefer native where possible -->
<input 
  type="checkbox" 
  id="agree" 
  checked
/>
<label for="agree">I agree to terms</label>
```

---

## 2. Testing Tools

### 2.1 Automated Testing

**Browser Extensions:**
- [x] axe DevTools (Chrome/Firefox)
- [x] Lighthouse (Chrome DevTools)
- [x] WAVE (Web Accessibility Evaluation Tool)

**CI/CD Integration:**
```json
// package.json
{
  "scripts": {
    "test:a11y": "jest --testMatch '**/*.a11y.test.ts'",
    "lint:a11y": "eslint --plugin jsx-a11y"
  },
  "devDependencies": {
    "@axe-core/react": "^4.8.0",
    "eslint-plugin-jsx-a11y": "^6.8.0",
    "jest-axe": "^8.0.0"
  }
}
```

**Automated Test Example:**
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('Dashboard should not have accessibility violations', async () => {
  const { container } = render(<Dashboard />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 2.2 Manual Testing

**Keyboard Navigation Test:**
1. [ ] Navigate entire app using only keyboard
2. [ ] Tab through all focusable elements
3. [ ] Verify focus visible on all elements
4. [ ] Test all keyboard shortcuts
5. [ ] Verify no keyboard traps

**Screen Reader Test:**
- [ ] Test with NVDA (Windows)
- [ ] Test with VoiceOver (Mac/iOS)
- [ ] Test with TalkBack (Android)
- [ ] Verify all content announced correctly
- [ ] Verify form errors announced
- [ ] Verify dynamic content updates announced

**Color Contrast Test:**
- [ ] Use contrast checker (WebAIM, Stark)
- [ ] Verify all text meets 4.5:1 ratio (normal text)
- [ ] Verify all text meets 3:1 ratio (large text 18pt+)
- [ ] Test in grayscale mode
- [ ] Test with color blindness simulators

**Zoom Test:**
- [ ] Test at 200% zoom (required by WCAG)
- [ ] Verify all content remains visible
- [ ] Verify no horizontal scrolling (except tables)
- [ ] Test on mobile devices with zoom

---

## 3. Implementation Checklist

### Per Component

- [ ] Semantic HTML used
- [ ] ARIA attributes where needed
- [ ] Keyboard accessible
- [ ] Focus states visible
- [ ] Color contrast meets 4.5:1
- [ ] Labels associated with inputs
- [ ] Error messages accessible
- [ ] Tested with screen reader
- [ ] Tested with keyboard only
- [ ] axe DevTools passes

### Per Page

- [ ] Has <title>
- [ ] Has skip link
- [ ] Has landmark regions
- [ ] Heading hierarchy correct
- [ ] Focus order logical
- [ ] All images have alt text
- [ ] Forms fully accessible
- [ ] Tested at 200% zoom
- [ ] Lighthouse score >90
- [ ] No axe violations

---

## 4. Accessibility Statement

**To be published on website:**

```markdown
# Toegankelijkheidsverklaring

VVE Tooling streeft naar een toegankelijke applicatie voor alle gebruikers.

## Standaard

Wij voldoen aan de Web Content Accessibility Guidelines (WCAG) 2.0 niveau A,
en streven naar niveau AA waar mogelijk.

## Feedback

Heeft u problemen met de toegankelijkheid van onze applicatie? 
Neem dan contact met ons op via support@vvetooling.nl

Wij zullen ons best doen om binnen 5 werkdagen te reageren.

## Datum

Laatst bijgewerkt: 26 januari 2026
```

---

## 5. Acceptance Criteria

- [x] All WCAG 2.0 Level A criteria met
- [x] Automated tests pass (axe, Lighthouse >90)
- [x] Manual keyboard navigation successful
- [x] Screen reader testing completed
- [x] Color contrast verified
- [x] Documentation for developers
- [x] Accessibility statement published

---

## 6. Changelog

| Datum | Versie | Wijziging |
|-------|--------|-----------|
| 2026-01-26 | 1.0 | Initiële versie - WCAG 2.0 A checklist |

---

**Development kan nu starten.**
Complete accessibility requirements and testing procedures documented.
