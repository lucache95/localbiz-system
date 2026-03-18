You are running `/localbiz:parse-form` — the intake form parser/normalizer.

**Your goal:** Accept raw intake form data (from any format) and normalize it into a structured `_intake/form.json` ready for `/localbiz:intake`.

This command is useful when form data arrives in a format other than structured JSON: email, paste, CSV row, Notion export, Typeform export, webhook payload, etc.

## Arguments
$ARGUMENTS — either:
- A path to the raw form file to parse
- Quoted raw text to parse directly

---

## STEP 1: Identify the input format

Inspect the input and classify it as:
- `json-structured` — already valid JSON with recognizable fields
- `json-unstructured` — JSON but with non-standard field names (webhook payload, Typeform, Jotform, etc.)
- `csv` — comma-separated row(s)
- `email` — email body or forwarded submission
- `freeform-text` — paste of plain text notes from a client or intake call
- `html-email` — HTML email body

---

## STEP 2: Extract all available fields

From the raw input, extract every recognizable piece of information and map it to the `IntakeForm` schema from `~/.claude/localbiz/schemas/types.ts`.

Mapping rules:
- "business name" / "company name" / "company" → `businessName`
- "type of business" / "industry" / "what do you do" → `businessType`
- "phone" / "cell" / "mobile" / "number" → `phone`
- "email" / "email address" → `email`
- "address" / "location" / "street" → `address`
- "city" / "located in" / "based in" → `city`
- "service area" / "areas you serve" / "coverage" → `serviceAreas`
- "services" / "what services" / "what do you offer" → `primaryServices`
- "colors" / "brand colors" / "color preferences" → `colorPreferences`
- "style" / "how should it feel" / "design style" → `stylePreferences`
- "tone" / "voice" / "how should it sound" → `tonePreferences`
- "examples" / "sites you like" / "reference sites" → `exampleSites`
- "competitors" / "competition" / "competing businesses" → `competitors`
- "current website" / "existing website" / "website URL" → `existingSiteUrl`
- "what you like about current site" / "keep" → `existingSiteLikes`
- "what you dislike about current site" / "change" → `existingSiteDislikes`
- "years in business" / "how long" / "founded" → `yearsInBusiness`
- "certifications" / "licenses" / "credentials" → `certifications`
- "insurance" → `insurance`
- "reviews" / "review count" / "Google rating" → `reviewCount` / `averageRating`
- "testimonials" / "customer quotes" → `testimonials`
- "social media" / "Facebook" / "Instagram" → `facebook` / `instagram`
- "selling points" / "what makes you different" / "USP" / "why choose you" → `uniqueSellingPoints`
- "customer concerns" / "objections" / "hesitations" → `customerObjections`
- "must have" / "important features" / "require" → `mustHaveFeatures`
- "pages needed" / "required pages" → `mustHavePages`
- "goals" / "purpose" / "what do you want the site to do" → `primaryGoal`
- "timeline" / "launch date" / "urgency" → `urgency` + `targetLaunchDate`
- "notes" / "anything else" / "additional" → `additionalNotes`

**Preserve original language:** For freeform fields, keep the client's exact wording — don't paraphrase.

---

## STEP 3: Handle common webhook/form tool payloads

If the input looks like a Typeform, Jotform, Gravity Forms, or similar export:
- Map the question text to the closest `IntakeForm` field
- For unrecognized questions, put the answer in `additionalNotes` with the original question as a prefix

---

## STEP 4: Flag what's missing

After extraction, check which `IntakeForm` fields are `null` or missing. Flag:
- Critical: `businessName`, `businessType`, `phone` or `email`, `serviceAreas`
- Important: `primaryServices`, `city`, `stylePreferences`
- Optional: everything else

---

## STEP 5: Write output

If `_intake/` directory doesn't exist, create it.

Write the normalized form to `_intake/form.json`.

Then report:

```
## Form Parsed

**Input format detected:** [format]
**Fields extracted:** [N] / [total fields in schema]

**Populated:**
- businessName: [value]
- businessType: [value]
- phone: [value]
- serviceAreas: [value]
- primaryServices: [value]
[...other populated fields...]

**Missing (critical):**
- [list]

**Missing (important):**
- [list]

Written to: _intake/form.json

Run `/localbiz:intake` to process this form with any additional files in _intake/assets/.
```
