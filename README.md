# LocalBiz Website Production System

A reusable system for generating high-quality local business websites from messy client input. Built for Claude Code + GSD.

## Setup

```bash
git clone https://github.com/YOUR_ORG/localbiz-system.git ~/clawd/localbiz-system
cd ~/clawd/localbiz-system
chmod +x install.sh
./install.sh
```

## Quick Start

```bash
# Drop client files folder → builds site
/localbiz:intake ~/Downloads/client-files/
/localbiz:generate-spec
/localbiz:build-site
```

See [QUICKSTART.md](QUICKSTART.md) for the full workflow.

## Commands

| Command | Purpose |
|---|---|
| `/localbiz:intake [path]` | Ingest client context from any folder → CONTEXT.json |
| `/localbiz:parse-form [text/path]` | Normalize raw form data → intake/form.json |
| `/localbiz:analyze-site [url]` | Analyze existing website → EXISTING_SITE.json |
| `/localbiz:generate-spec` | Convert context → canonical SPEC.json |
| `/localbiz:build-site` | Scaffold Next.js site from spec, prompt for API keys |
| `/localbiz:revise "[request]"` | Route and apply client change requests |

## Repository Structure

```
localbiz-system/
├── commands/                  ← Claude Code command files (symlinked to ~/.claude/commands/localbiz)
│   ├── intake.md
│   ├── parse-form.md
│   ├── analyze-site.md
│   ├── generate-spec.md
│   ├── build-site.md
│   └── revise.md
├── resources/                 ← Schemas, templates, examples (symlinked to ~/.claude/localbiz)
│   ├── schemas/
│   │   └── types.ts           ← All TypeScript type definitions
│   ├── templates/
│   │   └── intake-form.json   ← Intake form field schema
│   ├── examples/
│   │   └── plumber-intake-form.json
│   ├── starter/
│   │   ├── STRUCTURE.md       ← Next.js starter repo design
│   │   └── form-architecture.md
│   ├── business-type-profiles.json
│   ├── WORKFLOWS.md           ← End-to-end workflow docs
│   └── README.md
├── QUICKSTART.md
├── install.sh
└── README.md
```

## Client Projects

Every client project lives at:
```
~/clawd/projects/jaron-websites/[client-id]/
├── _intake/       ← raw client files
├── _context/      ← normalized context (CONTEXT.json, QUESTIONS.md)
├── _spec/         ← site spec (SPEC.json)
└── site/          ← generated Next.js site
```

Each project is its own git repo.

## Stack

Generated sites use: Next.js 14 (App Router) · TypeScript · Tailwind CSS · Resend (forms) · React Hook Form · Zod · Vercel (deploy)

Optional: Supabase (lead storage), Cloudflare (DNS/CDN/Turnstile), Cal.com (booking)
