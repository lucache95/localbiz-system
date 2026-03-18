# LocalBiz Website Production System
### Architecture, Schemas, Workflows & Implementation Plan
**Prepared for review — March 2026**

---

## What This Is

A reusable Claude Code + GSD system for generating high-quality local business websites from messy, incomplete client context. Built for an agency that produces websites for plumbers, roofers, electricians, landscapers, HVAC companies, med spas, and similar local service businesses.

**Core problem it solves:** Client inputs are always messy — a half-filled form, a Google Drive dump, an existing website that's 10 years old, and a phone call's worth of notes. This system ingests all of it, normalizes it, and produces a deployable Next.js site without the agency having to manually organize everything each time.

**Goals, in priority order:**
1. Speed to launch
2. Repeatability across clients
3. Quality consistency
4. Ease of future revisions
5. Minimal operational complexity

---

## System Overview

```
RAW CLIENT INPUTS                       NORMALIZED                  BUILT SITE
─────────────────────────────────────────────────────────────────────────────────

_intake/form.json     ┐
_intake/assets/       ├─ /localbiz:intake ──► CONTEXT.json ─► /localbiz:generate-spec ──► SPEC.json ──► /localbiz:build-site ──► site/
_intake/notes.txt     │
existingSiteUrl       ┘
```

**Three artifacts, three commands:**

| Artifact | Produced by | Purpose |
|---|---|---|
| `_context/CONTEXT.json` | `/localbiz:intake` | Normalized, sourced, confidence-rated business data |
| `_spec/SPEC.json` | `/localbiz:generate-spec` | Canonical site spec — drives all generation |
| `site/` | `/localbiz:build-site` | Production-ready Next.js app |

Revisions go through `/localbiz:revise`, which routes change requests and updates both `SPEC.json` and the site files.

---

## Repository Structure

**System repo:** `~/clawd/localbiz-system/` (git tracked, symlinked into Claude Code)

```
localbiz-system/
├── commands/                          ← Claude Code command files
│   ├── intake.md                      ← /localbiz:intake
│   ├── parse-form.md                  ← /localbiz:parse-form
│   ├── analyze-site.md                ← /localbiz:analyze-site
│   ├── generate-spec.md               ← /localbiz:generate-spec
│   ├── build-site.md                  ← /localbiz:build-site
│   └── revise.md                      ← /localbiz:revise
│
├── resources/
│   ├── schemas/
│   │   └── types.ts                   ← All TypeScript type definitions
│   ├── templates/
│   │   └── intake-form.json           ← Client intake form field schema
│   ├── examples/
│   │   └── plumber-intake-form.json   ← Real example: Priority Plumbing Solutions
│   ├── starter/
│   │   ├── STRUCTURE.md               ← Next.js starter repo design
│   │   └── form-architecture.md       ← Form handling code patterns
│   ├── business-type-profiles.json    ← Default patterns by business category
│   ├── WORKFLOWS.md                   ← End-to-end workflow documentation
│   └── README.md
│
├── QUICKSTART.md                      ← Simple 3-command workflow guide
├── OVERVIEW.md                        ← This document
├── install.sh                         ← Symlink installer
└── README.md
```

**Symlinks:**
- `~/.claude/commands/localbiz` → `localbiz-system/commands/`
- `~/.claude/localbiz` → `localbiz-system/resources/`

**Client projects:**
```
~/clawd/projects/jaron-websites/[client-id]/   ← one folder per client, git repo
├── _intake/                                    ← raw inputs go here
│   ├── form.json
│   └── assets/
├── _context/                                   ← produced by /localbiz:intake
│   ├── CONTEXT.json
│   ├── EXISTING_SITE.json
│   └── QUESTIONS.md
├── _spec/                                      ← produced by /localbiz:generate-spec
│   └── SPEC.json
└── site/                                       ← produced by /localbiz:build-site
    └── (full Next.js app)
```

---

## The Six Commands

### `/localbiz:intake [path]`

**Purpose:** Ingest all client context from any folder, normalize it, produce CONTEXT.json.

**Inputs:**
- `~/Downloads/whatever/` — raw client folder (most common). Auto-creates the project.
- A `jaron-websites/[client-id]/` project path — run on existing project.
- Empty — run from within a client project folder.

