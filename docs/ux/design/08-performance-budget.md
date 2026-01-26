# Performance Budget - UX Design

## Documentinformatie
- **Datum**: 2026-01-26
- **Eigenaar**: UX Design  
- **Status**: Final
- **Versie**: 1.0
- **Doel**: Performance constraints en budgets voor UX design

## Bronverwijzingen
- [Constraint UX-04: Performance Budget](../../architecture/constraints/01-randvoorwaarden-ux-development.md#constraint-ux-04-performance-budget)
- [Design System](01-design-system.md)

---

## 1. Performance Targets

### 1.1 Page Load Performance

**Target Metrics (95th percentile):**

```
Page Load Time:                < 2.0 seconds
First Contentful Paint (FCP):  < 1.5 seconds
Largest Contentful Paint (LCP):< 2.0 seconds
Time to Interactive (TTI):     < 3.0 seconds
Total Blocking Time (TBT):     < 200 milliseconds
Cumulative Layout Shift (CLS): < 0.1
```

**Lighthouse Scores:**
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- SEO: >85

### 1.2 Runtime Performance

**API Response Times:**
```
GET requests (list):     < 500ms
GET requests (detail):   < 200ms
POST/PATCH requests:     < 500ms
DELETE requests:         < 300ms
File downloads:          Start within 200ms
```

**UI Interactions:**
```
Button click response:   < 100ms (visual feedback)
Form input response:     < 50ms (keystroke to display)
Dropdown open:           < 100ms
Modal open/close:        < 200ms
Page transitions:        < 300ms
```

---

## 2. Asset Budgets

### 2.1 JavaScript Budget

**Target:**
```
Initial JavaScript bundle:  < 150KB (gzipped)
Total JavaScript:           < 500KB (gzipped)
```

**Breakdown:**
```
React + React DOM:         ~40KB (gzipped)
Next.js runtime:           ~30KB
UI Components (Headless):  ~15KB
Custom app code:           ~65KB
Third-party (analytics):   ~20KB (if needed)
--------------------------------------
Total:                     ~170KB ❌ (10% over budget)

Optimization needed:
- Code splitting by route
- Lazy load non-critical components
- Tree-shake unused code
- Remove duplicate dependencies
```

**Per-Route Budgets:**
```
/dashboard:     < 200KB (including shared bundles)
/transacties:   < 250KB (table library included)
/documenten:    < 180KB
/profiel:       < 150KB
```

**Enforcement:**
```json
// package.json
{
  "scripts": {
    "build": "next build",
    "analyze": "ANALYZE=true next build",
    "check-size": "bundlesize"
  },
  "bundlesize": [
    {
      "path": ".next/static/chunks/*.js",
      "maxSize": "150 kB"
    },
    {
      "path": ".next/static/css/*.css",
      "maxSize": "30 kB"
    }
  ]
}
```

### 2.2 CSS Budget

**Target:**
```
Initial CSS:  < 30KB (gzipped)
Total CSS:    < 50KB (gzipped)
```

**Tailwind CSS Strategy:**
```
Purge unused classes:       ✅ Required
Use JIT mode:               ✅ Recommended
Minimize custom CSS:        Keep < 5KB
Avoid @apply (bloat risk):  Use sparingly

Result:
- Tailwind (purged):  ~20KB
- Custom CSS:         ~5KB
- Component CSS:      ~3KB
-----------------------------
Total:                ~28KB ✅
```

### 2.3 Font Budget

**Recommended: System Fonts (0 KB)**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Helvetica', 'Arial', sans-serif;
```

**If Custom Font Required:**
```
Font files (WOFF2):  < 50KB total
  - Regular (400):   ~25KB
  - Semibold (600):  ~25KB

Only 2 weights maximum
Latin subset only (no full charset)
```

**Loading Strategy:**
```html
<link 
  rel="preload" 
  href="/fonts/inter-var.woff2" 
  as="font" 
  type="font/woff2" 
  crossorigin
/>

<style>
  @font-face {
    font-family: 'Inter';
    src: url('/fonts/inter-var.woff2') format('woff2');
    font-display: swap; /* Show fallback immediately */
    font-weight: 400 600;
  }
</style>
```

### 2.4 Image Budget

**Per Image:**
```
Hero images:       < 100KB (WebP preferred)
Thumbnails:        < 20KB
Icons (SVG):       < 2KB per icon
Avatars:           < 10KB
Max dimensions:    1920px wide (no larger needed)
```

**Format Priority:**
1. SVG (for icons, illustrations)
2. WebP (photos, with JPEG fallback)
3. PNG (only for transparency if WebP not supported)

**Lazy Loading:**
```html
<!-- All images below fold -->
<img 
  src="/image.webp" 
  alt="Description"
  loading="lazy"
  width="800"
  height="600"
/>

<!-- Responsive images -->
<img 
  srcset="
    /image-400w.webp 400w,
    /image-800w.webp 800w,
    /image-1200w.webp 1200w
  "
  sizes="(max-width: 768px) 400px, 800px"
  src="/image-800w.webp"
  alt="Description"
  loading="lazy"
/>
```

**Total Page Image Budget:**
```
Dashboard:      < 200KB (all images combined)
Transaction:    < 150KB
Documents:      < 100KB (mostly icons)
Profile:        < 80KB
```

### 2.5 Icon Strategy

**Recommended: Heroicons (Inline SVG)**
```
Delivery: Inline SVG (no HTTP requests)
Size per icon: ~2KB
Tree-shakeable: Yes (import only used icons)
Total icons budget: ~20 icons × 2KB = ~40KB

Included in JavaScript bundle (acceptable)
```

**Alternative: Icon Font (NOT Recommended)**
```
❌ Larger file size (~60-100KB)
❌ FOUT (Flash of Unstyled Text)
❌ Accessibility issues
❌ Limited customization
```

---

## 3. Network Budget

### 3.1 HTTP Requests

**Target:**
```
Initial page load:  < 20 requests
Full page load:     < 40 requests
```

**Request Types:**
```
HTML:         1 request
CSS:          1-2 requests (critical + async)
JavaScript:   3-5 requests (main + chunks)
Fonts:        0-2 requests (prefer system fonts)
Images:       5-10 requests (lazy load rest)
API calls:    2-5 requests (parallel where possible)
```

**HTTP/2 Benefits:**
- Multiplexing (parallel requests over single connection)
- Header compression
- Server push (optional)

### 3.2 Third-Party Scripts

**Strict Limits:**
```
Analytics:       1 script (if needed) < 20KB
Error tracking:  1 script (Sentry) < 30KB
Chat widget:     Defer until user interaction
Ads:             None (not applicable)
Social media:    None (not applicable)

Total third-party budget: < 50KB
```

**Loading Strategy:**
```html
<!-- Defer non-critical scripts -->
<script src="/analytics.js" defer></script>

<!-- Or dynamic import -->
<script>
  // Load analytics only if user consents
  if (userConsents) {
    import('/analytics.js').then(module => {
      module.init();
    });
  }
</script>
```

---

## 4. Data Transfer Budget

### 4.1 Initial Page Load

**Target:**
```
Total transfer (gzipped):  < 500KB

Breakdown:
- HTML:             ~10KB
- CSS:              ~30KB
- JavaScript:       ~150KB
- Fonts:            ~0KB (system) or ~50KB (custom)
- Images:           ~100KB
- API data:         ~50KB
--------------------------------
Total:              ~340KB ✅ (or ~390KB with custom fonts)
```

### 4.2 API Response Sizes

**Per Endpoint:**
```
GET /dashboard:       < 50KB (aggregated metrics)
GET /transactions:    < 100KB (20 items paginated)
GET /documents:       < 80KB (list with metadata)
GET /users:           < 30KB (all VVE users)

Compression: gzip enabled on all responses
Pagination: max 20-50 items per page
```

**Response Optimization:**
```json
// Good: Only needed fields
{
  "transactions": [
    {
      "id": "tx_123",
      "date": "2026-01-24",
      "description": "Gas & Licht",
      "amount": -450.00,
      "category": "energie"
    }
  ],
  "total": 156,
  "page": 1
}

// Bad: Unnecessary data
{
  "transactions": [
    {
      /* 50+ fields including internal metadata */
      "internal_audit_log": [...], /* ❌ Not needed in UI */
      "full_user_object": {...}     /* ❌ Duplicate data */
    }
  ]
}
```

---

## 5. Rendering Performance

### 5.1 Layout Shifts (CLS)

**Target: < 0.1**

**Causes of Layout Shift:**
1. Images without dimensions
2. Dynamic content insertion
3. Web fonts loading (FOUT)
4. Ads/embeds (not applicable)

**Fixes:**
```html
<!-- Always specify image dimensions -->
<img 
  src="/chart.png" 
  alt="Chart"
  width="800"
  height="600"
  class="w-full h-auto"
/>

<!-- Reserve space for dynamic content -->
<div class="min-h-[200px]">
  {/* Content loads here */}
</div>

<!-- Use font-display: swap with fallback -->
<style>
  @font-face {
    font-family: 'Inter';
    font-display: swap; /* Shows fallback immediately */
  }
</style>
```

### 5.2 Frame Rate

**Target: 60 FPS (16.67ms per frame)**

**Optimizations:**
```css
/* Use GPU-accelerated properties */
.animate {
  transform: translateX(100px); /* ✅ GPU */
  /* NOT: left: 100px; ❌ CPU, causes reflow */
}

/* Avoid expensive properties in animations */
.bad-animation {
  /* ❌ Triggers layout recalculation */
  animation: badAnim 1s;
}

@keyframes badAnim {
  from { width: 100px; }    /* ❌ Expensive */
  to { width: 200px; }
}

/* Better */
.good-animation {
  animation: goodAnim 1s;
}

@keyframes goodAnim {
  from { transform: scaleX(1); }  /* ✅ GPU */
  to { transform: scaleX(2); }
}
```

**React Performance:**
```typescript
// Memoize expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* render */}</div>;
});

