You are running `/localbiz:generate-spec` — the site spec generator for a local business website project.

**Your goal:** Convert `_context/CONTEXT.json` into a comprehensive, production-ready `_spec/SPEC.json` that fully drives site generation.

## Arguments
$ARGUMENTS — optional path to client project folder. Defaults to current directory.

---

## STEP 1: Load context

Read `_context/CONTEXT.json`. If it doesn't exist, tell the user to run `/localbiz:intake` first.

Also read:
- `_context/EXISTING_SITE.json` if present
- `~/.claude/localbiz/business-type-profiles.json` for business type defaults

---

## STEP 2: Validate context is ready

Check `issues.readyToGenerateSpec`. If false, list the critical missing fields and ask the user:
- "These critical fields are missing: [list]. Do you want to proceed anyway with placeholders, or answer the questions in `_context/QUESTIONS.md` first?"

If proceeding with placeholders, mark any placeholder values with a `[PLACEHOLDER]` prefix in the spec and add them to `meta.unresolvedQuestions`.

---

## STEP 3: Determine business category and defaults

From `business.category.value`, load the matching profile from `business-type-profiles.json`.

This gives you:
- `schemaType` for LocalBusiness schema
- Default home page sections
- Default CTA labels
- Default trust bar items
- Default page list

---

## STEP 4: Build identity block

Map from context:
- `businessName` ← context.business.name.value
- `tagline` ← context.business.tagline.value (if null, generate one based on business type + city)
- `description` ← context.business.description.value (if null, write a 2–3 sentence description from USPs)
- `phone` ← context.contact.phone.value
- `email` ← context.contact.email.value
- `address` ← context.contact.address.value
- `serviceAreas` ← context.contact.serviceAreas.value
- `primaryCity` ← context.contact.primaryCity.value
- `priceRange` ← context.services.priceRange.value (default "$$")

---

## STEP 5: Build brand block

**Colors:**
If the client provided color preferences (context.brand.colors), use them as hints.
If they gave hex codes, use them directly.
If they gave color names (e.g., "navy blue and gold"), translate to hex.
If they gave nothing, use the defaults from `business-type-profiles.json` → `defaultColorsByCategory[category]`.

**Tone and style:**
Map tone from context.brand.tone.value. If null, use these defaults by category:
- trade-emergency: "professional, reliable, and trustworthy"
- home-improvement: "quality-focused, friendly, and local"
- health-wellness: "professional, caring, and results-driven"
- service: "friendly, professional, and dependable"

**Fonts:**
Default: `fontHeading: "Inter"`, `fontBody: "Inter"` unless client specified a preference.

---

## STEP 6: Build navigation

Build `nav.links` based on the page list.
Default nav for most businesses:
- Services → /services
- About → /about
- Service Areas → /service-areas (only if 3+ areas)
- Contact → /contact

Primary CTA: use the category default from business-type-profiles.
Phone: use the contact phone.

---

## STEP 7: Build service specs

For each service in context.services.primary:
1. Generate a `ServiceSpec` with:
   - `shortDescription` — 1–2 sentences
   - `fullDescription` — 3–5 sentences
   - `features` — 3–5 bullet points of what's included
   - `benefits` — 3–5 customer-focused benefits
   - `faqs` — 2–4 FAQs relevant to this service
   - `hasOwnPage`: true if more than 3 primary services (each gets its own page)

For secondary services, `hasOwnPage: false` unless client specified otherwise.

If the context includes existing copy for this service, use it as a base and improve it.
Do NOT fabricate technical details (e.g., specific pricing, certifications) — use `[PLACEHOLDER]` for anything you can't confirm.

---

## STEP 8: Build page specs

Generate a `PageSpec` for each page. Use the section list from the business type profile.

### Homepage
Sections (apply based on what data is available):
1. **hero** — headline, subheadline, primary CTA, secondary CTA (call now)
   - Headline formula: "[Benefit/Result] in [City] — [Differentiator]"
   - Use USPs from context. If none, use a strong local-business default for the type.
