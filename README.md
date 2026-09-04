# RGT Global — localization test fixture

A deliberately broken, **fully catalogued** website. Its only purpose is to be a measurable
target for a localization detector.

The point is **ground truth**. A detector is only as good as its measured precision and recall,
and neither can be computed without knowing the right answer in advance. So the site is built
clean, and defects are applied from a machine-readable manifest — which means the manifest and
the site can never disagree, and a clean control build falls out of the same pipeline for free.

- **150 catalogued entries** — 111 defects and 39 traps across `en-US`, `de-DE` and `hi-IN`
- **Two builds** — seeded, and a clean control where a detector should find approximately nothing
- **10 pages** plus error routes, 43 prerendered shells
- **All 9 site-observable Level 1 issue types** present in all three locales

Ten pages: `/`, `/about`, `/services`, `/pricing`, `/events`, `/contact`, `/blog`,
`/blog/:slug`, `/login`, `/account` (behind a fake sign-in), plus `/404` and `/500`.

## Quick start

```bash
npm ci
npm run dev            # http://localhost:4310 — redirects to /en-US

npm run build:clean    # control build   → dist-clean/
npm run build:seeded   # defective build → dist-seeded/
```

`npm ci` runs a clean seed automatically via the `prepare` hook, which is what populates the
gitignored `src/constants/generated/` tree.

Each mode writes to its own directory. They used to share `dist/` and be moved apart by hand,
which meant forgetting the `mv` silently destroyed the first build with no warning.

### Previewing a build — use `serve:seeded`, not `npx serve`

```bash
npm run serve:seeded         # http://localhost:4400
npm run serve:clean          # http://localhost:4401
```

Both common alternatives misrepresent production, in opposite directions, and each one hides
real defects:

- `npx serve dist` has no SPA fallback, so `/about` and `/?lang=de-DE` 404 instead of reaching
  the locale gate.
- `npx serve -s dist` rewrites **everything** to the root `index.html`, so every prerendered
  shell is masked and every head-level defect silently disappears.

Vercel checks the filesystem **first** and only then applies rewrites — that order is what lets
shells and the SPA fallback coexist. [`scripts/serve-local.ts`](scripts/serve-local.ts)
reproduces it. (Per-route response-header defects are Vercel config; checking those needs the
real deployment.)

## Traps are half the point

39 of the 150 entries are **traps**: things a detector must _not_ flag. Without them you measure
recall only, and a detector that flags everything scores perfectly.

Nine guard the Level 1 plumbing rules specifically — a dotted filename that is not a resource
key, a JSON snippet whose braces are content, the word `null` used as terminology.

The other 30 include brand and product names (`RGT Global`, `CloudBridge`), German loanwords and
cognates that are identical to English and correct (`Login`, `Email`, `Team`), the version
string `1.000` which is a release number rather than a thousands-separated quantity, the product
code `12/05/2024` which is shaped exactly like a date and is not one, an English testimonial
correctly marked `lang="en"`, correct international phone numbers for genuine foreign offices,
and Latin numerals in Hindi where that is the convention.

Full listing: [`docs/defect-catalogue.md`](docs/defect-catalogue.md) — generated from the
manifest, never hand-edited. How to read and extend the ground truth, and which rule each defect
kind is expected to trip: [`fixtures/README.md`](fixtures/README.md).

## How a defect gets made

`fixtures/manifest.json` is the **source** that generates the defects, not a description of
them. `scripts/seed.ts` reads it and writes **only** into `src/constants/generated/`. Product
code under `src/` is never text-patched, and the clean build is the same pipeline with an empty
defect set — not a different code path.

| Injection target              | How it is applied                                                                                                                                                                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `i18nValue` / `i18nTransform` | Patches a translation string in the generated bundle                                                                                                                                                                                    |
| `i18nDelete`                  | **Deletes** the key so i18next's fallback surfaces English — which is what a genuinely missing translation looks like. Replacing it with hardcoded English would be indistinguishable from an _untranslated_ string, a different defect |
| `dataValue`                   | Patches a pre-formatted price, date, phone or address literal                                                                                                                                                                           |
| `headField` / `hreflangBreak` | A data row the prerenderer and the runtime both read                                                                                                                                                                                    |
| `componentFlag`               | A generated `const … = true`; the branch is dead-code-eliminated when false                                                                                                                                                             |
| `routeBehaviour`              | A generated const read by the locale resolver or the auth service                                                                                                                                                                       |
| `responseHeader`              | A rule in the generated `vercel.json`                                                                                                                                                                                                   |
| `assetSwap`                   | A file copy — text baked into pixels cannot be a string patch                                                                                                                                                                           |
| `shellByteOrderMark`          | Writes one prerendered shell as UTF-8-**with**-BOM. Not content and not a head field: the marker sits before the doctype, so it is a property of the file's encoding                                                                    |

