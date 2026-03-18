# LocalBiz Website Production System

A reusable system for generating high-quality local business websites from messy, incomplete client context. Works with Claude Code + GSD.

## Commands

| Command | Purpose |
|---|---|
| `/localbiz:intake` | Ingest all client context → produce `_context/CONTEXT.json` |
| `/localbiz:generate-spec` | Convert context → canonical `_spec/SPEC.json` |
| `/localbiz:build-site` | Build Next.js site from SPEC.json |
| `/localbiz:revise` | Route and apply client change requests |
| `/localbiz:analyze-site` | Analyze an existing website URL |
| `/localbiz:parse-form` | Normalize a raw intake form submission |

## Typical Flow

```
_intake/           →  /localbiz:intake  →  _context/CONTEXT.json
_context/          →  /localbiz:generate-spec  →  _spec/SPEC.json
_spec/             →  /localbiz:build-site  →  site/
site/ + request    →  /localbiz:revise  →  updated site/
```

## Client Project Structure

```
projects/ClientName/
├── _intake/          ← raw client inputs (form.json, assets/, notes)
├── _context/
│   ├── CONTEXT.json  ← normalized context (output of intake)
│   ├── EXISTING_SITE.json  ← existing site analysis (if applicable)
│   └── QUESTIONS.md  ← outstanding questions
├── _spec/
│   └── SPEC.json     ← canonical site spec (drives generation)
└── site/             ← generated Next.js site
```

## Intake Folder Convention

```
_intake/
├── form.json         ← structured intake form submission (optional)
├── notes.txt         ← freeform notes (optional)
└── assets/
    ├── logo.png
    ├── services.pdf
    ├── photos/
    ├── testimonials.txt
    └── pricing.docx
```

## Key Files

- `schemas/types.ts` — all TypeScript types for context + spec
- `templates/CONTEXT.template.json` — blank context scaffold
- `templates/SPEC.template.json` — blank spec scaffold
- `templates/intake-form.json` — intake form schema for your website
- `business-type-profiles.json` — default page/section patterns by business type
- `examples/` — example filled context + spec files
- `starter/STRUCTURE.md` — Next.js starter repo design
- `WORKFLOWS.md` — end-to-end workflow documentation

## Starter Repo

The generated site is built from `localbiz-starter`, a Next.js 14 app with:
- App Router + TypeScript + Tailwind
- JSON-driven content layer (`content/site.json`)
- Reusable section components for local business patterns
- Server-side form handling with email notifications
- LocalBusiness schema.org + SEO setup baked in

Set `LOCALBIZ_STARTER_REPO` in your environment to point to the starter repo.
Default: `https://github.com/YOUR_ORG/localbiz-starter`

## Principles

1. Speed to launch — sensible defaults, minimal decisions
2. Repeatability — deterministic process, JSON-driven
3. Quality consistency — opinionated starter, strong defaults
4. Easy revision — spec-driven, structured change requests
5. Minimal complexity — flat data, clear schemas, obvious file locations
