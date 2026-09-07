# Locale precedence — the normative spec

This document is **normative**. Several seeded defects are deliberate violations of the rules
below, and without a written spec "the cookie beat the path" is an unfalsifiable claim rather
than a defect. Change this document and the fixture's ground truth changes with it.

The implementation is one pure function: [`src/utils/localeResolution.ts`](../src/utils/localeResolution.ts).
It takes no React, no `window` and no `document`, so every rule here is testable in isolation
and each seeded violation is a one-branch swap rather than a scattered edit.

## Supported locales

`ar-SA`, `de-DE`, `en-US`, `hi-IN`. Default: **`en-US`**.

The tuple in [`src/constants/locales.ts`](../src/constants/locales.ts) is sorted and frozen.
The router, the prerenderer, the hreflang sets and `vercel.json` all widen off it, so adding a
fourth locale is one entry plus one content file.

## Resolution order

Evaluated in order; the first hit wins.

| #   | Source                  | Condition                                      | Notes                                                                                                 |
| --- | ----------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 1   | **Path prefix**         | first path segment is a supported locale       | Wins unconditionally, **including over `?lang=`**                                                     |
| 2   | **Query `?lang=`**      | value is supported **and** rule 1 did not fire | An override for un-prefixed URLs only. Triggers a `replace` navigation to the canonical prefixed path |
| 3   | **Cookie `rgt_locale`** | value is supported                             | Written on every resolution from `path` or `query`; `SameSite=Lax; Path=/; Max-Age=31536000`          |
| 4   | **`Accept-Language`**   | —                                              | See the substitution note below                                                                       |
| 5   | **Default**             | always                                         | `en-US`                                                                                               |

**The cookie is never written from source `navigator` or `default`.** A first-time visitor whose
browser happens to be German must not be silently pinned to German before they have chosen
anything — that would make the choice unrecoverable without clearing site data.

### The Accept-Language substitution

On static hosting the client cannot read the request header. The app uses
`navigator.languages` as a documented stand-in, matching by exact tag first
(`de-DE`), then by primary subtag (`de` → `de-DE`).

This is stated explicitly so a detector is not scored against behaviour the platform makes
impossible. If you later need real header negotiation, it requires an edge function and a
deviation from "pure static".

## Invariants

- **I-1 — canonicality.** Every rendered page's URL carries a locale prefix. Sources 2–5 always
  produce a `replace` navigation, never a render in place.
- **I-2 — stickiness.** A locale established by prefix survives every in-app navigation,
  including the `/login` → `/account` transition and the 404 fallback.

`replace`, not `push`, so the redirect is not counted as a user navigation and a detector's
history trace stays clean.

## Worked examples

| Request                                            | Resolves to | Source    | Lands on                             |
| -------------------------------------------------- | ----------- | --------- | ------------------------------------ |
| `/` (no cookie, `navigator.languages = ['en-GB']`) | `en-US`     | navigator | `/en-US`                             |
| `/` (no cookie, `navigator.languages = ['de']`)    | `de-DE`     | navigator | `/de-DE`                             |
| `/about?lang=de-DE`                                | `de-DE`     | query     | `/de-DE/about`                       |
| `/de-DE/about?lang=hi-IN`                          | `de-DE`     | path      | `/de-DE/about` (rule 1 beats rule 2) |
| `/about` with cookie `hi-IN`                       | `hi-IN`     | cookie    | `/hi-IN/about`                       |
| `/fr-FR/about`                                     | `en-US`     | default   | `/en-US/fr-FR/about` → localized 404 |

That last row is deliberate: an unsupported locale prefix produces a **localized** 404 rather
than a bare one, because the visitor still deserves an error page in a language they can read.

## Why literal routes, not a `:locale` param

React Router 6 puts no regex constraint on a path parameter, so `<Route path=":locale">` also
matches `/about` and makes the redirect gate unreachable. `SUPPORTED_LOCALES` is therefore
mapped to literal sibling routes, each rendering a `<LocaleShell locale="de-DE">` that receives
the locale as a compile-time prop. Nothing downstream ever has to ask whether a path segment is
a locale.

## Seeded violations of this spec

| Manifest ID | Behaviour flag                 | Rule violated                                                                       |
| ----------- | ------------------------------ | ----------------------------------------------------------------------------------- |
| `EN-027`    | `ignoreQueryLang`              | Rule 2 — an explicit `?lang=` is silently discarded                                 |
| `DE-033`    | `serveDefaultLocale` (`login`) | Rule 1 — the route serves `en-US` while the URL and `<html lang>` still say `de-DE` |
| `DE-034`    | `dropLocaleOnAuth`             | I-2 — the locale is lost across the sign-in boundary                                |
| `HI-028`    | `unlocalizedNotFound`          | I-2 — the 404 page always renders `en-US`                                           |

`cookieBeatsPath` exists in the codebase and is **deliberately not enabled** in the current
manifest: it depends on accumulated cookie state, so its effect would cascade unpredictably
across a detector's crawl and invalidate other entries' recorded values. Enable it only in a
manifest built specifically around it.