**What it does:**
1. If given a raw folder: creates `~/clawd/projects/jaron-websites/[client-id]/`, copies files, inits git
2. Classifies every file (form, notes, logo, photo, video, doc, pdf, etc.)
3. Parses `form.json` using the IntakeForm schema
4. Reads all text documents and extracts business context
5. Catalogs all asset files
6. Fetches and analyzes `existingSiteUrl` if present (calls analyze-site logic)
7. Synthesizes everything into `_context/CONTEXT.json` with source + confidence tracking
8. Writes `_context/QUESTIONS.md` with outstanding questions, grouped by severity

**Outputs:** `_context/CONTEXT.json`, `_context/QUESTIONS.md`, `_context/EXISTING_SITE.json` (if URL)

**Failure modes:**
- Critical fields missing (phone, business name, services, city) → sets `readyToGenerateSpec: false`, lists in QUESTIONS.md
- Contradictions across sources → flagged in both CONTEXT.json and QUESTIONS.md
- No inputs found → asks user for a path

---

### `/localbiz:parse-form [text or path]`

**Purpose:** Normalize raw form data from any format into `_intake/form.json`.

**Use when:** Form submission arrives as email, paste, CSV, Typeform/Jotform export, or any non-standard format.

**Inputs:**
- Freeform text pasted directly: `/localbiz:parse-form "Business: Acme Plumbing\nPhone: 972-555-0100..."`
- File path: `/localbiz:parse-form ~/Downloads/submission.txt`

**What it does:**
- Detects input format (structured JSON, webhook payload, email body, freeform text)
- Maps any recognizable field to the canonical `IntakeForm` schema
- Preserves exact client wording in freeform fields
- Flags critical missing fields
- Writes `_intake/form.json`

**Outputs:** `_intake/form.json`

---

### `/localbiz:analyze-site [url]`

**Purpose:** Crawl and score an existing website before building or migrating.

**Inputs:** A website URL.

**What it does:**
1. Fetches homepage + up to 10 linked pages (services, about, contact, FAQs)
2. Extracts: all services, service areas, CTAs, phone, email, address, testimonials, FAQs
3. Scores 1–5 for: design, mobile-friendliness, conversion clarity, SEO basics
4. Identifies salvageable content vs. content that needs rewriting
5. Produces a recommendation: `rebuild` | `rewrite` | `hybrid` | `preserve`

**Outputs:** `_context/EXISTING_SITE.json`

**Scoring rubric:**
- **Design 5:** Modern, consistent, premium — **1:** Broken/unreadable
- **Mobile 5:** Fully responsive, good tap targets — **1:** Not mobile-optimized
- **Conversion 5:** Clear above-fold offer, click-to-call, forms working — **1:** No CTAs
- **SEO 5:** Good title tags, meta, H1 structure, local signals, schema — **1:** None of the above

---

### `/localbiz:generate-spec`

**Purpose:** Convert `CONTEXT.json` into the canonical `SPEC.json` that drives site generation.

**Run from:** Inside the client project folder.

**What it does:**
1. Validates CONTEXT.json is ready (no critical missing fields)
2. Loads business type profile for defaults (section order, CTA copy, colors, schema type)
3. Builds identity, brand, navigation blocks
4. Generates full service specs with copy, features, benefits, FAQs per service
5. Builds a complete page spec for every page (homepage, services, about, contact, service areas)
6. Writes actual copy — headlines, subheadlines, CTAs, section text — not just field names
7. Configures forms (quote, contact) with field definitions and notification routing
8. Generates SEO block: LocalBusiness schema, target keywords per page, internal link recommendations, AI discoverability notes

**Outputs:** `_spec/SPEC.json`

**On placeholders:** Any field that can't be confirmed gets a `[PLACEHOLDER]` tag and is listed in `meta.unresolvedQuestions`.

---

### `/localbiz:build-site`

**Purpose:** Scaffold a full Next.js site from SPEC.json.

**Run from:** Inside the client project folder.

**What it does:**
1. Reads SPEC.json, checks for `[PLACEHOLDER]` values
2. **Detects required services** and prompts for credentials:
   - Always: Resend API key, notify email
   - Conditional: Google Analytics, Cloudflare Turnstile, Cal.com, Supabase, Google Maps
