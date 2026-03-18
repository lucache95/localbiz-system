# Form Architecture for Generated Sites

All generated sites use a consistent, server-side form architecture. No third-party form services required by default.

---

## Stack

- **React Hook Form** — form state + validation UX
- **Zod** — schema validation (shared client + server)
- **Next.js API Routes** — server-side form processing
- **Resend** — email notifications
- **Honeypot** — spam protection (no CAPTCHA friction by default)

---

## Form Types

| ID | Purpose | Default Fields |
|---|---|---|
| `contact` | General contact | name, email, phone*, message |
| `quote` | Quote/estimate request | name, phone, email*, service (select), description |
| `callback` | Phone callback | name, phone, best time |
| `booking` | Appointment booking | name, phone, email, service, preferred date/time |
| `financing` | Financing inquiry | name, phone, email, service, estimate amount |

*asterisk = optional

---

## File Structure

```
src/
├── app/api/
│   ├── contact/route.ts       ← POST: validate, spam check, email
│   └── quote/route.ts         ← POST: validate, spam check, email
├── components/forms/
│   ├── ContactForm.tsx         ← RHF form, calls /api/contact
│   ├── QuoteForm.tsx           ← RHF form, calls /api/quote
│   ├── FormField.tsx           ← Reusable input wrapper
│   └── SubmitButton.tsx        ← Loading-aware button
└── lib/
    └── forms.ts                ← Zod schemas, email templates
```

---

## Zod Schemas (`lib/forms.ts`)

```typescript
import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Please enter at least 10 characters'),
  // honeypot
  website: z.string().max(0, 'Bot detected').optional(),
})

export const quoteSchema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  email: z.string().email().optional().or(z.literal('')),
  service: z.string().min(1, 'Please select a service'),
  description: z.string().optional(),
  // honeypot
  website: z.string().max(0, 'Bot detected').optional(),
})

export type ContactFormData = z.infer<typeof contactSchema>
export type QuoteFormData = z.infer<typeof quoteSchema>
```

---

## API Route Pattern (`api/quote/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { quoteSchema } from '@/lib/forms'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 1. Validate
    const result = quoteSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const data = result.data

    // 2. Check honeypot
    if (data.website) {
      // Silently succeed to not reveal spam detection
      return NextResponse.json({ success: true })
    }

    // 3. Send notification email
    await resend.emails.send({
      from: 'Website Lead <leads@yourdomain.com>',
      to: process.env.NOTIFY_EMAIL!,
      replyTo: data.email || undefined,
      subject: `New Quote Request — ${data.service}`,
      html: buildQuoteEmailHtml(data),
    })

    // 4. Optional: send confirmation to client
    if (data.email) {
      await resend.emails.send({
        from: 'Business Name <noreply@yourdomain.com>',
        to: data.email,
        subject: 'We received your quote request',
        html: buildConfirmationEmailHtml(data),
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Quote form error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please call us directly.' },
      { status: 500 }
    )
  }
}

function buildQuoteEmailHtml(data: QuoteFormData): string {
  return `
    <h2>New Quote Request</h2>
    <p><strong>Name:</strong> ${data.name}</p>
    <p><strong>Phone:</strong> ${data.phone}</p>
    <p><strong>Email:</strong> ${data.email || 'Not provided'}</p>
    <p><strong>Service:</strong> ${data.service}</p>
    <p><strong>Details:</strong> ${data.description || 'Not provided'}</p>
    <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Source:</strong> ${process.env.NEXT_PUBLIC_SITE_URL}/contact</p>
  `
}

function buildConfirmationEmailHtml(data: QuoteFormData): string {
  return `
    <p>Hi ${data.name},</p>
    <p>We received your request for <strong>${data.service}</strong> and we'll follow up shortly.</p>
    <p>If you need immediate assistance, call us at <strong>[PHONE]</strong>.</p>
  `
}
```

---

## Form Component Pattern (`components/forms/QuoteForm.tsx`)

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { quoteSchema, QuoteFormData } from '@/lib/forms'
import FormField from './FormField'
import SubmitButton from './SubmitButton'
import { site } from '@/lib/content'

export default function QuoteForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const config = site.forms.quote

  const { register, handleSubmit, formState: { errors } } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema)
  })

  const onSubmit = async (data: QuoteFormData) => {
    setStatus('loading')
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <p className="text-green-800 font-medium">{config.successMessage}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Honeypot — hidden from humans, visible to bots */}
      <input
        type="text"
        {...register('website')}
        style={{ display: 'none' }}
        tabIndex={-1}
        autoComplete="off"
      />

      {config.fields.map(field => (
        <FormField
          key={field.name}
          field={field}
          register={register}
          error={errors[field.name as keyof QuoteFormData]}
        />
      ))}

      {status === 'error' && (
        <p className="text-red-600 text-sm">
          Something went wrong. Please call us directly.
        </p>
      )}

      <SubmitButton
        label={config.submitLabel}
        loading={status === 'loading'}
      />
    </form>
  )
}
```

---

## Environment Variables

```bash
# Required
RESEND_API_KEY=re_xxxx
NOTIFY_EMAIL=client@businessdomain.com
NEXT_PUBLIC_SITE_URL=https://businessdomain.com

# Optional
NEXT_PUBLIC_GA_ID=G-XXXX
```

---

## Spam Protection Strategy

Default: **honeypot field only** — no CAPTCHA friction.

The honeypot field is named `website` (a common autofill trap). It's:
- Added to the form with `display: none`
- Excluded from the Zod schema validation check
- Server-side: if populated, silently returns success (don't reveal detection)

Upgrade to Cloudflare Turnstile if spam becomes a problem:
1. Add Turnstile widget to form
2. Add server-side token verification before Resend call
3. No CAPTCHA puzzles for legitimate users

---

## Form Field Config → HTML Mapping

| `type` in config | HTML element |
|---|---|
| `text` | `<input type="text">` |
| `email` | `<input type="email">` |
| `tel` | `<input type="tel">` |
| `textarea` | `<textarea>` |
| `select` | `<select>` with `<option>` per item |
| `checkbox` | `<input type="checkbox">` |

All fields use the same `FormField.tsx` wrapper which handles label, input, and error message rendering.
