You are running `/localbiz:build-site` — the site builder for a local business website project.

**Your goal:** Scaffold a production-ready Next.js site in `site/` from the canonical `_spec/SPEC.json`.

## Arguments
$ARGUMENTS — optional: project folder path. Defaults to current directory.

---

## STEP 1: Load and validate the spec

Read `_spec/SPEC.json`. If it doesn't exist, tell the user to run `/localbiz:generate-spec` first.

Check for `[PLACEHOLDER]` values in the spec. If any exist, list them and ask:
"These fields are still placeholders. Do you want to proceed with placeholders (they'll be marked as TODO in the code) or fill them first?"

---

## STEP 1B: Determine required services and collect credentials

Before scaffolding anything, analyze the spec to determine which external services this project needs. Then present a checklist and collect any missing credentials.

**Always required:**
- **Resend** (form email notifications) — needs `RESEND_API_KEY`
- **Vercel** (deployment) — needs Vercel CLI installed; no env var needed for deploy
- **Notify email** — the email address where form submissions go (from `spec.forms.*.notifyEmail`)

**Conditionally required — check the spec:**
- **Google Analytics** — if `spec.seo.gaId` is set, needs `NEXT_PUBLIC_GA_ID`
- **Cloudflare Turnstile** — if `spec.forms.*.spamProtection === "turnstile"`, needs `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`
- **Cal.com** — if any section type is `"booking"` or any form type is `"booking"`, needs `NEXT_PUBLIC_CAL_LINK`
- **Supabase** — if spec has `"leadStorage": true` or any section requiring a database, needs `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Google Maps** — if any page has a map embed section, needs `NEXT_PUBLIC_GOOGLE_MAPS_KEY`
- **Railway** — only if the project requires a backend worker, job queue, or server process beyond Next.js (rare — most sites do NOT need this)

Present this prompt to the user:

```
## Services needed for [Business Name]

I need the following credentials before scaffolding. You can provide them now
or skip any and fill them in `.env.local` manually afterward.

### Always needed:
- [ ] RESEND_API_KEY — get at resend.com/api-keys
      Current value: [ask or show "not set"]
- [ ] NOTIFY_EMAIL — email for form lead notifications
      From spec: [spec.forms.quote.notifyEmail]

### Conditionally needed for this project:
[list only the services actually required by this spec]

Type your answers below, or type "skip" for any you want to fill in later.
Format: KEY=value (one per line), or just press Enter to use defaults where shown.
```

Wait for user response. Accept any of:
- `KEY=value` pairs
- "skip" or empty to defer
- "all skip" to defer everything

Store provided values to use when writing `.env.local`.

For **RESEND_API_KEY**: if the user has already set it as a shell environment variable (check `echo $RESEND_API_KEY`), note that and offer to use it.

**If the user skips credentials**, continue the build but:
- Write `.env.local` with empty or placeholder values
- Add a `## Missing credentials` section to the final report
- Add `# TODO: fill this in` comments next to empty values in `.env.local`

---

## STEP 2: Create the project if needed

**Read the configured projects directory from `~/.claude/localbiz/config.json` → `projectsDir`.** This is set during `./install.sh`. Use it as the base for all client project paths.

Determine the project folder name from `meta.clientId` (kebab-case, e.g. `acme-plumbing`).

If the current directory IS already a client project (i.e., `_spec/SPEC.json` is at `./`), use `.` as the project root.

Otherwise, confirm the project folder: `[PROJECTS_DIR]/[clientId]/`

The site goes in `[project-root]/site/`.

If `site/` doesn't exist yet, scaffold it. If it does exist, ask "A site/ directory already exists. Overwrite or update?"

---

## STEP 3: Initialize the Next.js site

If `site/` doesn't exist or we're overwriting:

```bash
cd [project-root]
npx create-next-app@latest site \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git
```

After scaffolding, install additional dependencies:
```bash
cd site
npm install resend zod @hookform/resolvers react-hook-form next-themes
npm install -D @types/node
```

Then initialize git in the project root (not just site/):
```bash
cd [project-root]
git init
git add .
git commit -m "init: scaffold [businessName] website"
```

---

## STEP 4: Install the component library

Copy or create the following directory structure in `site/src/`:

