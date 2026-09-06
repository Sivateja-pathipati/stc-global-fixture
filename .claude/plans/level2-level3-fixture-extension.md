# Seeding Levels 2 and 3 into the fixture

> Companion to `rgt-testai-dotnet/.claude/plans/standalone-level2-locale-conventions.md` and
> `…/standalone-level3-language-and-declarations.md`. Written **before** Level 2 is implemented,
> deliberately: the fixtures README already says it, and it is the rule that matters most here —
> _"Add traps at the same time as the rule they guard — a trap added after the rule already passes
> is a trap written to fit."_
>
> **Status: implemented, manifest v1.3.0.** Steps 2–8 are done: 150 entries → **225**, three
> locales → **four**, and `ar-SA` makes direction, bidi and script measurable for the first time.
> Step 1 (reconciling 31 / 29 / 39) still needs a live crawl. See **What landed** at the end.

## The headline

**The fixture is already about two thirds seeded for Levels 2 and 3.** It was built for the whole
product, not for Level 1, and most of the work below is _binding_ existing entries to rule names
rather than authoring new content.

Measured from `fixtures/manifest.json` v1.1.0 and `fixtures/issue-type-map.json`:

|                                   | Count                                         |
| --------------------------------- | --------------------------------------------- |
| Entries                           | **150** — 111 defects, 39 traps               |
| Defects by declared level         | L1 **31** · L2 **42** · L3 **31** · L4 **7**  |
| Defects by locale                 | en-US 47 · de-DE 53 · hi-IN 50                |
| Traps with a named `guards` list  | **9** — all Level 1                           |
| Traps with `guards: []`           | **30** — authored for Levels 2 and 3, waiting |
| Kinds bound to a real `IssueType` | **10 of 55** — Level 1 only                   |

So: 73 defects and 30 traps already exist for Levels 2 and 3, and **not one of them is bound to a
rule name**, which means none of it is currently measurable.

---

## 0. Reconcile three numbers before adding anything

The map says **31** Level 1 defects. The recorded backend measurement says **27/29 recall** and
**39 findings / 0 traps**. Those three numbers do not agree, and every Level 2 measurement will be
read against them.

| Number | Source                                                   | Question it raises                                                                 |
| ------ | -------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 31     | `issue-type-map.json`, kinds with a non-null `issueType` | —                                                                                  |
| 29     | "27/29 recall", backend master plan                      | Which 2 of the 31 are not site-observable? `head.byteOrderMark` is a plausible one |
| 39     | "Results shows 39 findings"                              | 12 findings above the 27 true positives, none of them a trap. What are they?       |

That last row is the one that matters. Twelve findings that are neither a catalogued defect nor a
trap means either the fixture is under-catalogued, or one defect legitimately produces several
node-level findings, or Level 1 has a false-positive class the fixture does not bait. **All three
are worth knowing and only one is harmless.** Resolve it against a fresh crawl before Level 2
adds 17 more defects on top.

_(Note: a fresh crawl is needed anyway — the captures in the database predate both the segmentation
rewrite and the `AlternateLinks` fix.)_

---

## 1. The level column is wrong for 22 entries

`issue-type-map.json` assigns these to level 2. All four are _"this text is not in the language the
page claims"_, which needs language identification — **Level 3** in the plans as written.

| Kind                        | Count | Example (`DE-031`, `DE-007`, `DE-009`)                   |
| --------------------------- | ----- | -------------------------------------------------------- |
| `translation.hardcoded`     | 11    | expected `Nachricht senden`, actual `Get in touch today` |
| `translation.untranslated`  | 6     | a whole German paragraph left in English                 |
| `translation.missing`       | 2     | key deleted, i18next falls back to English               |
| `translation.wrongLanguage` | 3     | French text on a German page                             |

**Move all 22 to level 3.** After the move:

|                 | Before | After                                           |
| --------------- | ------ | ----------------------------------------------- |
| Level 2 defects | 42     | **16** (the `format.*` kinds, and nothing else) |
| Level 3 defects | 31     | **53**                                          |

Two Level-2-assigned kinds remain unresolved and are dealt with in §4:
`translation.diacriticsStripped` (2) and `translation.truncated` (2).

---

## 2. Bind what already exists — a metadata-only change