3. Runs `create-next-app` with TypeScript + Tailwind + App Router
4. Installs: `resend`, `zod`, `react-hook-form`, `@hookform/resolvers`
5. Writes all section components (`Hero`, `TrustBar`, `ServicesGrid`, etc.)
6. Writes all pages with real content from spec
7. Writes form API routes (contact + quote) with Resend + honeypot spam protection
8. Writes `content/site.json` — the single JSON source of truth for all site content
9. Writes `LocalBusinessSchema` JSON-LD, `generateMetadata()` per page, sitemap, robots.txt
10. Writes `.env.local` with provided credentials + `# TODO` for missing ones
11. Commits everything: `feat: generate [businessName] site from spec`

**Outputs:** `site/` — a full, runnable Next.js app

**Credential prompting example:**
```
## Services needed for Acme Plumbing

### Always needed:
- RESEND_API_KEY — get at resend.com/api-keys
- NOTIFY_EMAIL — email for form leads (from spec: mike@acmeplumbing.com)

### For this project:
- (none beyond the basics — no booking, maps, or database sections in this spec)
```

---

### `/localbiz:revise "[request]"`

**Purpose:** Route and apply client change requests to the spec and site.

**Run from:** Inside the client project folder.

**Classification logic:**

| Category | Behavior | Examples |
|---|---|---|
| `content-swap` | Apply immediately | Update phone, fix typo, change hours |
| `asset-swap` | Apply immediately | Replace logo, swap photo |
| `text-edit` | Apply immediately | Change headline, edit CTA label |
| `add-item` | Apply immediately | Add testimonial, add FAQ, add service area |
| `remove-item` | Apply immediately | Remove old offer, remove service |
| `section-edit` | Ask questions | "Make the hero better" |
| `section-add` | Ask questions | "Add a financing section" |
| `page-add` | Ask questions | "Add a blog", "Add an Austin page" |
| `structural` | Ask questions | "Change the layout" |
| `seo-expansion` | Ask questions | "Rank in more cities" |
| `rebrand` | Ask questions | "Change the colors" |
| `conversion` | Ask questions | "Improve conversions" |
| `ambiguous` | Ask questions | Anything unclear |

**Safe changes:** Apply directly, commit, done. No questions.

**Qualifying questions:** Minimum needed, specific, actionable. Never generic bloated questionnaires.

**After qualification:** Generates a written revision plan, waits for approval, then applies.

---

## Data Schemas

### IntakeForm — what clients submit on your website

```typescript
interface IntakeForm {
  // Identity
  businessName: string;
  businessType: string;        // freeform — "plumber", "roofer", "HVAC", etc.
  tagline?: string;

  // Contact
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  serviceAreas?: string;       // freeform — "Dallas, Plano, Frisco"

  // Services
  primaryServices?: string;    // freeform list
  secondaryServices?: string;
  priceRange?: string;
  offers?: string;

  // Social
  facebook?: string;
  instagram?: string;
  googleBusiness?: string;
  yelp?: string;

  // Trust
  yearsInBusiness?: number;
  reviewCount?: number;
  averageRating?: number;
  certifications?: string;
  insurance?: string;
  license?: string;
  awards?: string;

  // Style / brand
  colorPreferences?: string;
  colorDislikes?: string;
  tonePreferences?: string;
  stylePreferences?: string;

  // References
  exampleSites?: string;       // URLs they like
  competitors?: string;
  designDislikes?: string;

  // Existing site
  existingSiteUrl?: string;
  existingSiteLikes?: string;
  existingSiteDislikes?: string;

  // Goals
  uniqueSellingPoints?: string;
  customerObjections?: string;
  targetCustomer?: string;
  primaryGoal?: string;
  mustHavePages?: string;
  mustHaveFeatures?: string;

  // Copy seeds
  heroHeadline?: string;
  testimonials?: string;
  faqsRaw?: string;
  processDescription?: string;

  // Meta
  urgency?: "asap" | "flexible" | "specific-date";
  targetLaunchDate?: string;
  additionalNotes?: string;
}
```

---

### ClientContext — normalized intermediate (output of /localbiz:intake)

