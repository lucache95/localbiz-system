You are running `/localbiz:analyze-site` — the existing website analyzer.

**Your goal:** Analyze an existing business website and produce a structured `_context/EXISTING_SITE.json` assessment.

## Arguments
$ARGUMENTS — the website URL to analyze. Required.

---

## STEP 1: Validate input

If no URL is provided, ask: "What is the URL of the existing website to analyze?"

---

## STEP 2: Fetch and crawl

Fetch the homepage. Then identify and fetch:
- Main navigation links (up to 10 pages)
- Service/product pages
- About page
- Contact page
- Any FAQ or testimonials page

For each page fetched, extract:
- Page title
- H1 and H2 headings
- Main body copy (first 500 words)
- All CTAs (button text + href)
- Phone numbers
- Email addresses
- Physical address
- Any form(s) present

---

## STEP 3: Extract business content

From all pages combined, extract:
- **Services mentioned** (list each service name found)
- **Service areas mentioned** (list cities/regions)
- **Testimonials** (quote text + author name if present)
- **FAQs** (question + answer pairs)
- **Business name**
- **Phone number(s)**
- **Email address(es)**
- **Physical address**
- **Trust signals** (licenses, certifications, awards, badges, guarantees mentioned)
- **Years in business** (if mentioned)
- **Review count / rating** (if shown on site, e.g. "4.9 stars, 127 reviews")

---

## STEP 4: Evaluate quality

Score each dimension 1–5:

**Design (1=terrible, 5=premium):**
- 5: Modern, well-structured, premium typography, consistent brand
- 4: Clean and professional but slightly dated
- 3: Functional but basic / template-ish
- 2: Cluttered, inconsistent, or amateurish
- 1: Broken, unreadable, or extremely outdated

**Mobile (1=broken, 5=excellent):**
- Check viewport meta, responsive layout, text size, tap targets

**Conversion (1=no CTAs, 5=optimized):**
- Check CTA presence, above-fold offer clarity, form accessibility, click-to-call

**SEO (1=no basics, 5=strong):**
- Check title tags, meta descriptions, H1 structure, local signals, schema presence

Write notes for each score explaining the rating.

---

## STEP 5: Identify salvageable content

List content that is worth preserving / migrating:
- Well-written service descriptions (quote them)
- Good testimonials
- Useful FAQs
- Process/how-it-works copy
- Strong trust signals / credential mentions

List content that should be rewritten:
- Thin or generic copy
- Outdated information
- Keyword-stuffed or awkward text
- Anything factually unclear

---

## STEP 6: Identify issues

**Critical issues** (would prevent ranking or converting):
- No mobile optimization
- No clear CTA above the fold
- No contact info visible
- Broken pages or forms
- Missing SSL
- Missing title tags

**Important issues:**
- No review/testimonial section
- No FAQ
- Services not individually listed
- No local schema markup
- Very slow loading

**Minor issues:**
- Outdated design
- Stock photos only
- No social proof
- Generic copy

---

## STEP 7: Recommendation

Based on scores and issues, recommend one of:
- `rebuild` — start fresh with the starter; migrate only key copy/testimonials
- `rewrite` — keep structure but rewrite most content
- `hybrid` — keep some pages, rebuild others
- `preserve` — site is decent, focus on additions/improvements only

Write 2–4 sentences explaining the recommendation.

---

## STEP 8: Write output

Write `_context/EXISTING_SITE.json` using the `ExistingSiteAnalysis` schema from `~/.claude/localbiz/schemas/types.ts`.

Then report:

```
## Existing Site Analysis — [URL]

**Pages analyzed:** [N]
**Design:** [score]/5
**Mobile:** [score]/5
**Conversion:** [score]/5
**SEO:** [score]/5

**Services found:** [list]
**Service areas found:** [list]
**Testimonials found:** [N]
**FAQs found:** [N]

**Salvageable content:** [summary]

**Key issues:**
- [critical issues]

**Recommendation:** [rebuild / rewrite / hybrid / preserve]
[reason]

Output written to: _context/EXISTING_SITE.json
```
