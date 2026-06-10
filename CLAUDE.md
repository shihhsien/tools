# NYC Restaurant Grade — project notes

Single-file static web app that looks up NYC Health Department (DOHMH)
inspection grades by restaurant name. Deployed on GitHub Pages.

**Live URL:** https://shihhsien.github.io/tools/nyc-restaurant-grade.html

---

## Definition of done — keep memory & skills in sync (read this first)

**Every change to this repo is incomplete until docs and skills match reality.**
Do these as part of the same task, not as a follow-up — never end a turn having
changed behaviour without also reconciling the items below. This is a standing
instruction: apply it automatically on every change, without being asked.

When you change **`nyc-restaurant-grade.html`**:
1. **Bump the version** in `<div class="ver">vX.Y.Z</div>` (patch = fix, minor =
   feature) and add a one-line entry under **Versioning → Notable versions**.
2. **Update "Current:"** in the Versioning section to the new version.
3. **Run the `test` skill** (`/test`) — it must end `N tests: N passed, 0 failed`.
4. If you added/changed behaviour, **add or update a test case** and reflect it in
   the **§Testing table** here AND the `test` skill (case count, assertion count,
   harness fixtures, and any fix-note for a new gotcha).
5. **Update the relevant architecture section** here (data flow, Maps parsing,
   palette/placard, etc.) so the prose matches the code.
6. If the change alters what the UI looks like, **run the `verify` skill** and
   confirm the screenshots.

When you change a **skill** (`.claude/skills/*/SKILL.md`): make sure its
`description`, case/assertion counts, harness template (fixtures + helpers), and
fix-notes still match the code and CLAUDE.md. The harness template must be
self-contained — a future agent copies it verbatim, so every fixture a test
references (e.g. `MAZZAT2`) must be declared in the template.

When you change **architecture or learn a new gotcha**: record it in the matching
section here (or under **Known gotchas**) in the same commit — don't leave it in
your head or only in the chat.

**Consistency invariants** (grep these when in doubt):
- Version string in HTML footer == "Current:" in CLAUDE.md.
- Test-case count and assertion count are identical in CLAUDE.md §Testing, the
  `test` skill `description`, and its "Run the full N-case…" / "Expected output"
  lines.
- Every test case in the §Testing table has a corresponding case in the suite.

---

## Files

- `nyc-restaurant-grade.html` — the entire app (HTML + CSS + JS, one file)
- `assets/` — PWA assets: `favicon.svg`, `favicon-16/32/48/180/192/512.png`, `manifest.json`
- `.github/workflows/pages.yml` — deploys on push to `main`
- `.githooks/check-consistency.sh` — enforces three invariants (see below)
- `.githooks/pre-push` — runs the consistency check before every push
- `.claude/settings.json` — runs the consistency check at every SessionStart
- `.claude/skills/test/` — Playwright test skill (45 cases, 161 assertions)
- `.claude/skills/verify/` — visual screenshot verification skill
- `.claude/skills/nyc-restaurant-grade-design/` — design system skill (tokens, components, UI kit)

## Deployment

Push to `main` → GitHub Actions builds → GitHub Pages serves.
No build step. The HTML file is served as-is.

Dev branch: `claude/nyc-restaurant-grade-SPLv9`

## Consistency guard

`.githooks/check-consistency.sh` enforces three invariants automatically:

1. HTML footer `vX.Y.Z` == `Current: **vX.Y.Z**` in this file
2. Test-case count matches across CLAUDE.md §Testing, test skill `description:`, and skill "Run the full N-case" line
3. Assertion count matches across CLAUDE.md §Testing and skill "Expected output" line

It runs in two places:
- **Pre-push** (via `.githooks/pre-push`) — aborts the push if anything is wrong. Git uses `.githooks/` via `core.hooksPath = .githooks` (set once per clone: `git config core.hooksPath .githooks`).
- **SessionStart** (via `.claude/settings.json`) — surfaces a warning at the top of every Claude Code session on this repo.

To run manually: `bash .githooks/check-consistency.sh`

---

## Architecture

### Data source

NYC Open Data / Socrata API (`43nn-pn8j`). SoQL query: match `upper(dba)`
with optional `street`, `boro`, or `zipcode` filter. Returns up to 200 rows,
deduplicated by `camis` (restaurant ID). Two things are tracked per restaurant:

- `latest` — the most recent inspection row (any type)
- `graded` — the most recent row that has a letter grade

These are separate because an inspection can happen without issuing a new grade.

`buildUrl`'s `$select` also fetches `phone`, `cuisine_description`, `nta`, `latitude`,
`longitude` (v1.16.0) — present on `43nn-pn8j` but previously unused. `cardHtml` renders
these (when non-empty) in a `.meta` line under the address: cuisine type as plain text,
phone as a `tel:` link formatted via `fmtPhone()` (`(212) 555-1234`), and a "Map ↗" link
to `maps.google.com/?q=LAT,LNG` when coordinates are present. `nta` (neighborhood) is
fetched but not yet displayed — reserved for a future enrichment.

### Maps link resolution

When the user pastes a Google Maps link, the app tries to extract the
restaurant name. Two cases:

**Full URL** (`google.com/maps/place/NAME/...` or `?q=NAME`) — name is in
the URL itself, resolved instantly with regex + URLSearchParams. No network.

**Short link** (`maps.app.goo.gl/CODE`) — must follow Google's redirect
server-side. Before resolving, `stripShortLinkQuery(url)` (v1.16.3) drops any
query string from `maps.app.goo.gl`/`goo.gl/maps` URLs — short codes carry the
destination entirely in the path, and a query string here is share-sheet
tracking cruft (e.g. iOS Shortcuts appends `?g_st=com.apple.shortcuts...`) that
can break the unshortener's redirect lookup. `google.com/maps` URLs are left
untouched, since their query string is where `?q=`/`?query=` live. Three
resolvers race via `Promise.any` with a 6 s timeout:

1. `viaMapu` → `mapu.retiolus.net/unshortener?link=URL`
   Returns `{ full_link }`. Purpose-built for maps.app.goo.gl, uses a
   real browser User-Agent to pass Google's bot detection.

2. `viaMicrolink` → `api.microlink.io/?url=URL`
   Headless Chromium service. Returns `{ data: { url, title } }`. Borough is mined
   via `boroFromAddr(data.url)`, falling back to `boroFromAddr(data.title)` (v1.16.1)
   when the resolved URL doesn't carry an address but the page title does.

3. `viaJina` → `r.jina.ai/URL`
   Headless browser. Returns plain text with `URL Source:` and `Title:` lines.

If all three fail, the app **automatically retries once** (these are serverless
services — first request often hits a cold-start timeout; the retry hits a warm
instance). If the retry also fails, show a "Short Maps links can't be expanded
here — Open it ↗" message with a tappable link.

### Name extraction pipeline

```
Maps URL / resolver response
        ↓
nameFromUrl(url)          — extracts from /maps/place/NAME, ?q=NAME, or ?query=NAME
        ↓
splitPlace(name, boro)    — splits "Name, 123 St, Brooklyn, NY 11231" on first comma;
                            mines trailing parts for borough via boroFromAddr(),
                            falling back to a 5-digit ZIP (v1.17.0) when no
                            borough name is found
        ↓
{ name, boro }            — name → #q input, boro → #loc input (boro may hold
                            either a borough name or a ZIP — #loc/buildUrl accept both)
```