This is the highest-value step in the plan and it authors no content. Editing
`issue-type-map.json` makes 73 defects and 30 traps measurable the moment the rules land.

### 2.1 Defect kinds → planned `IssueType`

| Fixture kind                                                                               | №   | Planned type                                   | Level |
| ------------------------------------------------------------------------------------------ | --- | ---------------------------------------------- | ----- |
| `format.number`                                                                            | 4   | `NumberFormatError`                            | 2     |
| `format.currency`                                                                          | 3   | `CurrencyFormatError`                          | 2     |
| `format.date`                                                                              | 4   | `DateFormatError`                              | 2     |
| `format.time`                                                                              | 2   | `TimeFormatError`                              | 2     |
| `format.phone`                                                                             | 2   | `PhoneFormatError`                             | 2     |
| `format.address`                                                                           | 1   | `AddressFormatError`                           | 2     |
| `translation.hardcoded` · `untranslated` · `missing` · `wrongLanguage`                     | 22  | `WrongLanguage`                                | 3     |
| `dom.altTextUntranslated` · `ariaUntranslated` · `placeholderUntranslated`                 | 5   | `WrongLanguage` (via the attribute projection) | 3     |
| `head.title` · `head.description` · `head.og`                                              | 7   | **no planned type — see §4**                   | 3     |
| `head.lang`                                                                                | 3   | `LangDeclarationMismatch`                      | 3     |
| `header.contentLanguage`                                                                   | 3   | `LangDeclarationMismatch`                      | 3     |
| `head.hreflang`                                                                            | 3   | `HreflangError`                                | 3     |
| `head.charset` · `header.contentType`                                                      | 2   | `CharsetDeclarationError`                      | 3     |
| `head.canonical`                                                                           | 3   | **no planned type — see §4**                   | 3     |
| `route.localeIgnored` · `notFoundUnlocalized` · `localeLostOnAuth` · `precedenceViolation` | 5   | `LocaleFallbackDetected`                       | 3     |

The five `dom.*Untranslated` rows are worth calling out: they are the ground truth for Level 3's
`CapturedAttribute` work and for the `PageCapture.AssessableText` projection. If those five do not
light up, the projection did not happen — which is otherwise a silent change.

### 2.2 The 30 empty-`guards` traps → the rules that must stay silent

Every one of them maps. Nothing here is a stretch.

| Trap kind                 | №   | `guards`                                                              |
| ------------------------- | --- | --------------------------------------------------------------------- |
| `trap.versionString`      | 3   | `NumberFormatError` — `1.000` is a release number                     |
| `trap.latinNumerals`      | 1   | `NumberFormatError` — Latin digits are the convention in hi-IN        |
| `trap.productCode`        | 3   | `DateFormatError` — `12/05/2024` is shaped like a date and is not one |
| `trap.internationalPhone` | 3   | `PhoneFormatError` — real numbers for genuine foreign offices         |
| `trap.brandName`          | 6   | `WrongLanguage`, `ScriptMismatch`                                     |
| `trap.loanword`           | 5   | `WrongLanguage`                                                       |
| `trap.cognate`            | 3   | `WrongLanguage` — `Login`, `Email`, `Team` are correct German         |
| `trap.legalEntity`        | 3   | `WrongLanguage`                                                       |
| `trap.taggedForeignQuote` | 3   | `WrongLanguage` — English original, correctly `lang="en"`             |

`trap.taggedForeignQuote` deserves special attention. The `detect.selector` is
`[data-rgt-id='testimonial-quote'][lang='en']` — the trap _is_ the lang attribute. Level 3's
`WrongLanguage` rule must read the node's `LangAttribute`, which `CapturedTextNode` already
carries and no rule has ever read. **That is the one existing trap most likely to be tripped**, and
binding it is what makes that discoverable rather than surprising.

---

## 3. Gaps: planned rules with no fixture material

Thirteen Level 2 types are planned. **Six are covered, seven are not.** Level 3 fares much better:
five and a half of seven.

