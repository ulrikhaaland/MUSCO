# Landing Page Structure (`src/app/page.tsx`)

## Overview
Client-rendered landing page (~675 lines) with sticky nav, multiple sections, and auto-redirect for authenticated users.

---

## Dependencies / Imports

| Import | Purpose |
|--------|---------|
| `useAuth` | Auth state (`user`, `loading`) |
| `useUser` | User program state |
| `useTranslation` | i18n (`t`, `locale`) |
| `useRouter` | Navigation |
| `getProgramBySlug`, `localizeProgramDayDescriptions` | Recovery program data |
| `PartnerLogos` | Logo marquee component |
| `PricingCards` | Subscription pricing UI |
| `HumanViewer` | 3D body model component |
| `logAnalyticsEvent` | Analytics tracking |

---

## State

| State | Type | Purpose |
|-------|------|---------|
| `modalOpen` | `string \| null` | Program preview modal |
| `showAllPrograms` | `boolean` | Toggle full program list |
| `isMobile` | `boolean` | Responsive breakpoint (<768px) |
| `currentSection` | `'how' \| 'programs' \| 'why' \| 'demo' \| 'pricing' \| 'faq' \| 'top'` | Active nav section |
| `_pricingAnnual` | `boolean` | (unused) |
| `_exploreInput` | `string` | (unused) |

---

## Refs (for scroll-to)

- `heroRef` — Hero section (commented out)
- `howRef` — How it works (removed)
- `demoRef` — 3D model demo
- `programsRef` — Programs grid
- `pricingRef` — Pricing section

---

## Effects

1. **Scroll restoration** — Disables browser scroll restoration; scrolls to top on mount (unless hash present)
2. **Auth redirect** — Redirects signed-in users to `/program` (if program exists) or `/app`
3. **Page title** — Sets `document.title` via `t('home.pageTitle')`
4. **Mobile detection** — Tracks viewport width for responsive rendering
5. **Section observer** — Updates `currentSection` based on scroll position for nav highlighting

---

## Sections (top to bottom)

### 1. Header (sticky nav)
- Logo: "bodAI" — scrolls to top on click
- Desktop nav links: Demo, Programs
  - Pricing link exists but hidden (`{false && ...}`)
- Sign In button (hidden when authenticated)

### 2. Hero (COMMENTED OUT)
- `LandingHero` component was here; now removed
- Would offer "diagnose" or "workout" CTAs

### 3. Demo Section (Hero)
- Container fills viewport height minus header and safe-area-inset-bottom
- Title: "Din AI helseassistent" (hardcoded Norwegian)
- `<HumanViewer gender="male" hideNav enableMobileChat fillHeight />` — interactive 3D body model, fills available space
- Partner logos anchored at bottom of hero section

### 4. Partner Logos (inside Hero)
- `<PartnerLogos />` — animated logo marquee, fixed at bottom of hero section

### 5. Programs Grid
- Title: `t('landing.programs.title')`
- Grid of program cards (3 cols desktop, 1-2 mobile)
- Each card: image, title, summary
- Click → navigates to `/program/{slug}`
- "See more / See less" toggle if >defaultVisible (3 mobile, 6 desktop)

**Program slugs:**
- lower-back, shoulder, runners-knee, ankle-sprain, plantar-fasciitis
- techneck, hamstring, upper-back-core, core-stability, tennis-elbow, shin-splints

### 6. Pricing (HIDDEN)
- Wrapped in `{false && ...}` — never renders
- Would show `<PricingCards />` with monthly/annual/try CTAs

### 7. Program Preview Modal
- `<ProgramPreviewModal />` — shows hardcoded sample week/exercises
- Triggered by `modalOpen` state (currently unused in visible code)

---

## Inline Components

### `ProgramPreviewModal`
- Props: `isOpen`, `onClose`, `title`
- Keyboard: Escape closes
- Hardcoded content: Week 1 schedule, sample exercises

---

## Constants / Data

### `programSummaries`
Static fallback summaries by slug (11 programs).

### `programCardsBase`
Array of `{ key, slug, img }` for all program cards.

### `commonalityRank`
Ordering by prevalence (lower-back=1, shin-splints=11).

### `SHOW_PRICING`
`true` — but pricing section itself is wrapped in `{false && ...}`

---

## Analytics Events

| Event | Trigger |
|-------|---------|
| `nav_click` (target: signin) | Sign In button |
| `program_card_open` (condition: key) | Program card click |

---

## Issues / Tech Debt

1. **Commented-out code** — Hero, partner logos placement, nav link
2. **Unused state** — `_pricingAnnual`, `_exploreInput` (prefixed with `_`)
3. **Hardcoded string** — "Din AI helseassistent" not in translation
4. **Pricing hidden** — Section exists but wrapped in `{false}`
5. **Modal unused** — `ProgramPreviewModal` exists but no visible trigger in current flow
6. **Redundant ref** — `heroRef` exists but Hero is commented out
7. **Large file** — Single 675-line component; could be split

---

## Rework Considerations

- [ ] Remove dead code (commented Hero, unused state/refs)
- [ ] Extract sections into subcomponents
- [ ] Centralize program data (currently split between summaries, cardsBase, rankings)
- [ ] Re-enable or remove pricing section
- [ ] i18n for hardcoded "Din AI helseassistent"
- [ ] Decide on modal — remove or wire up
- [ ] Responsive polish (mobile nav missing)