`cleanTitle(raw)` strips " - Google Maps" suffix and rejects empty, Google-only,
URL-like (`http…`), query-string-like (`?`/`=`/`&`), and known **error-page
titles** (`JUNK_TITLE`: "Dynamic Link Not Found", "Page Not Found", "Not Found",
"Untitled", "Error", "Maps"). The error-title block matters because a dead/expired
`maps.app.goo.gl` short link resolves to Google's Firebase error page, whose
`<title>` is **"Dynamic Link Not Found"** — without the block, `viaMicrolink`
scrapes that title and the app searches DOHMH for "DYNAMIC LINK NOT FOUND".
`nameFromUrl` applies the same validity check to the `/maps/place/`, `?q=`, and `?query=`
extracted values — rejects coordinates (no letters), URL fragments, and short codes
containing query chars. This prevents resolver garbage (raw short codes, expanded
coordinate URLs, tracking params like `?g_st=ic`) from leaking into the name field.
The `?query=` fallback (v1.16.2) handles Google's `/maps/search/?api=1&query=NAME`
share-link format, which `?q=` alone misses — `URLSearchParams` keeps each param's
value clean of sibling tracking params (e.g. `&g_st=ic`), so no extra stripping is
needed once the right param name is checked.
`boroFromAddr(text)` regex-matches Brooklyn/Kings, Manhattan/New York NY, Queens, Bronx,
Staten Island/Richmond from any free-form address string.

### Progressive name fallback

When the DOHMH query returns 0 results, `search()` automatically retries with
one fewer word (dropping the last), repeating until it finds results or reaches
a single-word query. If the single-word query also returns 0, the "No active
record" message is shown for the last (shortest) name tried.

When the fallback fires and finds results, the status shows:
`N match(es) · official data · shortened from "ORIGINAL NAME"`

This solves the Google Maps vs. DOHMH naming mismatch: Maps often appends a
cuisine type ("Oita Sushi") while DOHMH has only the trading name ("OITA").

### Deep-link support

`?q=Name&loc=Borough` on the page URL auto-fills and searches on load.
Used by the iOS Shortcut recipe to bypass the short-link problem entirely.

`?maps=URL` passes a raw Google Maps URL (full or short link) directly to the
resolver pipeline on load. Used by the 2-action iOS Shortcut: **Receive URLs
from Share Sheet → Open URLs** with `?maps=` + Shortcut Input. The app parses
the value from `location.search` directly using `location.search.startsWith('?maps=')` +
`.slice(6)` (not `URLSearchParams.get('maps')`), so the Maps URL is read verbatim
without re-encoding — Shortcuts can pass an unencoded Maps URL without a URL
Encode action. The app then runs `onMapsLink()` on the value, following the same
resolver path (mapu → microlink → jina, with auto-retry) as manual paste.

---

## Address extraction from resolved Maps links (research note)

**Question investigated:** can the short-link resolvers be forced to return a full
*address* (street, borough, ZIP), not just the name? **Findings — the resolved URL
itself is the richest free, client-side source, not the resolver metadata:**

1. **`/maps/place/NAME/` path often already contains the full address.** Place-card
   shares encode it as comma segments: `/maps/place/Mazzat,+247+Smith+St,+Brooklyn,+NY+11231/`.
   `splitPlace` splits on the first comma and mines the borough from the rest, falling
   back to a `/\b\d{5}\b/` ZIP match (v1.17.0) when no borough name is found. Present
   for place-card shares, **absent** for dropped-pin / coordinate shares
   (`/maps/place/lat,+lng/` — correctly rejected by `isName`).

2. **`@lat,lng` is always present** on a resolved place URL. The only path to an
   address when the place path is name-only is **reverse geocoding** the coordinates.
   The free, no-key, CORS-enabled option is **Nominatim** (`nominatim.openstreetmap.org/reverse?format=jsonv2&lat=..&lon=..&zoom=18&addressdetails=1`)
   → returns `address.postcode` (ZIP) and `address.borough`. Hard limit **1 req/sec**;
   must send a `Referer` (browsers do automatically). The common "CORS error" is
   misdiagnosed rate-limiting — the endpoint sends `Access-Control-Allow-Origin: *`.

3. **`data=!...` protobuf yields no parseable address** — only coordinates (redundant
   with `@`) and opaque place/feature/KG IDs that need a keyed Google API to expand.
   Not worth decoding.

4. **microlink & Jina add little address value for Maps targets.** Google's Maps page
   is JS-hydrated and bot-blocked, so there's no clean address meta/JSON-LD to scrape.
   `viaMicrolink` runs `boroFromAddr(data.url)`, falling back to `boroFromAddr(data.title)`
   (v1.16.1) when the URL alone doesn't yield a borough — the title sometimes carries the
   address even when the URL doesn't. Street-level data from these services is still
   unreliable. microlink *does* support free CSS-selector DOM scraping via
   `&data.X.selector=…&data.X.attr=textContent` GET params (50/day, no key), but selectors
   against Google's obfuscated Maps DOM are brittle.

**Recommended tiered design if this is ever built** (deferred — not implemented):
parse the place path for street/borough/ZIP → else regex `@lat,lng` and call Nominatim
→ keep microlink/Jina as name-only resolvers. Adding Nominatim means a new network
dependency and a new mocked test case.

---

## Deep research findings (June 2026) — next-step candidates

Verified facts from a 5-agent fan-out research run (sources in session transcript):

**Data enrichment:**
- **`43nn-pn8j` already has unselected columns**: `latitude`, `longitude`, `phone`,
  `cuisine_description`, `community_board`, `council_district`, `census_tract`,
  `bin`, `bbl`, `nta`. Widening `$select` is the cheapest enrichment — no new
  dependency. Coordinates from the dataset also remove any geocoding need for
  forward enrichment (Overpass bbox, "open in Maps" pin).
- **Nominatim** (re-verified 2026): 1 req/s, browser Referer satisfies the ID
  requirement, CORS on success but **absent on 403/429** (rate-limit looks like a
  CORS error), returns `postcode`; for borough check `address.borough || suburb ||
  city_district` + county→borough map. Requires ODbL attribution in footer.
- **Photon** (`photon.komoot.io/reverse`) — best no-key fallback, CORS-open,
  returns `postcode`; demo server, no SLA.
- **BigDataCloud is DISALLOWED for this app**: its fair-use policy permits only
  live device-GPS coordinates; feeding it coordinates parsed from a Maps URL
  violates policy (HTTP 402 + IP bans).
- **US Census geocoder**: reverse returns geographies only (no street/ZIP), JSONP
  not CORS — not useful.
- **Socrata sends CORS `*` platform-wide** (incl. data.ny.gov) → NYS Liquor
  Authority active-licenses joinable by address; data.ny.gov also mirrors
  `43nn-pn8j` (free failover instead of corsproxy.io). Keyless Socrata shares a
  throttled per-IP pool; a free app token lifts to ~1000 req/hr.
- **Overpass**: main instance fine from browsers (residential IPs) but has been
  blocking cloud-IP ranges in 2026; `overpass.kumi.systems` mirror historically
  lacked CORS headers — must live-check before use. NYC `opening_hours`/`website`
  tag coverage is unmeasured; treat as best-effort.

**Maps link reliability (2026 status):**
- `maps.app.goo.gl` still alive and redirecting (verified via GitHub issues from
  Jan–May 2026). No new Google API or client-side trick exists; whatwg/fetch #601
  (expose redirect Location) still unadopted.
