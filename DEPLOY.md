# Deploy — exact values

**Target:** Cloudflare **Workers** (not Pages — OpenNext deploys to Workers)
**Repo:** `github.com/ACELL2026/acellacadem`
**Domain:** `acellacademy.dpdns.org`

---

## 1. Upload to GitHub

Web interface → **Add file → Upload files** → drag the unzipped folder in → Commit.

Upload the **contents** of `acellacademy/`, not the folder itself.
`package.json` must sit at the repository root, not inside a subfolder.

Sanity check after upload — the repo root should show:

```
app/  components/  content/  lib/  scripts/  styles/
.env.example  .gitignore  DEPLOY.md  README.md
middleware.ts  next.config.ts  open-next.config.ts
package.json  tsconfig.json  wrangler.jsonc
```

If you see `acellacademy/` as a single folder at the root, the nesting is
wrong — the build will fail with "package.json not found".

---

## 2. Connect Workers to Git

Cloudflare dashboard → **Compute (Workers)** → **Create** →
**Import a repository** → authorise GitHub → select `acellacadem`.

**This is the Workers product, not Pages.** If the UI is offering you a
"Pages project", back out and start from Workers.

### Build configuration

| Field | Value |
|---|---|
| Project name | `acellacademy` |
| Production branch | `main` |
| Build command | `npx @opennextjs/cloudflare build` |
| Deploy command | `npx wrangler deploy` |
| Version command | *(leave empty)* |
| Root directory | `/` |
| Build variable | `NODE_VERSION` = `20` |

Leave **build output directory** empty if the field appears —
`wrangler.jsonc` supplies it.

---

## 3. Compatibility flags and date

`wrangler.jsonc` already sets both, so there is normally nothing to do:

```jsonc
"compatibility_date": "2025-03-25",
"compatibility_flags": ["nodejs_compat"]
```

If the dashboard shows its own compatibility settings, make them match.
`nodejs_compat` must be on for **Production and Preview**. The date must
be **2024-09-23 or later** — that is the floor for OpenNext, and the
value above clears it comfortably.

---

## 4. wrangler.jsonc — already in the package

Included and correct. Do not hand-edit unless the worker name clashes
with something already in your account:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "acellacademy",
  "main": ".open-next/worker.js",
  "compatibility_date": "2025-03-25",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },
  "observability": { "enabled": true }
}
```

`main` and `assets.directory` are the two that matter. `.open-next` is
the adapter's output root; `worker.js` and `assets/` are created inside
it during the build.

---

## 5. Environment variables

**The first deploy needs none.** Add these only when you reach Phase 9:

| Variable | Environment | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Production | `https://acellacademy.dpdns.org` |
| `NEXT_PUBLIC_SHOW_REVIEW_BANNERS` | **Preview only** | `true` — shows placeholder warnings to you, never to the public |
| `WEBAUTHN_RP_ID` | Production | Phase 9 |
| `WEBAUTHN_ORIGIN` | Production | Phase 9 |
| `NEXT_PUBLIC_SUPABASE_URL` | Both | Phase 9 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Both | Phase 9 |
| `SUPABASE_SERVICE_ROLE_KEY` | Production | **Secret.** Never `NEXT_PUBLIC_` |
| `RESEND_API_KEY` | Production | Secret |
| `BREVO_API_KEY` | Production | Secret |

Anything prefixed `NEXT_PUBLIC_` is compiled into the browser bundle.
Service-role keys and API keys must never carry that prefix.

---

## 6. Custom domain

Workers → `acellacademy` → **Settings → Domains & Routes → Add → Custom
domain** → `acellacademy.dpdns.org`.

The zone is already in this Cloudflare account, so the record is created
automatically and the certificate issues within a few minutes.

Consider adding `www.acellacademy.dpdns.org` too and redirecting it, so
someone typing `www.` does not hit an error.

---

## 7. Verify

```
https://acellacademy.dpdns.org            → 307 redirect to /en
https://acellacademy.dpdns.org/en         → English, LTR
https://acellacademy.dpdns.org/ar         → Arabic, RTL, Amiri font
https://acellacademy.dpdns.org/api/health → {"status":"ok",...}
https://acellacademy.dpdns.org/en/courses/beyond-words-mastery-b2-c1
```

On the course page, the badge should briefly read **"Checking…"** and
then become **"Announced"**. That transition is the static shell handing
off to `/api/status` — if you see it, the volatile-hydration architecture
is working end to end.

Also worth a look: toggle the theme, switch to Arabic and confirm the
whole layout mirrors, and check the refund terms render at the bottom of
the course page.

---

## 8. UptimeRobot

Monitor **`https://acellacademy.dpdns.org/api/health`** — not the homepage.

Public pages are static assets served from Cloudflare's edge and never
touch Postgres. A monitor on `/` would report 100% uptime while Supabase
paused underneath it after 7 days of inactivity. `/api/health` runs a
real query once Supabase is wired, so it keeps the project awake.

5-minute interval is fine.

---

## If the build fails

Send me:

1. The **last 200 lines** of the build log
2. Which step failed — `npm install`, `next build`, the OpenNext adapter,
   or `wrangler deploy`
3. The build settings as shown at failure time

### Two likely candidates

**`nodejs_compat` missing** → errors mentioning `node:` imports or
`AsyncLocalStorage`. Fix in dashboard compatibility flags.

**Adapter invocation changed** → `npx @opennextjs/cloudflare build` fails
with "command not found" or an unknown-argument error. The package also
exposes a `opennextjs-cloudflare` bin, so try:

```
npx opennextjs-cloudflare build
```

Both invocations were valid at my knowledge cutoff. If neither works, the
CLI has moved on and the current Cloudflare Next.js framework guide will
have the replacement — send it and I will adjust `package.json`.

---

## What you are deploying

The **public site foundation**, verified by two gates but **not built
locally** — I have no network access for `npm install`, so Cloudflare's
build is the first real one.

**Working:** 10 public pages in English and Arabic, RTL mirroring, theme
toggle, static generation, volatile status hydration, announcement
embargo, refund terms, contact form with mailto fallback, health endpoint.

**Not yet built:** Supabase wiring, admin panel, cart, checkout, accounts,
newsletter backend, `/api/enquiry`. All Phase 9+.

The contact form posts to `/api/enquiry`, which does not exist yet — it
shows its error state and falls back to the mailto link beneath it, so
nobody is stranded.