```typescript
// Every meaningful value is wrapped in Sourced<T>
interface Sourced<T> {
  value: T | null;
  source: "form" | "file" | "existing-site" | "inferred";
  confidence: "high" | "medium" | "low";
  notes?: string;
}

interface ClientContext {
  meta: {
    clientId: string;             // kebab-case slug from business name
    createdAt: string;
    sources: {
      hasForm: boolean;
      hasAssets: boolean;
      hasExistingSite: boolean;
      assetFiles: string[];
    };
    overallConfidence: "high" | "medium" | "low";
  };

  business: {
    name: Sourced<string>;
    type: Sourced<string>;        // normalized lowercase: "plumber", "roofer"
    category: Sourced<"trade-emergency" | "home-improvement" | "health-wellness" | "service">;
    tagline: Sourced<string>;
    description: Sourced<string>;
    yearsInBusiness: Sourced<number>;
    uniqueSellingPoints: Sourced<string[]>;
    customerObjections: Sourced<string[]>;
    targetCustomer: Sourced<string>;
  };

  contact: {
    phone: Sourced<string>;
    email: Sourced<string>;
    address: Sourced<Address>;
    serviceAreas: Sourced<string[]>;
    primaryCity: Sourced<string>;
  };

  social: { facebook, instagram, google, yelp, linkedin };

  services: {
    primary: ServiceEntry[];
    secondary: ServiceEntry[];
    offers: OfferEntry[];
    priceRange: Sourced<string>;
  };

  brand: {
    colors: { preferred, avoided, styleNotes, source };
    tone: Sourced<string>;
    style: Sourced<string>;
    logo: { files: AssetRef[]; hasLogo: boolean };
  };

  trustSignals: {
    reviews: { google: {count, rating}; yelp: {count, rating} };
    testimonials: Testimonial[];
    certifications, awards, insurance, license, yearsInBusiness;
  };

  content: {
    faqs: FAQ[];
    processSteps: string[];
    existingCopy: { page, content, source }[];
  };

  assets: { logos, photos, videos, documents, other };

  references: {
    exampleSites: SiteRef[];
    competitors: SiteRef[];
    styleNotes: string;
    designDislikes: string;
  };

  goals: {
    primaryGoal: string;
    mustHavePages: string[];
    mustHaveFeatures: string[];
    urgency: "asap" | "flexible" | "specific-date";
    targetLaunchDate: string | null;
  };

  existingSite: ExistingSiteAnalysis | null;

  issues: {
    missing: MissingField[];       // severity: "critical" | "important" | "optional"
    contradictions: Contradiction[];
    overallConfidence: "high" | "medium" | "low";
    readyToGenerateSpec: boolean;  // false if any critical fields missing
  };
}
```

---

### ExistingSiteAnalysis — output of /localbiz:analyze-site

```typescript
interface ExistingSiteAnalysis {
  url: string;
  analyzedAt: string;

  structure: {
    pages: { url, title, type }[];
    navLinks: string[];
    hasContactForm: boolean;
    hasBlog: boolean;
    hasServicePages: boolean;
  };

  content: {
    servicesFound: string[];
    serviceAreasFound: string[];
    testimonialsFound: string[];
    faqsFound: { q, a }[];
    ctasFound: string[];
    phone, email, address;
  };

  quality: {
    designScore: 1|2|3|4|5;       // 5 = premium, 1 = broken
    mobileScore: 1|2|3|4|5;
    conversionScore: 1|2|3|4|5;
    seoScore: 1|2|3|4|5;
    overallScore: 1|2|3|4|5;
    [field]Notes: string;          // explanation for each score
  };

  salvageable: {
    content: string[];             // specific content pieces worth keeping
    structure: string[];
    seo: string[];
  };

  issues: {
    critical: string[];
    important: string[];
    minor: string[];
  };

  recommendation: "rebuild" | "rewrite" | "hybrid" | "preserve";
  recommendationReason: string;
}
```

---

### SiteSpec — canonical spec driving site generation

