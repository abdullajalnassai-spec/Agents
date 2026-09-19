# Meridian — company website

A full company website inspired by the structure of monetise.com-style digital product funnels.

**Original brand:** Meridian (not affiliated with monetise.com).

## What’s included

- Marketing home (hero, proof, offers, bonuses, guarantee, FAQ, testimonials)
- Platform, Pricing, About, Journal, Careers
- Working **waitlist** + **contact** forms (saved in browser localStorage)
- Member **login** + **dashboard** with product draft studio
- Privacy & Terms

## Run locally

```bash
cd website
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Production build

```bash
cd website
npm run build
npm run preview
```

## How to make it “fully live”

1. Point a domain at your host (Vercel, Netlify, Cloudflare Pages).
2. Replace localStorage with a real backend / CRM (waitlist + contact).
3. Connect Stripe (or Whop) for checkout on Pricing.
4. Wire member login to Auth (Clerk, Supabase, Auth.js).
5. Swap demo email/WhatsApp in `src/data/content.ts`.