- mapu.retiolus.net: alive; single-hobbyist project (source:
  codeberg.org/retiolus/gmapsUnshortener), ~zero adoption — highest longevity risk.
- microlink: still 50 req/day free; rotating-proxy (which dodges IP blocks) is
  Pro-only (€39/mo).
- Jina Reader: keyless = 20 req/min; free API key = 200 RPM. Still viable.
- **Cloudflare Workers remains the right self-host plan**: free tier still 100k
  req/day, ~zero cold starts (would eliminate the auto-retry hack for the Worker
  path), no card needed. Avoid Deno Deploy (Classic shuts down July 20 2026 +
  company turbulence); Cloudflare Snippets are paid-plan-only; fly.io has no free
  tier. Val Town (~100k runs/day free) is a fine second resolver for diversity.

**Accessibility (contrast math locally verified):**
- **White-on-C-orange (`#e07d2a`) = 2.94:1 — fails even the 3:1 large-text
  minimum.** Affects the C grade chip and C placard letter. Darkening the orange
  slightly (≈`#d97320` or darker) clears 3:1.
- Small `.grade-hist` chips (white text, not large) need 4.5:1: B green = 4.26
  (fail), C orange = 2.94 (fail). A blue = 7.07 (pass).
- A-blue `.score-fill` on card = 2.47:1 (< 3:1 UI-component guideline; arguably
  exempt since the numeric score is adjacent text).
- `#status` should get `role="status"` (it already exists in the DOM at load —
  the hard part is done). VoiceOver won't re-announce identical strings (append
  zero-width space to force re-announcement). Do NOT add `role="button"`/
  `aria-expanded` to `<summary>` — native semantics already map them; extra ARIA
  causes double announcements. Keep a visible disclosure marker.
- iOS: home-screen web apps get **isolated localStorage** — `tip-v2` dismissed in
  Safari won't carry into a standalone instance. iOS 26 opens every
  added-to-home-screen site as a web app by default. Shortcuts "Open URLs"
  appears to honor the default-browser setting (explains "works in Chrome, not
  Safari" — likely the user's default browser is Chrome; a Safari-specific
  failure is more likely a stale standalone instance than an engine difference,
  since iOS Chrome is WebKit).

---

## JS code map

The `<script>` is organised into labelled sections:

| Section | Key functions |
|---|---|
| Config & DOM | constants, cached element refs |
| Small helpers | `decode`, `setStatus`, `setError`, `gradeClass`, `fmtDate`, `fmtPhone` |
| NYC DOHMH API | `buildUrl`, `getJSON` (with corsproxy.io fallback) |
| Violation-code categories | `splitCsvLine`, `parseViolCsv`, `loadViolCodes` (best-effort CSV enrichment) |
| Rendering | `groupByRestaurant`, `gradeContextHtml`, `scoreBarHtml`, `violationsHtml`, `historyHtml`, `closureBannerHtml`, `cardHtml`, `placardHtml`, `render` |
| Search | `search` |
| Maps parsing | `stripShortLinkQuery`, `nameFromUrl`, `cleanTitle`, `boroFromAddr`, `splitPlace`, `timeoutFetch`, `viaMapu`, `viaMicrolink`, `viaJina`, `resolveMapsLink` |
| Wiring | `onMapsLink` (with auto-retry), event listeners, deep-link init on load |

---

## Grade palette & placard (v1.13.0)

Grade colors use the **authentic NYC DOHMH window-card palette**, not the old
traffic-light scheme. No red anywhere — even a C is a calm orange.

| Grade | Color token | Hex | Points | (old traffic-light) |
|---|---|---|---|---|
| A | `--A` | `#1f57a6` blue | 0–13 | was `#16a34a` green |
| B | `--B` | `#2f8b4e` green | 14–27 | was `#ca8a04` amber |
| C | `--C` | `#c96f20` orange | 28+ | was `#dc2626` red |

`placardHtml(grade)` renders the iconic white DOHMH window card (header
"Sanitary Inspection / Grade", giant letter in the grade ink color, footer
"NYC Dept of Health & Mental Hygiene"). `render()` shows it as a **hero element
only when exactly one restaurant matches** (`groups.length === 1`); multi-result
lists use the compact `.grade` chips in each card. An unknown/pending grade
renders a "Grade Pending" placard in near-black `#1a1a1a` with a thin border.

The `.pending` status color is `var(--muted)` (grey), **not** `var(--B)` — amber
no longer signals "pending" now that it means a genuine B grade.

### Contrast fixes (v1.16.0)

White text on the original `--C` (`#e07d2a`) was 2.94:1 — failing even the 3:1
large-text floor for the `.grade.C` chip and the C placard letter. `--C` was
darkened to `#c96f20` (3.63:1 with white), which clears 3:1 for those large-text
uses. `.viol-crit`'s tinted background was updated to match (`rgba(201,111,32,.15)`).

The small `.grade-hist` history chips (22px, 11px bold — not "large text," needs
4.5:1) are a separate problem: the *original* B green was 4.26:1 and C orange was
2.94:1, both failing 4.5:1, and `--C: #c96f20` alone wouldn't fix the C chip either
(3.63:1). So `.grade-hist.B` and `.grade-hist.C` use **dedicated darker
backgrounds** (`#21703e` → 6.08:1, `#a05819` → 5.38:1) instead of `var(--B)`/`var(--C)`
— do not collapse these back to the shared variables.

`#status` now has `role="status"` so screen readers announce search results and
errors automatically.

---

## Card detail panels (v1.15.0)

Each result card carries four data-dense panels below the grade line, all fed
by fields `groupByRestaurant` collects per restaurant. `buildUrl`'s `$select`
includes `violation_code` so the violation chips can show the code.

`groupByRestaurant(rows)` folds rows by `camis` and, per restaurant, derives:
- `allRows` — every inspection row for the restaurant
- `violations` — rows on the **latest inspection date** that have a
  `violation_description`, mapped to `{ desc, flag, code }`
- `history` — one row per distinct `inspection_date` (graded row preferred when
  a date has both), newest first, capped at the last **6**
- `latestClosure` / `currentlyClosed` — most recent `action` containing
  `Closed by DOHMH`; `currentlyClosed` is true unless a later row's `action`
  includes `re-opened` (case-insensitive)

The four render helpers:

1. **`scoreBarHtml(score, grade)`** — a 4px bar with the fill width = `score/40`
   (capped at 100%) and tint = `gradeClass(grade)` (`--A/--B/--C`). Tick marks at
   35% (B, 14 pts) and 70% (C, 28 pts). A contextual `.score-note` appears near a
   boundary: "Excellent" (A, ≤5), "N pt(s) from B" (11–13), "N pt(s) from C" (B, 24–27).
   Returns `''` for a non-numeric score.

2. **`violationsHtml(violations)`** — a collapsed `<details class="viols">`. Summary
   shows `N violation(s)` plus `· M critical` when any are critical. Items are sorted
   **critical-first**; each shows a flag chip (`.viol-crit` orange / `.viol-ncrit`
   grey), the `.viol-code`, and the description. Empty list → a `.no-viols` checkmark
   row instead ("✓ No violations at last inspection").

3. **`historyHtml(history)`** — a collapsed `<details class="hist-wrap">` with one
   `.hist-row` per inspection (date, grade chip or "Closed", score, shortened type).
   Renders **only when `history.length >= 2`** (a single inspection adds nothing).