```typescript
interface SiteSpec {
  meta: {
    version: string;
    generatedAt: string;
    businessType: string;
    category: string;
    status: "draft" | "ready" | "published";
    clientId: string;
    migrationNeeded: boolean;
    migrationStrategy?: "rebuild" | "rewrite" | "hybrid";
    unresolvedQuestions: string[];   // [PLACEHOLDER] fields
    contradictions: string[];
  };

  identity: {
    businessName, tagline, description;
    phone, email;
    address: { street, city, state, zip, formatted };
    serviceAreas: string[];
    primaryCity: string;
    priceRange: string;
  };

  brand: {
    primaryColor: string;         // hex
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    fontHeading: string;
    fontBody: string;
    tone: string;                 // "professional and trustworthy"
    style: string;                // "clean, modern, premium"
    logoFile: string | null;
    hasLogo: boolean;
  };

  social: { facebook, instagram, google, yelp, linkedin };

  nav: {
    links: NavLink[];
    ctaPrimary: { label, href };
    phone: string;
    showPhone: boolean;
  };

  pages: PageSpec[];              // full page + section + SEO config per page

  services: ServiceSpec[];        // copy, features, benefits, FAQs per service

  trustSignals: {
    googleRating, googleReviewCount, yearsInBusiness;
    certifications, awards, insurance, license;
    badges: string[];             // "Licensed & Insured", "Family Owned", etc.
  };

  testimonials: Testimonial[];
  faqs: FAQ[];
  offers: OfferEntry[];

  forms: {
    [id: string]: FormConfig;    // quote, contact, booking, etc.
  };

  seo: {
    localBusiness: {             // full JSON-LD schema.org object
      "@type": string;           // "Plumber", "Electrician", etc.
      name, telephone, email, address, geo, areaServed, priceRange, url;
    };
    targetKeywords: { keyword, page, priority }[];
    internalLinks: { from, to, anchorText }[];
    aiDiscoverabilityNotes: string[];
    gaps: string[];
  };

  footer: {
    tagline: string;
    showServiceLinks, showAreaLinks, showContact: boolean;
    privacyPolicyUrl: string;
    year: number;
  };
}
```

---

### RevisionRequest — routing and applying change requests

```typescript
type RevisionCategory =
  | "content-swap"    // safe: update text, phone, hours, testimonial
  | "asset-swap"      // safe: replace image/logo
  | "text-edit"       // safe: change headline or CTA copy
  | "add-item"        // safe: add testimonial, FAQ, service area
  | "remove-item"     // safe: remove item from a list
  | "section-edit"    // needs qualification
  | "section-add"     // needs qualification
  | "page-add"        // needs qualification
  | "structural"      // needs qualification
  | "seo-expansion"   // needs qualification
  | "rebrand"         // needs qualification
  | "conversion"      // needs qualification
  | "ambiguous";      // needs qualification

interface RevisionRequest {
  id: string;
  requestedAt: string;
  rawRequest: string;           // exactly what the client said
  category: RevisionCategory;
  isSafe: boolean;
  targetPage?: string;
  targetSection?: string;
  changes: { type, field, currentValue, newValue, notes }[];
  qualifyingQuestions?: string[];
  estimatedScope: "small" | "medium" | "large";
  risk: "low" | "medium" | "high";
  plan?: string;
}
```

---

## Business Type Profiles

The system uses 4 categories with preconfigured defaults. The `business-type-profiles.json` file maps 30+ business types to these categories.

### trade-emergency
*Plumber, electrician, HVAC, roofer, locksmith, garage door, pest control*

- **Hero emphasis:** emergency availability, same-day service
- **Primary CTA:** "Get Free Quote"
- **Default trust bar:** Licensed & Insured, Free Estimates, Same-Day Service, Satisfaction Guaranteed
- **Homepage sections:** hero → trust-bar → services-grid → how-it-works → testimonials → service-areas → faq → cta-band → contact-block
- **Schema type:** HomeAndConstructionBusiness / Plumber / Electrician / etc.
- **Default colors:** navy `#1a3a5c` + amber `#f59e0b`

### home-improvement
*Painter, landscaper, flooring, contractor, remodeler, cleaning, movers*

- **Hero emphasis:** quality results, visual work
- **Primary CTA:** "Get Free Estimate"
- **Homepage sections:** adds `gallery` section, removes emergency messaging
- **Schema type:** HomeAndConstructionBusiness
- **Default colors:** forest green `#166534` + amber

### health-wellness
*Med spa, chiropractor, dentist, massage, physical therapy*

- **Hero emphasis:** results and credentials
- **Primary CTA:** "Book Appointment"
- **Homepage sections:** adds `before-after`, emphasizes `about` and `team`
- **Schema type:** MedicalBusiness / Dentist
- **Default colors:** navy `#1e3a5f` + purple `#8b5cf6`

### service
*Auto detailer, pool service, pressure washing, window cleaning, appliance repair*

