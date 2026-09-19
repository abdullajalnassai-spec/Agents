# Meridian — private AI digital product company (Abdulla Alnassai)

Owner-only company OS: **Develop → Distribute → Deliver → Scale**

## One-click deploy on Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/abdullajalnassai-spec/Agents/tree/cursor/meridian-company-website-10e0)

1. Click the button (sign in with GitHub if asked)
2. Click **Apply**
3. Wait for deploy → open your `*.onrender.com` URL
4. Go to `/owner` and sign in

**Owner login after Render deploy**

- Email: `abdulla.j.alnassai@gmail.com`
- Password: `MeridianOwner2026!`

## Local run

```bash
cd website
npm install
npm run build
OWNER_PASSWORD='MeridianOwner2026!' npm start
```

Open `/owner` → Studio → Forge.

## What operates

| Area | Route |
|------|--------|
| Owner login | `/owner` |
| Studio pipeline | `/studio` |
| AI product forge | `/studio/forge` |
| Ops admin | `/admin` |

Public checkout is closed. Only the owner can forge products.
