# LocalBiz Workflows

End-to-end process documentation for all production scenarios.

---

## Workflow 1: New Site — Form + Folder Only (No Existing Site)

**When:** Client submitted the intake form and optionally dropped files. No website yet.

```
Step 1: Create project folder
  mkdir -p [PROJECTS_DIR]/[client-name]/_intake/assets
  cd [PROJECTS_DIR]/[client-name]

Step 2: Add client inputs
  - Copy form submission → _intake/form.json
    (or paste raw form data and run /localbiz:parse-form)
  - Drop any files into _intake/assets/
    (logos, photos, PDFs, docs, etc.)

Step 3: Run intake
  /localbiz:intake
  → Produces _context/CONTEXT.json
  → Produces _context/QUESTIONS.md

Step 4: Review CONTEXT.json and QUESTIONS.md
  - If critical fields are missing, answer them first
  - Update _intake/form.json with answers and re-run intake
    OR manually patch _context/CONTEXT.json and proceed

Step 5: Generate spec
  /localbiz:generate-spec
  → Produces _spec/SPEC.json

Step 6: Review SPEC.json
  - Check [PLACEHOLDER] values — fill what you can
  - Review page structure, section order, copy drafts
  - Verify brand colors, tone, CTA strategy

Step 7: Build site
  /localbiz:build-site
  → Scaffolds site/ with full Next.js app
  → Initializes git in project root
  → Commits initial build

Step 8: Local preview
  cd site && cp .env.example .env.local
  # Add RESEND_API_KEY and NOTIFY_EMAIL
  npm run dev

Step 9: Review and iterate
  - Use /localbiz:revise for any changes
  - Or edit site/src/content/site.json directly

Step 10: Deploy
  vercel --cwd site
```

**Typical time:** 60–120 minutes end-to-end for a complete quality build.

---

## Workflow 2: New Site — Form + Folder + Existing Website

**When:** Client has an existing website that should inform (or replace) the new build.

```
Step 1-2: Same as Workflow 1 (project folder + inputs)

Step 3: Analyze existing site FIRST
  /localbiz:analyze-site [existing-site-url]
  → Produces _context/EXISTING_SITE.json

  Review the recommendation:
  - "rebuild" → start fresh, migrate testimonials/copy only
  - "rewrite" → same structure, rewrite content
  - "hybrid" → identify pages to keep vs. rebuild
  - "preserve" → extend/improve, don't replace

Step 4: Run intake (includes existing site context)
  /localbiz:intake
  → CONTEXT.json will include existing site analysis
  → Will flag salvageable vs. weak content
  → Will note contradictions (e.g., form says 5 service areas, site shows 12)

Step 5-10: Same as Workflow 1
  Note: generate-spec will reference EXISTING_SITE.json
  and incorporate salvageable content into the spec
```

**Extra consideration:** When `recommendation: "hybrid"`, review the SPEC.json page list carefully. The spec will note which pages are new vs. migrated.

---

## Workflow 3: Revision to an Existing Built Site

**When:** Site is already built and live. Client wants changes.

```
Step 1: Navigate to the project
  cd [PROJECTS_DIR]/[client-name]

Step 2: Run revise with the request
  /localbiz:revise "[exact change request from client]"

  Examples:
  - /localbiz:revise "Update our phone number to (972) 555-1234"
  - /localbiz:revise "Add a testimonial from John S. who said we saved his basement"
  - /localbiz:revise "Make the homepage feel more premium"
  - /localbiz:revise "Add plumber Garland TX to our SEO targets"

Step 3: Safe changes apply automatically
  - Phone/email updates → committed immediately
  - New testimonials → committed immediately
  - Text edits → committed immediately

Step 4: Vague/structural changes trigger qualification questions
  - Answer the questions in the chat
  - Review the generated revision plan
  - Approve or adjust
  - Apply

Step 5: Preview and deploy
  npm run dev (verify locally)
  vercel --cwd site (deploy)
```

---

## Workflow 4: Ambiguous Request Requiring Follow-Up

**When:** Client request is vague, contradictory, or incomplete.

**Example request:** "Make it look more premium and improve conversions"

```
/localbiz:revise "Make it look more premium and improve conversions"
```

The revise command classifies this as `conversion` + `rebrand` (ambiguous) and asks:

```
Before making this change, I need to clarify:

1. Which page is the priority? (Homepage / Services / Contact / All)
2. What does "more premium" mean to you?
   - A: Darker, bolder colors
   - B: More whitespace, cleaner layout
   - C: Better photography / remove stock images
   - D: Different fonts/typography
3. What's underperforming on conversions right now?
   - A: Not enough form submissions
   - B: Not enough phone calls
   - C: High bounce rate on a specific page
4. Do you have reference examples of sites you consider "premium"?
```

User answers → revise generates a scoped revision plan → review → apply.

---

## Workflow 5: Contradictory Client Inputs

**When:** The form says one thing, the existing website says another, and uploaded docs say a third.

**Example:** Form says "We serve Dallas only." Website lists 12 cities. A flyer says "DFW-wide service."

```
/localbiz:intake
```

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
    "contradictions": [
      {
        "field": "serviceAreas",
        "valueA": "Dallas only",
        "sourceA": "form",
        "valueB": "Plano, Frisco, Allen, McKinney, Richardson, Garland, Dallas, Irving, Arlington, Grand Prairie, Mesquite, Carrollton",
        "sourceB": "existing-site",
        "resolution": null
      }
    ]
  }
}
```

QUESTIONS.md includes:
```markdown
## Contradictions to Resolve
- **Service areas**: Your form says "Dallas only" but your current website lists 12 cities
  and a flyer says "DFW-wide." Which is accurate for the new site?
  Please list every city/area you actually serve.
```

User resolves → update `_intake/form.json` → re-run intake → proceed.

If user wants to proceed without resolving: intake uses the `form` value with `confidence: medium` and marks it in the spec as needing verification.

---

## Project Folder Convention

All client projects live under:
```
[PROJECTS_DIR]/[client-id]/
```

Where `[client-id]` is kebab-case from the business name:
- "Priority Plumbing Solutions" → `priority-plumbing-solutions`
- "Green Thumb Landscaping" → `green-thumb-landscaping`

Git is initialized in `[client-id]/` (the project root, not just `site/`).

Recommended GitHub remote naming: `[client-id]-website`

---

## GSD Integration

For larger site builds, you can use GSD to track phases:

```
cd [PROJECTS_DIR]/[client-id]
/gsd:new-project
```

Suggested phase structure for a full build:
```
Phase 1: intake + spec (localbiz:intake → localbiz:generate-spec)
Phase 2: site scaffold (localbiz:build-site)
Phase 3: content polish (review + revise spec/copy)
Phase 4: SEO review (meta, schema, sitemap)
Phase 5: QA + deploy
```

For quick builds, skip GSD and run the localbiz commands directly.

---

## Environment Setup (one-time)

The generated sites use Resend for form email notifications.

1. Create a Resend account at resend.com
2. Add your API key to `~/.zshrc`:
   ```
   export RESEND_API_KEY=re_xxxx
   ```
3. Each client site's `.env.local` gets:
   ```
   RESEND_API_KEY=[shared or client-specific key]
   NOTIFY_EMAIL=[client's email]
   NEXT_PUBLIC_SITE_URL=https://[client-domain].com
   ```