Transforms are **real**, not typed out: mojibake comes from an actual `utf8 → latin1` byte
round-trip, so the fixture reproduces the defect rather than a plausible-looking imitation.

## The three gates

These are what make the manifest a contract rather than documentation.

```bash
npm run verify:manifest        # coverage, kind spread, anchors, issue-type map — no build needed
npm run verify:clean           # reseeds clean, then checks dist-clean/
npm run verify:seeded          # checks dist-seeded/
npm run verify:determinism     # two builds, sha256 tree compare
npm run verify:rtl             # no physical direction utilities in src/
```

`verify:clean` reseeds before checking, and that is deliberate. Its flag check reads
`src/constants/generated/`, which is a build _input_ reflecting whichever seed ran last — not
the directory being inspected. Running it straight after a seeded build would otherwise read
seeded flags and fail against a perfectly good clean build.

1. **`seed.ts` recomputes every transform** and fails if the result disagrees with the
   manifest's `actual`. A hand-typed value for an NFD or mojibake transform will not match what
   the codec really produces — NFD in particular is byte-different but visually identical, so
   the mistake is invisible on review. This check is what makes ~150 hand-authored rows
   tractable.
2. **`verify-clean`** proves the control build is genuinely clean: all flags off, per-locale head
   shells carrying the expected values, and the hardcoded literals actually eliminated by
   dead-code elimination. _Do not trust DCE — trust the grep._ Note that it cannot use a naive
   whole-dist search: most cross-locale defects inject another locale's **correct** string, which
   is legitimately present elsewhere. The script explains what it can and cannot decide.
3. **`verify-seeded`** proves every claimed defect is really there, and that no trap has gone
   missing — a vanished trap silently stops measuring precision.

## Determinism

Every displayed number, date, currency and time is a **pre-formatted literal**, because ICU
output varies across Node versions and the manifest records exact strings. No live clock, no
randomness, no runtime network, no content hashes, pinned dependencies. Enforced by lint and by
`verify:determinism`.

Full reasoning: [`docs/determinism.md`](docs/determinism.md).

## Locale behaviour

Path prefix (`/de-DE/about`) wins, then `?lang=`, then the `rgt_locale` cookie, then
`navigator.languages`, then `en-US`. The spec is normative because several defects are
deliberate violations of it — without a written spec, "the cookie beat the path" is
unfalsifiable.

Read it before changing anything about routing:
[`docs/locale-precedence.md`](docs/locale-precedence.md).

## Signing in

The members-only page uses fake client-side auth. Credentials are published on purpose — the
detector needs them:

```
demo@rgtglobal.example / fixture-demo
```

`/account` still gets a prerendered shell with correct head and `lang`, so its head-level ground
truth is testable without authenticating.

## Deployment

Two Vercel projects, two branches, `vercel.json` the only difference.
**Turn Deployment Protection off** — a protected URL returns a 401 SSO page that a detector will
report as an untranslated English auth screen.

Details, and the known non-testables (HTTP status codes on error pages):
[`docs/deployment.md`](docs/deployment.md).

## Layout

```
content/          hand-authored truth — locales, site data, head copy
fixtures/         manifest.json: the ground truth that GENERATES the defects
scripts/          seed · prerender · gen-vercel · the verify gates
src/              the app — taxonomy mirrors rgt-testai-FE/apps/localization-testing
docs/             locale precedence · determinism · deployment · defect catalogue
```

## Adding a fourth locale

One entry in `SUPPORTED_LOCALES`, one entry in `LOCALE_DIR`, one file in `content/locales/`, and
one block per route in `content/head/head.json`. Router, prerenderer, hreflang sets and
`vercel.json` all widen off the tuple.

RTL is prepared for but not enabled: all spacing uses Tailwind **logical** utilities and
`npm run verify:rtl` fails the build if anything reaches for `ml-`, `pr-`, `text-left` and
friends.