```
site/src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── about/page.tsx
│   ├── services/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── contact/page.tsx
│   ├── privacy/page.tsx
│   └── api/
│       ├── contact/route.ts
│       └── quote/route.ts
├── components/
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── TrustBar.tsx
│   │   ├── ServicesGrid.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Testimonials.tsx
│   │   ├── ServiceAreas.tsx
│   │   ├── FAQ.tsx
│   │   ├── CTABand.tsx
│   │   ├── Gallery.tsx
│   │   ├── BeforeAfter.tsx
│   │   ├── AboutSection.tsx
│   │   ├── FinancingBlock.tsx
│   │   └── ContactBlock.tsx
│   ├── forms/
│   │   ├── ContactForm.tsx
│   │   ├── QuoteForm.tsx
│   │   ├── FormField.tsx
│   │   └── SubmitButton.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── MobileMenu.tsx
│       └── PhoneLink.tsx
├── lib/
│   ├── content.ts
│   ├── forms.ts
│   └── schema.ts
├── types/
│   └── site.ts
└── content/
    └── site.json
```

---

## STEP 5: Write `content/site.json`

Transform `_spec/SPEC.json` into the `site/src/content/site.json` format.

This file is the single source of truth for all site content. Write the full transformed JSON.

Key transformations:
- Flatten the spec into a simpler content structure
- Every page gets its sections config
- Colors become CSS custom property values
- Forms config carries over directly

---

## STEP 6: Write core files

Write each file with real content populated from the spec. Do not leave empty shells.

### `site/src/types/site.ts`
TypeScript types that mirror `content/site.json`.

### `site/src/lib/content.ts`
```typescript
import siteConfig from '@/content/site.json'
export const site = siteConfig
export type SiteConfig = typeof siteConfig
```

### `site/src/lib/schema.ts`
Functions that generate JSON-LD structured data from the site config.
- `getLocalBusinessSchema()` — builds the full LocalBusiness schema from `site.seo.localBusiness`
- `getServiceSchema(service)` — builds Service schema
- `getFAQSchema(faqs)` — builds FAQPage schema

### `site/src/app/layout.tsx`
Root layout with:
- Metadata from spec (title template, description, og:image)
- `<Header>` and `<Footer>` components
- `<LocalBusinessSchema>` JSON-LD injection
- Google fonts (if specified in spec)
- CSS variables for brand colors

### `site/.env.example`

Write `.env.example` with ALL possible keys documented:
```
# ── Required ────────────────────────────────────────
RESEND_API_KEY=                    # get at resend.com/api-keys
NOTIFY_EMAIL=                      # where form leads get emailed
NEXT_PUBLIC_SITE_URL=              # https://yourdomain.com

# ── Optional: Analytics ──────────────────────────────
NEXT_PUBLIC_GA_ID=                 # Google Analytics: G-XXXXXXXXXX

# ── Optional: Spam Protection ────────────────────────
NEXT_PUBLIC_TURNSTILE_SITE_KEY=    # Cloudflare Turnstile (if enabled)
TURNSTILE_SECRET_KEY=

# ── Optional: Booking ────────────────────────────────
NEXT_PUBLIC_CAL_LINK=              # Cal.com: username/event-type

# ── Optional: Lead Storage ───────────────────────────
NEXT_PUBLIC_SUPABASE_URL=          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Supabase anon key

# ── Optional: Maps ───────────────────────────────────
NEXT_PUBLIC_GOOGLE_MAPS_KEY=       # Google Maps embed key
```

Write `.env.local` with values populated from credentials collected in Step 1B.
For any skipped or missing values, write the key with an empty value and a `# TODO` comment:
```
RESEND_API_KEY=re_xxxx              # provided
NOTIFY_EMAIL=owner@business.com    # from spec
NEXT_PUBLIC_SITE_URL=              # TODO: set after domain is configured
```

---

## STEP 7: Write all section components

For each section type used in the spec, write the full React component.

Each component receives its config as props (from `content/site.json`). Use Tailwind for styling. Use the spec's color palette via CSS variables.

Write these as production-quality components — not scaffold stubs.

**Hero component:**
- Full-width above-the-fold section
- Headline + subheadline from spec
- Primary CTA button (prominent, high-contrast)
- Secondary CTA (call now link with phone icon)
- Background: gradient or image-ready
- Mobile-first responsive

