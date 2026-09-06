# Defect catalogue

Generated from `fixtures/manifest.json` v1.3.0 by `npm run gen:docs`. Do not edit by hand.

**149 defects · 76 traps**

## ar-SA

### Defects

| ID | Kind | Route | Severity | Expected | Actual |
|---|---|---|---|---|---|
| `AR-001` | translation.rawKey | home | critical | الخدمات | nav.services.label |
| `AR-002` | translation.placeholder | home | critical | أخبرنا أين تتألم منصتك وسنرسل مهندساً، لا مندوب مبيعات. | أخبرنا أين تتألم منصتك وسنرسل {{role}}، لا مندوب مبيعات. |
| `AR-003` | translation.marker | blog | critical | لم يتم العثور على مقالات | [missing translation] |
| `AR-004` | translation.nullValue | pricing | major | تُحتسب المقاعد الإضافية بالسعر نفسه. | تُحتسب المقاعد الإضافية بسعر undefined. |
| `AR-005` | translation.concatenated | contact | minor | مكاتبنا | مكاتبنا . |
| `AR-006` | translation.icuSyntax | blog | critical | 3 مقالات | {count, plural, one {# مقالة} other {# مقالات}} |
| `AR-007` | translation.mojibake | events | critical | أين تجدنا | Ø£ÙÙ ØªØ¬Ø¯ÙØ§ |
| `AR-008` | translation.controlChar | blog | minor | عرض الكل | عرض‎ الكل |
| `AR-009` | translation.byteOrderMark | about | minor | نوظّف اليوم 1,180 مهندساً في مراكز تسليم في حيدر آباد وبرلين وتورونتو. نحو ثلثي أعمالنا ار… | ﻿نوظّف اليوم 1,180 مهندساً في مراكز تسليم في حيدر آباد وبرلين وتورونتو. نحو ثلثي أعمالنا ا… |
| `AR-010` | head.byteOrderMark | services | major | <!doctype html> | ﻿<!doctype html> |
| `AR-011` | format.number | pricing | major | 99,5 % | 99.5% |
| `AR-012` | format.currency | pricing | critical | 5 059,00 ر.س | ر.س 5 059,00 |
| `AR-013` | format.date | events | critical | 17/03/2026، 2:00 م بتوقيت وسط أوروبا | 03/17/2026، 2:00 م بتوقيت وسط أوروبا |
| `AR-014` | format.time | events | major | 02/04/2026، 9:30 ص بالتوقيت الشرقي الصيفي | 02/04/2026، 09:30 بتوقيت شرق أمريكا الصيفي |
| `AR-015` | format.unitSystem | about | major | تعمل قاعات البيانات عند 21 °م. | تعمل قاعات البيانات عند 70 °ف. |
| `AR-016` | script.mismatch | about | critical | يُنشر دليلنا الهندسي بلغة كل مركز تسليم المحلية. | Yunsharu daliluna al-handasi bi-lughat kulli markaz taslim al-mahalliyya. |
| `AR-017` | dom.missingTextDirection | about | critical | dir="rtl" | dir="ltr" — the RTL locale served left-to-right |
| `AR-018` | dom.bidiIsolationMissing | contact | major | <bdi>+49 30 901820</bdi> | +49 30 901820 — the <bdi> isolation removed |
| `AR-019` | plural.agreement | pricing | major | 25 مقعداً مشمولاً | 25 مقاعد مشمولة |
| `AR-020` | head.lang | about | critical | ar-SA | en |
| `AR-021` | head.title | pricing | major | أسعار CloudBridge | CloudBridge pricing |
| `AR-022` | head.canonical | services | critical | https://rgt-global-seeded.vercel.app/ar-SA/services | https://rgt-global-seeded.vercel.app/en-US/services |
| `AR-023` | head.hreflang | contact | major | hreflang set includes de-DE | hreflang set omits de-DE |
| `AR-024` | header.contentLanguage | home | major | ar-SA | en-US |
| `AR-025` | translation.untranslated | about | critical | بدأت RGT Global حين ترك أربعة مهندسي منصات شركة تكامل أنظمة كبيرة، وهم مقتنعون بأن معظم مش… | RGT Global began when four platform engineers left a large systems integrator, convinced t… |
| `AR-026` | translation.wrongLanguage | services | critical | يبدأ معظم العملاء بتقييم ثم ينمون إلى ارتباط ثابت. | La plupart des clients commencent par une évaluation puis évoluent vers un engagement perm… |
| `AR-027` | dom.placeholderUntranslated | contact | major | اسمك الكامل | Your full name |

### Traps — these must NOT be flagged

| ID | Kind | Route | Value | Why flagging it is a false positive |
|---|---|---|---|---|
| `AR-901` | trap.brandName | home | RGT Global | A brand name is Latin in every locale by design. On an Arabic page it is also the most obv… |
| `AR-902` | trap.brandName | pricing | تُحتسب فوترة CloudBridge لكل مقعد شهرياً. تُسعَّر ارتباطات الاستشارات على حدة. | The product name stays CloudBridge inside Arabic prose. A script check that measures the s… |
| `AR-903` | trap.legalEntity | home | RGT Global Technologies Pvt. Ltd. | A registered company name is a legal string. Translating it would be the defect. |
| `AR-904` | trap.versionString | home | إصدار المنصة 1.000 | "1.000" is a release number, not one thousand. A number check that demands the ar-SA comma… |
| `AR-905` | trap.productCode | pricing | اذكر رمز المنتج هذا عند إصدار أمر شراء: 12/05/2024. | "12/05/2024" is a product code shaped exactly like a date, and both components are below 1… |
| `AR-906` | trap.internationalPhone | contact | +49 30 901820 | A correct international number for a genuine German office, shown on the Arabic site. Refo… |
| `AR-907` | trap.taggedForeignQuote | home | RGT Global rebuilt our deployment pipeline in eleven weeks. We now release twice a day ins… | A genuine English original, correctly marked lang="en" on the element. The attribute is th… |
| `AR-908` | trap.loanword | home | Email | "Email" is the form used in Saudi technical writing. Latin script inside Arabic prose is c… |
| `AR-909` | trap.latinNumerals | home | 14 | Latin digits are standard in Saudi web content. Demanding Arabic-Indic numerals would be a… |
| `AR-910` | trap.dottedIdentifier | services | تُعرَّف خطوط المعالجة في deploy.config.yaml في جذر المستودع. | "deploy.config.yaml" is a filename, not a resource key. |
| `AR-911` | trap.bracedLiteral | services | ثبّت المنطقة صراحةً، على سبيل المثال { "region": "eu-central-1" }. | Braces that are content: a JSON example, not an unresolved token. |
| `AR-912` | trap.nullInProse | services | قيمة null للمنطقة تعني استخدام الإعداد الافتراضي للمنصة. | The word null used as terminology, inside Arabic prose. |
| `AR-913` | trap.technicalTermInScript | about | OAuth وHTTPS مدعومان افتراضياً. | OAuth and HTTPS are Latin in every script. Whitelisting technical terms is what separates … |
| `AR-914` | trap.latinInRtl | home | 1,180 | A standalone Latin-digit number in RTL context needs no bidi isolation - it is not embedde… |
| `AR-915` | trap.foreignMeasurement | about | تسير رحلة الفريق السنوية على مسار طوله 5 أميال في كولورادو. | A Colorado trail signposted in miles, correct on a metric locale because the subject is Am… |
| `AR-916` | trap.ambiguousDate | about | تُجدَّد عقود الدعم في 03/04/2026. | 03/04/2026 is undecidable, so the rule must skip rather than guess. |
| `AR-917` | trap.foreignCurrency | pricing | يدفع العملاء الذين تصدر لهم فواتير من كياننا الأمريكي $1,349 شهرياً. | A deliberate second currency for a real US billing entity. |
| `AR-918` | trap.shortString | home | 240 | Three characters. Below any workable minimum length for language identification, so the ru… |

## de-DE

### Defects

| ID | Kind | Route | Severity | Expected | Actual |
|---|---|---|---|---|---|
| `DE-001` | translation.rawKey | home | critical | Leistungen | nav.services.label |
| `DE-002` | translation.placeholder | home | critical | Sagen Sie uns, wo Ihre Plattform Probleme macht, und wir schicken eine Ingenieurin oder ei… | Sagen Sie uns, wo Ihre Plattform Probleme macht, und wir schicken {0}. |
| `DE-003` | translation.marker | services | critical | Data Governance und Herkunftsnachweis | [missing translation] |
| `DE-004` | translation.nullValue | pricing | major | Bei jährlicher Zahlung sparen Sie 15 %. | Bei jährlicher Zahlung sparen Sie undefined %. |
| `DE-005` | translation.placeholder | blog | major | Lesedauer | Lesedauer %s |
| `DE-006` | translation.concatenated | contact | minor | Sagen Sie uns, was Sie bauen. Wir antworten innerhalb von zwei Werktagen. | Sagen Sie uns, was Sie bauen . Wir antworten innerhalb von zwei Werktagen . |
| `DE-007` | translation.untranslated | about | critical | Heute beschäftigen wir 1.180 Ingenieurinnen und Ingenieure in Lieferzentren in Hyderabad, … | Today we employ 1,180 engineers across delivery centres in Hyderabad, Berlin and Toronto. … |
| `DE-008` | translation.missing | home | major | Preise | Pricing |
| `DE-009` | translation.wrongLanguage | services | critical | Schrittweise Migration weg von Altsystemen, während der Betrieb durchgehend weiterläuft. | Migration progressive depuis les systèmes hérités, sans interrompre l'activité. |
| `DE-010` | translation.untranslated | home | major | Data Warehouses, Pipelines und Governance, die einer Prüfung standhalten und trotzdem schn… | Data Warehouses, Pipelines und Governance that survive an audit and still answer questions… |
| `DE-011` | translation.mojibake | pricing | critical | Enthaltene Arbeitsplätze | Enthaltene ArbeitsplÃ¤tze |
| `DE-012` | translation.unicodeNormalization | home | minor | Über uns | Über uns |
| `DE-013` | translation.diacriticsStripped | events | major | Workshops und Vorträge unserer Ingenieurinnen und Ingenieure. Die Teilnahme ist kostenlos,… | Workshops und Vortrage unserer Ingenieurinnen und Ingenieure. Die Teilnahme ist kostenlos,… |
| `DE-014` | translation.controlChar | contact | minor | Absenden | Absenden‎ |
| `DE-015` | format.currency | pricing | critical | 1.249,00 € | $1,249.00 |
| `DE-016` | format.number | pricing | major | 99,95 % | 99.95% |
| `DE-017` | format.date | events | critical | 17. März 2026, 14:00 Uhr MEZ | 03/17/2026, 2:00 PM CET |
| `DE-018` | format.time | events | major | 2. April 2026, 09:30 Uhr EDT | 2. April 2026, 9:30 AM EDT |
| `DE-019` | format.phone | contact | major | +49 30 901820 | (030) 901-820 |
| `DE-020` | format.address | contact | major | 10115 Berlin | Berlin, BE 10115 |
| `DE-021` | head.lang | about | critical | de-DE | en |
| `DE-022` | head.title | services | major | Leistungen — Plattform, Daten und Modernisierung | Services — Platform, data and modernisation |
| `DE-023` | head.canonical | pricing | critical | https://rgt-global-seeded.vercel.app/de-DE/pricing | https://rgt-global-seeded.vercel.app/en-US/pricing |
| `DE-024` | head.hreflang | services | major | hreflang set includes hi-IN | hreflang set omits hi-IN |
| `DE-025` | head.og | home | minor | de_DE | en_US |
| `DE-026` | header.contentLanguage | pricing | major | de-DE | en-US |
| `DE-027` | dom.clipped | home | major | nav labels render at their natural width | nav labels clipped at 6.5rem with overflow hidden |
| `DE-028` | dom.clipped | services | major | service CTA buttons size to their label | service CTA buttons capped at 11rem and truncated |
| `DE-029` | dom.overflow | pricing | major | pricing table scrolls inside its own container | pricing table forces document-level horizontal scroll |
| `DE-030` | dom.wrapped | home | minor | hero CTA stays on one line at 375px | hero CTA wraps to three lines at 375px |
| `DE-031` | translation.hardcoded | contact | critical | Nachricht senden | Get in touch today |
| `DE-032` | translation.hardcoded | pricing | major | Am beliebtesten | Most popular |
| `DE-033` | route.localeIgnored | login | critical | Anmelden | Sign in |
| `DE-034` | route.localeLostOnAuth | login | critical | /de-DE/account | /en-US/account |
| `DE-035` | dom.textInImage | blog.article (scaling-globally) | major | hero diagram carries no embedded text | hero diagram has English labels baked into the artwork |
| `DE-036` | translation.hardcoded | home | critical | Software ausliefern, die in jedem Markt funktioniert | Ship software that works everywhere |
| `DE-037` | translation.hardcoded | home | minor | Tätig in 14 Ländern. | Tätig in 14 Ländern weltweit. |
| `DE-038` | route.notFoundUnlocalized | notFound | major | Seite nicht gefunden | Page not found |
| `DE-039` | translation.icuSyntax | blog | critical | 3 Artikel | {count, plural, one {# Artikel} other {# Artikel}} |
| `DE-040` | translation.byteOrderMark | about | minor | RGT Global entstand, als vier Plattform-Ingenieure einen großen Systemintegrator verließen… | ﻿RGT Global entstand, als vier Plattform-Ingenieure einen großen Systemintegrator verließe… |
| `DE-041` | format.unitSystem | about | major | Unser Campus in Hyderabad liegt 12 km vom Flughafen entfernt. | Unser Campus in Hyderabad liegt 7,5 Meilen vom Flughafen entfernt. |
| `DE-042` | plural.agreement | pricing | major | 1 Sitzplatz inbegriffen | 1 Sitzplätze inbegriffen |
| `DE-043` | plural.placeholderLeak | pricing | major | Projekte | Projekt(e) |
| `DE-044` | style.toneInconsistency | contact | minor | Wir melden uns bei Ihnen innerhalb von zwei Werktagen. | Wir melden uns bei dir innerhalb von zwei Werktagen. |
| `DE-045` | head.charset | about | major | utf-8 | iso-8859-1 |

### Traps — these must NOT be flagged

| ID | Kind | Route | Value | Why flagging it is a false positive |
|---|---|---|---|---|
| `DE-901` | trap.brandName | home | RGT Global | The company name. Identical in every locale by design — flagging it as untranslated is a f… |
| `DE-902` | trap.brandName | pricing | CloudBridge | Product name. Never translated. |
| `DE-903` | trap.loanword | home | Login | An established German loanword. 'Login' is normal German usage and translating it would re… |
| `DE-904` | trap.loanword | home | Email | Also standard in German. Identical to the English string and correct. |
| `DE-905` | trap.cognate | pricing | Team | The plan name is also a German word spelled identically. An equality check against the Eng… |
| `DE-906` | trap.versionString | home | Plattform-Release 1.000 | '1.000' is a release number, not one thousand. A number-format checker that reads it as a … |
| `DE-907` | trap.productCode | pricing | 12/05/2024 | A product code shaped exactly like a date. Whether a string is even a date is a semantic q… |
| `DE-908` | trap.taggedForeignQuote | home | RGT Global rebuilt our deployment pipeline in eleven weeks. We now release twice a day ins… | A genuine English original, correctly marked lang="en" on the element. The lang attribute … |
| `DE-909` | trap.internationalPhone | contact | +91 40 2345 6789 | A correctly formatted Indian number on the German page. It is a foreign office, so a Germa… |
| `DE-910` | trap.legalEntity | home | RGT Global Technologies Pvt. Ltd. | A registered legal entity name. Translating it would be legally wrong, not helpful. |
| `DE-911` | trap.dottedIdentifier | services | Pipelines werden in deploy.config.yaml im Wurzelverzeichnis deklariert. | A configuration filename, not a resource key. Both are dotted lowercase identifiers, so a … |
| `DE-912` | trap.bracedLiteral | services | Geben Sie eine Region explizit an, zum Beispiel { "region": "eu-central-1" }. | A JSON snippet quoted as documentation. The braces are content, not an unresolved token, s… |
| `DE-913` | trap.nullInProse | services | Ein null-Wert für die Region bedeutet, dass die Standardregion verwendet wird. | The word null used as terminology in a sentence about configuration. NullOrUndefinedRender… |
| `DE-914` | trap.foreignMeasurement | about | Die jährliche Teamwanderung folgt einem 5-Meilen-Trail in Colorado. | A Colorado trail is signposted in miles. Miles are correct here BECAUSE the subject is Ame… |
| `DE-915` | trap.isoDate | about | Auditeinträge tragen in jedem Gebietsschema den Stempel 2026-03-04. | The same date on a locale whose own pattern is dd.MM.yyyy, where the temptation to "fix" i… |
| `DE-916` | trap.ambiguousDate | about | Supportverträge verlängern sich am 03/04/2026. | 03/04/2026 is undecidable: neither component exceeds 12, so nothing on the page says wheth… |
| `DE-917` | trap.dottedAddress | about | Das Standard-Gateway lauscht auf 192.168.1.1. | Worse on German, where "." IS the grouping separator, so 192.168.1.1 reads as a plausible … |
| `DE-918` | trap.foreignCurrency | pricing | Kunden, die über unsere US-Gesellschaft abgerechnet werden, zahlen $1,349 pro Monat. | A second currency for a real US billing entity. Reporting the PRESENCE of a foreign curren… |
| `DE-919` | trap.usAddressAbroad | pricing | Zahlungen an unsere US-Gesellschaft: 1200 Market St, San Francisco, CA 94102. | A genuine US postal address in a global remittance note. "City, ST 12345" is exactly what … |
| `DE-920` | trap.parentheticalPlural | contact | Bitte Vorname(n) und Nachname angeben. | "Vorname(n)" is idiomatic German for a form label, not a leaked plural artefact. The diffe… |
| `DE-921` | trap.quotedInformalRegister | contact | Unsere Karriereseite duzt bewusst: „Komm ins Team, wir zeigen dir alles.“ | The informal register is inside quotation marks, quoted from the careers page. A tone chec… |
| `DE-922` | trap.quotedSchedule | contact | Der US-Webcast wird in der Einladung mit 3:45 PM EST angegeben. | A US webcast time quoted as the invitation prints it. The 12-hour clock is correct because… |

## en-US

### Defects

| ID | Kind | Route | Severity | Expected | Actual |
|---|---|---|---|---|---|
| `EN-001` | translation.rawKey | home | critical | Events | nav.events.label |
| `EN-002` | translation.placeholder | home | critical | RGT Global helps engineering organisations design, build and operate platforms that hold u… | RGT Global helps ${count} engineering organisations design, build and operate platforms th… |
| `EN-003` | translation.marker | blog | major | No articles match this topic yet. Try another topic or view all articles. | TODO: write the empty state copy |
| `EN-004` | format.number | pricing | critical | $349 | $NaN |
| `EN-005` | translation.concatenated | about | minor | Continuity beats headcount. Our median engagement runs 26 months with the same core team. | Continuity beats headcount . Our median engagement runs 26 months with the same core team … |
| `EN-006` | translation.mojibake | blog.article (migration-without-freeze) | critical | Élodie Fontaine | Ãlodie Fontaine |
| `EN-007` | translation.controlChar | blog | minor | View all | View‎ all |
| `EN-008` | head.lang | contact | critical | en-US | de |
| `EN-009` | head.title | blog | major | Insights — Notes from our engineering practice | Einblicke — Notizen aus unserer Entwicklungspraxis |
| `EN-010` | head.canonical | about | critical | https://rgt-global-seeded.vercel.app/en-US/about | https://rgt-global-seeded.vercel.app/hi-IN/about |
| `EN-011` | head.hreflang | pricing | major | hreflang set includes de-DE | hreflang set omits de-DE |
| `EN-012` | head.charset | events | critical | utf-8 | ISO-8859-1 |
| `EN-013` | header.contentType | events | critical | text/html; charset=utf-8 | text/html; charset=ISO-8859-1 |
| `EN-014` | header.contentLanguage | about | major | en-US | de-DE |
| `EN-015` | translation.hardcoded | home | critical | Operating across 14 countries. | Tätig in 14 Ländern weltweit. |
| `EN-016` | format.number | home | minor | 1,180 | 1180 |
| `EN-017` | format.currency | pricing | critical | $1,349 | 1.349,00 € |
| `EN-018` | format.date | blog.article (scaling-globally) | major | 12 February 2026 | 12.02.2026 |
| `EN-019` | format.date | events | major | 24 March 2026, 10:00 IST | 24/03/2026, 10:00 IST |
| `EN-020` | dom.ariaUntranslated | home | major | Primary navigation | Hauptnavigation |
| `EN-021` | translation.wrongLanguage | about | critical | Decisions are recorded with their reasoning, so the next engineer inherits the argument an… | Las decisiones se registran junto con su razonamiento, de modo que el siguiente ingeniero … |
| `EN-022` | translation.truncated | services | minor | Internal developer platforms, CI/CD, observability and the operational practice around the… | Internal developer platforms, CI/CD, observability and the… |
| `EN-023` | head.description | login | minor | Client portal access for existing RGT Global engagements. | _(empty)_ |
| `EN-024` | head.og | events | minor | Events and workshops | कार्यक्रम और कार्यशालाएँ |
| `EN-025` | translation.nullValue | events | major | All times are shown in the local time of the host city. | All times are shown in null. |
| `EN-026` | translation.rawKey | serverError | critical | Something went wrong | errors.serverError.title |
| `EN-027` | route.precedenceViolation | home | major | /?lang=de-DE resolves to /de-DE | /?lang=de-DE resolves to /en-US |
| `EN-028` | translation.concatenated | pricing | minor | Above 500 seats we price per organisation. Tell us your shape and we will quote. | Above 500 seats we price per organisation.  Tell us your shape and we will quote . |
| `EN-029` | dom.altTextUntranslated | blog.article (observability-budget) | major | Chart showing telemetry volume by service | Diagramm des Telemetrievolumens nach Dienst |
| `EN-030` | dom.placeholderUntranslated | contact | major | A short description of your platform and the problem | Eine kurze Beschreibung Ihrer Plattform und des Problems |
| `EN-031` | translation.hardcoded | home | major | Ship software that works in every market you enter | Ship software that works everywhere |
| `EN-032` | translation.hardcoded | contact | major | Send message | Get in touch today |
| `EN-033` | translation.icuSyntax | blog | critical | 3 articles | {count, plural, one {# article} other {# articles}} |
| `EN-034` | translation.byteOrderMark | about | minor | RGT Global began when four platform engineers left a large systems integrator, convinced t… | ﻿RGT Global began when four platform engineers left a large systems integrator, convinced … |
| `EN-035` | format.unitSystem | about | minor | Data halls run at 70 °F. | Data halls run at 21 °C. |
| `EN-036` | plural.agreement | pricing | major | 1 seat included | 1 seats included |
| `EN-037` | plural.placeholderLeak | pricing | major | Projects | Project(s) |
| `EN-038` | head.langMissing | events | critical | lang="en-US" | lang="" — present but empty |

### Traps — these must NOT be flagged

| ID | Kind | Route | Value | Why flagging it is a false positive |
|---|---|---|---|---|
| `EN-901` | trap.brandName | home | RGT Global | Company name. |
| `EN-902` | trap.brandName | pricing | CloudBridge | Product name. |
| `EN-903` | trap.versionString | home | Platform release 1.000 | A release number, not a quantity. Must not be rewritten to '1,000'. |
| `EN-904` | trap.productCode | pricing | 12/05/2024 | A product code shaped like a date. |
| `EN-905` | trap.legalEntity | home | RGT Global Technologies Pvt. Ltd. | Registered entity name — 'Pvt. Ltd.' is part of the legal name, not an untranslated abbrev… |
| `EN-906` | trap.internationalPhone | contact | +49 30 901820 | A correct German number in international format, shown on the US page because it is a real… |
| `EN-907` | trap.cognate | pricing | Team | Plan name, identical across all three locales by design. |
| `EN-908` | trap.loanword | services | Kubernetes | A technical product name, correctly identical in every locale. |
| `EN-909` | trap.loanword | services | CI/CD | An industry abbreviation left as-is in every locale. Also shaped oddly enough to confuse a… |
| `EN-910` | trap.taggedForeignQuote | home | RGT Global rebuilt our deployment pipeline in eleven weeks. We now release twice a day ins… | Explicitly tagged lang="en" and genuinely English. Correct on the English page and correct… |
| `EN-911` | trap.dottedIdentifier | services | Pipelines are declared in deploy.config.yaml at the repository root. | A configuration filename, not a resource key. Both are dotted lowercase identifiers, so a … |
| `EN-912` | trap.bracedLiteral | services | Pin a region explicitly, for example { "region": "eu-central-1" }. | A JSON snippet quoted as documentation. The braces are content, not an unresolved token, s… |
| `EN-913` | trap.nullInProse | services | A null region means the platform default is used. | The word null used as terminology in a sentence about configuration. NullOrUndefinedRender… |
| `EN-914` | trap.isoDate | about | Audit entries are stamped 2026-03-04 in every locale. | ISO-8601 is locale-neutral by design. Rewriting it to a locale pattern would be the defect… |
| `EN-915` | trap.ambiguousDate | about | Support contracts renew on 03/04/2026. | The same undecidable date under the opposite convention - if a rule guesses, one of these … |
| `EN-916` | trap.dottedAddress | about | The default gateway listens on 192.168.1.1. | An IPv4 address is four dotted groups of digits and is not a grouped number. It satisfies … |
| `EN-917` | trap.tableHeaderCount | pricing | 1 seat | "1 seat" is the pricing UNIT, not a count that disagrees with its noun. Bare "<n> <noun>" … |
| `EN-918` | trap.parentheticalPlural | contact | Please give your first name(s) and surname. | "first name(s)" is idiomatic English on a form for the same reason. |
| `EN-919` | trap.shortString | home | 14 | Two characters. Below any sane minimum length for language identification, so the rule mus… |

## hi-IN

### Defects

| ID | Kind | Route | Severity | Expected | Actual |
|---|---|---|---|---|---|
| `HI-001` | translation.rawKey | home | critical | संपर्क | nav.contact.label |
| `HI-002` | translation.placeholder | home | critical | हमें बताइए कि आपके प्लेटफ़ॉर्म में कहाँ दिक्कत है, और हम एक इंजीनियर भेजेंगे, विक्रेता नही… | हमें बताइए कि आपके प्लेटफ़ॉर्म में कहाँ दिक्कत है, और हम %s भेजेंगे। |
| `HI-003` | translation.marker | blog | critical | कोई लेख नहीं मिला | [missing translation] |
| `HI-004` | translation.nullValue | pricing | major | अतिरिक्त सीटों का बिल उसी दर पर लगता है। | अतिरिक्त सीटों का बिल undefined दर पर लगता है। |
| `HI-005` | translation.untranslated | about | critical | RGT Global की शुरुआत तब हुई जब चार प्लेटफ़ॉर्म इंजीनियरों ने एक बड़ी सिस्टम इंटीग्रेटर कंप… | RGT Global began when four platform engineers left a large systems integrator, convinced t… |
| `HI-006` | translation.missing | home | major | हमारे बारे में | About |
| `HI-007` | translation.wrongLanguage | services | critical | डेटा वेयरहाउस, स्ट्रीमिंग पाइपलाइन और वह गवर्नेंस जो उन्हें भरोसेमंद बनाए रखती है। | Entrepôts de données, pipelines de streaming et la gouvernance qui les rend fiables. |
| `HI-008` | translation.untranslated | home | major | हम वे आंतरिक प्लेटफ़ॉर्म बनाते हैं जिन पर आपकी उत्पाद टीमें तैनाती करती हैं, ताकि रिलीज़ ए… | हम वे आंतरिक प्लेटफ़ॉर्म बनाते हैं जिन पर आपकी उत्पाद टीमें तैनाती करती हैं, so releases s… |
| `HI-009` | translation.mojibake | events | critical | आप हमसे कहाँ मिल सकते हैं | आप हमसे कहाँ मिल सकते ह�ं |
| `HI-010` | translation.untranslated | about | minor | छोटी टीमें, लंबी परियोजनाएँ | छोटी teams, लंबी परियोजनाएँ |
| `HI-011` | translation.controlChar | blog | minor | सभी देखें | सभी‎ देखें |
| `HI-012` | translation.truncated | about | minor | 2009 में स्थापित, RGT Global चार लोगों की परामर्श कंपनी से बढ़कर तीन महाद्वीपों पर वितरण क… | 2009 में स्थापित, RGT Global चार लोगों की परामर्श कंपनी से बढ़कर… |
| `HI-013` | format.number | pricing | critical | ₹1,03,900 | ₹103900 |
| `HI-014` | format.currency | pricing | critical | ₹28,900 | $28,900 |
| `HI-015` | format.date | blog.article (observability-budget) | major | 3 फ़रवरी 2026 | February 3, 2026 |
| `HI-016` | format.time | events | major | 24 मार्च 2026, सुबह 10:00 बजे IST | 24 मार्च 2026, 10:00 AM IST |
| `HI-017` | format.phone | contact | major | +91 40 2345 6789 | 040-23456789 |
| `HI-018` | head.lang | pricing | critical | hi-IN | en |
| `HI-019` | head.title | events | major | कार्यक्रम और कार्यशालाएँ | Events and workshops |
| `HI-020` | head.description | about | minor | 2009 में स्थापित, RGT Global हैदराबाद, बर्लिन और टोरंटो में वितरण केंद्रों वाला एक वितरित … | _(empty)_ |
| `HI-021` | head.hreflang | blog | major | hreflang set includes en-US | hreflang set omits en-US |
| `HI-022` | head.canonical | home | critical | https://rgt-global-seeded.vercel.app/hi-IN | https://rgt-global-seeded.vercel.app/en-US |
| `HI-023` | header.contentLanguage | blog | major | hi-IN | en-US |
| `HI-024` | dom.clipped | events | major | event card titles wrap to their natural height | event card titles clipped at a fixed 2.6rem height |
| `HI-025` | translation.hardcoded | home | critical | ऐसा सॉफ़्टवेयर बनाएँ जो हर बाज़ार में काम करे | Ship software that works everywhere |
| `HI-026` | translation.hardcoded | home | major | 14 देशों में सक्रिय। | Tätig in 14 Ländern weltweit. |
| `HI-027` | dom.textInImage | blog.article (scaling-globally) | major | hero diagram carries no embedded text | hero diagram has English labels baked into the artwork |
| `HI-028` | route.notFoundUnlocalized | notFound | major | पृष्ठ नहीं मिला | Page not found |
| `HI-029` | dom.altTextUntranslated | blog.article (migration-without-freeze) | major | दो प्रणालियों के बीच क्रमिक ट्रैफ़िक स्थानांतरण का चित्रण | Illustration of traffic shifting gradually between two systems |
| `HI-030` | dom.placeholderUntranslated | contact | major | आपका पूरा नाम | Your full name |
| `HI-031` | translation.untranslated | contact | critical | कृपया एक वैध ईमेल पता दर्ज करें। | Please enter a valid email address. |
| `HI-032` | translation.concatenated | contact | minor | हमारे कार्यालय | हमारे कार्यालय . |
| `HI-033` | translation.hardcoded | contact | critical | संदेश भेजें | Get in touch today |
| `HI-034` | translation.hardcoded | pricing | major | सर्वाधिक लोकप्रिय | Most popular |
| `HI-035` | translation.icuSyntax | blog | critical | 3 लेख | {count, plural, one {# लेख} other {# लेख}} |
| `HI-036` | translation.byteOrderMark | about | minor | आज हैदराबाद, बर्लिन और टोरंटो के वितरण केंद्रों में हमारे 1,180 इंजीनियर कार्यरत हैं। हमार… | ﻿आज हैदराबाद, बर्लिन और टोरंटो के वितरण केंद्रों में हमारे 1,180 इंजीनियर कार्यरत हैं। हमा… |
| `HI-037` | head.byteOrderMark | services | major | <!doctype html> | ﻿<!doctype html> |
| `HI-038` | format.unitSystem | about | major | हमारा हैदराबाद परिसर हवाई अड्डे से 12 किमी दूर है। | हमारा हैदराबाद परिसर हवाई अड्डे से 7.5 मील दूर है। |
| `HI-039` | script.mismatch | about | critical | हमारी इंजीनियरिंग हैंडबुक प्रत्येक डिलीवरी केंद्र की स्थानीय भाषा में प्रकाशित होती है। | Hamari engineering handbook pratyek delivery centre ki sthaniya bhasha mein prakashit hoti… |

### Traps — these must NOT be flagged

| ID | Kind | Route | Value | Why flagging it is a false positive |
|---|---|---|---|---|
| `HI-901` | trap.brandName | home | RGT Global | Company name, deliberately in Latin script on the Hindi page. |
| `HI-902` | trap.brandName | pricing | CloudBridge | Product name in Latin script. A script-violation check that flags Latin characters on a De… |
| `HI-903` | trap.latinNumerals | home | 240 | Latin digits are the overwhelming convention in Hindi web content. Demanding Devanagari nu… |
| `HI-904` | trap.versionString | home | प्लेटफ़ॉर्म रिलीज़ 1.000 | A release number. Applying Indian digit grouping to it would produce nonsense. |
| `HI-905` | trap.productCode | pricing | 12/05/2024 | A product code, not a date. |
| `HI-906` | trap.legalEntity | home | RGT Global Technologies Pvt. Ltd. | The registered Indian entity name. Written in Latin script by law, on the Hindi page. |
| `HI-907` | trap.taggedForeignQuote | home | RGT Global rebuilt our deployment pipeline in eleven weeks. We now release twice a day ins… | An English original quoted verbatim and tagged lang="en". The adjacent note tells the read… |
| `HI-908` | trap.loanword | home | Email | Standard usage in Indian English-influenced Hindi UI copy. |
| `HI-909` | trap.cognate | pricing | Team | Plan name, identical across all three locales by design. |
| `HI-910` | trap.internationalPhone | contact | +1 416 555 0142 | A correct Canadian number for a real foreign office. An Indian phone pattern must not be a… |
| `HI-911` | trap.dottedIdentifier | services | पाइपलाइन रिपॉज़िटरी की जड़ में deploy.config.yaml में घोषित की जाती हैं। | A configuration filename, not a resource key. Both are dotted lowercase identifiers, so a … |
| `HI-912` | trap.bracedLiteral | services | क्षेत्र स्पष्ट रूप से निर्दिष्ट करें, उदाहरण के लिए { "region": "eu-central-1" }। | A JSON snippet quoted as documentation. The braces are content, not an unresolved token, s… |
| `HI-913` | trap.nullInProse | services | क्षेत्र का null मान होने पर प्लेटफ़ॉर्म का डिफ़ॉल्ट उपयोग होता है। | The word null used as terminology in a sentence about configuration. NullOrUndefinedRender… |
| `HI-914` | trap.foreignMeasurement | about | वार्षिक टीम ट्रेक कोलोराडो में 5-मील के ट्रेल पर चलता है। | Same near-miss in a second metric locale, so the rule cannot pass by special-casing German… |
| `HI-915` | trap.technicalTermInScript | about | OAuth और HTTPS डिफ़ॉल्ट रूप से समर्थित हैं। | OAuth and HTTPS are Latin in every script. A script check that counts out-of-range codepoi… |
| `HI-916` | trap.foreignCurrency | pricing | हमारी अमेरिकी इकाई द्वारा बिल किए गए ग्राहक $1,349 प्रति माह भुगतान करते हैं। | The same near-miss on a locale whose own symbol is a different glyph again. |
| `HI-917` | trap.shortString | home | 14 | Two characters. Below any sane minimum length for language identification, so the rule mus… |