| Planned type              | Level | Have | Add   | Why the gap                                           |
| ------------------------- | ----- | ---- | ----- | ----------------------------------------------------- |
| `UnitSystemMismatch`      | 2     | 0    | **3** | No miles/°F/°C content anywhere                       |
| `ScriptMismatch`          | 2     | 0    | **3** | Needs a wholly-Latin block on hi-IN (and ar-SA)       |
| `PluralAgreementError`    | 2     | 0    | **3** | §6 — the fixture has no plurals at all                |
| `PluralPlaceholderLeak`   | 2     | 0    | **2** | §6                                                    |
| `ToneInconsistency`       | 2     | 0    | **2** | de-DE only; `ToneRules` are seeded for 6 languages    |
| `MissingRtlDirection`     | 2     | 0    | **2** | §5 — needs an RTL locale                              |
| `BidiIsolationMissing`    | 2     | 0    | **2** | §5                                                    |
| `SlugPatternError`        | 3     | 0    | **2** | The `route.*` entries are behaviours, not slug shapes |
| `MissingLangDeclaration`  | 3     | 0    | **1** | `head.lang` entries are _wrong_, never _absent_       |
| `CharsetDeclarationError` | 3     | 2    | **1** | Thin — one meta, one header, no disagreement case     |

**21 new defects.** Seven of them (`MissingRtlDirection`, `BidiIsolationMissing`, and one
`ScriptMismatch`) are blocked on §5.

---

## 4. Gaps the other way: fixture defects with no planned rule

The fixture is a check on the plans, not only a target for them. Three findings, and the first two
are real omissions in the Level 3 plan.

**`head.canonical` — 3 defects, no planned type.** A cross-locale canonical (`de-DE/pricing`
declaring `en-US/pricing` as canonical) silently deindexes an entire locale. The Level 3 plan
captures `Declarations.Canonical` and never reads it. **Add `CanonicalError` to the Level 3
plan** — `Declaration` category, Assertion tier when the canonical points at a different locale of
the same site, silent when it points off-site.

**`head.title` / `head.description` / `head.og` — 7 defects, no planned type.** Untranslated head
copy: invisible on the page, visible in the tab, in search results and in shares. The Level 3 plan
captures all three fields and feeds none of them to the language pass. **Feed head copy into
`TranslationAnalysisService` alongside text nodes**, so an untranslated title is a `WrongLanguage`
finding located at the head rather than a new type. That is the same argument as the attribute
projection in §2.1 and should be the same mechanism.

**`translation.diacriticsStripped` (2) and `translation.truncated` (2) — still unresolved.**
The fixtures README already records the first as taxonomy debt: `DE-012` is an NFD round-trip
(`Über` decomposed, visually identical, byte-different) and `DE-013` is genuinely stripped
(`Vorträge` → `Vortrage`). Different rules catch these. The NFD case is arguably Level 1
`TextIntegrity` — Unicode normalization is a byte-level property, not a locale convention — and
the stripped case needs a dictionary and is realistically Level 5. **Split the kind, and move the
NFD half to Level 1** where `EncodingErrorRule` and friends already live. `translation.truncated`
is a layout consequence; move it to Level 4.

**One correction to the Level 2 plan itself:** §B says _"Eleven new `IssueType`s"_ and §C.3 says
_"eleven, eleven and two new entries"_. The tables list **thirteen** (7 in B.2, 6 in B.3). Fix the
prose to match the tables.

---

## 5. The RTL problem — add `ar-SA`

**Three of thirteen Level 2 types cannot be measured at all**: `MissingRtlDirection`,
`BidiIsolationMissing`, and half of `ScriptMismatch`. The fixture has no RTL locale, and the
detector seeds `IsRtl = true` for exactly four (`ar-SA`, `he-IL`, `fa-IR`, `ur-PK`).

This is the single highest-leverage change in the plan, and the fixture was built expecting it:

- The README already documents _"Adding a fourth locale"_ as a four-touch operation — one entry in
  `SUPPORTED_LOCALES`, one in `LOCALE_DIR`, one file in `content/locales/`, one block per route in
  `head.json`. Router, prerenderer, hreflang sets and `vercel.json` all widen off the tuple.
- `npm run verify:rtl` **already passes** — all spacing uses Tailwind logical utilities and the
  gate fails the build if anything reaches for `ml-`, `pr-` or `text-left`. The CSS work is done.

What `ar-SA` unlocks beyond directionality:

|                        |                                                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `ScriptMismatch`       | `Arab` ranges are seeded (`0x0600-0x06FF`, `0x0750-0x077F`)                                                           |
| `PluralAgreementError` | Arabic has **six** CLDR categories — zero/one/two/few/many/other, the richest seeded set and the strongest test of §6 |
| `BidiIsolationMissing` | Latin brand names inside RTL prose is the canonical case                                                              |
| `CurrencyFormatError`  | `SAR ر.س`, position `after` — a non-Latin currency symbol                                                             |
| `format.date`          | `dd/MM/yyyy`, `h:mm a` — differs from all three existing locales                                                      |

### 5.1 It cannot be partial

A key absent from `ar-SA.json` does not render blank — i18next's `fallbackLng` surfaces the
**English** string. That is exactly how `translation.missing` defects are seeded (`seed.ts`,
`i18nDelete`): _"Delete rather than replace: i18next's fallbackLng then surfaces the English
string, which is what a genuinely missing translation looks like."_

So an incomplete `ar-SA` manufactures fake defects that are **indistinguishable from real ones**,
and the manifest would not record them. It is all 224 keys or no locale at all.

### 5.2 The gate sets the entry count, and it is higher than first estimated

`scripts/verify-manifest.ts` enforces per-locale minimums:

```
MIN_DEFECTS_PER_LOCALE = 25
MIN_TRAPS_PER_LOCALE   = 10
MIN_KINDS_PER_LOCALE   = 8
```

The moment `ar-SA` joins `SUPPORTED_LOCALES`, `verify:manifest` demands **≥25 defects, ≥10 traps
and ≥8 distinct kinds for it** — the check loops over `SUPPORTED_LOCALES`, not over locales that
happen to have entries. An earlier draft of this plan budgeted ~10 defects and 4 traps for `ar-SA`;
**that fails the gate immediately.**

Lowering the thresholds is the wrong trade: they exist so a locale cannot be added as a token
presence, and weakening them weakens the guarantee for `en-US`, `de-DE` and `hi-IN` too.

### 5.3 Real cost of `ar-SA`

|                  |                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------- |
| Locale content   | **224 keys**, complete, non-negotiable (§5.1)                                          |
| Head copy        | one block per route × 10 routes in `content/head/head.json`                            |
| Widening         | `SUPPORTED_LOCALES`, `LOCALE_DIR`, hreflang sets, `vercel.json` — all off the tuple    |
| Manifest entries | **≥25 defects, ≥10 traps, ≥8 kinds** — call it **~38 entries**                         |
| Data rows        | per-locale `ar-SA` values in `site-data.json` for every price, date, phone and address |

That is roughly the same weight as an existing locale (`de-DE` carries 53 entries), because the
gate is designed to make it so.

### 5.4 One risk worth naming

**The Arabic baseline is itself ground truth.** Every `expected` value in the manifest asserts what
correct output looks like. If a baseline string is subtly wrong — a mis-agreed adjective, a wrong
plural form, a Latin digit where Arabic-Indic is expected — then a _correct_ detector finding gets
scored as a **false positive**, and the fixture's precision measurement quietly becomes a
measurement of the translator's accuracy instead. The other three locales carry the same risk and
have presumably been reviewed; `ar-SA` would start unreviewed.

Budget a native review of the 224 keys before the first measurement is trusted, or record `ar-SA`
precision as provisional until one happens.

---

## 6. Plurals — the one place with genuinely zero material

Verified: **224 leaf keys per locale, zero ICU plural syntax, zero `_one`/`_other` keys.** No
pluralized string is rendered anywhere in the fixture.

So `PluralAgreementError` and `PluralPlaceholderLeak` need **new content**, not just new manifest
rows: a countable thing on a page, rendered at more than one count. The natural home is
`/pricing` (seats, projects) or `/events` (attendees, sessions), both of which already carry
per-locale data rows.

Author the correct plural forms in all locales first, then seed the defects against them:

| Defect                   | Locale | Shape                                                 |
| ------------------------ | ------ | ----------------------------------------------------- |
| `plural.agreement`       | en-US  | `1 items` — the classic `n != 1` bug                  |
| `plural.agreement`       | de-DE  | `1 Projekte`                                          |
| `plural.agreement`       | ar-SA  | a form that ignores Arabic's `two` / `few` categories |
| `plural.placeholderLeak` | de-DE  | `Projekt(e)` where a real plural form exists          |
| `plural.placeholderLeak` | en-US  | `item(s)`                                             |

