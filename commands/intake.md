You are running `/localbiz:intake` — the context ingestion command for a local business website project.

**Your goal:** Ingest all available client context and produce `_context/CONTEXT.json` and `_context/QUESTIONS.md`.

## Arguments
$ARGUMENTS — one of:
- A path to any folder of client files (e.g., `~/Downloads/acme-plumbing/` or a Google Drive download folder)
- A path to an existing client project folder (e.g., `[PROJECTS_DIR]/acme-plumbing`)
- Empty — run from within an existing client project folder

---

## STEP 1: Resolve folders and set up project structure

**Case A — $ARGUMENTS is a raw client files folder (not already a jaron-websites project):**
- This is the "drop folder" case. The user pointed at their Downloads or a Google Drive export.
- Scan for a form file (`form.json`, `*.json`) or any document to detect the business name.
- Derive `[client-id]` from the business name as kebab-case (e.g., "Acme Plumbing" → `acme-plumbing`).
- Create the project at `[PROJECTS_DIR]/[client-id]/`.
- Create the folder structure: `_intake/`, `_intake/assets/`, `_context/`, `_spec/`.
- Copy files from the source folder into the project:
  - Files named `form.json`, `submission.json`, or `form.txt` → `_intake/form.json`
  - All `.jpg`, `.png`, `.svg`, `.webp`, `.heic`, `.gif` → `_intake/assets/`
  - All `.pdf`, `.docx`, `.txt`, `.md`, `.csv`, `.xlsx` → `_intake/assets/`
  - All `.mp4`, `.mov` → `_intake/assets/`
  - Everything else → `_intake/assets/`
- Initialize git in the project root and make an initial commit of `_intake/`.
- Report: "Created project at `[PROJECTS_DIR]/[client-id]/`. Copied N files."

**Case B — $ARGUMENTS is an existing client project folder:**
- Use that as the project root. Look for `_intake/` inside it.

**Case C — $ARGUMENTS is empty:**
- Check if the current directory is a client project (has `_intake/` or `_context/`).
- If yes, use it.
- If no, ask: "Where are your client files? Provide a path (e.g., ~/Downloads/client-folder) or drop the files in a `_intake/` folder in the current directory."

---

## STEP 2: Inventory all inputs

List and classify every file in `_intake/`:
- `form` — JSON or structured form data
- `notes` — freeform text from the client
- `logo` — logo files (`.svg`, `.ai`, `.eps`, or `.png`/`.jpg` with "logo" in name)
- `photo` — website photos
- `video` — video assets
- `doc` — text documents
- `pdf` — PDFs (brochures, price lists, service menus)
- `spreadsheet` — data files
- `branding` — brand guides, color palettes
- `other` — anything else

---

## STEP 2: Classify every file

