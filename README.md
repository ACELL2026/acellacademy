# ACELL Academy

Bilingual (EN/AR) site for Yosuef Mohamed Abdusalam — books, courses,
articles and consultancy.

**Domain:** https://acellacademy.dpdns.org
**Stack:** Next.js 15 · OpenNext · Cloudflare Workers · Supabase (Phase 9)

Deploy instructions: **[DEPLOY.md](./DEPLOY.md)**

---

## What this repository currently is

**The public site foundation.** It builds, deploys, and serves every
public page in both languages with **zero environment variables**.

**It is not yet a storefront.** These are not built:

| Missing | Phase |
|---|---|
| Supabase wiring (client, queries, RLS enforcement) | 9 |
| Admin panel UI | 9 |
| Cart, checkout, orders | 9 |
| User accounts and login | 9 |
| `/api/enquiry` route | 9 |
| Newsletter backend | 10 |

The contact form posts to `/api/enquiry`, which does not exist yet — it
shows its error state and falls back to the mailto link beneath it, so
nobody is stranded.

Deploy this first to prove the pipeline end to end: GitHub → Workers →
custom domain → HTTPS. Then add moving parts against something known to
work, rather than debugging four new things at once.

---

## Editing content

All copy lives in **`content/seed.ts`**.

```ts
{
  slug: 'english-tenses-and-senses',
  title: 'English Tenses and Senses: From Form to Thought',
  description: 'Your words here.',
  copyState: 'needs_review',   // ← change to 'authored' when edited
}
```

`copyState` takes exactly two values: `'needs_review'` or `'authored'`.

Anything still `needs_review` renders a warning banner when
`NEXT_PUBLIC_SHOW_REVIEW_BANNERS=true`. Set that on **Preview only**, so
you see it and the public never does.

Course copy is already `'authored'` — it is yours, used as written.
Everything else is placeholder in your register and marked accordingly.

### Currently placeholder

| Item | Note |
|---|---|
| Book descriptions (4) | the flagship one is your own framing paraphrased back at you |
| Service descriptions (5) | describe a category, not your practice — no PCELT, no teaching since 2003, no MA research |
| About page | cannot be ghostwritten — deliberately near-empty |

Also unconfirmed: book price seeded at **45.000 LYD**, course at
**450.000 LYD**, and the levels assigned to the three Studio books.

---

## Verification

```bash
npm run verify          # both gates
npm run a11y:contrast   # 23 WCAG AA pairs
npm run i18n:check      # every key resolves in both locales
```

`npm run build` runs both first, so a contrast regression or a missing
translation **blocks the build** rather than shipping.

### What the gates catch

**Contrast** — the palette has two mirrored failures. Copper `#C9A96E` is
1.97:1 on cream; teal `#3D6B6B` is 2.92:1 on navy. Each mode therefore
uses a different functional value, and both originals survive as
`--decor-*` for ornament only. The gate also asserts the decorative
tokens still *fail* — if one starts passing, someone has quietly
repurposed it as a functional colour.

**i18n** — every `dict.x.y` reference must resolve in *both* locales,
`en.json` and `ar.json` must have identical key sets, and no value may be
empty. Dynamic key spaces (`policy.${kind}.${k}`, `status.${badge}`) are
enumerated explicitly rather than skipped, because a static scan cannot
resolve a template literal and skipping it would hide a whole class of
missing-translation bugs.

Current: **23/23** contrast pairs · **39 literal + 33 dynamic** keys ·
**94 keys** identical across both locales.

---

## Two architectural decisions worth knowing

### Static shell + volatile hydration

Phase 6 derived course status at read time so it could not go stale.
Phase 8 prerenders public pages to stay inside the Workers 10ms CPU
ceiling. **Together they cancel out** — a prerendered page bakes the
derived status into HTML at build time, so "never stale" becomes "always
stale": a full cohort still reads "Enrolment open".

So every page is split. Title, copy, units, price and refund policy
prerender; badge, seat signal, countdown and CTA hydrate from
`/api/status`. `assertPrerenderable()` fails the build if a volatile
field ever leaks into a static page.

If that fetch fails, the placeholder is **a link, never a transaction** —
a JavaScript failure must not invite someone to pay for a full cohort.

Countdowns tick against **server** time. A device two hours fast would
otherwise show 4h remaining on a 6h payment deadline.

### Announcements embargo

`publish_at <= now()` in an RLS policy is correct for a dynamic page and
completely inert in a prerender: `now()` freezes at build time, so a post
scheduled for next week is simply absent.

`prepareForStatic()` prerenders future items **with their publish instant
but without their body**, so the client reveals them on time and nothing
embargoed ever reaches the browser.

---

## Structure

```
app/[locale]/          10 public pages, EN + AR
app/api/health         keepalive — must hit the DB, not a static asset
app/api/status         volatile half of every page (~3ms CPU)
components/layout/     header, footer, theme, locale, skip link
components/public/     cards, CTAs, refund note, enquiry form, feed
content/seed.ts        ← all copy lives here
lib/i18n/              config, dictionaries, flattener
lib/money/             amount_minor + currency_exp (LYD exponent = 3)
lib/public/            volatile split, announcement embargo
scripts/               contrast + i18n gates
styles/tokens.css      ← never edit without running the contrast gate
```

---

## Notes for later

- **LYD has 3 decimal places**, not 2. All money is `amount_minor` +
  `currency_exp`. 20 LYD = `20_000`.
- **Passkeys bind to the domain.** Do not enrol until production is live
  on `acellacademy.dpdns.org`, and expect to re-enrol on the eventual
  `.com` migration — there is no migration path for WebAuthn credentials.
- **Auth cookies need the `__Host-` prefix** (Phase 9). The shared parent
  `dpdns.org` means a sibling subdomain could otherwise set a cookie your
  app reads — classic cookie tossing. `__Host-` closes it unconditionally.
- **Email reputation is domain-level.** Transactional (Resend) sits on the
  apex; marketing (Brevo) on `news.` — separate subdomains so a newsletter
  complaint spike cannot damage verification deliverability.