And the trap that must not fire: **`Vorname(n)`** in a German form label is idiomatic, not a leaked
plural artefact.

> This depends on the Level 2 plan's open item **O1** — which plural strategy. The recommendation
> there is option 1, `one`/`other` languages only, evaluated as `n == 1`. Under that strategy the
> Arabic row above is _expected to be missed_, and the manifest should record it as a
> known-uncovered defect rather than as a recall failure. Decide O1 before authoring the content.

---

## 7. Traps, and the false-positive target

Two different questions, and they have different answers.

### How many false positives should the detector produce? **Zero. That number does not move.**

Level 1 measured **0 of 39 traps tripped**, so zero is proven achievable rather than aspirational.
Every trap trip at Level 2 or 3 is a rule bug to be fixed in the rule, not a threshold to be tuned
away. The acceptance line is `0/N`, and only `N` grows.

### How many traps should exist? **17 more, and 4 more again with `ar-SA`.**

Fourteen of the twenty planned Level 2 and Level 3 rules currently have **no trap at all**. Each
one's near-miss is already named in the plans' own rule tables — that column is the specification
for these entries and no invention is required.

| New trap kind                 | №   | Guards                                                          | The near-miss                                          |
| ----------------------------- | --- | --------------------------------------------------------------- | ------------------------------------------------------ |
| `trap.dottedAddress`          | 1   | `NumberFormatError`                                             | `192.168.1.1`                                          |
| `trap.isoDate`                | 1   | `DateFormatError`, `NumberFormatError`                          | `2024-03-04` is locale-neutral                         |
| `trap.ambiguousDate`          | 1   | `DateFormatError`                                               | `03/04/2024` — must be **skipped**, not guessed        |
| `trap.foreignCurrency`        | 1   | `CurrencyFormatError`                                           | `$49` shown deliberately on a de-DE page               |
| `trap.quotedSchedule`         | 1   | `TimeFormatError`                                               | a US dateline quoted inside German prose               |
| `trap.foreignMeasurement`     | 1   | `UnitSystemMismatch`                                            | "a 5-mile trail in Colorado" on a de-DE page           |
| `trap.usAddressAbroad`        | 1   | `AddressFormatError`                                            | a genuine US office in a global contact list           |
| `trap.technicalTermInScript`  | 1   | `ScriptMismatch`                                                | `OAuth`, `HTTPS` in Devanagari prose                   |
| `trap.tableHeaderCount`       | 1   | `PluralAgreementError`                                          | a bare `1 Item` column header                          |
| `trap.parentheticalPlural`    | 1   | `PluralPlaceholderLeak`                                         | `Vorname(n)`                                           |
| `trap.quotedInformalRegister` | 1   | `ToneInconsistency`                                             | a deliberately `du`-form marketing block               |
| `trap.regionNeutralLang`      | 1   | `LangDeclarationMismatch`                                       | `lang="de"` on a de-DE page is correct                 |
| `trap.noAlternates`           | 1   | `HreflangError`                                                 | **a page with no hreflang at all**                     |
| `trap.headerOnlyCharset`      | 1   | `CharsetDeclarationError`                                       | no `<meta charset>`, correct `Content-Type`            |
| `trap.identifierPathSegment`  | 1   | `SlugPatternError`                                              | `/id/…` meaning _identifier_, not Indonesian           |
| `trap.languageOnlyMatch`      | 1   | `LocaleFallbackDetected`                                        | `de` served for `de-AT` is `Localized`, not `Fallback` |
| `trap.shortString`            | 1   | `WrongLanguage`                                                 | below `MinLength`; must get no verdict                 |
| **`ar-SA` set**               | 4   | `BidiIsolationMissing`, `ScriptMismatch`, `MissingRtlDirection` | a wholly-Latin node; a Latin brand in RTL prose        |

Three of these deserve emphasis because they encode failures already observed in the wild:

- **`trap.noAlternates`** is the `ratnaglobaltech.com` case. That site has `lang="en"`, 10 `og:`
  tags and zero hreflang alternates. A site that genuinely has none must not be reported as broken.
  This trap is also the only guard against the `AlternateLinks` regression class — the field was
  empty on every capture for months and nothing noticed.