- **Hero emphasis:** convenience and quality
- **Primary CTA:** "Get a Quote"
- **Schema type:** LocalBusiness
- **Default colors:** blue `#1e40af` + amber

---

## End-to-End Workflows

### Workflow 1: New site — form + folder (most common)

```
Step 1: Drop client files and run intake
  /localbiz:intake ~/Downloads/acme-plumbing-files/
  → Auto-creates ~/clawd/projects/jaron-websites/acme-plumbing/
  → Copies all files to _intake/assets/
  → Inits git in project root
  → Produces _context/CONTEXT.json + QUESTIONS.md

Step 2: Review CONTEXT.json
  Check _context/QUESTIONS.md for any critical missing info.
  Answer what you can, or proceed with placeholders.

Step 3: Generate spec
  cd ~/clawd/projects/jaron-websites/acme-plumbing
  /localbiz:generate-spec
  → Produces _spec/SPEC.json with all pages, copy, SEO, forms

Step 4: Build site
  /localbiz:build-site
  → Prompts for Resend API key + notify email
  → Scaffolds full Next.js site in site/
  → Commits everything

Step 5: Preview
  cd site && cp .env.example .env.local
  npm run dev

Step 6: Deploy
  vercel --cwd site
```

**Typical time end-to-end:** 60–120 minutes for a complete quality build.

---

### Workflow 2: New site — with existing website

```
Step 1: Analyze the existing site first
  /localbiz:analyze-site https://oldsite.com
  → Produces _context/EXISTING_SITE.json
  → Scores design/mobile/conversion/SEO
  → Recommends: rebuild / rewrite / hybrid / preserve

Step 2: Run intake (picks up existing site analysis automatically)
  /localbiz:intake ~/Downloads/client-files/

Step 3–6: Same as Workflow 1
  generate-spec will incorporate salvageable content from the old site.
```

---

### Workflow 3: Revision to a live site

```
cd ~/clawd/projects/jaron-websites/acme-plumbing

# Safe changes — apply instantly
/localbiz:revise "Update phone to (972) 555-1234"
/localbiz:revise "Add a testimonial from John S.: 'Best plumber in Plano.'"
/localbiz:revise "Change the hero headline to 'DFW's Most Trusted Plumber'"

# Vague changes — asks questions first
/localbiz:revise "Make the homepage more premium"
/localbiz:revise "Improve our conversions"
/localbiz:revise "Add SEO for more cities"
```

All changes update both `_spec/SPEC.json` and `site/src/content/site.json` and are committed.

---

### Workflow 4: Ambiguous / contradictory client input

**Example:** Form says "Dallas only." Existing website lists 12 cities. A flyer says "DFW-wide."

Intake produces in CONTEXT.json:
```json
{
  "contact": {
    "serviceAreas": {
      "value": ["Dallas"],
      "source": "form",
      "confidence": "medium",
      "notes": "CONTRADICTION: existing site lists 12 cities; flyer says DFW-wide"
    }
  },
  "issues": {
    "contradictions": [{
      "field": "serviceAreas",
      "valueA": "Dallas only",  "sourceA": "form",
      "valueB": "12 cities listed",  "sourceB": "existing-site",
      "resolution": null
    }]
  }
}
```

QUESTIONS.md includes a specific resolution question. User answers → intake is re-run or CONTEXT.json is patched manually → proceed.

---

## Starter Repo Design

**Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Resend + React Hook Form + Zod

**Key principle:** All site content lives in `src/content/site.json`. Components are purely presentational — they receive data as props. `/localbiz:build-site` transforms `SPEC.json` into `site.json` and then writes all the components.

### Section components

| Section type | Component | Notes |
|---|---|---|
| `hero` | `Hero.tsx` | Full-width, above fold, mobile-first |
| `trust-bar` | `TrustBar.tsx` | 4 badge items, icon + label |
| `services-grid` | `ServicesGrid.tsx` | 3-col responsive cards |
| `how-it-works` | `HowItWorks.tsx` | 3 numbered steps |
| `testimonials` | `Testimonials.tsx` | Cards with star rating |
| `faq` | `FAQ.tsx` | Accordion + FAQPage schema |
| `service-areas` | `ServiceAreas.tsx` | Badge grid of city names |
| `about` | `AboutSection.tsx` | Story + credentials |
| `cta-band` | `CTABand.tsx` | Full-width colored band |
| `gallery` | `Gallery.tsx` | Photo grid |
| `before-after` | `BeforeAfter.tsx` | Side-by-side comparison |
| `financing` | `FinancingBlock.tsx` | Promo + inquiry form |
| `contact-block` | `ContactBlock.tsx` | Form + contact info |