4. **`closureBannerHtml(latestClosure, currentlyClosed)`** — a red `.closure-banner`
   ("⚠ Closed by DOHMH · DATE") shown at the top of the card **only when
   `currentlyClosed`**. This is the only place red is used in the app.

All four run every field through `htmlEsc()` (XSS guard extends to the new fields).

---

## Grade context & explainer (v1.18.0)

Two pieces of plain-English interpretation, both content-only (no behaviour change to
search/resolve):

1. **Per-card grade-context line.** `cardHtml` renders a `.grade-ctx` line under the grade
   line. For a graded row it's `gradeContextHtml(grade)` — a lookup in `GRADE_CONTEXT`
   (A = "Cleanest tier (0–13 points). About 9 in 10 NYC restaurants earn an A.", B/C
   analogues). When there's no grade on record it shows `PENDING_CONTEXT` instead
   (explains that a below-A result is re-inspected before a letter is posted). An unknown
   letter falls through `GRADE_CONTEXT` to `''`.

2. **Static "What do these grades mean?" panel.** A `<details class="about" id="about">`
   lives permanently in the body (after `#results`), collapsed by default — so it needs no
   search and no JS. It covers: lower-is-better scoring (A 0–13 / B 14–27 / C 28+), critical
   vs. upkeep violations, "~9 in 10 get an A so a B/C is informative, but score matters as
   much as the letter near the cutoff", what Grade Pending and Closed-by-DOHMH mean, the
   sliding inspection cycle, and the CDC Salmonella-decline finding, with a source link to
   the NYC Health grading FAQ. Facts are sourced from the June 2026 grading-semantics
   research run (see session transcript / the research notes above).

## Violation-code categories (v1.18.0)

Best-effort enrichment that labels each violation with a plain-English category. `loadViolCodes()`
fetches NYC Health's public reference CSV
(`raw.githubusercontent.com/nychealth/Food-Safety-Health-Code-Reference/main/Violation-Health-Code-Mapping.csv`
— keyless, CORS-open). `parseViolCsv` locates the `Violation_Code` and `Category_Description`
columns **by name** (tolerant to reordering; `splitCsvLine` handles quoted commas; a leading BOM
is stripped) and builds `violCodeMap` = `{ CODE -> category }`. `violationsHtml` adds a `.viol-cat`
label per violation when its `code` maps.

The load is **primed on page load** and `await`ed once at the top of `search()` (cached via
`violCodePromise`, so later searches don't refetch). Every failure mode degrades silently to
`{}` — fetch error, non-200, missing columns, or a schema that doesn't match all just mean **no
category label**, never a broken card. Because the sandbox can't reach the CSV (and the research
agent couldn't fetch the raw file either — the column names are from search snippets, not a direct
read), **the live rendering of `.viol-cat` is unverified** and must be confirmed on the deployed
page; if the real CSV's columns differ, tighten `parseViolCsv`'s column-matching.

---

## The Google bot-blocking problem

**Do not re-research this** — it has been thoroughly investigated.

`maps.app.goo.gl` links return HTTP 302 for real browser requests and
HTTP 403 (`x-deny-reason: host_not_allowed`) for datacenter/bot requests.

