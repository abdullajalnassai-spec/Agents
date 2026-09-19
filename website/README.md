# Meridian — company website + operating API

Original digital-product company site (inspired by monetise.com-style funnels).  
Includes checkout, waitlist, contact, member hub, and an ops admin — backed by SQLite.

## Quick start (full stack)

```bash
cd website
npm install
npm run dev
```

- Site: http://127.0.0.1:5173  
- API: http://127.0.0.1:8787  

## Production (one process)

```bash
cd website
npm install
npm run build
npm start
```

Opens on http://127.0.0.1:8787 with the built site + API + SQLite database in `data/`.

## Stripe payments (optional)

1. Copy `.env.example` to `.env`
2. Add your Stripe **test** secret key:
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   APP_URL=https://your-domain.com
   ```
3. Restart the server

Without Stripe keys, checkout runs in **demo mode** (instant enrollment, no card).

## What operates out of the box

| Feature | Route |
|--------|--------|
| Marketing site | `/` |
| Waitlist (saved to DB) | `/waitlist` |
| Paid enrollment | `/checkout` |
| Member hub | `/dashboard` |
| Company ops admin | `/admin` |
| Contact inbox (DB) | `/contact` |

## Deploy

### Docker

```bash
cd website
docker build -t meridian .
docker run -p 8787:8787 -e APP_URL=https://your-domain.com meridian
```

### Railway / Render / Fly

- Root directory: `website`
- Build: `npm install && npm run build`
- Start: `npm start`
- Set `PORT` (platform usually provides it) and `APP_URL`
- Optional: `STRIPE_SECRET_KEY`

### GitHub Pages (marketing only)

Static frontend can be published from `website/dist`. Forms need the API host — use the Docker/Railway deploy for full operations.
