# LocalBiz System — Quick Start

## The Simple Workflow

### You can be in ANY directory when running these commands. They work globally.

---

## Starting a new client project

### Option A: You have a folder of client files (most common)

Drop everything into a folder (Google Drive download, Downloads folder, wherever). Then:

```
/localbiz:intake ~/Downloads/acme-plumbing-files/
```

That's it. The command will:
- Detect the business name from the files
- Create `[PROJECTS_DIR]/acme-plumbing/` automatically
- Copy all files into `_intake/assets/`
- Initialize git in the project
- Run the full intake analysis
- Tell you what it found and what's missing

### Option B: You have a form submission (email, paste, webhook JSON)

Paste the raw form data directly into the command:

```
/localbiz:parse-form "Business Name: Acme Plumbing
Phone: 972-555-0100
Services: drain cleaning, water heaters, leak repair
City: Plano TX
Style: clean and professional, navy blue"
```

This normalizes it into `_intake/form.json`, then run `/localbiz:intake`.

### Option C: You already set up a project folder manually

```
cd ~/clawd/projects/jaron-websites/acme-plumbing
/localbiz:intake
```

---

## Full workflow (3 commands to a built site)

```bash
# 1. Ingest all client context
/localbiz:intake ~/Downloads/client-files/
# → Creates project, produces _context/CONTEXT.json

# 2. Generate the site spec
cd ~/clawd/projects/jaron-websites/[client-id]
/localbiz:generate-spec
# → Produces _spec/SPEC.json with all pages, copy, SEO, forms

# 3. Build the site
/localbiz:build-site
# → Scaffolds site/ Next.js app
# → Prompts for any API keys needed (Resend, Vercel, etc.)
# → Commits everything
```

---

## Revising an existing site

```bash
cd ~/clawd/projects/jaron-websites/[client-id]
/localbiz:revise "Update phone number to 972-555-1234"
/localbiz:revise "Add a testimonial from John S."
/localbiz:revise "Make the hero section more conversion-focused"
```

Safe changes apply immediately and commit. Vague requests ask questions first.

---

## Analyzing an existing website before building

```bash
/localbiz:analyze-site https://clientoldsite.com
# → Produces _context/EXISTING_SITE.json
# → Then run /localbiz:intake to include it in context
```

---

## What directory do I need to be in?

**For `/localbiz:intake [path]`** — anywhere. Pass the path.

**For `/localbiz:generate-spec` and `/localbiz:build-site`** — inside the client project:
```
cd ~/clawd/projects/jaron-websites/[client-id]
```

**For `/localbiz:revise`** — inside the client project.

---

## Where do client projects live?

Always: `[PROJECTS_DIR]/[client-id]/`

```
jaron-websites/
├── acme-plumbing/
│   ├── _intake/          ← raw client files
│   ├── _context/         ← normalized context (auto-generated)
│   ├── _spec/            ← site spec (auto-generated)
│   └── site/             ← Next.js site (auto-generated)
├── green-thumb-landscaping/
│   └── ...
```

Each project is its own git repo.

---

## Can I drop files right into the command?

Yes. Pass any folder path as the argument to `/localbiz:intake`:

```
/localbiz:intake ~/Downloads/client-dump/
/localbiz:intake "/Users/me/Google Drive/Clients/Acme Plumbing/"
/localbiz:intake ~/Desktop/mike-johnson-plumbing/
```

The command creates the project folder, copies the files, and runs intake automatically.

You do NOT need to create the project folder first.
You do NOT need to organize the files first.
Just point it at whatever folder the client sent you.
