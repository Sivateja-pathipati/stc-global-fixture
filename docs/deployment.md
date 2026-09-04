# Deployment

Two Vercel projects on one repository, two long-lived branches. **The only file that differs
between them is `vercel.json`.**

|                              | `rgt-global-clean`            | `rgt-global-seeded`            |
| ---------------------------- | ----------------------------- | ------------------------------ |
| Production branch            | `fixture/clean`               | `fixture/seeded`               |
| `vercel.json` `buildCommand` | `npm run build:clean`         | `npm run build:seeded`         |
| Production alias             | `rgt-global-clean.vercel.app` | `rgt-global-seeded.vercel.app` |

Both branches merge from `main`. A CI check asserts that everything except `vercel.json` is
identical between them — that is the structural guarantee against clean/seeded divergence. One
project with two output directories cannot work: Vercel supports one output directory per
project.

`vercel.json` is **generated and committed**. Vercel reads it from the repo root _before_ the
build runs, so it cannot be produced by the build:

```bash
npm run gen:vercel -- --mode=seeded   # on fixture/seeded
npm run gen:vercel -- --mode=clean    # on fixture/clean
```

CI regenerates it and fails if the committed file differs, which keeps the transport defects
derived from the manifest rather than hand-maintained.

## Turn Deployment Protection OFF

This is the most likely deployment-day failure and it is worth doing before the first deploy.

Vercel enables SSO protection on preview deployments by default, and on some team plans on
production too. A protected URL returns **401 and an SSO login page** — the detector would
report the fixture as an untranslated English auth screen and every ground-truth assertion would
fail in a thoroughly confusing way.

**Settings → Deployment Protection → Vercel Authentication → Disabled**, on both projects.

Smoke check after each deploy:

```bash
curl -sI https://rgt-global-seeded.vercel.app/de-DE/pricing | head -1   # expect 200
```

## Set the Node version

Match `.nvmrc` in **Settings → General → Node.js Version** on both projects. Vercel silently
upgrades its default, and an ICU change is exactly the kind of drift the fixture is built to
exclude.

## What to hand the detector team

- The **stable production aliases**, not per-deployment `*-git-*` hash URLs — those rotate and
  may be protection-gated.
- `GET /__fixture.json` on each, to confirm which build was reached.
- [`fixtures/manifest.json`](../fixtures/manifest.json) as the scoring contract, and
  [`defect-catalogue.md`](defect-catalogue.md) as its readable rendering.

## Known non-testables

**HTTP status codes.** `routes` and `rewrites` are mutually exclusive in `vercel.json`, and the
transport defects need the `headers` array — so the legacy `routes` array is unavailable, and
with it the ability to return a real status from static config.

Consequently `/{locale}/500` and unknown paths both return **200** with the correct error-page
body. Accept this: what the fixture is testing is the _localization_ of the error page, not its
status code. If a real status is ever required, one `api/error.ts` Edge Function returning the
prerendered body with the right code would do it — but that is a deviation from "pure static"
and adds cold-start latency, so do not add it pre-emptively.

**Trailing slashes.** `trailingSlash: false` means `/de-DE/about/` 308s to `/de-DE/about`.
Canonicals and hreflang are always published without trailing slashes so the detector never has
to follow a hop, but confirm its fetcher follows 308 — some HTTP clients only auto-follow
301/302.

## SSRF guard

Public `*.vercel.app` addresses resolve to public anycast IPs, so a guard that blocks loopback,
RFC1918 and link-local ranges passes them cleanly. This is precisely why hosting the fixture is
worth the trouble compared with a localhost one, which would have required a dev-only escape
hatch in the detector.

Three things the guard must still permit: the 308 from `trailingSlash: false`, and the
same-origin `/assets/*` and `/images/*` sub-requests a headless browser will make.