> **Correction (June 2026 deep research):** the `x-deny-reason: host_not_allowed`
> 403 above was observed **from inside the Claude Code sandbox**, and that exact
> header is the signature of the **Anthropic sandbox egress proxy**, not Google
> (it appears verbatim in anthropics/claude-code issue reports about the proxy,
> e.g. issue #41741). Public GitHub projects resolve `maps.app.goo.gl` redirects
> from GCP, Vercel, and Cloudflare Worker datacenter IPs with a browser UA and no
> 403 handling (e.g. ElmerProject/CoordinatesTool worker.js, htongyai/Wonwon).
> Whether Google blocks *some* datacenter ranges is unproven either way — but the
> Cloudflare Worker plan below is more likely to work than this section implies.
> **Never test this from the sandbox; deploy and test from a real browser.**
> The CORS-proxy blocklists below remain independently true.

Every major free CORS proxy explicitly blocklists `maps.app.goo.gl`:
- `allorigins.win` — blocked
- `corsproxy.io` — blocked
- `jina.ai` — blocked
- `microlink.io` — intermittently blocked (IP-dependent)

Client-side workarounds that do NOT work:
- `fetch(url, { redirect: 'manual' })` in the browser — CORS hides the
  Location header for cross-origin responses; spec-level restriction
- Service workers — same CORS restriction applies
- Web Share Target API — receives content, can't resolve a URL
- Firebase DL `?d=1` debug param — returns an HTML flowchart, not parseable
- Firebase DL REST API — requires an API key for all resolution operations

**maps.app.goo.gl links are NOT going away.** Google explicitly preserved
links generated by its own apps when Firebase Dynamic Links shut down on
August 25 2025. New Maps shares still generate these links.

**The next step if mapu.retiolus.net fails:**
Deploy a free Cloudflare Worker. Workers can set a real browser User-Agent
on outbound `fetch()` and read the `Location` header with `redirect: 'manual'`.
Free tier: 100 k req/day. Exact Worker code:

```js
export default {
  async fetch(req) {
    const short = new URL(req.url).searchParams.get('url') || '';
    if (!short.includes('maps.app.goo.gl'))
      return new Response('bad input', { status: 400 });
    const res = await fetch(short, {
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    const location = res.headers.get('Location') || '';
    return new Response(JSON.stringify({ location }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};
```

Deploy at `workers.dev` (free subdomain). Add as a new resolver:
```js
async function viaWorker(url) {
  const res = await timeoutFetch('https://YOUR-WORKER.workers.dev/?url=' + encodeURIComponent(url));
  if (!res.ok) throw 0;
  const { location } = await res.json();
  const name = nameFromUrl(location);
  if (!name) throw 0;
  return { name, boro: boroFromAddr(location) };
}
// Then add viaWorker(url) to the Promise.any([...]) call in resolveMapsLink.
```

---

## iOS Shortcut recipe

Lets the user tap **Share → NYC Grade** from inside Google Maps and have
the grade load automatically. Resolves the short link on-device (real browser
session), bypassing Google's bot block entirely.

**Simple version (always works):**
1. Shortcuts → **+** → name it **NYC Grade**
2. Tap **ⓘ** → enable **Show in Share Sheet** → URLs checked → Done
3. Actions in order:
   - **Receive** URLs from Share Sheet (if no input → Ask For Input)
   - **Ask for Input** — Prompt: `Restaurant name?` (pre-fill with Shortcut Input)
   - **URL Encode** the input
   - **Open URLs** → `https://shihhsien.github.io/tools/nyc-restaurant-grade.html?q=` + encoded text

The `?q=` deep-link auto-fills the name field and fires the search on load.

---

## Testing

Tests use Playwright (installed at `/opt/node22/lib/node_modules/playwright`).
Write tests in `test.mjs`, run with `node test.mjs`, delete after pushing.

Pattern:
```js
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import { pathToFileURL } from 'url';
const { chromium } = pw;
const BASE = pathToFileURL(process.cwd() + '/nyc-restaurant-grade.html').href;

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();

// Route BEFORE navigating so load-time fetches (deep-link auto-search) are captured.
// Pass file:// requests through; mock all http(s).
await page.route('**/*', route =>
  route.request().url().startsWith('file:') ? route.continue() : yourHandler(route));
await page.goto(BASE, { waitUntil: 'load' });
```

Mock network responses with `route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) })`.

**Required test cases (45 cases, 161 assertions — all must pass):**

| # | What | Key assertion |
|---|------|---------------|
| 1 | Version footer | `.ver` text === `vX.Y.Z` |
| 2 | No JS errors on bare load | `pageerror` events = 0 |
| 3 | Empty search guard | status includes "Enter a restaurant name" |
| 4 | Basic search — card, name, grade, status, placard | `.name`, `.grade`, "1 match"; `.placard-wrap` present (single result) |
| 5 | No results | status includes "No active record"; no `.placard-wrap` |
| 5b | Placard hidden for multiple results | 2 cards shown; no `.placard-wrap` |
| 6 | Apostrophe SoQL escaping + display | captured URL has `MIA''S`; display/status has no `''` |
| 7 | Smart quote (U+2019) normalized | captured URL has `MIA''S` |
| 8 | Full Maps URL `/maps/place/` — no resolver calls | resolver routes never hit; `#q` filled; card shown |
| 9 | Full Maps URL `?q=` — no resolver calls | `#q` filled; card shown |
| 10 | Coordinate URL (`?q=40.7580,-73.9855` — no letters) rejected | DOHMH not called; error with Open link |
| 11 | Query-string garbage (`qMJf…?g_st=ic`) rejected | DOHMH not called; error with Open link |
| 12 | Short link: viaMapu success | mock mapu → card shown |
| 13 | Short link: viaMicrolink success | mock microlink → card shown |
| 14 | Short link: viaJina success | mock jina text → card shown |
| 15 | Auto-retry on cold start (mapu) | mapu called twice; card shown on 2nd attempt |
| 16 | All resolvers fail → error with Open link | error text + link to original URL |
| 17 | Deep link `?q=Name&loc=Borough` | both fields pre-filled; auto-searched |
| 18 | Borough extracted from resolver place name | `Mazzat, Brooklyn, NY` splits to name=Mazzat, loc=BROOKLYN |
| 19 | Enter key on Maps input triggers resolution | set value, press Enter, card shown |
| 20 | Progressive fallback finds results after word-drop | 2 DOHMH calls; status has "shortened from" + original name |
| 21 | Prime symbol (U+2032) normalized and escaped for SoQL | captured URL has `MIA''S`; status has no `''` |
| 22 | Apostrophe in `loc` field gets SoQL-escaped | captured URL has `O''NEIL` in the `$where` clause |
| 23 | Firebase "Dynamic Link Not Found" error title rejected | DOHMH not called; `#q` stays empty; error with Open link |
| 24 | XSS in API data is escaped, not executed | malicious `dba` `<img onerror>` → payload never fires; no injected `<img>`; `.name` shows literal markup as text |
| 25 | iOS Shortcut tip (visibility, toggle, dismiss, persistence) | tip shown on iOS UA; starts collapsed; toggle opens/closes; dismiss hides + sets `localStorage`; hidden on reload after dismiss; hidden on non-iOS UA |
| 26 | `?maps=URL` deep link — unencoded (raw Shortcuts pass-through) | pass unencoded short link as `?maps=`; mock mapu → card shown; name correct |
| 27 | `?maps=URL` deep link — encoded (4-action Shortcuts workflow) | pass `encodeURIComponent(shortLink)` as `?maps=`; mock mapu → card shown; status "1 match" |
| 28 | viaMicrolink cold-start retry | mapu/jina always fail; microlink: fail call 1, succeed call 2; `mlCalls === 2`; card shown |
| 29 | viaJina cold-start retry | mapu/microlink always fail; jina: fail call 1, succeed call 2; `jinaCalls === 2`; card shown |
| 30 | splitPlace strips ZIP from name | mapu returns place URL with full address; `#q` = `MAZZAT`; `#loc` has borough; `#q` has no ZIP |
| 31 | Multi-result status shows count | 2 fixtures → 2 cards; status includes `2 match` |
| 32 | `?q=` deep link without loc | `?q=MAZZAT` only; `#q` = `MAZZAT`; `#loc` empty; card shown |
| 33 | Score bar renders with grade-colored fill and boundary note | `.score-bar-wrap` present; `.score-fill-A` present; `.score-note` shows "N pt(s) from B" for score 13 |
| 34 | Violation list — critical chips, count label, sorted critical-first | `.viols` present; summary "2 violations · 1 critical"; 2 `.viol-item`; first item is `.viol-crit`; `.viol-code` shown |
| 35 | No violations → clean checkmark row | `.no-viols` present; no `.viols` details |
| 36 | Inspection history timeline shown for multiple inspections | `.hist-wrap` present; N `.hist-row` matching inspection count |
| 36b | History hidden for a single inspection | no `.hist-wrap` when only one inspection date |
| 37 | Closure banner shown when currently closed | `.closure-banner` present; text mentions "Closed by DOHMH" |
| 37b | Closure banner cleared after a later re-open action | no `.closure-banner` when a re-opened action follows the closure |
| 38 | Card meta line (cuisine, phone, map link) + `role="status"` | `.meta` text includes cuisine; `.meta a[href^="tel:"]` text is formatted phone; `.meta a[href*="maps.google.com"]` href includes lat/lng; `#status` has `role="status"` |
| 39 | viaMicrolink falls back to title for borough when URL has none | mock microlink `data.url` with no borough + `data.title` containing "Brooklyn, NY"; `#loc === 'BROOKLYN'`; card shown with name MAZZAT |
| 40 | nameFromUrl extracts from `/maps/search/?api=1&query=NAME` | full URL via `triggerMaps`, no resolver call; `#q` filled with MAZZAT; card shown |
| 41 | stripShortLinkQuery drops tracking query string from short links | short link with `?g_st=...` via `triggerMaps`; captured `mapu` request URL has no `g_st`; card shown |
| 42 | splitPlace falls back to ZIP when no borough is found in the address | mapu returns place URL with address lacking a borough name but containing a 5-digit ZIP; `#loc === '11231'`; card shown |
| 43 | "What do these grades mean?" explainer panel (static) | `#about` present and collapsed; text includes `0–13` + "lower is better" + mentions "Grade Pending" and "Closed by DOHMH" |
| 44 | Per-card grade-context line (A tier) | `.grade-ctx` present; text mentions "9 in 10" |
| 44b | Pending context line when no letter grade | row with `grade:null` → `.grade-ctx` present; text mentions "re-inspected" |
| 45 | Violation category label from reference CSV | mock `raw.githubusercontent.com` CSV; violation `04L` → `.viol-cat` text === "Vermin / Pests" |
| 45b | Violation category degrades gracefully when CSV unavailable | mock CSV → `E`; `.viol-item` still renders; no `.viol-cat` |

**Mocking notes:**
- `E = { status: 503, ct: 'text/plain', body: 'error' }` for resolver failures
- `J(rows)` for DOHMH JSON responses
- `TX(text)` for Jina plain-text responses
- For auto-retry (test 15): track `mapuCalls` counter; return 503 on call 1, success on call 2
- For deep-link tests (test 17): pass `pageUrl = BASE + '?q=Name&loc=Borough'` to the test runner
- For progressive fallback (test 20): check `u.includes('SUSHI')` (not `decodeURIComponent(u).includes('OITA SUSHI')`) — URLSearchParams encodes spaces as `+`, so the decoded URL still has `+` after `decodeURIComponent`. Shared counter variables must be declared outside both `setup` and `fn` closures (they run in separate scopes within `T()`).
- For the Firebase junk-title test (test 23): mock `microlink.io` to return `{ data: { url: '…?q=40.6,-73.9', title: 'Dynamic Link Not Found' } }`, `mapu` to coordinates only, `jina` to empty. Assert DOHMH (`43nn-pn8j`) is never called and `#q` stays `''`.
- For tests 6, 7, 21, 22 (apostrophe/prime URL escaping): `URLSearchParams` encodes `'` as `%27`, so `capturedUrl.includes("MIA''S")` fails — use `decodeURIComponent(capturedUrl).includes("MIA''S")`. Unlike spaces (encoded as `+`, not decoded by `decodeURIComponent`), apostrophes ARE decoded by it.
- For the XSS test (test 24): `dba` is `<img src=x onerror="window.__xss=1">EVIL CAFE`. Seed `window.__xss = 0` via `page.addInitScript` before load, then assert it stays `0` (the `onerror` never fires because `htmlEsc` turns `<` into `&lt;`), no `.card img` element exists, and `.name` textContent contains the literal `<img` string. Guards `htmlEsc()` in `cardHtml`.
- For the iOS tip test (test 25): use `browser.newContext({ userAgent: IOS_UA })` where `IOS_UA` is an iPhone UA string. The dismiss key is `tip-v2`. For the "tip hidden after dismiss on reload" sub-test, pre-seed localStorage via `page.addInitScript(() => localStorage.setItem('tip-v2', '1'))` BEFORE `page.goto()` — calling `page.evaluate()` before goto causes `SecurityError: Access is denied` on `file://` pages. Sub-tests share a browser instance (single `chromium.launch`) but each use a fresh context; jsErrs are collected across all sub-tests. **Critical for dismiss sub-test:** `#tip-dismiss` is inside `#tip-body` which starts hidden — click `#tip-toggle` first to open the body, wait for it to be visible, then click `#tip-dismiss`. Clicking a hidden button times out.
- For the `?maps=` deep-link tests (26–27): set up route in `setup` before `goto` so load-time resolution is captured. Test 26 passes the URL unencoded (`BASE + '?maps=https://maps.app.goo.gl/TEST'`); test 27 passes it encoded (`BASE + '?maps=' + encodeURIComponent('https://maps.app.goo.gl/TEST')`). Both should work since the app does `decodeURIComponent()` on the value.
- For microlink/jina retry tests (28–29): mock the other two resolvers as always-fail (`E`); use a shared counter outside setup/fn; return `E` on call 1 and success on call 2. `Promise.any` is called twice (once per `onMapsLink` attempt), so counters accumulate across both.
- For splitPlace ZIP test (test 30): mock mapu to return `{ full_link: 'https://www.google.com/maps/place/Mazzat,+247+Smith+St,+Brooklyn,+NY+11231/@40.67,-73.99' }`. Assert `#q.toUpperCase() === 'MAZZAT'` (not the full comma-separated string), `#loc` contains `BROOKLYN`, and `#q` does not include `11231`.
- For multi-result status test (test 31): mock DOHMH to return `[MAZZAT, MAZZAT2]`. Assert `(await p.$$('.card')).length === 2` and status includes `2 match`.
- For bare `?q=` test (test 32): pass `pageUrl = BASE + '?q=MAZZAT'` with no `&loc=`. Assert `#loc` value is empty string.
- For the v1.15.0 card-detail tests (33–37b): these are plain DOHMH searches (`#q` fill + `#go` click) — no resolvers. The `mkRow` fixture needs a `violation_code: null` default. Multi-row fixtures share one `camis` so `groupByRestaurant` folds them into a single restaurant; rows for the same `inspection_date` become the violation list, distinct dates become history.
- For the score-bar test (test 33): use `score:'13'` (one point under the B threshold) so `scoreBarHtml` emits the "1 pt from B" note. Assert `.score-fill-A` exists (fill class follows `gradeClass(grade)`) and `.score-note` text matches `/from B/`.
- For the violations test (test 34): two rows, same `camis`/`inspection_date`, one `critical_flag:'Critical'` and one `'Not Critical'`, each with a `violation_code` and `violation_description`. Assert `.viols-summary` text is `2 violations · 1 critical`, exactly 2 `.viol-item`, and `.viol-item:first-child .viol-flag` has class `viol-crit` (critical sorted first).
- For the clean test (test 35): single row with `violation_description:null` → `groupByRestaurant` produces an empty `violations` array → `violationsHtml` returns the `.no-viols` checkmark row, no `.viols` `<details>`.
- For the history tests (36/36b): `historyHtml` renders only when `history.length >= 2`. Test 36 uses three rows with distinct `inspection_date`s (assert 3 `.hist-row`); test 36b uses a single inspection (assert no `.hist-wrap`).
- For the closure tests (37/37b): closure is detected by `action.includes('Closed by DOHMH')` and cleared only if a later row's `action` includes `re-opened` (case-insensitive) with a greater `inspection_date`. Test 37 has a lone closure row (assert `.closure-banner` present); test 37b adds a later re-opened row (assert `.closure-banner` absent).
- For the card meta test (test 38, v1.16.0): mock a row with `cuisine_description:'Japanese'`, `phone:'2125551234'`, `latitude:'40.7580'`, `longitude:'-73.9855'`. Assert `.meta` textContent includes `Japanese`; `.meta a[href^="tel:"]` textContent === `(212) 555-1234` (via `fmtPhone`); `.meta a[href*="maps.google.com"]` href includes `40.7580,-73.9855`; and `#status` `getAttribute('role') === 'status'`.
- For the microlink title-borough-fallback test (test 39, v1.16.1): trigger a `maps.app.goo.gl` short link via `triggerMaps`. Mock `mapu.retiolus.net` and `jina.ai` as always-fail (`E`). Mock `microlink.io` to return `{ data: { url: 'https://www.google.com/maps/place/Mazzat/@40.6840,-73.9970,17z', title: 'Mazzat - Brooklyn, NY - Google Maps' } }` — note the `data.url` has no borough (no comma-separated address segment), but `data.title` has "Brooklyn, NY". Mock `43nn-pn8j` to `J([MAZZAT])`. Wait for `.card`, then assert `#loc` value `=== 'BROOKLYN'` (proves `boroFromAddr(data.title)` fallback fired since `boroFromAddr(data.url)` finds nothing) and `.name === 'MAZZAT'`.
- For the `?query=` param test (test 40, v1.16.2): trigger `https://www.google.com/maps/search/?api=1&query=Mazzat&g_st=ic` via `triggerMaps`. Mock only `43nn-pn8j` to `J([MAZZAT])` — no resolver routes should be hit, since `nameFromUrl` resolves `?query=` directly without a network call. Wait for `.card`, then assert `#q` (uppercased) `=== 'MAZZAT'` and `.name === 'MAZZAT'`.
- For the `stripShortLinkQuery` test (test 41, v1.16.3): trigger `https://maps.app.goo.gl/TEST?g_st=com.apple.shortcuts.Run-Workflow.(null)` via `triggerMaps`. Mock `mapu.retiolus.net` with a function handler that captures the request URL and returns `J({ full_link: 'https://www.google.com/maps/place/Mazzat/@40.6840,-73.9970,17z' })`; mock `microlink.io`/`jina.ai` as always-fail (`E`); mock `43nn-pn8j` to `J([MAZZAT])`. Wait for `.card`, then assert the captured `mapu` URL's `link` param (decoded) does NOT include `g_st`, and `.name === 'MAZZAT'`.
- For the splitPlace ZIP-fallback test (test 42, v1.17.0): mock mapu to return `{ full_link: 'https://www.google.com/maps/place/Mazzat,+247+Smith+St,+11231/@40.67,-73.99' }` — note the address has no borough keyword (no "Brooklyn"/"Manhattan"/etc), only a 5-digit ZIP. Mock `microlink.io`/`jina.ai` as always-fail (`E`); mock `43nn-pn8j` to `J([MAZZAT])`. Wait for `.card`, then assert `#loc === '11231'` (proves the ZIP fallback in `splitPlace` fired since `boroFromAddr` found nothing) and `.name === 'MAZZAT'`.
- For the about-grades panel test (test 43, v1.18.0): static — `setupRoute(p, [])`, no search. Assert `#about` present, `el.open === false`, and its `textContent` includes `0–13` (use an en dash, not a hyphen — it must match the HTML) and `lower is better`, and mentions both `Grade Pending` and `Closed by DOHMH`.
- For the grade-context tests (tests 44/44b, v1.18.0): plain DOHMH search. Test 44: `J([MAZZAT])` (grade A) → `.grade-ctx` present, text includes `9 in 10`. Test 44b: a row with `grade:null, grade_date:null` → `.grade-ctx` present, text includes `re-inspected` (the `PENDING_CONTEXT` string).
- For the violation-category tests (tests 45/45b, v1.18.0): test 45 mocks `raw.githubusercontent.com` → `TX(csv)` where `csv` is a header line `Violation_Code,Health_Code,Violation_Summary,Category_Description` plus a row `04L,§81.11,Live mice present,Vermin / Pests`, and `43nn-pn8j` with a row whose `violation_code:'04L'` + a `violation_description`. Wait for `.card`, assert `.viol-cat` present and text `=== 'Vermin / Pests'`. Test 45b mocks `raw.githubusercontent.com` → `E`; assert the `.viol-item` still renders and `.viol-cat` is absent (graceful degradation). **All other tests leave `raw.githubusercontent.com` unmocked** — `setupRoute` aborts it, `loadViolCodes` swallows the failure → `{}` → no `.viol-cat` and no `pageerror`, so the existing cases are unaffected.

**Critical gotcha:** The Edit tool may silently replace ASCII straight apostrophes (`'` U+0027) with Unicode curly quotes (`'`/`'` U+2018/U+2019) in JS string literals and regex patterns. This causes an "Invalid or unexpected token" syntax error that breaks the whole page. After any edit to the `search()` function, verify with:
```js
node -e "const h=require('fs').readFileSync('nyc-restaurant-grade.html','utf8'); new Function(h.match(/<script>([\s\S]*?)<\/script>/)[1]); console.log('OK');"
```

---

## Known gotchas

- **Container blocks all outbound network.** When working in the remote
  execution environment, `fetch()` and `curl` to any external URL return 403
  or time out — including to `mapu.retiolus.net`, `microlink.io`, and Google
  itself. This is a sandbox restriction, not a code bug. Test proxy calls by
  deploying and using a real browser.

- **`Promise.any` needs promises to reject, not throw strings.**
  Resolver functions use `throw 0` (not `throw new Error(...)`) to reject.
  If all reject, `Promise.any` throws `AggregateError`; the outer `catch`
  handles it and throws `new Error('app-link')` for the UI.

- **`mapu.retiolus.net` also blocks datacenter IPs** when called server-side.
  Its blocking of our container is expected — it's designed to be called from
  real browsers. Don't add it to server-side test assertions; mock it instead.

- **Version bump is required on every change.** The version string lives in
  `<div class="ver">vX.Y.Z</div>` near the bottom of the HTML. Bump it or
  the user can't tell if a deploy landed.

- **`nameFromUrl` strips `@lat,lng` suffixes.** Encoded coordinates sometimes
  appear after the place name in `/maps/place/NAME@40.7,-73.9`. The regex
  `[^/@?&"'\s]+` stops at `@`; `.replace(/@.*$/, '')` is also applied in
  some paths. Do not remove these guards.

- **Name extraction rejects garbage strings.** Both `nameFromUrl` and `cleanTitle`
  validate extracted values with `isName`: must contain a letter, must not contain
  `?`/`=`/`&`, must not start with `http`. This prevents coordinates, raw short
  codes (`qMJfabamuYZjqp4W8?g_st=ic`), and unexpanded URLs from reaching the
  name field.

- **`isName` requires a letter — zoom-level `z` is a letter.** The test for
  test 10 (coordinate URL rejection) must use a coordinate string with no letters.
  `?q=40.7580,-73.9855` passes (no letters). `?q=51.175806,0.4,12z` FAILS the test
  because the zoom suffix `12z` contains `z`, making `isName` return `true`, which
  causes a search to fire with the coordinate string as the name.
  Use `?q=lat,lng` without a zoom level in test 10.

- **Resolvers have cold-start latency.** The first request to mapu/microlink/jina
  often times out (serverless spin-up). `onMapsLink` retries once automatically
  before showing the error. Do not remove this retry or the services will appear
  broken on first use.

- **`search()` normalize → escape pipeline — do not collapse any step.**

  1. `normalize(s)` converts three Unicode variants to straight U+0027:
     - U+2018 LEFT SINGLE QUOTATION MARK (`'`)
     - U+2019 RIGHT SINGLE QUOTATION MARK (`'`) — the common iOS smart quote
     - U+2032 PRIME (`′`) — appears in addresses like "5′ Market St" copied from Maps

  2. `displayName` — normalized, straight apostrophes, uppercased. Goes into `render()` and status messages only.

  3. `name` — `displayName` with `'` → `''` for SoQL. Goes into `buildUrl()` only.

  4. `loc` — also normalized then SoQL-escaped (`normalize(...).replace(/'/g, "''")`). Goes into `buildUrl()` only.

  Do not collapse `displayName` and `name` — the escaped form leaking into the UI is a bug (shows `MIA''S` in the status bar). Tests 6, 7, 21, 22 protect this pipeline.

- **Edit tool curly-quote corruption.** The Edit tool sometimes replaces straight
  apostrophes (`'` U+0027) with curly quotes (`'`/`'` U+2018/U+2019), breaking
  JS syntax. After any edit to `search()`, run the syntax check:
  ```
  node -e "const h=require('fs').readFileSync('nyc-restaurant-grade.html','utf8'); new Function(h.match(/<script>([\s\S]*?)<\/script>/)[1]); console.log('OK');"
  ```
  To fix corrupted lines, use Python (which preserves bytes faithfully):
  ```python
  with open('nyc-restaurant-grade.html', 'r', encoding='utf-8') as f: html = f.read()
  # find script tag, split into lines, fix the offending line, reassemble and write back
  ```

---

## Versioning

Bump the version string in the `.ver` footer div on every change.
Current: **v1.18.0**

Notable versions:
- v1.9.0 — major refactor for readability; organized into labelled sections
- v1.10.0 — deep-link `?q=` support + Paste button
- v1.10.1 — switched Paste from Clipboard API to `prompt()` (iOS fix)
- v1.11.0 — added `mapu.retiolus.net` as primary resolver
- v1.12.0 — removed redundant Paste button (plain input field works fine on iOS)
- v1.12.1 — `nameFromUrl` rejects coordinate-only strings
- v1.12.2 — `nameFromUrl` + `cleanTitle` reject URL/query-string garbage
- v1.12.3 — auto-retry resolver once before showing the error message
- v1.12.4 — apostrophe handling: normalize curly quotes then escape `'`→`''` for SoQL
- v1.12.5 — `displayName` split so escaped form never leaks into UI
- v1.12.6 — Enter key on Maps input triggers resolution
- v1.12.7 — progressive word-drop fallback: if no results, retry with one fewer word until a match is found or the name is exhausted; status shows "shortened from ORIGINAL" when fallback fires
- v1.12.8 — debug trace log: append `?debug=1` to the URL to show a timestamped resolver trace panel below the results
- v1.12.9 — fix misleading "Google blocks it" error message; now says "Couldn't find a restaurant name in this link"
- v1.13.0 — authentic NYC DOHMH placard palette (A blue / B green / C orange); `placardHtml` window-card hero shown for single results; pending color → muted grey
- v1.13.1 — `cleanTitle` rejects Firebase error-page titles (`JUNK_TITLE`), fixing dead `maps.app.goo.gl` links that scraped "Dynamic Link Not Found" as a name
- v1.14.0 — PWA assets: favicon (SVG + PNG set), apple-touch-icon, web app manifest; button transition + disabled state; input outline removed
- v1.14.1 — `user-select: none` on grade chip; README: git hook setup + test count fix (22→23, 61→70)
- v1.14.2 — remove `maximum-scale=1.0` (accessibility); `html` background fills wide screens; `htmlEsc()` applied to all API data in `cardHtml` and error messages; `onMapsLink` error uses DOM instead of innerHTML for user URL; placard `inkMap` uses CSS vars (`var(--A/B/C)`) instead of duplicated hex; design skill brief corrected to DOHMH palette
- v1.14.3 — iOS Shortcut tip: collapsible inline instructions shown only on iOS, dismissed via localStorage (`tip-v1`); test 25 added (9 assertions)
- v1.14.4 — `?maps=URL` deep-link support; iOS tip updated to 2-action shortcut; dismiss key bumped to tip-v2; test 26 added
- v1.14.5 — `?maps=URL` deep-link support: raw Maps URL passed as query param triggers resolver pipeline on load; iOS tip updated to 2-action shortcut (`?maps=` URL, no typing); dismiss key bumped to `tip-v2`; test 26 added
- v1.14.6 — raw-string parsing for `?maps=` deep link (`location.search.startsWith` + `.slice(6)`) so Shortcuts can pass an unencoded Maps URL without a URL Encode action
- v1.14.7 — updated iOS Shortcut install link to 4-action version (Text conversion + URL Encode workaround for Shortcuts URL-type encoding bug)
- v1.15.0 — violation list with critical/not-critical chips and violation code; score bar with A/B/C threshold markers and contextual notes; inspection history timeline (last 6 inspections); closure banner when restaurant is currently closed by DOHMH; tests 33–37b added (37 cases, 129 assertions)
- v1.16.0 — `$select` widened to fetch `phone`, `cuisine_description`, `nta`, `latitude`, `longitude`; cards show a `.meta` line with cuisine, formatted `tel:` phone link, and "Map ↗" link; `--C` darkened `#e07d2a`→`#c96f20` (3.63:1, clears 3:1 for the C grade chip/placard); `.grade-hist.B`/`.grade-hist.C` use dedicated darker backgrounds (`#21703e`/`#a05819`, both ≥4.5:1) for the small history chips; `#status` gets `role="status"`; test 38 added (38 cases, 133 assertions)
- v1.16.1 — `viaMicrolink` now falls back to `boroFromAddr(data.title)` when `boroFromAddr(data.url)` finds nothing, improving borough extraction for short-link resolutions where the title carries the address but the resolved URL doesn't
- v1.16.2 — `nameFromUrl` now also tries the `?query=` param (Google's `/maps/search/?api=1&query=NAME` share-link format) when `/maps/place/` and `?q=` both miss; test 40 added (40 cases, 139 assertions)
- v1.16.3 — `stripShortLinkQuery` strips any query string from `maps.app.goo.gl`/`goo.gl/maps` short links before resolving — share-sheet tracking params (e.g. iOS Shortcuts' `?g_st=com.apple.shortcuts...`) appended to the short code can break the unshortener's redirect lookup; `google.com/maps` URLs are unaffected; test 41 added (41 cases, 142 assertions)
- v1.17.0 — `splitPlace` now falls back to a 5-digit ZIP mined from the address when no borough name is found, prefilling `#loc` with the ZIP (accepted by `buildUrl`'s `zipcode='${loc}'` clause); test 42 added (42 cases, 145 assertions)
- v1.18.0 — interpretive context: a per-card `.grade-ctx` line (plain-English meaning of A/B/C, or a pending explainer) and a static collapsible "What do these grades mean?" panel (scoring, critical-vs-upkeep, Pending/Closed meaning, inspection cycle, CDC Salmonella finding, sourced to NYC Health); plus best-effort violation-code categories — `loadViolCodes` pulls NYC Health's keyless CORS-open reference CSV and `violationsHtml` shows a `.viol-cat` label per code, degrading silently if the CSV is unreachable or its schema differs (live `.viol-cat` rendering is unverified from the sandbox — confirm on deploy); tests 43–45b added (45 cases, 161 assertions)

## Known-good Maps parsing baseline

**v1.12.8 (commit `b214028`) is the verified working baseline for all Maps link parsing.**

If a future change breaks Maps parsing, diff against this commit:
```bash
git diff b214028 nyc-restaurant-grade.html
```
Or restore just the parsing functions:
```bash
git show b214028:nyc-restaurant-grade.html | grep -A 200 'Google Maps link'
```

What is confirmed working at this baseline (all covered by tests 8–16, 18–19):

| Scenario | Behaviour |
|---|---|
| Full URL `/maps/place/NAME/…` | Name extracted by regex, no network call |
| Full URL `?q=NAME` | Name extracted by URLSearchParams, no network call |
| Coordinate URL `?q=40.75,-73.98` | Rejected by `isName` (no letters); error + Open link shown |
| Tracking-param garbage `?g_st=ic` | Rejected by `isName` (`?` in string); error + Open link shown |
| Short link → viaMapu success | `full_link` parsed by `nameFromUrl` |
| Short link → viaMicrolink success | `data.url` / `data.title` parsed by `nameFromUrl` / `cleanTitle` |
| Short link → viaJina success | `URL Source:` / `Title:` lines parsed from plain text |
| All resolvers fail → retry once | `onMapsLink` loops attempt 1→2 before showing error |
| All resolvers fail both attempts | Error with tappable "Open it ↗" link to original URL |
| Resolver returns "Name, City, Borough" | `splitPlace` keeps name before first comma; borough prefills `#loc` |
| Enter key on Maps input | Same resolution path as `input` event |
| Dead short link → "Dynamic Link Not Found" title | Rejected by `cleanTitle` `JUNK_TITLE` block; error + Open link shown (v1.13.1) |

`isName` invariants that must not be weakened:
- Must contain at least one letter (`/[a-zA-Z]/`)
- Must not contain `?`, `=`, or `&`
- Must not start with `http`
- Length > 1

`normalize()` invariants that must not be narrowed:
- U+2018 (`'`), U+2019 (`'`), U+2032 (`′`) all → U+0027 (`'`)
- Applied to both `name` (search field) and `loc` (location field)
- `name` is then further escaped `'` → `''` for SoQL; `displayName` keeps straight apostrophes for the UI
