/**
 * LocalBiz Website Production System — Canonical Type Definitions
 * All schemas live here. Commands, templates, and the starter reference these.
 */

// ─────────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────────

export type ConfidenceLevel = "high" | "medium" | "low";
export type SourceType = "form" | "file" | "existing-site" | "inferred" | "unknown";

/** A value with tracked provenance */
export interface Sourced<T> {
  value: T | null;
  source: SourceType;
  confidence: ConfidenceLevel;
  notes?: string; // e.g. "conflicts with existing site"
}

// ─────────────────────────────────────────────
// INTAKE FORM (what the client submits on your website)
// ─────────────────────────────────────────────

export interface IntakeForm {
  // Identity
  businessName: string;
  businessType: string; // freeform, e.g. "plumber", "roofer", "HVAC"
  tagline?: string;

  // Contact
  phone?: string;
  email?: string;
  address?: string; // freeform
  city?: string;
  state?: string;
  zip?: string;
  serviceAreas?: string; // freeform, e.g. "Dallas, Plano, Frisco"

  // Services
  primaryServices?: string; // freeform list
  secondaryServices?: string;
  priceRange?: string; // "$" | "$$" | "$$$" | or freeform
  offers?: string; // current promotions / offers

  // Social
  facebook?: string;
  instagram?: string;
  googleBusiness?: string;
  yelp?: string;
  linkedin?: string;

  // Trust
  yearsInBusiness?: number;
  reviewCount?: number;
  averageRating?: number;
  certifications?: string;
  insurance?: string;
  license?: string;
  awards?: string;

  // Style / brand
  colorPreferences?: string;
  colorDislikes?: string;
  tonePreferences?: string; // "professional" | "friendly" | "premium" | etc.
  stylePreferences?: string; // freeform
  fontPreferences?: string;

  // References
  exampleSites?: string; // URLs they like, comma-separated or freeform
  competitors?: string; // competitor URLs, freeform
  designDislikes?: string;

  // Existing site
  existingSiteUrl?: string;
  existingSiteLikes?: string;
  existingSiteDislikes?: string;

  // Goals / content
  uniqueSellingPoints?: string;
  customerObjections?: string;
  targetCustomer?: string;
  primaryGoal?: string; // "generate leads" | "show portfolio" | "book appointments"
  mustHavePages?: string; // freeform list
  mustHaveFeatures?: string;

  // Copy seeds
  heroHeadline?: string; // if client has a preferred headline
  testimonials?: string; // raw testimonial text
  faqsRaw?: string; // any FAQs they want
  processDescription?: string;

  // Meta
  urgency?: "asap" | "flexible" | "specific-date";
  targetLaunchDate?: string;
  additionalNotes?: string;
  submittedAt?: string;
}

// ─────────────────────────────────────────────
// CLIENT CONTEXT (normalized intermediate — output of /localbiz:intake)
// ─────────────────────────────────────────────

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  formatted?: string; // full formatted string
}

export interface ServiceEntry {
  name: string;
  slug: string;
  description?: string;
  source: SourceType;
  hasOwnPage?: boolean; // whether to generate a dedicated service page
}

export interface OfferEntry {
  title: string;
  description?: string;
  expiry?: string;
  source: SourceType;
}

export interface Testimonial {
  quote: string;
  author?: string;
  company?: string;
  rating?: number;
  source: SourceType;
}

export interface FAQ {
  q: string;
  a: string;
  source: SourceType;
}

export interface AssetRef {
  filename: string;
  type: "logo" | "photo" | "video" | "doc" | "pdf" | "other";
  description?: string;
  approved?: boolean; // approved for website use
}

export interface SiteRef {
  url: string;
  notes?: string; // why they like/dislike it
}

export interface MissingField {
  field: string;
  severity: "critical" | "important" | "optional";
  impact: string;
  question: string; // the actual question to ask
}

export interface Contradiction {
  field: string;
  valueA: string;
  sourceA: SourceType;
  valueB: string;
  sourceB: SourceType;
  resolution?: string; // if resolved, how
}

export interface ClientContext {
  meta: {
    clientId: string; // kebab-case slug from business name
    createdAt: string;
    sources: {
      hasForm: boolean;
      hasAssets: boolean;
      hasExistingSite: boolean;
      assetFiles: string[];
    };
    overallConfidence: ConfidenceLevel;
  };

  business: {
    name: Sourced<string>;
    type: Sourced<string>; // normalized: "plumber" | "roofer" | "hvac" | etc.
    category: Sourced<"trade-emergency" | "home-improvement" | "health-wellness" | "service">;
    niche: Sourced<string>; // more specific, e.g. "residential plumber"
    tagline: Sourced<string>;
    description: Sourced<string>; // 2-3 sentence business description
    yearsInBusiness: Sourced<number>;
    uniqueSellingPoints: Sourced<string[]>;
    customerObjections: Sourced<string[]>;
    targetCustomer: Sourced<string>;
  };