- **`trap.identifierPathSegment`** is the exact discrimination `LanguageSubtags.Iso6391` was kept
  for through the Level 1 reset: `/it` is Italian, `/id` is usually an identifier, and no
  two-letter regex can tell them apart.
- **`trap.ambiguousDate`** guards a _skip_, not a suppression. `03/04/2024` is undecidable and the
  rule must never guess. A trap is the only way to make "we correctly declined to answer"
  measurable.

---

## 8. Target totals

|                              | Now     | After §1–§4, §6, §7             | With `ar-SA` (§5) |
| ---------------------------- | ------- | ------------------------------- | ----------------- |
| Defects                      | 111     | **132**                         | **157**           |
| Traps                        | 39      | **56**                          | **66**            |
| **Entries**                  | **150** | **188**                         | **~225**          |
| Level 1 defects              | 31      | 32 _(+ the NFD split, §4)_      | ~40               |
| Level 2 defects              | 42      | **30** _(16 kept + 14 new)_     | **~42**           |
| Level 3 defects              | 31      | **57** _(53 after §1 + 4 new)_  | **~62**           |
| Level 4 defects              | 7       | 9 _(+ `translation.truncated`)_ | ~9                |
| Rules with ≥1 trap           | 5 of 25 | **22 of 25**                    | **25 of 25**      |
| **False positives expected** | **0**   | **0**                           | **0**             |

That last row is the whole point of the exercise. The bottom-left cell is the one that changes:
**5 of 25 rules currently have a trap; the target is all 25.**

---

## Build order

| #   | Step                                                                                                              | Gate                                                                        |
| --- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 1   | §0 — reconcile 31 / 29 / 39 against a fresh crawl                                                                 | A written answer, not a guess                                               |
| 2   | ~~§1 — move 22 entries to level 3~~ **done**                                                                      | `verify:manifest` green                                                     |
| 3   | ~~§2 — bind kinds, populate the 30 empty `guards`~~ **done** — as `plannedIssueType` / `plannedGuards`, see below | `verify:manifest` green                                                     |
| 4   | ~~§4 — split `diacriticsStripped`, relevel `truncated`, fix the Level 2 plan's count~~ **done**                   | `typecheck`, `lint`, `verify:seeded` green                                  |
| 5   | §7 — 17 new traps _(defects they guard need not exist yet)_                                                       | `verify:seeded`                                                             |
| 6   | §3 — 14 new Level 2/3 defects that need no new locale                                                             | `verify:seeded`, `verify:clean`                                             |
| 7   | §6 — plural content, then the 5 plural entries                                                                    | Blocked on Level 2 **O1**                                                   |
| 8   | §5 — `ar-SA`: 224-key locale file, 10 head blocks, `site-data` rows, **≥25 defects and ≥10 traps**                | `verify:manifest` (per-locale minimums), `verify:rtl`, `verify:determinism` |

### What steps 2–4 actually changed (manifest v1.1.0 → v1.2.0)

`issue-type-map.json` gained **two new fields rather than reusing `issueType`**, and that is the one
design decision taken during execution. The fixtures README argues, correctly, that _"a guessed name
would be worse than null — it would score against a rule that does not exist"_, and
`verify-manifest.ts` counts `measurable` off a non-null `issueType`. Writing `NumberFormatError`
there today would have taken the coverage line from 31/111 to 100/111 and made it a lie.

| Field              | Meaning                                                                           |
| ------------------ | --------------------------------------------------------------------------------- |
| `issueType`        | The rule that exists in the detector **today**. Unchanged: Level 1 only, 10 kinds |
| `plannedIssueType` | The rule the Level 2/3 plans say **will** catch this kind — 26 kinds              |
| `guards`           | Traps: rules that exist today and must stay silent                                |
| `plannedGuards`    | Traps: rules that do not exist yet and must stay silent once they do — 9 kinds    |

Promoting a `plannedIssueType` to `issueType` is now the one-line diff that records a rule landing,
and the gate rejects a kind that names both — so the two can never drift apart. The coverage line
reads honestly:

```
verify-manifest: OK — v1.2.0, 150 entries (111 defects, 39 traps)
  bound to a live IssueType:  31/111 defect entries
  planned, rule not built:    69/111 defect entries
  unbound (no rule planned):  11/111 defect entries
```

**That 69 is the number this step existed to create** — 69 defects that were invisible to any
scoring run are now attributed to a named rule, plus all 30 previously-unguarded traps.