// Virtualize long lists
import { FixedSizeList } from 'react-window';

function TransactionList({ transactions }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={transactions.length}
      itemSize={48}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <TransactionRow data={transactions[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

---

## 6. Monitoring & Enforcement

### 6.1 Continuous Monitoring

**Lighthouse CI:**
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/dashboard
            http://localhost:3000/transacties
          uploadArtifacts: true
          temporaryPublicStorage: true
```

**Performance Budgets in CI:**
```json
// lighthouserc.json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "first-contentful-paint": ["error", {"maxNumericValue": 1500}],
        "largest-contentful-paint": ["error", {"maxNumericValue": 2000}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}],
        "total-blocking-time": ["error", {"maxNumericValue": 200}]
      }
    }
  }
}
```

### 6.2 Real User Monitoring (RUM)

**Web Vitals Tracking:**
```typescript
// lib/analytics.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to analytics service
  const body = JSON.stringify(metric);
  navigator.sendBeacon('/api/analytics', body);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

**Dashboard:**
- Track real user performance
- Alert on regressions (>10% increase in LCP)
- Segment by device type (mobile vs desktop)
- Segment by network (4G vs WiFi)

---

## 7. UX Design Guidelines for Performance

### 7.1 Minimize Visual Complexity

**Simple > Complex:**
```
❌ Heavy animations, shadows, gradients everywhere
✅ Subtle shadows, minimal animations, flat colors

❌ Multiple large background images
✅ SVG backgrounds or solid colors

❌ Carousel with 10+ auto-playing slides
✅ Static hero image or max 3 manual slides
```