**TrustBar component:**
- Horizontal row of 4 trust badges
- Icons + labels
- Subtle background separator

**ServicesGrid component:**
- Responsive grid (3 cols desktop, 2 tablet, 1 mobile)
- Each card: icon, service name, short description, "Learn More" link
- Links to service pages if `hasOwnPage: true`

**HowItWorks component:**
- Numbered steps (3)
- Step title + description
- Visual connector between steps on desktop

**Testimonials component:**
- Card carousel or grid (3 per row)
- Quote, author name, star rating if available
- Google review reference if applicable

**FAQ component:**
- Accordion-style
- Question + answer
- FAQ schema output (via `getFAQSchema`)

**ServiceAreas component:**
- Grid of city names / area badges
- Optional: short note per area
- Link to individual area if pages exist

**CTABand component:**
- Full-width colored band (secondary color)
- Headline + subheadline from spec
- CTA button

**ContactBlock component:**
- Quote form (left) + contact info (right) on desktop
- Phone, email, address, hours
- Simple two-column layout

---

## STEP 8: Write all pages

### Homepage (`app/page.tsx`)
Import and render all sections defined in `site.pages[0].sections`.
Use a `renderSection(section)` switch that maps section type to component.

### Services page (`app/services/page.tsx`)
List all services with cards linking to individual service pages.

### Individual service page (`app/services/[slug]/page.tsx`)
Dynamic route. Read the matching service from `site.services`.
Render hero → description → features → FAQs → testimonials → CTA.
Generate `generateMetadata()` using page-specific title/description.
Generate `generateStaticParams()` for all service slugs.

### About page (`app/about/page.tsx`)
Business story, years in business, certifications, team.

### Contact page (`app/contact/page.tsx`)
Full contact + quote form + map embed if address present.

### Privacy page (`app/privacy/page.tsx`)
Standard privacy policy boilerplate.

---

## STEP 9: Write form handling

### `site/src/app/api/contact/route.ts`
```typescript
// POST handler
// 1. Validate with Zod
// 2. Check honeypot
// 3. Send email via Resend
// 4. Return success/error JSON
```

Use Resend for email delivery. Send to `process.env.NOTIFY_EMAIL`.

Email template should include all form fields, the page it was submitted from, and a timestamp.

### `site/src/app/api/quote/route.ts`
Same pattern as contact, but with quote-specific fields and a different email template.

### `site/src/components/forms/ContactForm.tsx`
React Hook Form + Zod validation.
Honeypot field (hidden, named like `website` or `url`).
Loading state on submit.
Success message after submission.
Error message if API returns error.

---

## STEP 10: Write SEO setup

### `site/src/lib/schema.ts`
Full JSON-LD generators. Include LocalBusiness, FAQPage, Service schemas.

### Each page's `generateMetadata()`
Populate from `content/site.json` page configs.

### `site/public/robots.txt`
```
User-agent: *
Allow: /
Sitemap: https://SITE_URL/sitemap.xml
```

### `site/app/sitemap.ts`
Dynamic sitemap from all page slugs.

---

## STEP 11: Write `next.config.ts` and `tailwind.config.ts`

`next.config.ts`: image domain allowlist if external images are used.

`tailwind.config.ts`: extend with brand colors from spec:
```typescript
theme: {
  extend: {
    colors: {
      brand: {
        primary: spec.brand.primaryColor,
        secondary: spec.brand.secondaryColor,
        accent: spec.brand.accentColor,
      }
    }
  }
}
```

---

## STEP 12: Initial git commit

```bash
cd [project-root]
git add .
git commit -m "feat: generate [businessName] site from spec"
```

---

## STEP 13: Report

```
## Site Built — [Business Name]

**Location:** [PROJECTS_DIR]/[clientId]/site/

**Pages generated:**
- / (homepage)
- /services
- /services/[N service pages]
- /about
- /contact
- /privacy

**Components written:** [count]
**Forms configured:** contact, quote
**Schema:** [schemaType]

**To run locally:**
cd [PROJECTS_DIR]/[clientId]/site
cp .env.example .env.local
# Add your RESEND_API_KEY to .env.local
npm run dev

**To deploy to Vercel:**
vercel --cwd site

**Placeholders still needing attention:**
- [list any [PLACEHOLDER] values in the code]
```
