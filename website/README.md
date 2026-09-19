# Meridian — private AI digital product company (Abdulla Alnassai)

Owner-only company OS that runs the faceless digital-product procedure:

**Develop → Distribute → Deliver → Scale**

## Owner access

Only `abdulla.j.alnassai@gmail.com` can sign in.

```bash
cd website
npm install
npm run build
npm start
```

Open `/owner`, sign in, then use **Studio → Forge**.

Set a permanent password with:

```bash
OWNER_EMAIL=abdulla.j.alnassai@gmail.com
OWNER_PASSWORD='your-strong-password'
OWNER_NAME='Abdulla Alnassai'
```

On first boot without `OWNER_PASSWORD`, a one-time password is printed in the server logs and saved locally in `data/owner-credentials.json` (gitignored).

## Product forge procedure

1. Enter niche / topic + audience + product type
2. Meridian generates:
   - Niche research + opportunity score
   - Full product deliverable pack
   - Sales page + emails
   - Partner distribution leads + weekly plan
   - Launch checklist + export markdown
3. Save in pipeline → mark **Live** when storefront is ready

## Notion HQ

Private Notion drafts are created for company HQ + forge skill (see agent summary links).

## API highlights

- `POST /api/owner/login`
- `POST /api/forge/run` (owner token required)
- `GET /api/products` (owner token required)
- `GET /api/admin/summary` (owner token required)
- Public checkout is **closed**

## Deploy

```bash
docker build -t meridian .
docker run -p 8787:8787 \
  -e OWNER_EMAIL=abdulla.j.alnassai@gmail.com \
  -e OWNER_PASSWORD='...' \
  -e APP_URL=https://your-domain.com \
  meridian
```
