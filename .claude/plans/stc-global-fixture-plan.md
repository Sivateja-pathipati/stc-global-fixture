# RGT Global — Reference Localization Test Fixture

> **Status: implemented.** Deviations from this plan, all discovered while building, are
> recorded in [Implementation notes](#implementation-notes) at the end.

## Context

The localization-testing product is moving from **comparison-based** review (localized site vs. source site) to **standalone** review (judge one locale on its own evidence). That change invalidates most of the existing detection path, and there is currently nothing to develop or measure against — no target site, no known defects, no way to tell whether a detector run that finds 40 issues missed 200.

`stc-global-fixture` is that missing piece: a small, deliberately broken, **fully catalogued** website. Its only purpose is to be a measurable target.

The critical property is **ground truth**. A detector is only as good as its measured precision and recall, and neither can be computed without knowing the right answer in advance. So the fixture is built clean, then defects are applied from a machine-readable manifest — meaning the manifest and the site can never disagree, and a clean control build comes out of the same pipeline for free.

**Outcome:** two deployed URLs (clean + seeded), ~120 catalogued defects and traps across three locales, and a manifest the detector's CI can assert against — extra findings failing the build as hard as missing ones.

---

## Confirmed decisions

| Decision         | Choice                                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------------------- |
| Stack            | React 18 + Vite + TypeScript, **npm**, single standalone app                                             |
| Structure        | Mirrors `rgt-testai-FE/apps/localization-testing` `src/` taxonomy, minus all monorepo/MFE wiring         |
| Hosting          | **Vercel** static — SPA rewrites + per-route response headers via `vercel.json`. No Docker.              |
| Locales          | `en-US`, `hi-IN`, `de-DE` (4th, incl. RTL, must be cheap to add)                                         |
| Locale mechanism | Path prefix primary, `?lang=` override, cookie persistence, `Accept-Language` fallback                   |
| Head content     | **Prerendered per-route HTML shells** stamped post-build; React hydrates on top                          |
| Builds           | **Two** — `build:clean` and `build:seeded`, two Vercel deployments                                       |
| Defect scope     | All three locales carry defects, **plus traps that must not be flagged**                                 |
| Translations     | Machine-translated, then hand-corrected                                                                  |
| i18n             | i18next + react-i18next (introduced fresh — the FE repo has no i18n; strings live in `constants/labels`) |

---

## The ten pages

Each chosen to carry a distinct check category rather than repeat a surface.

| #   | Route         | Primary surfaces                                                                     |
| --- | ------------- | ------------------------------------------------------------------------------------ |
| 1   | `/`           | Nav, footer, breadcrumbs, hero — chrome that repeats on every page                   |
| 2   | `/about`      | Long prose: expansion, terminology consistency, third-language leakage               |
| 3   | `/services`   | Card grid, short button labels — overflow and truncation under German expansion      |
| 4   | `/pricing`    | **Currency, numbers, percentages, grouping** — main CLDR target                      |
| 5   | `/events`     | **Dates, times, 12h/24h, month and weekday names** — second CLDR target              |
| 6   | `/contact`    | Form: phone, postal code, address, country dropdown, validation errors, placeholders |
| 7   | `/blog`       | List, pagination, tag collation, **empty state** via `?tag=none`                     |
| 8   | `/blog/:slug` | Rich text, `alt` text, **text baked into an image**                                  |
| 9   | `/login`      | Auth entry, validation errors, locale-survives-login boundary                        |
| 10  | `/account`    | Members-only behind fake client-side auth; locale-formatted profile data             |

Plus non-nav routes carrying defects: `/404`, `/500`, and the locale switcher itself.

---

## Defect catalogue

~30 defects + ~10 traps per locale, ~120 manifest entries total.

**Broken plumbing** (zero-false-positive tier) — raw resource key rendered literally (`nav.services.label`), unresolved `{{userName}}`, raw ICU `{count, plural, one {…}}`, `undefined`/`NaN` in a price, `[missing translation]`, leftover `%s`, orphan punctuation from a bad join.

**Language presence** — an English block inside de-DE `/about`; one untranslated nav string appearing on all ten pages (deliberately, to test root-cause grouping — must surface as _one_ finding, not ten); a French sentence inside hi-IN; mixed-language within a single component.

**Encoding and script** — `Ã¼` mojibake in de-DE, U+FFFD in hi-IN, stripped diacritics (`Munchen`), Latin letters spliced mid-word into Devanagari, an embedded control character.

**Locale data formats** — `MM/DD/YYYY` on de-DE; `1,234.56` instead of `1.234,56`; `$1,234` where `1.234,00 €` belongs (wrong currency _and_ position); hi-IN missing lakh/crore grouping (`100,000` not `1,00,000`); `3:00 PM` instead of `15:00`; US-format phone on the German contact page; US state dropdown on a German address form; postal validation rejecting a valid PLZ; English month names on the Hindi calendar.

**Metadata, SEO, accessibility** — `<html lang="en">` on a de-DE page; non-reciprocal `hreflang`; untranslated `<title>`; missing `meta description` on hi-IN; untranslated OG tags; English `alt` text; untranslated `aria-label` on the nav toggle; wrong `Content-Language` header; one page declaring `ISO-8859-1` (paired with the mojibake, so the root cause is discoverable).

**Layout and geometry** — German nav item clipped by `overflow: hidden`; a button wrapping to three lines _only at 375px_; a table header blowing out column width; Hindi truncated by a fixed-width card; horizontal scrollbar on de-DE `/pricing` at 1280px.

**Reachability** (highest-value group) — `/de-DE/events` silently serves English; the switcher shows "Deutsch" active while serving en-US; locale resets to en-US after login; `?lang=de` with a `hi` cookie resolves to the wrong one; a deep link to `/hi-IN/pricing` in a fresh session redirects away.

**Interaction states** — English validation message on a de-DE form; untranslated empty state; untranslated 404 in hi-IN; untranslated success toast; untranslated `placeholder` attribute (chosen deliberately because text-node extraction cannot see it).

### Traps — the precision half

Must **not** be flagged. Without these you get recall numbers only.

- Brand and product names identical across locales — "RGT Global", "CloudBridge"
- Accepted German loanwords — "OK", "Email", "Login", "Team"
- Cognates identical to English and correct — "Radio", "Hotel", "Manager"
- Version string `1.000` that must not be read as a number needing separators
- SKU `12/05/2024` that is not a date
- A testimonial legitimately in English, correctly marked `lang="en"`
- A correct international phone number `+49 30 901820`
- Latin numerals in hi-IN where that is the convention
- Legal entity name "RGT Global Technologies Pvt. Ltd." intentionally untranslated

---

## Determinism (hard requirement)

A fixture whose output drifts between builds cannot support build-over-build diffing or byte-identical snapshot assertions.

- **Every displayed number, currency, date and time is a literal string in `content/data/*.json`, per locale.** This is the single most important decision here. `Intl.NumberFormat('de-DE', {style:'currency'})` varies across ICU versions in whether the space before `€` is U+0020 or U+00A0, and `Intl.DateTimeFormat` long forms change wording between ICU releases. Ground truth that records exact strings cannot tolerate that. So `pricing.pro.price` is the literal `"1.249,00 €"`, and a currency defect is seeded by swapping that literal to `"$1,249.00"`. Runtime `Intl` survives in exactly one instrumented helper, whose output is asserted at build time so ICU drift breaks loudly instead of silently.
- **No live clock.** `BUILD_NOW` in `constants/time.ts` is a hand-pinned ISO literal — never generated, or the point is lost.
- **No randomness.** No `Math.random()`, no `crypto.randomUUID()`.
- **No external network at runtime.** Self-hosted fonts (preloaded, so `font-display: swap` can't produce timing-variable FOUT), no CDN, no analytics.
- **No runtime config knob.** Drop the FE's `public/env.js` pattern — a runtime-editable value on the deployed site is exactly the manifest/reality drift this design exists to prevent. Replace it with a static `dist/__fixture.json` the detector harness can `GET` to confirm which build it hit.
- **Pinned exact versions** (zero `^`/`~`), committed `package-lock.json`, `npm ci` everywhere, `.nvmrc` pinning Node — and the Vercel project set to match, since Vercel silently upgrades default Node versions.
- **No content hashes in asset filenames.** Cache busting is irrelevant here and stable names make a two-build diff readable.
- **Explicit sort order** everywhere — manifest by id, locale enumeration, hreflang sets, head tag order, and recursive key sorting on every JSON write.

Enforced by `no-restricted-syntax` ESLint rules banning `new Date()`, `Date.now()`, `Math.random()` and `new Intl.*` outside two exempted helpers, and by `verify-determinism` building twice under `TZ=UTC LC_ALL=C` and comparing a sha256 tree.

---

## Conventions inherited from `rgt-testai-FE`

Verified against the real source, not the README. Carry these over exactly:

| Area            | Convention                                                                                                                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Components      | **Default export**, `export default function Name()`, one per file, filename matches                                                                                                                                                 |
| Everything else | **Named exports only** — services, utils, hooks, mappers, constants                                                                                                                                                                  |
| Props           | Destructured in the signature, typed by an `interface` imported from `@/types/<domain>` — not inline                                                                                                                                 |
| `src/types/`    | All `.d.ts`, flat, **no barrel**; `interface` for shapes, `type` for unions; `import type` always                                                                                                                                    |
| `src/services/` | `<domain>.service.ts`, one-expression arrow functions, never catch errors (hooks do that)                                                                                                                                            |
| `src/hooks/`    | Flat `useXxx.ts`, return a **named object** never a tuple, `AbortController` on every fetch effect                                                                                                                                   |
| `src/contexts/` | **Two-file split** — `XContext.ts` (createContext + accessor hook, no JSX) and `XProvider.tsx`                                                                                                                                       |
| `src/mappers/`  | `<domain>.mapper.ts`, pure, `??` default on every field                                                                                                                                                                              |
| `src/pages/`    | PascalCase folder, entry file `<Folder>Page.tsx`, colocated components flat, sub-flows in a PascalCase subfolder, **relative imports inside the folder**, `@/` outside                                                               |
| `src/router/`   | Single `routes.tsx`, react-router-dom **6.14.1** JSX `<Routes>/<Route>` style, no lazy loading                                                                                                                                       |
| Route paths     | **Never literals** — always from `constants/routes.ts` `APP_ROUTES`                                                                                                                                                                  |
| Styling         | Tailwind **v4** via `@tailwindcss/postcss`; `src/index.css` is the only stylesheet; app-prefixed CSS custom properties (`--rgt-*`) consumed as `bg-[var(--rgt-border)]`; state-dependent class sets hoisted to `constants/colors.ts` |
| Formatting      | Root `.prettierrc` verbatim + `.gitattributes` `* text=auto eol=lf` (load-bearing on Windows)                                                                                                                                        |
| Lint            | ESLint 9 flat config, `eslint-config-prettier` last, `consistent-type-imports`, `max-lines` warn 350                                                                                                                                 |
| Comments        | Explain **why and what was rejected**, not what the code does                                                                                                                                                                        |

**One deliberate divergence.** The FE has _no i18n at all_ — every user-facing string is a hardcoded `as const` object under `constants/labels/`. The fixture must invert that: all display copy moves to i18next resources. `src/constants/` keeps only non-string constants (routes, config, colours, locale definitions).

`constants/labels/` is retained for exactly one purpose: **the strings that are deliberately hardcoded as a seeded defect** (the i18n-readiness / hardcoded-string category). The FE's own convention becomes a defect class in the fixture — which is a neat way to make that category realistic rather than contrived.

**Adopt the `// ── Libraries ──` three-section import banner uniformly.** In the FE it is only used in ~19% of files; pick one state and hold it.

**Strip entirely:** `vite-plugin-federation` and all `exposes`/`remotes`/`shared`, `@testai/shared-ui` and `@rgt-testai-fe/shared` aliases and every `R*` component import, `workspace:*` deps, `pnpm-workspace.yaml`, `-r --filter` scripts, Docker/nginx, `useBasePath`/`basePath.ts`, `build.minify: false`, `base: './'`, the auth-expiry plumbing. Keep only the `@` → `./src` alias.

**Declare what the FE hoisted.** `vite`, `@vitejs/plugin-react`, `typescript` are not in the app's `package.json` in the monorepo — they come from the root. A standalone app must declare them itself.

**Testing starts from zero** — the FE has no app-level tests. Use Vitest + `@testing-library/react` + jsdom, colocated `*.test.tsx`.

---

## Directory tree

```
temp3/stc-global-fixture/
├── .claude/plans/                     ← this plan
├── fixtures/
│   ├── manifest.json                  ← GROUND TRUTH — generates the defects
│   ├── manifest.schema.ts             ← the entry type + a validator
│   └── README.md                      ← how to add a defect
├── scripts/
│   ├── seed.ts                        ← applies manifest → seeded content
│   ├── prerender.ts                   ← stamps dist/<locale>/<route>/index.html
│   ├── gen-vercel-config.ts           ← emits vercel.json incl. header defects
│   └── verify-determinism.sh          ← builds twice, diffs hashes
├── public/
│   ├── locales/{en-US,hi-IN,de-DE}/   ← common.json, home.json, pricing.json, …
│   ├── images/                        ← incl. the banner with baked-in English text
│   └── fonts/                         ← self-hosted (Latin + Devanagari)
├── src/
│   ├── main.tsx                       ← BrowserRouter + providers (no separate App entry)
│   ├── index.css                      ← the only stylesheet; --rgt-* tokens
│   ├── assets/
│   ├── router/routes.tsx              ← single file, :locale segment
│   ├── layout/
│   │   ├── AppLayout.tsx              ← composer
│   │   ├── Header.tsx  Footer.tsx  Nav.tsx  Breadcrumbs.tsx
│   │   └── LocaleSwitcher.tsx         ← carries the "says X, serves Y" defect
│   ├── pages/                         ← Home/ About/ Services/ Pricing/ Events/
│   │                                     Contact/ Blog/ BlogPost/ Login/ Account/
│   │                                     NotFound/ ServerError/
│   ├── components/                    ← cross-page: Card, Table, Badge, EmptyState,
│   │                                     FormField, Toast, ProtectedRoute
│   ├── ui/                            ← root-mounted singletons only (AppToast)
│   ├── constants/
│   │   ├── routes.ts  locales.ts  config.ts  colors.ts
│   │   └── labels/                    ← ONLY the deliberately-hardcoded defect strings
│   ├── contexts/
│   │   ├── LocaleContext.ts / LocaleProvider.tsx
│   │   └── AuthContext.ts  / AuthProvider.tsx
│   ├── hooks/                         ← useLocale, useAuth, useFixtureFlag, …
│   ├── i18n/index.ts                  ← i18next init, resource loading, ns list
│   ├── mappers/  services/  types/  utils/
├── index.html
├── vite.config.ts  tsconfig.json  tailwind.config.cjs  postcss.config.cjs
├── eslint.config.mjs  .prettierrc  .gitattributes  .gitignore
├── vercel.json                        ← generated, committed
└── package.json                       ← npm, exact pins
```

## Locale resolution

A **written precedence spec** is required, because several seeded defects are deliberate violations of it and there must be something to violate:

1. Path segment — `/de-DE/about`
2. `?lang=` query override
3. `rgt_locale` cookie
4. `Accept-Language`
5. Fallback `en-US`

Two invariants the spec pins down, because seeded defects violate exactly these:

- **I-1 canonicality** — every rendered page's URL carries a locale prefix. Sources 2–5 always produce a `replace` navigation, never a render in place.
- **I-2 stickiness** — a locale set by prefix survives every in-app navigation, including `/login` → `/account` and the 404 fallback.

`/` with no locale resolves through 2→5 and **redirects** to the resolved prefix. Logic lives in one pure function in `utils/localeResolution.ts` (no React, no `window`, no `document`) returning `{ locale, source, canonicalPath, shouldPersistCookie }`. Everything above it is a thin adapter — which is what makes the precedence spec testable and makes the "cookie beat the path" defect a one-branch swap rather than a scattered edit.

**Do not use a `:locale` route param.** React Router 6 has no regex constraint on params, so `<Route path=":locale">` would also match `/about` and make the redirect gate unreachable. Instead, map `SUPPORTED_LOCALES` to **three literal sibling routes**, each rendering a `<LocaleShell locale="de-DE">` that takes the locale as a compile-time prop, with a single top-level `path="*"` → `<LocaleGate />` outside them. Adding a fourth locale is then one tuple entry, and router, prerenderer, hreflang set and `vercel.json` all widen automatically.

Use `BrowserRouter` + declarative `<Routes>` — **not** `createBrowserRouter`/`RouterProvider`. Data routers add loader/action async boundaries and a hydrate-fallback state, which is gratuitous non-determinism in an app with zero data fetching, and the declarative form matches the FE.

Cookie is written only when resolution came from `path` or `query` — never from `navigator` or `default`, so a first-time German browser isn't silently pinned before the user chooses.

**The head is build-time only; the app never touches it.** This keeps metadata defects deterministic and visible to a plain fetch. It also creates a genuine, realistic defect class for free: when `?lang=` overrides the path locale, the stamped `<html lang>` disagrees with the rendered body language. That must be **recorded in the manifest as an intended defect**, not left as an accident.

## Prerendering and hosting

Vite must use `base: '/'` (not the FE's `'./'`) so absolute asset paths resolve at nested depths. `scripts/prerender.ts` reads the built `dist/index.html` as a template and writes one file per locale × route, stamping `lang`, `dir`, `title`, description, OG/Twitter, canonical and hreflang from the manifest.

**Every blog slug is prerendered** — the set is finite and fixed, which removes the need for a dynamic rewrite and keeps output deterministic. 3 locales × (10 static + 5 articles + `/404` + `/500`) = 51 shells plus the root gate shell. A catch-all rewrite per locale points anything unmatched at that locale's shell.

**Vercel checks the filesystem before applying rewrites**, so a request to `/de-DE/about` serves `dist/de-DE/about/index.html` directly and the SPA fallback never fires. The two mechanisms partition the URL space rather than fighting; the rewrite only covers URLs we didn't enumerate.

**Scripts are TypeScript run under `tsx`, not `.mjs`.** This lets `prerender.ts` import the _same_ `computeHead()` the React app uses, rather than reimplementing it. Two implementations would drift and produce phantom head defects — this is the single largest correctness risk in the project and one import removes it. The same table feeds the stamped shell and the runtime, so shell and hydrated head can only differ when a manifest entry explicitly says so.

`vercel.json` is **generated** by `scripts/gen-vercel.ts` and committed (Vercel reads it before the build runs, so it cannot be a build output). CI fails if the committed file differs from a fresh generation.

**Known limitation — `routes` and `rewrites` are mutually exclusive in `vercel.json`.** Because the transport defects need the `headers` array, the legacy `routes` array is unavailable, and with it the ability to return real HTTP status codes from static config. So `/{locale}/500` and unknown paths both return **200** with the correct error-page body. Accept and document this: what matters here is the localization of the error page, not its status code. Do not pre-emptively add an Edge Function to fix it.

Also: publish canonicals and hreflang **without trailing slashes** (`trailingSlash: false` 308s otherwise), and confirm the detector's fetcher follows 308 — some clients only auto-follow 301/302.

### Two deployments

Two Vercel projects on one repo, two long-lived branches — `fixture/clean` and `fixture/seeded`. **The only file that differs between them is `vercel.json`** (its `buildCommand`). A CI check asserts `git diff` between the branches is empty for everything else. That is the structural guarantee against clean/seeded divergence; one project with two output directories cannot work, since Vercel supports one output dir per project.

**Turn Deployment Protection off explicitly in both projects.** It is on by default for previews and on some team plans for production. A protected URL returns 401 and an SSO login page — the detector would report the fixture as an untranslated English auth screen and every ground-truth assertion would fail confusingly. Add a `curl -sI | grep '200 OK'` smoke check to the deploy docs.

Give the detector team the **stable production alias**, not the per-deployment `*-git-*` hash URL — those rotate and may be protection-gated.

---

## Manifest schema

```ts
type Tier = 'assertion' | 'candidate' | 'not-automatable';

type InjectionTarget =
  | 'i18n-value' // patch a translation JSON string value
  | 'i18n-key' // delete a key so i18next renders the raw key
  | 'head-field' // prerender: lang, dir, title, meta, og, canonical, hreflang
  | 'http-header' // vercel.json
  | 'component-flag' // build-time flag a component reads (layout / behaviour)
  | 'route-behaviour' // locale resolution deliberately wrong for one route
  | 'asset'; // swap in an image carrying baked-in text

interface ManifestEntry {
  id: string; // 'de-DE.plumbing.raw-key.nav-services'
  kind: 'defect' | 'trap';
  locale: 'en-US' | 'hi-IN' | 'de-DE';
  route: string; // '/services'
  target: InjectionTarget;
  selector?: string; // CSS selector, for the reviewer and for assertions
  i18nNamespace?: string;
  i18nKey?: string;
  attribute?: string; // 'placeholder' | 'alt' | 'aria-label' | 'title'
  viewport?: 375 | 768 | 1280; // set only for viewport-specific layout defects
  category:
    | 'plumbing'
    | 'language'
    | 'encoding'
    | 'format'
    | 'metadata'
    | 'layout'
    | 'reachability'
    | 'interaction';
  expectedCheckId: string; // which detector rule should fire
  tier: Tier;
  severity: 'critical' | 'high' | 'medium' | 'low';
  expectedDetection: boolean; // false for every trap
  correctValue: string;
  injectedValue: string;
  description: string;
}
```

## Seeding mechanics

The important point: **these are not all string substitution**, and pretending they are is how the seeded and clean builds drift apart.

| Target            | How the seeding step actually applies it                                                                                                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `i18n-value`      | JSON patch — replace the value at `i18nKey` in `public/locales/<locale>/<ns>.json`                                                                                                                         |
| `i18n-key`        | **Delete** the key. i18next then renders the raw key itself — producing the raw-resource-key defect authentically instead of hardcoding the key as a literal                                               |
| `head-field`      | Not a file patch. `prerender.ts` reads the manifest directly and overrides that field for that locale × route                                                                                              |
| `http-header`     | `gen-vercel-config.ts` reads the manifest and emits the wrong header for that route                                                                                                                        |
| `component-flag`  | Cannot be text-patched. Seeding generates `src/generated/fixtureFlags.ts` exporting the active flag id set; components read it via `useFixtureFlag('de-DE.layout.nav-clip')` and apply a defect-only class |
| `route-behaviour` | Same flag mechanism, consumed by `utils/resolveLocale.ts` — e.g. a flag makes `/de-DE/events` resolve to `en-US`                                                                                           |
| `asset`           | Copy the alternate image over the canonical filename                                                                                                                                                       |

Three of the seven targets are **build-time flags, not text patches**. Seeding writes only into `src/constants/generated/**` and `vercel.json` — **product code under `src/` is never text-patched.** That is the rule that keeps clean and seeded from diverging. The clean build is the same pipeline with an empty defect set, not a different code path.

Emit flags as per-defect `const` literals (`export const D_DE_014_CLIPPED_CTA = true;`), not a `Set` lookup, so Rollup constant-folds and dead-code-eliminates the inactive branch.

### Three checks that make the manifest a contract rather than documentation

1. **`verify-clean`** greps the entire clean `dist/` — JS, CSS, HTML, JSON — for every `entry.actual` string and fails if any is found. DCE is the mechanism; this grep is the proof. _Don't trust DCE, trust the grep_ — a defect literal surviving into the clean bundle is the subtle failure that would otherwise go unnoticed.
2. **`verify-seeded`** asserts every non-trap `actual` is present, and every trap's value is unchanged.
3. **`seed.ts` recomputes each transform and fails the build if the result disagrees with the manifest's `actual`.** Hand-typed `actual` values for mojibake or NFD transforms will not match what the codec produces — NFD in particular is byte-different but visually identical. This one check is what makes ~120 hand-authored ground-truth rows tractable.

**Transforms must be real, not typed-out approximations.** Mojibake comes from `Buffer.from(v,'utf8').toString('latin1')`, so `Qualität` genuinely becomes `QualitÃ¤t`. And `translation.missing` is seeded by **deleting** the key and letting i18next's `fallbackLng` surface English — a hardcoded English replacement would be indistinguishable from `untranslated`, and those are different defects.

**`src/constants/generated/**`is gitignored** — correct, since a stale committed seeded file leaking into a clean build is the worst possible failure. But it breaks`tsc --noEmit`on a fresh clone, so wire`prepare`(seed clean after install) and`prebuild:clean`/`prebuild:seeded`hooks. The`prebuild`hook is the load-bearing one; don't rely on`prepare` alone.

## Fake auth

No backend. `AuthProvider` holds a hardcoded credential pair from `constants/config.ts`, stores a session marker in `sessionStorage`, and a `ProtectedRoute` component guards `/account`. Successful login normally navigates to `/<current-locale>/account`.

The **"locale resets after login"** defect is one flag away: when set, the post-login navigate target becomes `/en-US/account` regardless of the active locale. One line, behind a flag, recorded in the manifest.

## Determinism enforcement

- `scripts/verify-determinism.sh` builds twice into separate directories, hashes every file, and diffs the hash manifests. Any difference fails.
- A grep guard in CI rejects `new Date()`, `Date.now()`, `Math.random()`, `crypto.randomUUID()` anywhere under `src/`.
- All displayed dates derive from a single frozen `FIXTURE_NOW` in `constants/config.ts`.

## Build order

| Phase | Deliverable                                                                                        | Done when                                                                              |
| ----- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 0     | Create `temp3/stc-global-fixture/` and `.claude/plans/`, copy this plan in                         | Folder exists with the plan inside it                                                  |
| 1     | Scaffold, conventions, routing, locale resolution, 10 pages clean in en-US                         | `npm run dev` serves all routes, `/` redirects correctly, lint + typecheck clean       |
| 2     | i18n wired; de-DE and hi-IN resources complete and hand-corrected                                  | All three locales render fully, no missing keys, switcher and cookie persistence work  |
| 3     | Manifest schema, seeding, flag generation, dual build, prerender, `vercel.json` generation         | Both builds produce output; clean build's flag set is empty; determinism script passes |
| 4     | Seed tier-A defects (plumbing, encoding, metadata, language presence); first Vercel deploy of both | Both URLs live; manifest counts match what is visibly wrong on the page                |
| 5     | Seed formats and the full trap set                                                                 | Precision becomes measurable                                                           |
| 6     | Seed layout/viewport, reachability, auth defects                                                   | Full catalogue complete                                                                |
| 7     | `npm run verify:manifest` cross-check harness                                                      | Every manifest entry provably renders as described                                     |

Phases 1–4 alone give something worth pointing the detector at.

## Verification

1. `npm run dev` — walk all ten routes in all three locales; confirm path, `?lang=`, cookie and `Accept-Language` precedence behave per spec.
2. `npm run build:clean && npm run build:seeded`, serve both with `npx serve`, and diff the rendered pages — every difference should trace to a manifest entry.
3. `scripts/verify-determinism.sh` — must report identical hashes.
4. `npm run verify:manifest` — asserts each entry's `selector` resolves and carries `injectedValue`.
5. Deploy both to Vercel. Point the localization detector at the **clean** URL and expect approximately zero findings; point it at the **seeded** URL and expect the manifest's counts, with traps absent from the findings.

**One incidental benefit of Vercel over the earlier Docker plan:** public HTTPS URLs pass the detector's `SsrfGuard` unchanged. Hosting the fixture on localhost or a private range would have required the dev-only guard escape hatch — this avoids that risk entirely.

## Sharp edges

- **hreflang reciprocity is structural, not checked.** The alternate set is generated from the sorted locale tuple for every variant of a route and always includes a self-reference, so a correct build is reciprocal _by construction_ and cannot break accidentally. A `hreflangBreak` entry removes one `<link>` from one shell — producing a genuine one-directional break that a reciprocity crawler catches and a per-page checker misses. Worth seeding two siblings alongside it: a cross-locale `canonical` (hi-IN pointing at en-US — a classic bug that silently deindexes a whole locale) and a stale `og:locale`.
- **`max-lines: 350` is a warn, but lint-staged runs `--max-warnings 0`**, so it is a hard block. Pricing, Events and Article pages will cross it. Plan per-section child components from the start rather than refactoring under lint pressure.
- **Tailwind v4 with a v3-style config** works through the `@config` compat layer, but the `content` array must not point outside this repo — delete the FE's `../../packages/shared-ui/**` glob or v4 silently emits no utilities.
- **`useLayoutEffect`, not `useEffect`,** for setting `lang`/`dir`, so they are correct before the first paint a headless browser could capture.
- **Do not set `X-Frame-Options` or CSP `frame-ancestors`.** If the detector renders the fixture in an iframe, those produce a fake "page is empty" result.
- **`Cache-Control: must-revalidate` on everything** — the detector will hit clean and seeded in quick succession and must never compare a cached shell.
- **SSRF guard.** Public `*.vercel.app` addresses pass a guard that blocks loopback/RFC1918/link-local cleanly — which is precisely why hosting this is worth the trouble versus a localhost fixture. The guard must, however, permit the 308 from `trailingSlash: false` and the same-origin `/assets/*` and `/images/*` sub-requests a headless browser makes.

## Out of scope for now

Cookie-consent banner, embedded third-party iframe, per-locale PDF download, and RTL (`ar-SA`).

RTL is deferred but **prepared for**: `dir` comes from a `LOCALE_DIR` map (one line to extend), all spacing and alignment uses Tailwind **logical** utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end`), and `verify-rtl-ready.ts` fails the build if any `className` literal contains `ml-`, `mr-`, `pl-`, `pr-`, `text-left`, `text-right`, `left-` or `right-`. Crude, cheap, and it actually holds the line — adding a fourth locale stays a content folder plus a constants entry.

---

## Implementation notes

Deviations from the plan above, all found while building. Recorded here rather than silently
absorbed, because each one is a decision someone may want to revisit.

**An eighth injection target was needed: `dataValue`.** The plan assumed seven. But every
pre-formatted display literal — prices, dates, phone numbers, addresses — lives in
`content/data/site-data.json`, outside the i18n resources, so no existing target could reach
them and the entire format-defect category would have been unbuildable. `seed.ts` now also owns
`site-data`, emitting `src/constants/generated/siteData.ts`.

**A real race in the i18n bootstrap.** The plan had `LocaleProvider` set the language in a
layout effect. That renders English content under a correct German `<html lang>` and never
recovers: `changeLanguage()` resolves in a microtask, so `languageChanged` can fire _before_
react-i18next's `useTranslation` subscriptions attach in their passive effects, and the event is
missed. Fixed by deriving the initial language from the URL at i18next init, so the first render
is already correct; the provider's effect now only handles genuine switches. This was invisible
to typecheck, lint and the head-level checks — only a browser run caught it.

**`verify-clean` cannot be a whole-dist grep.** The plan specified searching the clean build for
every seeded string. That produces 21 false alarms, because most cross-locale defects inject
_another locale's correct string_ (DE-022 puts the real English title on the German page), which
is legitimately present elsewhere — and the shared JS bundle carries every locale's resources
anyway. It now checks the three things that are actually decidable: flags all off, per-locale
head shells clean, and dead-code elimination proven for the hardcoded literals that appear
nowhere in the authored content. The script documents what it cannot decide rather than
pretending otherwise.

**Component and route-behaviour flags are global, so defects need cataloguing per locale.** A
flag like `enHomeHeroHardcoded` changes the rendered output in all three locales, but the plan
catalogued each one once. That left the seeded build carrying visible differences the ground
truth did not know about. Seven extra entries (DE-036…DE-038, EN-031, EN-032, HI-033, HI-034)
close the gap; the rule is now "one entry per locale where the rendered output differs from
clean".

**Two defects collided on the 404 page.** `EN-026` put a raw key on the en-US 404 while `HI-028`
forces the en-US copy onto the Hindi 404 — so the Hindi 404 rendered EN-026's raw key and
HI-028's recorded `actual` was wrong. `EN-026` moved to `/500`, which no behaviour flag touches.
Worth remembering when adding entries: a route-behaviour defect makes every content defect on
its target route unreliable.

**`cookieBeatsPath` is implemented but deliberately not enabled.** Its effect depends on
accumulated cookie state, so it would cascade unpredictably across a detector's crawl and
invalidate other entries' recorded values. `ignoreQueryLang` gives a precedence violation with
no cascade, and is used instead.

**A purpose-built preview server was needed.** Neither `npx serve` (no fallback — un-prefixed
paths 404) nor `npx serve -s` (always falls back — every shell masked) matches Vercel's
filesystem-first ordering, and both hide real defects during local review.
`scripts/serve-local.ts` reproduces the real ordering.

**Scale as built:** 3 blog posts rather than 5 (the article page is what matters, not the
count), 43 prerendered shells, **134 manifest entries — 104 defects and 30 traps**, against a
planned ~120.

**Not built, as planned:** cookie-consent banner, third-party iframe, per-locale PDF download,
RTL. RTL scaffolding is in place and enforced by `verify:rtl`.