### Form architecture

- **React Hook Form** — state + UX
- **Zod** — shared client/server validation
- **Next.js API routes** — server-side processing
- **Resend** — email notifications to client + confirmation to lead
- **Honeypot** — default spam protection (no CAPTCHA friction)
- Optional upgrade: **Cloudflare Turnstile** if spam becomes an issue

**Default forms:** `quote` (name, phone, email, service, description) and `contact` (name, email, phone, message).

### SEO baked in

Every generated site includes:
- `LocalBusiness` JSON-LD in root layout
- `FAQPage` schema on pages with FAQs
- `Service` schema on service pages
- `generateMetadata()` per page from `site.json`
- Dynamic `sitemap.ts`
- `robots.ts`
- Consistent NAP across all pages and schema
- Target keyword per page defined in spec

### Environment variables

```bash
# Always required
RESEND_API_KEY=
NOTIFY_EMAIL=
NEXT_PUBLIC_SITE_URL=

# Conditional (build-site prompts only if spec requires them)
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_CAL_LINK=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_KEY=
```

---

## Design Decisions & Tradeoffs

| Decision | Chosen approach | Alternative considered | Reason |
|---|---|---|---|
| Framework | Next.js 14 App Router | Astro, plain HTML | SSR + API routes in one, Vercel-native |
| Styling | Tailwind | CSS Modules, styled-components | Speed of iteration, good defaults |
| Email | Resend | SendGrid, Postmark, Nodemailer | Best DX, free tier, simple API |
| CMS | None by default | Sanity, Contentful | JSON file is simpler, CMS adds ops overhead for most clients |
| Forms | Server-side API routes | Netlify Forms, Formspree | No third-party dependency, full control |
| Deployment | Vercel | Netlify, Railway | Best Next.js DX, free tier generous |
| Spam | Honeypot | reCAPTCHA, Turnstile | No friction for real users |
| Database | None by default | Supabase | Most sites don't need it; easy to add later |
| Git | Per-project repo | Monorepo | Cleaner client separation, easier to hand off |

---

## Open Questions / Areas to Improve

These are known gaps worth discussing:

1. **Starter repo doesn't exist yet as a real GitHub repo.** The system describes the structure and components but `/localbiz:build-site` currently scaffolds from scratch each time. A real template repo would make the first build faster and more consistent.

2. **No real content/site.json transform code.** The `generate-spec` and `build-site` commands produce the right artifacts, but there's no standalone transform function — Claude writes the transformation each time. A TypeScript utility (`spec-to-site-config.ts`) would make this more deterministic.

3. **Image handling is not fully designed.** The system catalogs image assets but doesn't define how they get copied into `public/images/` or how asset paths are referenced in `site.json`.

4. **Service area pages.** The system mentions generating service area pages "only when genuinely useful and non-spammy" but doesn't define the exact threshold or content pattern for when to create them vs. just list areas on a section.

5. **Revision history.** Revisions update `SPEC.json` in place. There's no versioning or changelog on the spec — if a client wants to revert a content change, there's no easy path beyond git.

6. **Multi-location businesses.** The schema handles a single primary address. A business with multiple locations (e.g., two storefronts) would need schema and page structure changes that aren't currently defined.

7. **Handoff to clients.** No defined process for handing the repo/site to the client if they eventually want to self-manage or move to a different agency.

---

## Quick Reference — Commands

```bash
# Start a new client from any folder of files
/localbiz:intake ~/Downloads/client-files/

# Normalize messy form input (paste or file)
/localbiz:parse-form "raw form text or path"

# Analyze an existing website before building
/localbiz:analyze-site https://existingsite.com

# Generate site spec from normalized context
cd ~/clawd/projects/jaron-websites/[client-id]
/localbiz:generate-spec

# Build the Next.js site (prompts for credentials)
/localbiz:build-site

# Apply a revision
/localbiz:revise "change request in plain English"
```

---

*System built with Claude Code. Repo: `https://github.com/lucache95/localbiz-system`*