The 11 unbound are the honest remainder and every one is expected: 7 Level 4 layout defects
(`dom.clipped` ×3, `overflow`, `wrapped`, `textInImage` ×2), `translation.truncated` ×2 relevelled to
4, the Level 5 `diacriticsStripped`, and the newly split `translation.unicodeNormalization` — which
is open item **F6**, because `UnsupportedCharacterRule`'s ranges stop short of U+0300–U+036F and no
Level 1 rule reads combining marks today.

Step 5 before step 6 is deliberate, and it is the fixtures README's own rule: traps land with — or
before — the rule they guard, never after it already passes.

---

## Verification

Unchanged gates, all of which already exist:

```bash
npm run verify:manifest      # coverage, kind spread, anchors, issue-type map
npm run verify:clean         # reseeds clean, then checks dist-clean/
npm run verify:seeded        # every claimed defect really there, no trap vanished
npm run verify:determinism   # two builds, sha256 tree compare
npm run verify:rtl           # no physical direction utilities in src/
```

Two things to respect while extending:

- **Never hand-type `actual` for an `i18nTransform`.** `seed.ts` recomputes every transform and
  fails if the manifest disagrees. An NFD or mojibake value typed by hand is byte-wrong in a way
  that is invisible on review — this is the check that makes ~200 hand-authored rows tractable.
- **One resource key, one defect.** `verify:manifest` rejects two entries seeding the same
  `locale + namespace.key`. Stacking them makes the second transform whatever the first left
  behind, and the ground truth stops saying which rule should fire.

Both new locales' and new kinds' rows must be added to `DefectKind` in `src/types/fixture.d.ts`
**and** `issue-type-map.json` — `verify:manifest` enforces both, which is what stops a new kind
scoring against nothing and holding recall at 100% because the denominator never grew.

---

## Explicitly not doing

- **Not fixturing `CaptureFailed`.** Still true and still the right call: a static site cannot
  produce an honest capture failure, and Vercel answers 200 for every unknown path.
- **Not fixturing HTTP status codes.** `routes` and `rewrites` are mutually exclusive in
  `vercel.json`; what is tested is the localization of the error page, not its status.
- **Not adding Level 4 or Level 5 material.** The 7 existing `dom.*` layout entries stay as they
  are until there is a plan for those levels.
- **Not touching the `en-US` / `de-DE` / `hi-IN` content that already works.** Every change above is
  additive except the two relevels in §1 and §4.
- **Not renaming the fixture.** `RGT Global` → `STC Global` is a separate task and would churn
  every `expected` string containing the brand.

## Open items

| #   | Item                                                                                                                                                                                           | Blocks                             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| F1  | §0 — what are the 12 findings above the 27 true positives?                                                                                                                                     | Trusting any Level 2 measurement   |
| F2  | `ar-SA` costs a full 224-key translation **plus ~38 manifest entries** (§5.2 — the gate, not a choice). Worth it? Recommendation: **yes**, it is the only way to measure 3 of 13 Level 2 types | 3 of 13 Level 2 types              |
| F7  | Who reviews the Arabic baseline (§5.4)? Until someone does, `ar-SA` precision is provisional                                                                                                   | Trusting `ar-SA` measurements      |
| F3  | Level 2 **O1** (plural strategy) must be decided before §6 content is authored                                                                                                                 | §6                                 |
| F4  | Where do plurals live — `/pricing` seats or `/events` attendees?                                                                                                                               | §6                                 |
| F5  | `CanonicalError` and head-copy language need adding to the Level 3 plan (§4)                                                                                                                   | 10 fixture defects staying unbound |
| F6  | Does the NFD half of `diacriticsStripped` belong to Level 1 `TextIntegrity`? Recommendation: yes                                                                                               | §4                                 |

---

## What landed

Manifest **v1.3.0**. All gates green: `typecheck`, `lint`, `format:check`, `verify:manifest`,
`verify:seeded`, `verify:clean`, `verify:rtl`, `verify:determinism` (67 files byte-identical).