  contact: {
    phone: Sourced<string>;
    email: Sourced<string>;
    address: Sourced<Address>;
    serviceAreas: Sourced<string[]>;
    primaryCity: Sourced<string>;
  };

  social: {
    facebook: string | null;
    instagram: string | null;
    google: string | null;
    yelp: string | null;
    linkedin: string | null;
  };

  services: {
    primary: ServiceEntry[];
    secondary: ServiceEntry[];
    offers: OfferEntry[];
    priceRange: Sourced<string>;
  };

  brand: {
    colors: {
      preferred: string[];
      avoided: string[];
      styleNotes: string;
      source: SourceType;
    };
    tone: Sourced<string>;
    style: Sourced<string>;
    logo: {
      files: AssetRef[];
      hasLogo: boolean;
    };
  };

  trustSignals: {
    reviews: {
      google: { count: number | null; rating: number | null };
      yelp: { count: number | null; rating: number | null };
      source: SourceType;
    };
    testimonials: Testimonial[];
    certifications: string[];
    awards: string[];
    insurance: string | null;
    license: string | null;
    yearsInBusiness: number | null;
  };

  content: {
    faqs: FAQ[];
    processSteps: string[];
    existingCopy: { page: string; content: string; source: SourceType }[];
  };

  assets: {
    logos: AssetRef[];
    photos: AssetRef[];
    videos: AssetRef[];
    documents: AssetRef[];
    other: AssetRef[];
  };

  references: {
    exampleSites: SiteRef[];
    competitors: SiteRef[];
    styleNotes: string;
    designDislikes: string;
  };

  goals: {
    primaryGoal: string;
    mustHavePages: string[];
    mustHaveFeatures: string[];
    urgency: "asap" | "flexible" | "specific-date";
    targetLaunchDate: string | null;
  };

  existingSite: ExistingSiteAnalysis | null;

  issues: {
    missing: MissingField[];
    contradictions: Contradiction[];
    overallConfidence: ConfidenceLevel;
    readyToGenerateSpec: boolean; // true if no critical fields are missing
  };
}

// ─────────────────────────────────────────────
// EXISTING SITE ANALYSIS (output of /localbiz:analyze-site)
// ─────────────────────────────────────────────

export interface ExistingSiteAnalysis {
  url: string;
  analyzedAt: string;

  structure: {
    pages: { url: string; title: string; type: string }[];
    navLinks: string[];
    hasContactForm: boolean;
    hasBlog: boolean;
    hasServicePages: boolean;
  };

  content: {
    servicesFound: string[];
    serviceAreasFound: string[];
    testimonialsFound: string[];
    faqsFound: { q: string; a: string }[];
    ctasFound: string[];
    phone: string | null;
    email: string | null;
    address: string | null;
  };

  quality: {
    designScore: 1 | 2 | 3 | 4 | 5;
    mobileScore: 1 | 2 | 3 | 4 | 5;
    conversionScore: 1 | 2 | 3 | 4 | 5;
    seoScore: 1 | 2 | 3 | 4 | 5;
    overallScore: 1 | 2 | 3 | 4 | 5;
    designNotes: string;
    mobileNotes: string;
    conversionNotes: string;
    seoNotes: string;
  };

  salvageable: {
    content: string[]; // list of salvageable content pieces
    structure: string[]; // structural elements worth keeping
    seo: string[]; // SEO elements worth keeping
  };

  issues: {
    critical: string[];
    important: string[];
    minor: string[];
  };

  recommendation: "rebuild" | "rewrite" | "hybrid" | "preserve";
  recommendationReason: string;
}

// ─────────────────────────────────────────────
// SITE SPEC (canonical spec — output of /localbiz:generate-spec)
// ─────────────────────────────────────────────

export interface NavLink {
  label: string;
  href: string;
  children?: NavLink[]; // for dropdowns
}

export interface CTAConfig {
  label: string;
  href: string;
  style?: "primary" | "secondary" | "ghost";
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "checkbox";
  required: boolean;
  placeholder?: string;
  options?: string[]; // for select
}

export interface FormConfig {
  id: string;
  type: "contact" | "quote" | "callback" | "booking" | "financing" | "general";
  headline?: string;
  subheadline?: string;
  fields: FormFieldConfig[];
  submitLabel: string;
  successMessage: string;
  notifyEmail: string;
  webhookUrl?: string;
  spamProtection: "honeypot" | "recaptcha" | "turnstile" | "none";
}

// Section types — each maps to a component in the starter
export type SectionType =
  | "hero"
  | "trust-bar"
  | "services-grid"
  | "testimonials"
  | "how-it-works"
  | "faq"
  | "service-areas"
  | "about"
  | "cta-band"
  | "gallery"
  | "before-after"
  | "financing"
  | "contact-block"
  | "map-contact"
  | "custom";