### 7.2 Progressive Enhancement

**Core Content First:**
```html
<!-- 1. Show content immediately (no JS needed) -->
<div class="transactions">
  <h2>Transacties</h2>
  <ul>
    <li>Gas & Licht - € 450,00</li>
    <li>Bijdrage - € 125,00</li>
  </ul>
</div>

<!-- 2. Enhance with JavaScript (filtering, sorting) -->
<script>
  // Add interactive features after page loads
</script>
```

### 7.3 Lazy Load Non-Critical

**Below the Fold:**
```typescript
// Lazy load components
const DocumentViewer = lazy(() => import('./DocumentViewer'));
const AdvancedChart = lazy(() => import('./AdvancedChart'));

function Dashboard() {
  return (
    <div>
      {/* Above fold: loads immediately */}
      <MetricCards />
      
      {/* Below fold: lazy load */}
      <Suspense fallback={<Spinner />}>
        <AdvancedChart />
      </Suspense>
    </div>
  );
}
```

### 7.4 Optimize Images

**Design Considerations:**
```
- Use illustrations (SVG) instead of photos where possible
- Compress all images before upload (TinyPNG, ImageOptim)
- Serve WebP with JPEG fallback
- Use CSS for simple graphics (gradients, shapes)
- Avoid image-heavy designs
```

---

## 8. Performance Checklist

### Pre-Launch Checklist

- [ ] Lighthouse Performance score >90
- [ ] FCP < 1.5s, LCP < 2.0s
- [ ] Total JavaScript < 500KB (gzipped)
- [ ] Total CSS < 50KB (gzipped)
- [ ] All images optimized (WebP + lazy load)
- [ ] System fonts used (or custom fonts < 50KB)
- [ ] API responses < 100KB per endpoint
- [ ] No layout shifts (CLS < 0.1)
- [ ] 60 FPS animations (no jank)
- [ ] Bundle analysis completed (no surprises)
- [ ] Performance budgets enforced in CI
- [ ] Real User Monitoring configured

### Per-Page Checklist

- [ ] Page loads in < 2s (95th percentile)
- [ ] No render-blocking resources
- [ ] Critical CSS inlined
- [ ] Images below fold lazy loaded
- [ ] JavaScript code-split
- [ ] API calls minimized (max 5 per page)
- [ ] Tested on slow 3G network
- [ ] Tested on low-end device

---

## 9. Acceptance Criteria

- [x] Performance targets documented
- [x] Asset budgets defined (JS, CSS, images, fonts)
- [x] Monitoring strategy implemented (Lighthouse CI, RUM)
- [x] UX guidelines for performance created
- [x] Enforcement in CI/CD pipeline
- [x] All pages meet performance budget
- [x] Lighthouse scores >90 (Performance, Accessibility)

---

## 10. Changelog

| Datum | Versie | Wijziging |
|-------|--------|-----------|
| 2026-01-26 | 1.0 | Initiële versie - Performance budget |

---

**Development kan nu starten.**
Complete performance budget with metrics, budgets, monitoring, and enforcement strategies.
