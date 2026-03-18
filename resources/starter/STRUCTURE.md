# LocalBiz Starter — Next.js Starter Repo Design

This documents the structure of the `localbiz-starter` Next.js template.
The `/localbiz:build-site` command scaffolds a site from this structure and populates it from SPEC.json.

**Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Resend + React Hook Form + Zod

---

## Repository Structure

```
localbiz-starter/
├── src/
│   ├── app/
│   │   ├── layout.tsx              ← Root layout: Header, Footer, schema injection
│   │   ├── page.tsx                ← Homepage: renders sections from site.json
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── services/
│   │   │   ├── page.tsx            ← Services overview
│   │   │   └── [slug]/
│   │   │       └── page.tsx        ← Individual service page (dynamic)
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   ├── service-areas/
│   │   │   └── page.tsx            ← Service areas overview (conditional)
│   │   ├── privacy/
│   │   │   └── page.tsx
│   │   ├── sitemap.ts              ← Dynamic sitemap
│   │   ├── robots.ts               ← robots.txt
│   │   └── api/
│   │       ├── contact/
│   │       │   └── route.ts        ← Contact form handler
│   │       └── quote/
│   │           └── route.ts        ← Quote form handler
│   │
│   ├── components/
│   │   ├── sections/               ← One file per section type
│   │   │   ├── Hero.tsx
│   │   │   ├── TrustBar.tsx
│   │   │   ├── ServicesGrid.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── ServiceAreas.tsx
│   │   │   ├── AboutSection.tsx
│   │   │   ├── CTABand.tsx
│   │   │   ├── Gallery.tsx
│   │   │   ├── BeforeAfter.tsx
│   │   │   ├── FinancingBlock.tsx
│   │   │   └── ContactBlock.tsx
│   │   │
│   │   ├── forms/
│   │   │   ├── ContactForm.tsx     ← General contact form
│   │   │   ├── QuoteForm.tsx       ← Quote request form
│   │   │   ├── FormField.tsx       ← Reusable field wrapper
│   │   │   └── SubmitButton.tsx    ← Loading-aware submit button
│   │   │
│   │   └── layout/
│   │       ├── Header.tsx          ← Desktop nav + mobile menu + CTA
│   │       ├── Footer.tsx          ← Links, contact, legal
│   │       ├── MobileMenu.tsx      ← Slide-out mobile nav
│   │       └── PhoneLink.tsx       ← click-to-call anchor
│   │
│   ├── lib/
│   │   ├── content.ts              ← Import and re-export site.json
│   │   ├── schema.ts               ← JSON-LD generators
│   │   ├── forms.ts                ← Zod schemas + form utilities
│   │   └── utils.ts                ← cn(), formatPhone(), slugify()
│   │
│   ├── types/
│   │   └── site.ts                 ← TypeScript types for site.json
│   │
│   └── content/
│       └── site.json               ← THE SINGLE SOURCE OF TRUTH for all content
│
├── public/
│   ├── images/
│   │   └── og-default.jpg          ← Default OG image
│   └── favicon.ico
│
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## The Content Layer: `content/site.json`

This is the most important concept. All site content lives in one JSON file.
The `/localbiz:build-site` command transforms SPEC.json into this format.

```json
{
  "identity": {
    "businessName": "Priority Plumbing Solutions",
    "tagline": "Trusted Plumbing. Same-Day Service. Plano's #1 Choice.",
    "description": "...",
    "phone": "(972) 555-0192",
    "phoneFormatted": "+19725550192",
    "email": "mike@priorityplumbing.com",
    "address": {
      "street": "1847 Commerce Dr",
      "city": "Plano",
      "state": "TX",
      "zip": "75023",
      "formatted": "1847 Commerce Dr, Plano, TX 75023"
    },
    "serviceAreas": ["Plano", "Frisco", "Allen", "McKinney", "Richardson"],
    "primaryCity": "Plano",
    "priceRange": "$$"
  },

  "brand": {
    "primaryColor": "#1a3a5c",
    "secondaryColor": "#f59e0b",
    "accentColor": "#e5e7eb",
    "fontHeading": "Inter",
    "fontBody": "Inter",
    "tone": "professional and trustworthy",
    "style": "clean, modern, premium",
    "logoFile": "/images/logo.svg",
    "hasLogo": true
  },

  "social": {
    "facebook": "https://facebook.com/priorityplumbingplano",
    "instagram": null,
    "google": "https://g.co/kgs/priorityplumbing",
    "yelp": null
  },

  "nav": {
    "links": [
      { "label": "Services", "href": "/services" },
      { "label": "About", "href": "/about" },
      { "label": "Service Areas", "href": "/service-areas" },
      { "label": "Contact", "href": "/contact" }
    ],
    "ctaPrimary": { "label": "Get Free Quote", "href": "/contact#quote" },
    "phone": "(972) 555-0192",
    "showPhone": true
  },

  "pages": {
    "home": {
      "metaTitle": "Plumber in Plano TX | Priority Plumbing Solutions",
      "metaDescription": "Same-day plumbing services in Plano, TX. 12 years experience, Master Licensed. Drain cleaning, water heaters, leak repair. Call (972) 555-0192 for free estimate.",
      "sections": ["hero", "trust-bar", "services-grid", "how-it-works", "testimonials", "service-areas", "faq", "cta-band", "contact-block"]
    },
    "services": {
      "metaTitle": "Plumbing Services in Plano TX | Priority Plumbing",
      "metaDescription": "Expert plumbing services in Plano, TX. Drain cleaning, water heaters, leak detection, pipe repair and more. Licensed Master Plumber.",
      "headline": "Our Plumbing Services",
      "subheadline": "From emergency repairs to full installations, we handle it all."
    },
    "about": {
      "metaTitle": "About Priority Plumbing Solutions — Plano, TX",
      "metaDescription": "12 years serving Plano and DFW. Master Licensed, fully insured. Meet the team behind Priority Plumbing Solutions.",
      "headline": "About Priority Plumbing",
      "content": "..."
    },
    "contact": {
      "metaTitle": "Contact Priority Plumbing | Get a Free Estimate",
      "metaDescription": "Call or request a quote online. Same-day service available. Serving Plano, Frisco, Allen, McKinney and surrounding areas.",
      "headline": "Get a Free Estimate"
    }
  },

  "sections": {
    "hero": {
      "headline": "Plano's Trusted Plumber — Same-Day Service, Honest Pricing",
      "subheadline": "12 Years. Master Licensed. 247 Five-Star Reviews.",
      "ctaPrimary": { "label": "Get Free Quote", "href": "/contact#quote" },
      "ctaSecondary": { "label": "Call (972) 555-0192", "href": "tel:+19725550192" },
      "backgroundImage": null
    },
    "trust-bar": {
      "items": [
        { "label": "Master Licensed & Insured", "icon": "shield" },
        { "label": "4.9 Stars — 247 Reviews", "icon": "star" },
        { "label": "Same-Day Emergency Service", "icon": "clock" },
        { "label": "Free Estimates", "icon": "tag" }
      ]
    },
    "how-it-works": {
      "headline": "How It Works",
      "steps": [
        { "number": "01", "title": "Call or Request Online", "description": "Call us or submit a quick form and we'll reach out within minutes." },
        { "number": "02", "title": "Same-Day Diagnosis", "description": "We show up, diagnose the issue, and give you a clear upfront price." },
        { "number": "03", "title": "Fixed Right the First Time", "description": "We do the work, clean up, and follow up to make sure you're satisfied." }
      ]
    },
    "service-areas": {
      "headline": "Serving the DFW Metroplex",
      "areas": ["Plano", "Frisco", "Allen", "McKinney", "Richardson", "Garland", "Dallas"]
    },
    "cta-band": {
      "headline": "Ready for Fast, Reliable Plumbing Service?",
      "subheadline": "No surprises. No runaround. Just great work.",
      "cta": { "label": "Get Free Quote", "href": "/contact#quote" }
    }
  },

  "services": [
    {
      "id": "drain-cleaning",
      "name": "Drain Cleaning",
      "slug": "drain-cleaning",
      "shortDescription": "Fast, effective drain cleaning for clogs of all sizes — kitchen, bathroom, main line.",
      "fullDescription": "...",
      "features": ["Video camera inspection available", "Hydro-jetting for severe clogs", "Safe for all pipe types", "Same-day service"],
      "faqs": [
        { "q": "How quickly can you clear a clog?", "a": "Most residential drain clogs are cleared in 1–2 hours." }
      ]
    }
  ],

  "trustSignals": {
    "googleRating": 4.9,
    "googleReviewCount": 247,
    "yearsInBusiness": 12,
    "certifications": ["TX Master Plumber #12345", "PHCC Member"],
    "awards": ["Angi Super Service Award 2023"],
    "insurance": "General Liability $1M",
    "license": "TX Master Plumber #12345",
    "badges": ["Licensed & Insured", "Master Plumber", "Family Owned", "Free Estimates"]
  },

  "testimonials": [
    {
      "quote": "Mike showed up in 2 hours when our water heater burst. Fixed it the same day. Incredible service.",
      "author": "Sarah T.",
      "location": "Plano",
      "rating": 5
    }
  ],

  "faqs": [
    { "q": "Do you offer same-day service?", "a": "Yes — we offer same-day service for emergencies and next-day for scheduled work." },
    { "q": "Are your estimates free?", "a": "Yes, we provide free estimates for most plumbing jobs." },
    { "q": "Are you licensed and insured?", "a": "Yes — we hold a Texas Master Plumber License and carry $1M general liability insurance." }
  ],

  "offers": [
    { "title": "$50 Off Any Repair", "description": "Mention our website when booking to receive $50 off any repair over $300." }
  ],

  "forms": {
    "quote": {
      "id": "quote",
      "type": "quote",
      "headline": "Get Your Free Estimate",
      "subheadline": "We'll call you back within 30 minutes during business hours.",
      "fields": [
        { "name": "name", "label": "Your Name", "type": "text", "required": true },
        { "name": "phone", "label": "Phone Number", "type": "tel", "required": true },
        { "name": "email", "label": "Email Address", "type": "email", "required": false },
        { "name": "service", "label": "Service Needed", "type": "select", "required": true, "options": ["Drain Cleaning", "Water Heater", "Leak Repair", "Emergency", "Other"] },
        { "name": "description", "label": "Describe the Issue", "type": "textarea", "required": false }
      ],
      "submitLabel": "Request Free Estimate",
      "successMessage": "Thanks! We'll call you back within 30 minutes.",
      "notifyEmail": "mike@priorityplumbing.com"
    },
    "contact": {
      "id": "contact",
      "type": "contact",
      "headline": "Send Us a Message",
      "fields": [
        { "name": "name", "label": "Your Name", "type": "text", "required": true },
        { "name": "email", "label": "Email Address", "type": "email", "required": true },
        { "name": "phone", "label": "Phone (optional)", "type": "tel", "required": false },
        { "name": "message", "label": "Message", "type": "textarea", "required": true }
      ],
      "submitLabel": "Send Message",
      "successMessage": "Message received! We'll get back to you soon.",
      "notifyEmail": "mike@priorityplumbing.com"
    }
  },

  "seo": {
    "localBusiness": {
      "@type": "Plumber",
      "name": "Priority Plumbing Solutions",
      "telephone": "+19725550192",
      "email": "mike@priorityplumbing.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "1847 Commerce Dr",
        "addressLocality": "Plano",
        "addressRegion": "TX",
        "postalCode": "75023",
        "addressCountry": "US"
      },
      "geo": { "@type": "GeoCoordinates", "latitude": null, "longitude": null },
      "areaServed": ["Plano TX", "Frisco TX", "Allen TX", "McKinney TX"],
      "priceRange": "$$",
      "url": "https://priorityplumbingplano.com"
    }
  },

  "footer": {
    "tagline": "Honest work. Fair prices. Same-day service.",
    "showServiceLinks": true,
    "showAreaLinks": true,
    "showContact": true,
    "year": 2026
  }
}
```

---

## Section → Component Mapping

| `site.json` section type | Component | Notes |
|---|---|---|
| `hero` | `Hero.tsx` | Full-width, above fold |
| `trust-bar` | `TrustBar.tsx` | 4 badges, icon + text |
| `services-grid` | `ServicesGrid.tsx` | 3-col responsive cards |
| `how-it-works` | `HowItWorks.tsx` | Numbered steps, 3 max |
| `testimonials` | `Testimonials.tsx` | Cards, star rating |
| `faq` | `FAQ.tsx` | Accordion + FAQPage schema |
| `service-areas` | `ServiceAreas.tsx` | Badge grid |
| `about` | `AboutSection.tsx` | Story + credentials |
| `cta-band` | `CTABand.tsx` | Full-width colored band |
| `gallery` | `Gallery.tsx` | Masonry / grid |
| `before-after` | `BeforeAfter.tsx` | Slider or side-by-side |
| `financing` | `FinancingBlock.tsx` | Promo info + form |
| `contact-block` | `ContactBlock.tsx` | Form + contact info |

---

## Key Design Principles

1. **No hardcoded copy** — everything comes from `content/site.json`
2. **Components are presentational** — they receive data as props, don't fetch it
3. **CSS variables for brand colors** — set in `layout.tsx` from `site.json`
4. **Forms use server actions or API routes** — no client-side API keys
5. **Every page has proper `generateMetadata()`** — from `site.json` pages config
6. **JSON-LD injected in layout** — LocalBusiness schema always present
7. **Mobile-first Tailwind** — all components start at mobile and scale up