For each file found, classify it as:
- `form` — JSON or structured form data (`form.json`, `submission.json`, etc.)
- `notes` — freeform text from the client (`notes.txt`, `brief.txt`, etc.)
- `logo` — logo files (`.svg`, `.png`, `.ai`, `.eps`, `.pdf` with "logo" in name)
- `photo` — photos for the website (`.jpg`, `.png`, `.webp`, `.heic`, etc.)
- `video` — video assets (`.mp4`, `.mov`, etc.)
- `doc` — documents (`.docx`, `.txt`, `.md` that aren't notes)
- `pdf` — PDFs (brochures, service menus, price sheets, etc.)
- `spreadsheet` — data files (`.csv`, `.xlsx`)
- `testimonial` — testimonial files or docs
- `pricing` — pricing-related files
- `branding` — brand guides, color palettes, style guides
- `other` — anything else

---

## STEP 3: Parse the intake form (if present)

If a `form.json` file exists, read it and extract every field. Use the intake form schema from `~/.claude/localbiz/schemas/types.ts` (the `IntakeForm` interface) as a reference.

Map each field. For empty/missing fields, note `null`.

For freeform text fields like `stylePreferences`, `additionalNotes`, etc., preserve the raw text verbatim — don't summarize it yet.

---

## STEP 4: Read all documents

For each `.txt`, `.md`, `.docx` (read as plain text), or `.pdf` file in the intake folder:
- Read the content
- Extract any of: services, service areas, testimonials, FAQs, pricing, contact info, brand info, copy
- Record the source filename for each extracted piece

If a document has conflicting info vs. the form, note both and flag it as a contradiction.

---

## STEP 5: Inventory all assets

List every image, logo, and video file. For each:
- Record filename
- Classify type (logo, photo, video)
- Note whether it's likely approved for web use (assume yes unless the filename suggests "draft", "internal", "private", etc.)

Do NOT read binary files. Just catalog them.

---

## STEP 6: Analyze existing website (if URL present)

If `existingSiteUrl` was found in the form data and is non-empty:

1. Fetch the URL
2. Read the main pages (home, services, about, contact — follow nav links if possible)
3. Extract: page list, services mentioned, service areas, CTAs, phone, email, address, testimonials, FAQs
4. Evaluate the site quality on a 1–5 scale for: design, mobile, conversion, SEO
5. Identify what content is salvageable
6. Identify what's weak or missing
7. Note the overall recommendation: "rebuild" | "rewrite" | "hybrid" | "preserve"

Write these findings to `_context/EXISTING_SITE.json`. Use the `ExistingSiteAnalysis` schema from `~/.claude/localbiz/schemas/types.ts`.

---

## STEP 7: Build CONTEXT.json

Now synthesize everything into `_context/CONTEXT.json`.

Use the `ClientContext` schema from `~/.claude/localbiz/schemas/types.ts`.

Key rules:
- Every value must have `source` ("form" | "file" | "existing-site" | "inferred") and `confidence` ("high" | "medium" | "low")
- "high" = explicitly stated by client
- "medium" = inferred or partially stated
- "low" = guessed from context, should be verified
- When sources conflict, record both and add a contradiction entry
- For business type, normalize to lowercase (e.g., "Plumber" → "plumber")
- For service areas, parse freeform into an array of city/area names
- For services, split freeform lists into individual service entries with slugs
- Infer `category` from business type using `~/.claude/localbiz/business-type-profiles.json` — `businessTypeMap`

For `issues.missing`, use these severities:
- `critical`: phone number, business name, primary service, primary city — missing = can't launch
- `important`: email, logo, service descriptions, service areas, Google review info
- `optional`: social links, certifications, before/after photos, financing info

For `issues.readyToGenerateSpec`: set to `true` only if no critical fields are missing.

---

## STEP 8: Build QUESTIONS.md

Write `_context/QUESTIONS.md` with any questions needed to fill missing or contradictory fields.

Format:
```markdown
# Outstanding Questions — [Business Name]
Generated: [date]

## Critical (blocking launch)
- [ ] What is your primary phone number?

## Important (needed for full quality)
- [ ] Can you share your logo file?
- [ ] What cities/areas do you serve?

## Optional (nice to have)
- [ ] Do you have before/after photos we can use?
```

Only include questions when the answer is genuinely unknown. If you can infer it confidently (confidence: high/medium), don't ask.

For contradictions, add a section:
```markdown
## Contradictions to Resolve
- **Service areas**: Form says "Dallas only" but existing website lists 12 cities. Which is current?
```

---

## STEP 9: Report to user

Output a summary:

```
## Intake Complete — [Business Name]

**Sources processed:**
- Form: yes/no
- Asset files: N files (list types)
- Existing site: yes/no [URL]

**Context confidence:** high / medium / low

**Services found:** [list]
**Service areas found:** [list]
**Assets found:** N logos, N photos, N videos, N docs

**Critical missing:**
- [list any critical missing fields]

**Contradictions:**
- [list any contradictions]

**Ready to generate spec:** yes / no

**Next step:**
- [If ready]: Run `/localbiz:generate-spec` to create the site spec
- [If not ready]: Answer the questions in `_context/QUESTIONS.md` first, then re-run intake or proceed carefully
```
