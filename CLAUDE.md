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
- `.github/workflows/pages.yml` — deploys on push to `main`

## Deployment

Push to `main` → GitHub Actions builds → GitHub Pages serves.
No build step. The HTML file is served as-is.

Dev branch: `claude/nyc-restaurant-grade-SPLv9`

---

## Architecture

### Data source

NYC Open Data / Socrata API (`43nn-pn8j`). SoQL query: match `upper(dba)`
with optional `street`, `boro`, or `zipcode` filter. Returns up to 200 rows,
deduplicated by `camis` (restaurant ID). Two things are tracked per restaurant:

- `latest` — the most recent inspection row (any type)
- `graded` — the most recent row that has a letter grade

These are separate because an inspection can happen without issuing a new grade.

### Maps link resolution

When the user pastes a Google Maps link, the app tries to extract the
restaurant name. Two cases:

**Full URL** (`google.com/maps/place/NAME/...` or `?q=NAME`) — name is in
the URL itself, resolved instantly with regex + URLSearchParams. No network.

**Short link** (`maps.app.goo.gl/CODE`) — must follow Google's redirect
server-side. Three resolvers race via `Promise.any` with a 6 s timeout:

1. `viaMapu` → `mapu.retiolus.net/unshortener?link=URL`
   Returns `{ full_link }`. Purpose-built for maps.app.goo.gl, uses a
   real browser User-Agent to pass Google's bot detection.

2. `viaMicrolink` → `api.microlink.io/?url=URL`
   Headless Chromium service. Returns `{ data: { url, title } }`.

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
nameFromUrl(url)          — extracts from /maps/place/NAME or ?q=NAME
        ↓
splitPlace(name, boro)    — splits "Name, 123 St, Brooklyn" on first comma;
                            mines trailing parts for borough via boroFromAddr()
        ↓
{ name, boro }            — name → #q input, boro → #loc input
```

`cleanTitle(raw)` strips " - Google Maps" suffix and rejects empty, Google-only,
URL-like (`http…`), query-string-like (`?`/`=`/`&`), and known **error-page
titles** (`JUNK_TITLE`: "Dynamic Link Not Found", "Page Not Found", "Not Found",
"Untitled", "Error", "Maps"). The error-title block matters because a dead/expired
`maps.app.goo.gl` short link resolves to Google's Firebase error page, whose
`<title>` is **"Dynamic Link Not Found"** — without the block, `viaMicrolink`
scrapes that title and the app searches DOHMH for "DYNAMIC LINK NOT FOUND".
`nameFromUrl` applies the same validity check to both the `/maps/place/` and `?q=`
extracted values — rejects coordinates (no letters), URL fragments, and short codes
containing query chars. This prevents resolver garbage (raw short codes, expanded
coordinate URLs, tracking params like `?g_st=ic`) from leaking into the name field.
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

---

## JS code map

The `<script>` is organised into labelled sections:

| Section | Key functions |
|---|---|
| Config & DOM | constants, cached element refs |
| Small helpers | `decode`, `setStatus`, `setError`, `gradeClass`, `fmtDate` |
| NYC DOHMH API | `buildUrl`, `getJSON` (with corsproxy.io fallback) |
| Rendering | `groupByRestaurant`, `cardHtml`, `placardHtml`, `render` |
| Search | `search` |
| Maps parsing | `nameFromUrl`, `cleanTitle`, `boroFromAddr`, `splitPlace`, `timeoutFetch`, `viaMapu`, `viaMicrolink`, `viaJina`, `resolveMapsLink` |
| Wiring | `onMapsLink` (with auto-retry), event listeners, deep-link init on load |

---

## Grade palette & placard (v1.13.0)

Grade colors use the **authentic NYC DOHMH window-card palette**, not the old
traffic-light scheme. No red anywhere — even a C is a calm orange.

| Grade | Color token | Hex | Points | (old traffic-light) |
|---|---|---|---|---|
| A | `--A` | `#1f57a6` blue | 0–13 | was `#16a34a` green |
| B | `--B` | `#2f8b4e` green | 14–27 | was `#ca8a04` amber |
| C | `--C` | `#e07d2a` orange | 28+ | was `#dc2626` red |

`placardHtml(grade)` renders the iconic white DOHMH window card (header
"Sanitary Inspection / Grade", giant letter in the grade ink color, footer
"NYC Dept of Health & Mental Hygiene"). `render()` shows it as a **hero element
only when exactly one restaurant matches** (`groups.length === 1`); multi-result
lists use the compact `.grade` chips in each card. An unknown/pending grade
renders a "Grade Pending" placard in near-black `#1a1a1a` with a thin border.

The `.pending` status color is `var(--muted)` (grey), **not** `var(--B)` — amber
no longer signals "pending" now that it means a genuine B grade.

---

## The Google bot-blocking problem

**Do not re-research this** — it has been thoroughly investigated.

`maps.app.goo.gl` links return HTTP 302 for real browser requests and
HTTP 403 (`x-deny-reason: host_not_allowed`) for datacenter/bot requests.

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

**Required test cases (23 cases, 70 assertions — all must pass):**

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
| 15 | Auto-retry on cold start | mapu called twice; card shown on 2nd attempt |
| 16 | All resolvers fail → error with Open link | error text + link to original URL |
| 17 | Deep link `?q=Name&loc=Borough` | both fields pre-filled; auto-searched |
| 18 | Borough extracted from resolver place name | `Mazzat, Brooklyn, NY` splits to name=Mazzat, loc=BROOKLYN |
| 19 | Enter key on Maps input triggers resolution | set value, press Enter, card shown |
| 20 | Progressive fallback finds results after word-drop | 2 DOHMH calls; status has "shortened from" + original name |
| 21 | Prime symbol (U+2032) normalized and escaped for SoQL | captured URL has `MIA''S`; status has no `''` |
| 22 | Apostrophe in `loc` field gets SoQL-escaped | captured URL has `O''NEIL` in the `$where` clause |
| 23 | Firebase "Dynamic Link Not Found" error title rejected | DOHMH not called; `#q` stays empty; error with Open link |

**Mocking notes:**
- `E = { status: 503, ct: 'text/plain', body: 'error' }` for resolver failures
- `J(rows)` for DOHMH JSON responses
- `TX(text)` for Jina plain-text responses
- For auto-retry (test 15): track `mapuCalls` counter; return 503 on call 1, success on call 2
- For deep-link tests (test 17): pass `pageUrl = BASE + '?q=Name&loc=Borough'` to the test runner
- For progressive fallback (test 20): check `u.includes('SUSHI')` (not `decodeURIComponent(u).includes('OITA SUSHI')`) — URLSearchParams encodes spaces as `+`, so the decoded URL still has `+` after `decodeURIComponent`. Shared counter variables must be declared outside both `setup` and `fn` closures (they run in separate scopes within `T()`).
- For the Firebase junk-title test (test 23): mock `microlink.io` to return `{ data: { url: '…?q=40.6,-73.9', title: 'Dynamic Link Not Found' } }`, `mapu` to coordinates only, `jina` to empty. Assert DOHMH (`43nn-pn8j`) is never called and `#q` stays `''`.

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
Current: **v1.14.0**

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