2. **trust-bar** — use context trustSignals + category defaults
3. **services-grid** — list all primary services with icons and short descriptions
4. **how-it-works** — 3 steps. Use context.content.processSteps if available, else create sensible defaults.
5. **testimonials** — include if context.trustSignals.testimonials has 1+ entries
6. **service-areas** — include if context.contact.serviceAreas has 3+ entries
7. **faq** — include if context.content.faqs has 1+ entries
8. **cta-band** — always include
9. **contact-block** — always include, with quote form

For each section, write actual content (not just field names). Write real headlines, subheadlines, and copy.

**SEO:**
- `metaTitle`: "[Business Name] — [Primary Service] in [City] | [State]" (max 60 chars)
- `metaDescription`: Include primary service, city, key differentiator, and CTA (max 160 chars)

### Services page
- Hero with services overview
- Services grid with links to individual service pages
- Trust signals
- CTA band

### Individual service pages (if hasOwnPage)
- Hero with service-specific headline
- Service description
- Features/process
- FAQ for this service
- Testimonials (2–3 relevant ones)
- CTA band

### About page
- Business story + team
- Certifications, years in business
- Trust signals
- CTA

### Contact page
- Quote/contact form
- Phone, email, address
- Google Maps embed (if address provided)
- Service areas list

### Service Areas page (if 3+ areas)
- Overview of all service areas
- Brief section for primary cities (50–100 words each) — don't make them doorway pages

---

## STEP 9: Build forms config

Create a `forms` block with at minimum:
- `quote` form — name, email, phone, service (select), description (textarea), preferred date (optional)
- `contact` form — name, email, phone, message

Configure based on business category:
- trade-emergency: emphasize quote form, show emergency note
- health-wellness: booking inquiry form
- home-improvement: project description form

`notifyEmail`: use context.contact.email.value
`spamProtection`: "honeypot" (default, no additional services needed)

---

## STEP 10: Build SEO block

**LocalBusiness schema:**
Use `seoSchemaTypeMap` from business-type-profiles.json to get the `@type` value.
Fill all fields from context. Leave `geo` as null if no lat/lng available.

**Target keywords:**
Generate 5–10 target keywords per page:
- Format: "[service] [city]", "[service] near me", "[city] [service] company"
- Priority: primary for homepage, secondary for service pages

**Internal links:**
Create sensible internal linking recommendations:
- Homepage → key service pages
- Service pages → contact
- About → contact
- Service areas → relevant service pages

**AI discoverability notes:**
Include recommendations like:
- "Add FAQ structured data to homepage and service pages"
- "Use clear H1 tags with city + service on each page"
- "Ensure NAP (name, address, phone) is consistent across all pages and schema"
- "Add service-specific landing pages for top 3 services"

---

## STEP 11: Build meta block

```json
{
  "meta": {
    "version": "1.0",
    "generatedAt": "[timestamp]",
    "businessType": "[type]",
    "category": "[category]",
    "status": "draft",
    "clientId": "[from context]",
    "migrationNeeded": [true if existingSite recommendation is not "preserve"],
    "migrationStrategy": "[from existingSite.recommendation if applicable]",
    "unresolvedQuestions": ["list any [PLACEHOLDER] fields"],
    "contradictions": ["list from context.issues.contradictions"]
  }
}
```

---

## STEP 12: Write output

Write `_spec/SPEC.json` (create `_spec/` if needed).

Then report:

```
## Spec Generated — [Business Name]

**Pages:** [list]
**Services with own pages:** [list]
**Forms configured:** [list]
**Colors:** Primary [hex], Secondary [hex]
**Schema type:** [type]

**Placeholders (need review):**
- [list any [PLACEHOLDER] values]

**Contradictions carried forward:**
- [list]

**Next step:**
Run `/localbiz:build-site` to scaffold the Next.js site.
Or review and edit `_spec/SPEC.json` first.
```