|                               | Before             | After                      |
| ----------------------------- | ------------------ | -------------------------- |
| Entries                       | 150                | **225**                    |
| Defects · traps               | 111 · 39           | **149 · 76**               |
| Locales                       | 3                  | **4** — `ar-SA` added      |
| Prerendered shells            | 43                 | **57**                     |
| Kinds                         | 55                 | **77**                     |
| Defects by level              | 1:31 2:42 3:31 4:7 | **1:42 2:34 3:63 4:9 5:1** |
| Traps guarding a live rule    | 9                  | **12**                     |
| Traps guarding a planned rule | 0 (30 unguarded)   | **64**                     |
| Rules with ≥1 trap            | 5 of 25            | **25 of 25**               |
| **False positives expected**  | **0**              | **0**                      |

`ar-SA`: 224-key locale file, 11 head blocks, `ar-SA` on all 60 localized `site-data` records,
27 defects across 27 kinds and 18 traps. `LocaleId`, `SUPPORTED_LOCALES`, `LOCALE_DIR`,
`LOCALE_HTML_LANG`, `LOCALE_LABEL` and `ACCOUNT_SNAPSHOT` all widened.

### Decisions taken during execution

**`seed.ts` kept its own copy of the locale list.** `const LOCALES = ['de-DE','en-US','hi-IN']`
sat beside `SUPPORTED_LOCALES` as a second hand-maintained source of truth — a fourth locale added
to the tuple but not to the script would have seeded three locales and said nothing. It now reads
the tuple.

**Two new injection mechanisms, both minimal.** `htmlDir` became an overridable `HeadFieldName`
(one line in `computeHead`) so an RTL locale can be served without `dir="rtl"`; and
`arPhoneNotIsolated` is a component flag that strips the `<bdi>` around a phone number in Arabic
prose. The baseline markup gained the `<bdi>` it should always have had.

**Three kinds are absences, and `verify:seeded` was lying about two of them.** It greps for a
defect's `actual` in the build. `dom.missingTextDirection` (`ltr`) and `dom.bidiIsolationMissing`
(the phone number) both _passed_ on their first run — because that text is in the build whether or
not the defect is seeded. They now sit in `DESCRIPTIVE_KINDS` alongside `head.langMissing`, with
their `expected`/`actual` rewritten as descriptions. **A gate that passes for the wrong reason is
worse than one that fails.**

**Formatted literals follow the detector's seed, not a reading of CLDR.** `ar-SA` prices, dates and
times match `LocaleFormatRulesSeed` — comma decimal, space grouping, `ر.س` after the amount,
`dd/MM/yyyy`, `h:mm a`, Latin digits. The fixture's `expected` values have to agree with the thing
being measured, or every correct page reads as a defect.

### Deliberately not done

**`SlugPatternError` defects.** Recorded in `fixtures/README.md` under _Deliberately not
expressible here_: the fixture serves `/{locale}/{path}` with slugs identical across locales, so a
slug defect would need per-locale slugs. A contrived one would measure the fixture, not the
detector.

**`trap.noAlternates`, `trap.headerOnlyCharset`, `trap.regionNeutralLang`.** Each needs a route
whose _baseline_ omits something the head model always emits — a structural change to the head
pipeline, not a manifest row. `trap.taggedForeignQuote` already exercises a region-neutral element
`lang`, so that near-miss is covered.

**Arabic plural agreement is a catalogued known-miss.** `AR-019` seeds `25 مقاعد` where Arabic
wants the accusative singular. Under the recommended one/other plural strategy (Level 2 **O1**)
the rule will not catch it. It is in the manifest so the gap is _measured_ rather than invisible.

### Still open

| #   | Item                                                                                                                                                                                                                                                                                                                              |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | §0 — 31 / 29 / 39 still unreconciled. Needs a live crawl, and the captures in the database predate both the segmentation rewrite and the `AlternateLinks` fix                                                                                                                                                                     |
| F3  | Level 2 **O1** (plural strategy) decides whether `AR-019` and `DE-042` are hits or known misses                                                                                                                                                                                                                                   |
| F6  | Does the NFD half of the split kind belong to Level 1 `TextIntegrity`? `UnsupportedCharacterRule` stops short of U+0300–U+036F                                                                                                                                                                                                    |
| F7  | **The Arabic baseline is unreviewed.** Every `expected` value asserts what correct output looks like; if one is subtly wrong, a _correct_ detector finding scores as a false positive and the fixture measures the translator instead. Treat `ar-SA` precision as provisional until a native reader has been through the 224 keys |
