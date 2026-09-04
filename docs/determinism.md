# Determinism

A fixture whose output drifts between builds cannot support byte-identical snapshot assertions
or build-over-build diffing, which is most of what makes it useful. Determinism here is a
correctness requirement, not a nicety.

`npm run verify:determinism` builds twice under `TZ=UTC LC_ALL=C` and compares a sha256 tree.

## The rules

### 1. Every displayed number, date, currency and time is a pre-formatted literal

This is the most important decision in the fixture, and the least obvious.

`Intl.NumberFormat('de-DE', { style: 'currency' })` varies across ICU versions in whether the
space before `€` is U+0020 or U+00A0. `Intl.DateTimeFormat` long forms change wording between
ICU releases. The manifest records **exact strings** as ground truth, so a value computed at
render time would make the ground truth depend on which Node version built the site — and the
failure would look like a detector bug, not a fixture bug.

So `plans.1.price.de-DE` is the literal `"1.249,00 €"` in
[`content/data/site-data.json`](../content/data/site-data.json), and a currency defect is
seeded by swapping that literal. Same for dates, times, phone numbers and addresses.

ESLint enforces it: `new Intl.*` is banned in `src/` outside two narrowly scoped helpers.

### 2. No live clock

`BUILD_NOW` in [`src/constants/time.ts`](../src/constants/time.ts) is a hand-pinned ISO literal,
never generated. A generated timestamp would make two builds a minute apart differ, which
defeats the entire point. `new Date()` and `Date.now()` are banned by lint.

### 3. No randomness

No `Math.random()`, no `crypto.randomUUID()`. Banned by lint.

### 4. No runtime network

Fonts are self-hosted, there is no CDN, no analytics and no map embed. Two reasons: a detector's
network capture should see only first-party requests, and `font-display: swap` produces a flash
whose timing varies run to run, which makes any screenshot-diffing detector flaky.

`fetch` is banned as a global in `src/`.

### 5. No runtime config knob

The sibling FE repo ships a `public/env.js` that sets `window.__ENV__` at container start. That
pattern is deliberately **not** copied here: a runtime-editable value on the deployed site is
exactly the manifest/reality drift this whole design exists to prevent.

What replaces it is [`dist/__fixture.json`](../scripts/prerender.ts) — a static file a detector
harness can `GET` to confirm which build it hit, carrying the mode, the fixture version and the
sha256 of the manifest that produced it.

### 6. Pinned versions

Zero `^` or `~` in `package.json`. `package-lock.json` is committed and CI uses `npm ci`.
`.nvmrc` pins Node; set the Vercel project to the matching version, since Vercel silently
upgrades its default.

### 7. No content hashes in asset filenames

Cache busting is irrelevant for a fixture, `Cache-Control: must-revalidate` covers freshness,
and stable filenames make a two-build diff readable instead of a wall of renames.

### 8. Explicit ordering everywhere

Manifest entries sorted by id. Locale enumeration sorted. hreflang sets sorted. Head tag order
fixed by one array in [`src/mappers/head.mapper.ts`](../src/mappers/head.mapper.ts). Every JSON
write goes through `sortKeys`, which uses a **byte comparator** — `localeCompare` consults ICU,
which is the very variance being avoided.

## Verifying

```bash
npm run verify:determinism            # two seeded builds, sha256 tree compare
npm run verify:determinism -- --mode=clean
```

On failure it prints the first differing paths. The usual causes, in order of likelihood: a new
`Intl` call that slipped past lint, a timestamp written into an artefact, or a dependency that
was not pinned.
