# The ground truth

Two files, and everything else in this repository is downstream of them.

| File                  | What it is                                                                        |
| --------------------- | --------------------------------------------------------------------------------- |
| `manifest.json`       | Every defect and trap. **Generates** the defects; it is not a description of them |
| `issue-type-map.json` | Maps the fixture's own defect vocabulary onto the detector's `IssueType` enum     |

`manifest.json` is the source. `scripts/seed.ts` reads it and writes **only** into
`src/constants/generated/`. Product code under `src/` is never text-patched, and the clean build
is the same pipeline with an empty defect set — not a second code path.

225 entries: **149 defects and 76 traps** across `ar-SA`, `de-DE`, `en-US` and `hi-IN`.

---

## Why the issue-type map is keyed per kind

The manifest classifies by `kind` — 77 values in its own vocabulary. The detector classifies by
`IssueType`. Something has to join them, or "what is our Level 1 recall" can only be eyeballed.

The join lives in `issue-type-map.json`, one row per kind rather than a field on each of the 225
entries. The relationship is taxonomic: every `translation.rawKey` is a `RawResourceKey`, and
150 copies of that fact would drift the first time a type is renamed.

```json
"translation.rawKey":  { "issueType": "RawResourceKey", "level": 1 },
"format.number":       { "issueType": null, "plannedIssueType": "NumberFormatError", "level": 2 },
"trap.bracedLiteral":  { "issueType": null, "level": null,
                         "guards": ["UnresolvedPlaceholder", "IcuSyntaxError"] },
"trap.ambiguousDate":  { "issueType": null, "level": null,
                         "guards": [], "plannedGuards": ["DateFormatError"] }
```

- **`issueType`** is non-null ONLY when the rule exists in the detector today. It is what makes
  "measurable" countable, and a guessed name there would score against a rule that does not exist.
- **`plannedIssueType`** records the name the Level 2/3 plans say the rule _will_ be called.
  Promoting it to `issueType` is the one-line diff that says a rule has landed, and
  `verify:manifest` rejects a kind naming both, so the two cannot drift apart.
- **`guards`** replaces `issueType` on trap rows: the rules that must stay _silent_. That makes
  precision computable per rule instead of only in aggregate. **`plannedGuards`** is the same
  thing for rules that do not exist yet.

`verify:manifest` fails if any kind used by an entry has no row, so a new kind cannot be added
without deciding which rule should catch it. Without that gate a new kind scores against
nothing, and recall stays at 100% because the denominator never grew.

---

## Adding a defect

1. Pick an `id`: `<EN|DE|HI>-<3 digits>`. Under 900 is a defect, 900+ is a trap. Never reuse one.
2. Pick a `kind`. If it is new, add it to `DefectKind` in `src/types/fixture.d.ts` **and** to
   `issue-type-map.json` — `verify:manifest` enforces both.
3. Pick a `target.via` — see the table in the root README for what each one physically does.
4. Fill in `expected` and `actual`. For a `i18nTransform`, **do not hand-type `actual`**: run the
   seed and copy what it produces. `seed.ts` recomputes every transform and fails if the manifest
   disagrees, which is the check that makes ~150 hand-authored rows tractable. An NFD or mojibake
   value typed by hand is byte-wrong in a way that is invisible on review.
5. Give `detect` an anchor that exists — a `data-rgt-id` in the rendered markup.
6. Write a `rationale` that says why this is a defect. For a trap, why flagging it would be a
   false positive.

**One resource key, one defect.** `verify:manifest` rejects two entries seeding the same
`locale + namespace.key`. Stacking them means the second transforms whatever the first left
behind, and the ground truth stops saying which rule should fire — this has already been caught
once in practice.

---

## Traps are half the point

76 of the 225 entries are things a detector must **not** flag. Without them you measure recall
only, and a detector that flags everything scores perfectly.

Twelve of them guard rules that exist today. Three live together on `/services` under
"Implementation notes":

| Trap                    | Content                                             | Guards                                    |
| ----------------------- | --------------------------------------------------- | ----------------------------------------- |
| `trap.dottedIdentifier` | `deploy.config.yaml`                                | `RawResourceKey`                          |
| `trap.bracedLiteral`    | `{ "region": "eu-central-1" }`                      | `UnresolvedPlaceholder`, `IcuSyntaxError` |
| `trap.nullInProse`      | "A null region means the platform default is used." | `NullOrUndefinedRendered`                 |

Each is a near-miss shaped exactly like the defect its rule hunts. Add traps at the same time as
the rule they guard — a trap added after the rule already passes is a trap written to fit.

The remaining 64 guard the Level 2 and Level 3 rules and name them in `plannedGuards`. Three are
worth singling out because each guards a _decision not to answer_ rather than a suppression:
`trap.ambiguousDate` (`03/04/2026` cannot be resolved either way, so the rule must skip it),
`trap.shortString` (below any workable minimum length for language identification), and
`trap.latinInRtl` (a standalone Latin number in RTL context needs no bidi isolation). A rule that
guesses on any of them trips a trap, which is the only way to measure restraint.

---

## Deliberately not fixtured

**`CaptureFailed`.** A static site cannot produce an honest capture failure. Vercel's rewrites
make every unknown path return 200 with a locale shell, and a hanging request would break the
determinism rule that forbids runtime network access. Anything contrived here would test a fake.

`CaptureFailed` is a property of the detector's fetch pipeline, not of the site — an
unresolvable host, a connection reset, a timeout. It belongs in the detector's own unit tests,
and it is the one Level 1 issue type this fixture deliberately does not cover.

**HTTP status codes.** `routes` and `rewrites` are mutually exclusive in `vercel.json`, and the
transport defects need the `headers` array. So `/{locale}/500` and unknown paths both return 200
with the correct error-page body. What is being tested is the _localization_ of the error page,
not its status.

---

## Resolved taxonomy debt

`translation.diacriticsStripped` used to cover two different defects. It was split when Level 2
was seeded: `DE-012` is now **`translation.unicodeNormalization`** — an NFD round-trip, `Über`
decomposed to `U` plus a combining diaeresis, visually identical and byte-different — while
`DE-013` keeps `translation.diacriticsStripped` for genuinely stripped umlauts (`Vorträge` to
`Vortrage`).

The NFD half is deliberately left **unbound**. `UnsupportedCharacterRule` stops short of
U+0300–U+036F, so no Level 1 rule reads combining marks today; whether that rule widens or a new
one arrives is open item F6 in the Level 2/3 fixture plan.

## Deliberately not expressible here

**`SlugPatternError` defects.** The rule wants a path segment carrying a language subtag that
contradicts the page locale. This fixture serves `/{locale}/{path}` with slugs identical across
locales, so seeding one would mean modelling per-locale slugs. Recorded rather than faked — a
contrived slug defect would measure the fixture, not the detector.
