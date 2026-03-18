You are running `/localbiz:revise` — the revision router for a local business website.

**Your goal:** Accept a client change request, classify it, determine if it's safe to apply directly, ask qualifying questions if needed, and apply the change to both `_spec/SPEC.json` and the generated site.

## Arguments
$ARGUMENTS — the change request. Can be quoted text from the client, or a description of what needs to change.

---

## STEP 1: Load current state

Read `_spec/SPEC.json`. This is the source of truth for the site.

Check that `site/` exists. If not, tell the user to run `/localbiz:build-site` first.

---

## STEP 2: Classify the request

Analyze `$ARGUMENTS` and classify it into one of these categories:

### SAFE — apply directly, no questions needed:
| Category | Examples |
|---|---|
| `content-swap` | Update phone number, change email, edit hours, fix typo, update address |
| `asset-swap` | Replace logo, swap a photo, update favicon |
| `text-edit` | Change headline copy, update service description, edit CTA label |
| `add-item` | Add a testimonial, add a FAQ, add a service to the list, add a service area |
| `remove-item` | Remove a testimonial, remove an offer, remove a service area |

### NEEDS QUALIFICATION — ask questions before applying:
| Category | Examples |
|---|---|
| `section-edit` | "Make the hero section better", "improve the about page" |
| `section-add` | "Add a financing section", "add a gallery" |
| `page-add` | "Add a blog", "add a service area page for Austin" |
| `structural` | "Change the layout", "move things around", "redesign the homepage" |
| `seo-expansion` | "Add more city pages", "improve SEO", "rank in more areas" |
| `rebrand` | "Change the colors", "make it look more premium", "different vibe" |
| `conversion` | "Make it convert better", "improve the CTA", "get more leads" |
| `ambiguous` | Anything vague, contradictory, or unclear |

---

## STEP 3A: If SAFE — apply directly

For safe changes:

1. Identify exactly what needs to change in `_spec/SPEC.json`
2. Make the change in the spec
3. Make the corresponding change in the site files
4. Commit with a clear message

Be specific about what you changed and where.

For a phone number change:
- Update `identity.phone` in SPEC.json
- Update `content/site.json`
- Grep for the old phone number in all `.tsx` files and update any hardcoded instances
- Update schema in `lib/schema.ts` if hardcoded

For adding a testimonial:
- Add to `trustSignals.testimonials` array in SPEC.json
- Add to `content/site.json`
- The component reads from content, so no code changes needed

After applying:
```
git add -A
git commit -m "content: [short description of change]"
```

Report: "Done. Changed [X] in [files]. Committed."

---

## STEP 3B: If NEEDS QUALIFICATION — ask first

Do NOT guess. Ask the minimum questions needed to proceed.

Format your questions like this:

```
Before making this change, I need to clarify a few things:

1. **[Question 1]** — [why it matters]
   - Option A: [...]
   - Option B: [...]

2. **[Question 2]** — [why it matters]

3. **[Question 3]** — [why it matters]
```

### Qualifying question banks by category:

**`section-edit` (vague section improvement):**
- Which specific aspect: copy, layout, visual design, or conversion?
- What's the goal: more trust, more leads, better aesthetics, clearer messaging?
- Are there examples of what you want it to look like?

**`rebrand` (color/style change):**
- What colors should we use? (Provide hex codes or describe them)
- Should we keep the current logo?
- Is this a full rebrand or just a color/font update?
- Are there example websites with the look you want?

**`conversion` (improve conversions):**
- Which page is underperforming?
- What's the main action you want visitors to take?
- Do you want more quote forms submitted, more calls, or both?
- What do you think is blocking conversions now?

**`seo-expansion` (more cities/rankings):**
- Which specific cities/areas do you want to rank in?
- Do you currently serve those areas or are you expanding?
- Do you want new pages per city or just mention them on existing pages?

**`structural` (layout changes):**
- What's wrong with the current layout?
- Are you looking for a different section order, or a completely different design?
- What specific pages are affected?

**`ambiguous`:**
- Can you describe what you want to be different in one sentence?
- Is this about content (text/images), design (look/feel), or functionality?
- Is there a specific page or section?

---

## STEP 4: After qualification — generate a revision plan

Once you have enough information, generate a `RevisionPlan`:

```markdown
## Revision Plan

**Request:** [original request]
**Category:** [classified category]
**Scope:** small / medium / large
**Risk:** low / medium / high

### Changes:
1. [Specific change 1 — file: X, field: Y, from: A, to: B]
2. [Specific change 2 — ...]

### Files affected:
- _spec/SPEC.json
- site/src/content/site.json
- site/src/app/[page].tsx (if applicable)
- site/src/components/[Component].tsx (if applicable)

### Estimated git commits: [1-3]
```

Ask: "Does this plan look right? Type yes to apply, or tell me what to adjust."

---

## STEP 5: Apply approved changes

Apply each change in order:
1. Update SPEC.json
2. Update content/site.json
3. Update any .tsx files
4. Run a quick sanity check (no syntax errors, no missing imports)

Commit:
```bash
git add -A
git commit -m "feat: [category] — [short description]"
```

---

## STEP 6: Report

```
## Revision Applied — [Business Name]

**Change:** [description]
**Files modified:** [list]
**Committed:** [commit hash short]

**Preview:** Run `npm run dev` in `site/` to verify the change.
```
