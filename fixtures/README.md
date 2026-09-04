# The ground truth

Two files, and everything else in this repository is downstream of them.

| File                  | What it is                                                                        |
| --------------------- | --------------------------------------------------------------------------------- |
| `manifest.json`       | Every defect and trap. **Generates** the defects; it is not a description of them |
| `issue-type-map.json` | Maps the fixture's own defect vocabulary onto the detector's `IssueType` enum     |

`manifest.json` is the source. `scripts/seed.ts` reads it and writes **only** into
`src/constants/generated/`. Product code under `src/` is never text-patched, and the clean build
is the same pipeline with an empty defect set — not a second code path.

150 entries: **111 defects and 39 traps** across `en-US`, `de-DE` and `hi-IN`.

---

## Why the issue-type map is keyed per kind

The manifest classifies by `kind` — 55 values in its own vocabulary. The detector classifies by
`IssueType`. Something has to join them, or "what is our Level 1 recall" can only be eyeballed.

The join lives in `issue-type-map.json`, one row per kind rather than a field on each of the 150
entries. The relationship is taxonomic: every `translation.rawKey` is a `RawResourceKey`, and
150 copies of that fact would drift the first time a type is renamed.

```json
"translation.rawKey":  { "issueType": "RawResourceKey", "level": 1 },
"format.number":       { "issueType": null,             "level": 2 },
"trap.bracedLiteral":  { "issueType": null, "level": null,
                         "guards": ["UnresolvedPlaceholder", "IcuSyntaxError"] }
```

- **`issueType: null`** means no rule covers this kind yet. `level` says when one is expected to.
  Only Level 1 names are bound today, because Level 1 is the only tier whose enum members are
  fixed. A guessed name would be worse than null — it would score against a rule that does not
  exist.
- **`guards`** replaces `issueType` on trap rows: the rules that must stay _silent_. That makes
  precision computable per rule instead of only in aggregate.

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

39 of the 150 entries are things a detector must **not** flag. Without them you measure recall
only, and a detector that flags everything scores perfectly.

Nine of them exist specifically to guard the Level 1 plumbing rules, and they live together on
`/services` under "Implementation notes":

| Trap                    | Content                                             | Guards                                    |
| ----------------------- | --------------------------------------------------- | ----------------------------------------- |
| `trap.dottedIdentifier` | `deploy.config.yaml`                                | `RawResourceKey`                          |
| `trap.bracedLiteral`    | `{ "region": "eu-central-1" }`                      | `UnresolvedPlaceholder`, `IcuSyntaxError` |
| `trap.nullInProse`      | "A null region means the platform default is used." | `NullOrUndefinedRendered`                 |

Each is a near-miss shaped exactly like the defect its rule hunts. Add traps at the same time as
the rule they guard — a trap added after the rule already passes is a trap written to fit.

The remaining 30 guard the Level 2 and Level 3 rules: brand and product names, German loanwords
and cognates that are correct as-is, the version string `1.000` that is not a
thousands-separated quantity, the product code `12/05/2024` that is not a date, an English
testimonial correctly marked `lang="en"`, real international phone numbers, and Latin numerals
in Hindi where that is the convention.

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

## Known taxonomy debt

`translation.diacriticsStripped` covers two different defects. `DE-012` is an NFD round-trip —
`Über` decomposed to `U` plus a combining diaeresis, visually identical and byte-different.
`DE-013` is genuinely stripped: `Vorträge` to `Vortrage`. Different rules will catch these, so
the kind should split when Level 2 lands. Recorded here so it is not rediscovered as a surprise.