export interface SectionConfig {
  type: SectionType;
  id?: string;
  headline?: string;
  subheadline?: string;
  content?: Record<string, unknown>; // section-specific config
  formId?: string; // for sections with forms
  visible: boolean;
}

export interface PageSpec {
  id: string;
  slug: string;
  title: string; // H1 / page display title
  metaTitle: string; // <title> tag — max 60 chars
  metaDescription: string; // <meta description> — max 160 chars
  sections: SectionConfig[];
  schema?: Record<string, unknown>; // JSON-LD schema.org for this page
  keywords?: string[]; // target keywords
  canonicalUrl?: string;
}

export interface ServiceSpec {
  id: string;
  name: string;
  slug: string;
  shortDescription: string; // 1-2 sentences
  fullDescription: string; // full page content
  features: string[];
  benefits: string[];
  faqs: FAQ[];
  image: string | null;
  hasOwnPage: boolean;
  page?: PageSpec; // if hasOwnPage, the full page spec
}

export interface SiteSpec {
  meta: {
    version: string;
    generatedAt: string;
    businessType: string;
    category: string;
    status: "draft" | "ready" | "published";
    clientId: string;
    migrationNeeded: boolean;
    migrationStrategy?: "rebuild" | "rewrite" | "hybrid";
    unresolvedQuestions: string[];
    contradictions: string[];
  };

  identity: {
    businessName: string;
    tagline: string;
    description: string; // 2-3 sentences
    phone: string;
    email: string;
    address: Address;
    serviceAreas: string[];
    primaryCity: string;
    priceRange: string; // "$" | "$$" | "$$$"
  };

  brand: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    fontHeading: string;
    fontBody: string;
    tone: string; // "professional and trustworthy" | "friendly and approachable" | etc.
    style: string; // "clean, modern, premium" | "bold, high-contrast" | etc.
    logoFile: string | null;
    hasLogo: boolean;
  };

  social: {
    facebook: string | null;
    instagram: string | null;
    google: string | null;
    yelp: string | null;
    linkedin: string | null;
  };

  nav: {
    links: NavLink[];
    ctaPrimary: CTAConfig;
    phone: string;
    showPhone: boolean;
  };

  pages: PageSpec[];

  services: ServiceSpec[];

  trustSignals: {
    googleRating: number | null;
    googleReviewCount: number | null;
    yearsInBusiness: number | null;
    certifications: string[];
    awards: string[];
    insurance: string | null;
    license: string | null;
    badges: string[]; // display badges like "Licensed & Insured", "Family Owned"
  };

  testimonials: Testimonial[];
  faqs: FAQ[];

  offers: OfferEntry[];

  forms: Record<string, FormConfig>; // keyed by form ID

  seo: {
    localBusiness: {
      "@type": string; // e.g. "Plumber", "Electrician", "HomeAndConstructionBusiness"
      name: string;
      telephone: string;
      email: string;
      address: {
        "@type": "PostalAddress";
        streetAddress: string;
        addressLocality: string;
        addressRegion: string;
        postalCode: string;
        addressCountry: "US";
      };
      geo: { "@type": "GeoCoordinates"; latitude: number | null; longitude: number | null };
      openingHoursSpecification?: unknown[];
      areaServed: string[];
      priceRange: string;
      url: string;
    };
    targetKeywords: { keyword: string; page: string; priority: "primary" | "secondary" }[];
    internalLinks: { from: string; to: string; anchorText: string }[];
    aiDiscoverabilityNotes: string[];
    gaps: string[];
  };

  footer: {
    tagline: string;
    showServiceLinks: boolean;
    showAreaLinks: boolean;
    showContact: boolean;
    privacyPolicyUrl: string;
    year: number;
  };
}

// ─────────────────────────────────────────────
// REVISION REQUEST
// ─────────────────────────────────────────────

export type RevisionCategory =
  | "content-swap"    // safe: update text, phone, hours, testimonial
  | "asset-swap"      // safe: replace image/logo
  | "section-edit"    // medium: change section content/copy
  | "section-add"     // medium: add new section to existing page
  | "page-add"        // larger: add new page
  | "structural"      // larger: change layout/order of sections
  | "seo-expansion"   // larger: add city pages, expand keywords
  | "rebrand"         // larger: color/font/style change
  | "conversion"      // vague: "improve conversions" — needs qualification
  | "ambiguous";      // unclear — needs qualification

export interface RevisionRequest {
  id: string;
  requestedAt: string;
  rawRequest: string; // exactly what the client said
  category: RevisionCategory;
  isSafe: boolean; // safe = can apply without qualification questions
  targetPage?: string;
  targetSection?: string;
  changes: {
    type: string;
    field?: string;
    currentValue?: string;
    newValue?: string;
    notes?: string;
  }[];
  qualifyingQuestions?: string[]; // questions to ask before proceeding
  estimatedScope: "small" | "medium" | "large";
  risk: "low" | "medium" | "high";
  plan?: string; // generated plan for the revision
}
