---
name: test
description: Run the full Playwright test suite for nyc-restaurant-grade.html. Writes test.mjs, runs all 79 required cases, fixes failures, iterates until all pass, then deletes the file. Use after any change to nyc-restaurant-grade.html to validate at 95%+ confidence.
---

# NYC Restaurant Grade — Test Suite

Run the full 79-case Playwright test suite, fix any failures, and confirm 352/352 assertions pass.

## Setup

Playwright is pre-installed at `/opt/node22/lib/node_modules/playwright`.
Tests run against the local file via `pathToFileURL`. No server needed.
Write to `test.mjs` in the project root, run with `node test.mjs`, delete when done.

## Step 1 — Write test.mjs

Use this exact harness structure. Do NOT deviate from the fixture shapes or helper names — the test cases depend on them.

```js
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import { pathToFileURL } from 'url';
const { chromium } = pw;
const BASE = pathToFileURL(process.cwd() + '/nyc-restaurant-grade.html').href;

// Fixtures — minimal rows that satisfy groupByRestaurant()
const mkRow = o => ({
  camis:'1', dba:'TEST', building:'1', street:'MAIN ST', boro:'Manhattan',
  zipcode:'10001', grade:'A', score:'5',
  grade_date:'2025-01-01T00:00:00.000', inspection_date:'2025-01-01T00:00:00.000',
  inspection_type:'Cycle Inspection', violation_description:null,
  critical_flag:null, action:null, violation_code:null, ...o
});
const MAZZAT = mkRow({ camis:'2', dba:'MAZZAT', boro:'Brooklyn', zipcode:'11231', score:'13',
  grade_date:'2025-05-07T00:00:00.000', inspection_date:'2025-05-07T00:00:00.000' });
const MAZZAT2 = mkRow({ camis:'9', dba:'MAZZAT UPTOWN', boro:'Manhattan', zipcode:'10001', score:'5',
  grade_date:'2025-05-07T00:00:00.000', inspection_date:'2025-05-07T00:00:00.000' });
const MIAS = mkRow({ camis:'3', dba:"MIA'S BROOKLYN BAKERY", boro:'Brooklyn', zipcode:'11201' });

const IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SQ = String.fromCharCode(0x2019);    // ' right single quotation mark (iOS smart quote)
const PRIME = String.fromCharCode(0x2032); // ′ prime — both built via fromCharCode so Write/Edit can't corrupt them

// Harness
let pass = 0, fail = 0;
const failures = [];
function ok(cond, msg) {
  if (cond) { console.log(`    ✓ ${msg}`); pass++; }
  else { console.error(`    ✗ ${msg}`); fail++; failures.push(msg); }
}

function setupRoute(page, mocks) {
  return page.route('**/*', r => {
    const u = r.request().url();
    if (u.startsWith('file:')) return r.continue();
    for (const [pat, resp] of mocks) {
      if (u.includes(pat)) {
        if (typeof resp === 'function') return resp(r, u);
        return r.fulfill({
          status: resp.status ?? 200,
          contentType: resp.ct ?? (resp.text ? 'text/plain' : 'application/json'),
          body: typeof resp.body === 'string' ? resp.body : JSON.stringify(resp.body)
        });
      }
    }
    return r.abort();
  });
}

const J  = body => ({ body });                                    // JSON response
const TX = body => ({ text: true, ct: 'text/plain', body });     // plain-text response
const E  = { status: 503, ct: 'text/plain', body: 'error' };    // resolver failure

async function T(label, setup, fn, pageUrl) {
  console.log(`\n● ${label}`);
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const jsErrs = [];
  page.on('pageerror', e => jsErrs.push(e.message));
  try {
    if (setup) await setup(page);
    await page.goto(pageUrl || BASE, { waitUntil: 'load' });
    await fn(page);
    ok(jsErrs.length === 0, 'no JS errors');
  } catch (e) {
    const m = e.message.split('\n')[0];
    console.error(`    ERROR: ${m}`);
    fail++; failures.push(`${label}: ${m}`);
  } finally {
    await browser.close();
  }
}

const triggerMaps = (page, url) => page.evaluate(u => {
  const el = document.getElementById('maps-input');
  el.value = u;
  el.dispatchEvent(new Event('input', { bubbles: true }));
}, url);

const waitErr = (page, ms = 20000) =>
  page.waitForFunction(() => document.getElementById('status').className.includes('err'), { timeout: ms });
```

Then implement all 79 test cases exactly as specified in CLAUDE.md §Testing.

Test 19 (Enter key) uses `page.press` rather than `triggerMaps`:
```js
await p.evaluate(u => { document.getElementById('maps-input').value = u; }, url);
await p.press('#maps-input', 'Enter');
await p.waitForSelector('.card', { timeout: 15000 });
ok(await p.$eval('.name', el => el.textContent) === 'MAZZAT', 'Enter key resolved link');
```

## Step 2 — Run

```bash
node test.mjs
```

Expected output ends with: `352 tests: 352 passed, 0 failed`

## Step 3 — Fix failures

### JS syntax error ("Invalid or unexpected token")
The Edit tool may corrupt straight apostrophes into curly quotes. Run the syntax check first:
```bash
node -e "const h=require('fs').readFileSync('nyc-restaurant-grade.html','utf8'); new Function(h.match(/<script>([\s\S]*?)<\/script>/)[1]); console.log('OK');"
```
If it fails, find the bad lines:
```bash
node -e "
const fs=require('fs'),html=fs.readFileSync('nyc-restaurant-grade.html','utf8');
const lines=html.match(/<script>([\s\S]*?)<\/script>/)[1].split('\n');
lines.forEach((l,i)=>{for(let j=0;j<l.length;j++){const c=l.charCodeAt(j);if(c===0x2018||c===0x2019)process.stdout.write('L'+(i+1)+': '+JSON.stringify(l)+'\n');}});
"
```
Fix with Python (preserves encoding reliably):
```python
with open('nyc-restaurant-grade.html', 'r', encoding='utf-8') as f: html = f.read()
start = html.index('<script>') + len('<script>')
end = html.index('</script>')
lines = html[start:end].split('\n')
# fix lines[N] = "corrected line with straight apostrophes"
with open('nyc-restaurant-grade.html', 'w', encoding='utf-8') as f:
    f.write(html[:start] + '\n'.join(lines) + html[end:])
```

### Test timeouts (Maps resolver tests)
Ensure mock patterns match the actual outbound URLs:
- mapu → `mapu.retiolus.net`
- microlink → `microlink.io`
- jina → `jina.ai`
- DOHMH → `43nn-pn8j`

### Apostrophe test (tests 6 & 7) fails
Check that `displayName` (straight quotes) and `name` (SoQL-escaped with `''`) are kept separate in `search()`. The captured request URL should have `MIA''S` when decoded.

### Shared state between `setup` and `fn`
`setup` and `fn` are separate function parameters to `T()` — variables declared inside one are not visible in the other. Declare shared state (`capturedUrl`, `resolverCalled`, counter variables) in a wrapping block scope before calling `T()`, e.g.:
```js
{ let callCount = 0;
  await T('...', async p => { await setupRoute(p, [['pat', (r,u) => { callCount++; ... }]]); },
          async p => { ok(callCount === 2, '...'); }); }
```

### Progressive fallback mock (test 20)
URLSearchParams encodes spaces as `+`. `decodeURIComponent(u)` does NOT decode `+` as space, so `decoded.includes('OITA SUSHI')` fails. Use `u.includes('SUSHI')` to detect the two-word query instead.

### Unicode normalization tests (tests 7, 21)
`normalize()` in `search()` handles three codepoints: U+2018, U+2019, U+2032. Build these via `String.fromCharCode` (`SQ`/`PRIME` in the harness) rather than typing the literal characters — the Edit/Write tools can silently turn a literal curly quote into a straight one, defeating the test. Test 7 fills `#q` with `'MIA' + SQ + 'S BROOKLYN BAKERY'` (U+2019); test 21 uses `PRIME` (U+2032). Both verify the captured DOHMH URL contains `MIA''S`.

### Apostrophe URL-encoding (tests 6, 7, 21, 22)
`URLSearchParams` encodes `'` (U+0027) as `%27`, so `capturedUrl.includes("MIA''S")` always fails. Use `decodeURIComponent(capturedUrl).includes("MIA''S")` instead. Unlike spaces (encoded as `+`, which `decodeURIComponent` does NOT decode), apostrophes ARE recovered by `decodeURIComponent`.

### loc escaping test (test 22)
`loc` goes through `normalize(...).replace(/'/g, "''")`. Test 22 fills `#loc` with `O'NEIL ST` and checks the captured URL contains `O''NEIL`. Use `decodeURIComponent(capturedUrl).includes("O''NEIL")` — same apostrophe encoding as above.

### Placard tests (tests 4, 5, 5b)
`placardHtml()` renders `.placard-wrap` only when `render()` gets exactly one group. Test 4 asserts `.placard-wrap` present on a single result; test 5 asserts absent on zero results; test 5b asserts absent when two cards render. Fixture `MAZZAT2` (a second distinct restaurant) drives the multi-result case.

### XSS escaping test (test 24)
`cardHtml` runs all DOHMH fields through `htmlEsc()`. Test 24 uses a fixture with `dba: '<img src=x onerror="window.__xss=1">EVIL CAFE'`. Seed `window.__xss = 0` via `page.addInitScript(() => { window.__xss = 0; })` in the `setup` step (before `goto`), then after the card renders assert: `window.__xss === 0` (payload never fired), `.card img` is `null` (no element injected), and `.name` textContent contains the literal `<img` substring (markup shown as text, not parsed). If any of these fail, `htmlEsc()` is missing or bypassed in `cardHtml`.

### Firebase junk-title test (test 23)
A dead `maps.app.goo.gl` link resolves to Google's error page titled "Dynamic Link Not Found". `cleanTitle`'s `JUNK_TITLE` regex must reject it. Mock `microlink.io` → `{ data: { url: '…?q=40.6,-73.9', title: 'Dynamic Link Not Found' } }`, `mapu` → coordinates only, `jina` → empty. Assert DOHMH (`43nn-pn8j`) is never called and `#q` stays `''`.

### iOS Shortcut tip test (test 25)
Test 25 uses `browser.newContext({ userAgent: IOS_UA })` (a real iPhone UA string). Multiple sub-tests share one `chromium.launch()` browser but each use a fresh context. **Critical:** pre-seeding localStorage for the "tip hidden after dismiss on reload" sub-test MUST use `page.addInitScript(() => localStorage.setItem('tip-v2', '1'))` BEFORE `page.goto()`. Calling `page.evaluate()` before goto on a `file://` page causes `SecurityError: Access is denied for this document`. The `addInitScript` hook runs before the page's own scripts, so the tip IIFE sees `tip-v2 === '1'` and hides the wrap immediately.

**Dismiss sub-test:** `#tip-dismiss` is inside `#tip-body` which is hidden by default. Click `#tip-toggle` first to open the body, then `waitForFunction` until it's visible, then click `#tip-dismiss`. Clicking a hidden/non-interactable button times out.

### Resolver retry tests (tests 28–29)
Use a shared counter outside setup/fn. Mock the other two resolvers as always-fail (`E`). Return `E` on call 1, success on call 2. `Promise.any` fires twice (once per `onMapsLink` attempt) so the counter accumulates across both attempts. Use `timeout: 30000` on `waitForSelector('.card')` — two full resolver rounds take longer than the default 15 s.

### splitPlace ZIP test (test 30)
Assert `#q.toUpperCase() === 'MAZZAT'` (splitPlace takes the name before the first comma, so no street/ZIP/borough in the field). Assert `#loc.toUpperCase().includes('BROOKLYN')`. Assert `!qVal.includes('11231')`.

### Multi-result count test (test 31)
Use `await p.$$('.card')` to get the NodeList; assert `.length === 2`. Assert `status.includes('2 match')` (covers both "2 matches" and "2 match").

### Bare ?q= deep-link test (test 32)
Pass `pageUrl = BASE + '?q=MAZZAT'` (no `&loc=`). After load, assert `#loc` value is `''` (empty string, not undefined).

### Card-detail tests (33–37b) — v1.15.0 panels
These are plain DOHMH searches (`page.fill('#q', NAME)` + `page.click('#go')` + `waitForSelector('.card')`) — no resolvers, no `triggerMaps`. Mock only `43nn-pn8j`. `mkRow` defaults `violation_code:null`. Multi-row fixtures share one `camis` so `groupByRestaurant` folds them: rows on the same `inspection_date` become violations, distinct dates become history. The `<details>` panels start collapsed, but their children are in the DOM — `$`/`$$` find them while hidden.

- **Test 33 (score bar):** one row, `score:'13'`, `grade:'A'`. Assert `.score-bar-wrap` and `.score-fill-A` present, and `.score-note` text matches `/from B/` (13 is 1 pt under the B threshold).
- **Test 34 (violations):** two rows, same `camis`/`inspection_date`, one `critical_flag:'Critical'` and one `'Not Critical'`, each with `violation_code` + `violation_description`. Assert `.viols` present, `.viols-summary` text is `2 violations · 1 critical`, exactly 2 `.viol-item`, `.viol-item:first-child .viol-flag` has class `viol-crit` (critical sorted first), and `.viol-code` non-empty.
- **Test 35 (clean):** one row with `violation_description:null`. Assert `.no-viols` present and `.viols` absent.
- **Tests 36/36b (history):** `historyHtml` renders only when `history.length >= 2`. Test 36: three rows with distinct `inspection_date`s → assert `.hist-wrap` present and 3 `.hist-row`. Test 36b: single inspection → assert `.hist-wrap` absent.
- **Tests 37/37b (closure):** closure = `action.includes('Closed by DOHMH')`, cleared only by a later row whose `action` includes `re-opened` (case-insensitive) with a greater `inspection_date`. Test 37: lone closure row → assert `.closure-banner` present and its text matches `/Closed by DOHMH/`. Test 37b: closure row + later re-opened row → assert `.closure-banner` absent.

### Card meta line + role=status (test 38, v1.16.0, updated v1.21.0)
Plain DOHMH search like tests 33–37b. Mock one row with `cuisine_description:'Japanese'`,
`phone:'2125551234'`. Assert:
- `.meta` element exists and its `textContent` includes `Japanese`
- `.meta a[href^="tel:"]` exists and its `textContent === '(212) 555-1234'` (formatted by `fmtPhone`)
- `.meta a[href*="google.com/maps/search"]` exists and `decodeURIComponent` of its `href`
  includes the restaurant name (v1.21.0 place-search link — the old `maps.google.com/?q=LAT,LNG`
  pin no longer exists)
- `#status` element's `getAttribute('role') === 'status'`

### viaMicrolink title-borough fallback (test 39, v1.16.1)
Trigger a `maps.app.goo.gl` short link via `triggerMaps`. Mock `mapu.retiolus.net` and `jina.ai`
as always-fail (`E`). Mock `microlink.io` to return `{ data: { url: 'https://www.google.com/maps/place/Mazzat/@40.6840,-73.9970,17z', title: 'Mazzat - Brooklyn, NY - Google Maps' } }` —
`data.url` has no borough (no comma-separated address segment), but `data.title` does. Mock
`43nn-pn8j` to `J([MAZZAT])`. Wait for `.card`, then assert:
- `#loc` value `=== 'BROOKLYN'` (proves `boroFromAddr(data.title)` fired since `boroFromAddr(data.url)` found nothing)
- `.name === 'MAZZAT'`

### nameFromUrl ?query= param fallback (test 40, v1.16.2)
Trigger `https://www.google.com/maps/search/?api=1&query=Mazzat&g_st=ic` via `triggerMaps`. Mock
only `43nn-pn8j` to `J([MAZZAT])` — `nameFromUrl` resolves `?query=` directly (no `/maps/place/`
or `?q=` present), so no resolver routes (mapu/microlink/jina) should ever be hit. Wait for
`.card`, then assert `#q` (uppercased) `=== 'MAZZAT'` and `.name === 'MAZZAT'`.

### stripShortLinkQuery test (test 41, v1.16.3)
Trigger `https://maps.app.goo.gl/TEST?g_st=com.apple.shortcuts.Run-Workflow.(null)` via
`triggerMaps`. Mock `mapu.retiolus.net` with a function handler `(r, u) => { capturedUrl = u;
return r.fulfill({ ...J({ full_link: 'https://www.google.com/maps/place/Mazzat/@40.6840,-73.9970,17z' }) }); }`
(declare `capturedUrl` outside `setup`/`fn`, same pattern as other captured-URL tests). Mock
`microlink.io`/`jina.ai` as always-fail (`E`); mock `43nn-pn8j` to `J([MAZZAT])`. Wait for `.card`,
then assert `decodeURIComponent(capturedUrl)` does NOT include `g_st` (proves
`stripShortLinkQuery` dropped the tracking query string before it reached `mapu`'s `link=` param),
and `.name === 'MAZZAT'`.

### splitPlace ZIP-fallback test (test 42, v1.17.0)
Mock `mapu.retiolus.net` to return `J({ full_link: 'https://www.google.com/maps/place/Mazzat,+247+Smith+St,+11231/@40.67,-73.99' })`
— the address has a 5-digit ZIP but no borough keyword. Mock `microlink.io`/`jina.ai` as
always-fail (`E`); mock `43nn-pn8j` to `J([MAZZAT])`. Trigger the short link via `triggerMaps`,
wait for `.card`, then assert `#loc === '11231'` (proves `splitPlace`'s ZIP fallback fired since
`boroFromAddr` found nothing) and `.name === 'MAZZAT'`.

### About-grades explainer panel (test 43, v1.18.0)
Static — no search, no mocks (`setupRoute(p, [])`). The `#about` `<details>` is always in the DOM.
Assert `#about` present, `el.open === false` (collapsed by default), its `textContent` includes
`0–13` (en dash, not hyphen) and `lower is better`, and mentions both `Grade Pending` and
`Closed by DOHMH`. This guards the static interpretive copy from accidental deletion.

### Grade-context line (tests 44, 44b, v1.18.0)
Plain DOHMH search. `cardHtml` renders a `.grade-ctx` line under the grade line: `gradeContextHtml(grade)`
for a graded row, or the `PENDING_CONTEXT` string when `graded` is null. Test 44: `J([MAZZAT])` (grade A)
→ assert `.grade-ctx` present and its text includes `9 in 10`. Test 44b: a row with `grade:null,
grade_date:null` → assert `.grade-ctx` present and its text includes `re-inspected`.

### Violation-category enrichment (tests 45, 45b, v1.18.0)
`loadViolCodes()` fetches the NYC Health reference CSV from `raw.githubusercontent.com` once (primed
on load, awaited in `search()`), parsing `Violation_Code`→`Category_Description` into `violCodeMap`;
`violationsHtml` adds a `.viol-cat` label per violation when the code maps. Test 45: mock
`raw.githubusercontent.com` → `TX(csv)` where `csv` is a `Violation_Code,Health_Code,Violation_Summary,Category_Description`
header plus an `04L,...,Vermin / Pests` row; mock `43nn-pn8j` with a row whose `violation_code:'04L'`.
Wait for `.card`, assert `.viol-cat` present and its text `=== 'Vermin / Pests'`. Test 45b: mock
`raw.githubusercontent.com` → `E` (fetch fails); assert the `.viol-item` still renders and `.viol-cat`
is absent (graceful degradation). All other tests leave `raw.githubusercontent.com` unmocked, so
`setupRoute` aborts it → `loadViolCodes` swallows the error → `{}` → no `.viol-cat` (and no JS error).

### ?share= deep-link tests (tests 46, 46b, 47, v1.19.0)
All three pass `pageUrl = BASE + '?share=' + encodeURIComponent(payload)` and set up routes in
`setup` so load-time handling is captured. `onShare` prefers the name in the payload (direct
DOHMH search, no resolvers) and falls back to `onMapsLink` when the name is absent or its search
renders 0 results.
- **Test 46:** payload `'Mazzat\n247 Smith St, Brooklyn, NY 11231\nhttps://maps.app.goo.gl/TEST'`.
  Mock the three resolvers with hit-flag handlers and `43nn-pn8j` → `J([MAZZAT])`. Assert no
  resolver was hit, `#q` (uppercased) `=== 'MAZZAT'`, `#loc === 'BROOKLYN'` (mined from the
  address line), and the card renders.
- **Test 46b:** payload is the bare short link. `parseShare` finds no name → `onMapsLink` path.
  Mock mapu → `J({ full_link: '…/maps/place/Mazzat/@…' })`, microlink/jina → `E`. Assert card.
- **Test 47:** payload `'Ghostplace\nhttps://maps.app.goo.gl/TEST'` with a conditional DOHMH
  mock: `decodeURIComponent(u).includes('MAZZAT') ? [MAZZAT] : []` and a shared `dohmhCalls`
  counter. The Ghostplace search returns `[]`, then the URL fallback resolves to Mazzat which
  finds the row. Assert `dohmhCalls >= 2` and the card shows MAZZAT. Use `timeout: 30000`.
- **Test 47b (v1.19.1):** payload is the bare text `'Invalid Dynamic Link'` (Firebase error-page
  title, no URL). `parseShare` rejects `JUNK_TITLE` matches as names, so `onShare` has neither
  name nor URL → shows the "Couldn't read the shared content" status. Mock `43nn-pn8j` with a
  hit-flag handler; assert it was never called, `#q` stays `''`, and status includes
  `Couldn't read`.

### Near-me tests (48, 48b, 49, v1.20.0)
These click `#near` (not `#go`/`#q`) and mock `navigator.geolocation.getCurrentPosition` via
`page.addInitScript` — must be registered before `goto` since `page.evaluate` before `goto`
throws `SecurityError` on `file://` pages.
- **Test 48:** `addInitScript(() => { navigator.geolocation.getCurrentPosition = ok =>
  ok({ coords: { latitude: 40.68, longitude: -73.99 } }); })`. Mock `43nn-pn8j` with a
  function handler that captures the URL and returns two fixtures with `latitude`/`longitude`
  at different distances from `(40.68, -73.99)` (one nearer, one farther). Click `#near`,
  `waitForSelector('.card', { timeout: 15000 })`. Assert the captured `$where` (decoded)
  includes `within_circle`, two `.card`s render with the nearer restaurant first, `#status`
  text includes `within 300`, and the first card's `.meta` includes `m away`.
- **Test 48b:** same geolocation mock. Mock `43nn-pn8j` with a handler that returns HTTP 400
  when the URL contains `within_circle` (track a `wcCalls` counter) and 200 with one fixture
  otherwise (capture that URL as `bboxUrl`). Click `#near`, wait for `.card` with
  `timeout: 20000` (two round trips). Assert `wcCalls >= 1`, and
  `decodeURIComponent(bboxUrl.replace(/\+/g, ' ')).includes('latitude >')` — note `+` (space)
  must be replaced before `decodeURIComponent`, which does not decode `+`.
- **Test 49:** `addInitScript(() => { navigator.geolocation.getCurrentPosition = (ok, err) =>
  err({ code: 1, message: 'denied' }); })`. Mock `43nn-pn8j` with a hit-flag handler that
  aborts. Click `#near`, `waitErr(p)`. Assert the hit-flag stayed false and `#status` text
  includes `permission denied`.

### Review-links test (test 50, v1.21.0, updated v1.23.0)
Plain DOHMH search with `J([MAZZAT])`. `cardHtml` builds all three links with
`encodeURIComponent` (spaces → `%20`, recovered by `decodeURIComponent` — unlike the
`+` that `URLSearchParams` produces elsewhere). Assert:
- `.meta a[href*="google.com/maps/search"]` exists, its `href` includes `api=1`, and its
  decoded href includes `MAZZAT` and `MAIN ST` (name + street in the place-search query)
- `.meta a[href*="yelp.com/search"]` exists and its decoded href includes
  `find_desc=MAZZAT` and `MAIN ST` (street inside `find_loc`)
- `.meta a[href*="resy.com"]` exists and its decoded href includes `MAZZAT`
All three links render whenever `dba` is present — no coordinates required.

### Address-based chain disambiguation (test 51, v1.22.0)
Two same-name DOHMH fixtures sharing `dba: 'MAZZAT'` but different `camis`/`building`/
`street`/`boro`/`zipcode`:
```js
const MAZZAT_A = mkRow({ camis: '2', dba: 'MAZZAT', building: '247', street: 'SMITH ST', boro: 'Brooklyn', zipcode: '11231' });
const MAZZAT_B = mkRow({ camis: '31', dba: 'MAZZAT', building: '500', street: 'ATLANTIC AVE', boro: 'Brooklyn', zipcode: '11217' });
```
Mock `mapu.retiolus.net` → `J({ full_link: 'https://www.google.com/maps/place/Mazzat,+247+Smith+St,+Brooklyn,+NY+11231/@40.67,-73.99' })`
(microlink/jina → `E`), and `43nn-pn8j` → `J([MAZZAT_A, MAZZAT_B])`. Trigger the short
link via `triggerMaps`, wait for `.card`, then assert: exactly 1 `.card`, `#status`
includes `matched by address`, `.placard-wrap` is present (hero shown for the narrowed
single result), and `.addr` text includes `SMITH ST` (proving `MAZZAT_A`, whose
`building`/`street` match the resolved address, won over `MAZZAT_B`).

### Click-handler regression guard (v1.22.0)
`#go`'s click listener must be `() => search()`, not bare `search`. Passing the
listener directly makes the click `MouseEvent` become `search`'s `addressHint`
argument, and `scoreAddressMatch`'s `addr.toUpperCase()` throws on a `MouseEvent`,
breaking every manual search (tests 5b/31 etc. would time out waiting for `.card`).
If a future change reintroduces this, those multi-result tests will fail with
"addr.toUpperCase is not a function" surfaced via `setError`.

### Recently-searched list (test 52, v1.23.0, updated v1.25.1)
Plain DOHMH search with `J([MAZZAT])`. Sequence:
1. Before any search, `#recent` is empty: `(await p.$eval('#recent', el => el.innerHTML.trim())) === ''`.
2. Fill `#q` with `MAZZAT`, click `#go`, wait for `.card`, then `waitForSelector('.recent-chip')`
   (the chip render happens synchronously inside `search()`'s success path but waiting is
   cheap insurance) — assert its `textContent === 'MAZZAT'`.
3. Assert the chip is a compact pill, not a full-width bar:
   `await p.$eval('.recent-chip', el => el.offsetWidth < document.getElementById('recent').offsetWidth / 2)`
   — guards the v1.25.1 `width: auto; margin-top: 0` override on `.recent-chip`, without
   which the global `button { width: 100% }` rule makes every chip span the whole row.
4. `page.reload({ waitUntil: 'load' })`, wait for `.recent-chip` again, assert it still
   reads `MAZZAT` — proves `localStorage['recent-searches']` persistence across loads.
5. Clear `#q`, click `.recent-chip`, wait for `.card`, assert `#q` value is now `MAZZAT`
   (clicking a chip refills the input and re-searches).
6. Click `.recent-clear`, assert `#recent` is empty again.

### `&` in name from `?q=` URL (test 53, v1.23.1)
Trigger `https://www.google.com/maps?q=Muteki+Udon+%26+Ramen` via `triggerMaps`. Mock
`mapu.retiolus.net`/`microlink.io`/`jina.ai` as always-fail (`E`) — `nameFromUrl` resolves
`?q=` directly with zero resolver calls. Mock `43nn-pn8j` to
`J([mkRow({ dba: 'MUTEKI UDON & RAMEN' })])`. Wait for `.card`, assert `#q` (uppercased)
`=== 'MUTEKI UDON & RAMEN'` and `.name === 'MUTEKI UDON & RAMEN'`. Guards against
`isName`'s reject-regex narrowed from `/[?=&]/` to `/[?=]/` (v1.23.1) — `&` is a legitimate
character in names and `?q=Muteki+Udon+%26+Ramen` decodes to a literal `&`, which the old
regex incorrectly rejected as query-string garbage.

`saveRecent` is called from inside `search()`'s success branch, so it fires for manual
searches, deep links, and resolved Maps/share links alike — no separate mocking needed
beyond the one DOHMH route.

### Trend indicator (tests 54/54b, v1.24.0)
Plain DOHMH search. Test 54 mocks two rows sharing `camis`/`dba`, distinct `inspection_date`s
— newest with `score:'5'`, older with `score:'20'`. `groupByRestaurant` sorts `history`
newest-first, so `history[0].score (5) < history[1].score (20)` → improving. Assert
`.trend.trend-up` present, text includes `Improving` and `(15 pts)`. Test 54b mocks a single
row (`J([MAZZAT])`) — `history.length < 2` → assert `.trend` is absent (same guard as
`historyHtml`).

### Inspection freshness chip (tests 55/55b, v1.24.0)
Plain DOHMH search. Test 55 mocks a row with `inspection_date: new Date().toISOString()`
(today, computed at test-run time) — assert `.meta .freshness` present and
`textContent === 'Inspected today'`. Test 55b mocks a row with
`inspection_date: '2018-01-01T00:00:00.000'` (always past `FRESHNESS_OVERDUE_DAYS`, 545
days) — assert `.meta .freshness.freshness-overdue` present and
`textContent === 'Inspection overdue'`.

### Design system v2 (test 56, v1.25.0)
Plain DOHMH search with `J([MAZZAT])` (single result so `.placard` renders). Before
searching, assert `.brand-chip` textContent `=== 'A'` and `h1` textContent
`=== 'NYC Restaurant Grade'` (the wordmark's `<span>` is inside the h1, so textContent
joins cleanly). Then `await p.focus('#q')` and assert the computed `boxShadow !== 'none'`
(the NYC-blue focus ring). After the card renders, assert
`getComputedStyle(document.querySelector('.placard')).fontFamily` includes
`Liberation Sans Narrow` — computed font-family reports the declared stack, so this holds
even when the TTF doesn't actually load under `file://`.

### Nominatim reverse-geocode (test 57, v1.26.0)
Tests the dropped-pin path: a resolved Maps link with `@lat,lng` but no place-path
address gets reverse-geocoded so chain disambiguation has something to match. Reuse
test 51's two same-name fixtures:
```js
const MAZZAT_A = mkRow({ camis: '2', dba: 'MAZZAT', building: '247', street: 'SMITH ST', boro: 'Brooklyn', zipcode: '11231' });
const MAZZAT_B = mkRow({ camis: '31', dba: 'MAZZAT', building: '500', street: 'ATLANTIC AVE', boro: 'Brooklyn', zipcode: '11217' });
```
Declare `let nominatimHit = false;` outside `setup`/`fn`. Mock (in `setup`):
- `mapu.retiolus.net` → `J({ full_link: 'https://www.google.com/maps/place/Mazzat/@40.6782,-73.9929,17z' })`
  — **name-only place path, `@lat,lng`, no comma-address** (so `splitPlace`'s `addr` is
  empty and the coordinate path fires). `microlink.io`/`jina.ai` → `E`.
- `nominatim.openstreetmap.org` → function handler `(r) => { nominatimHit = true; return r.fulfill({ ...J({ address: { house_number:'247', road:'Smith Street', borough:'Brooklyn', county:'Kings County', state:'New York', postcode:'11231' } }) }); }`
- `43nn-pn8j` → `J([MAZZAT_A, MAZZAT_B])`.

Trigger the short link via `triggerMaps`, `waitForSelector('.card', { timeout: 20000 })`.
Assert: `nominatimHit === true`; exactly 1 `.card`; `#status` includes `matched by address`;
`.addr` includes `SMITH ST`; and `#osm-attr` visible
(`await p.$eval('#osm-attr', el => getComputedStyle(el).display !== 'none')`).

**Why other resolver tests don't need a geocoder mock:** tests whose mapu mock returns a
name-only `@coords` URL (12, 15, 41, …) now also reach `reverseGeocode`, but
`nominatim.openstreetmap.org` **and** `photon.komoot.io` are both unmocked → `setupRoute`
aborts them → each tier's fetch rejects → `reverseGeocode` returns `null`, the card renders
name-only, and no `pageerror` fires. Leave them unmocked.

### Photon reverse-geocode fallback (test 58, v1.27.0)
`reverseGeocode` is tiered: Nominatim first, then Photon (`photon.komoot.io/reverse`) when
Nominatim 429s. Identical setup to test 57 (reuse `MAZZAT_A`/`MAZZAT_B`, the name-only
`@lat,lng` mapu mock, `microlink.io`/`jina.ai` → `E`), but:
- `nominatim.openstreetmap.org` → `{ status: 429, ct: 'text/plain', body: 'rate limited' }`
  (tier 1 fails).
- Declare `let photonHit = false;` outside `setup`/`fn`. `photon.komoot.io` → function handler
  `(r) => { photonHit = true; return r.fulfill({ ...J({ features: [{ properties: { housenumber:'247', street:'Smith Street', district:'Brooklyn', county:'Kings County', postcode:'11231' } }] }) }); }`
  (note Photon's **GeoJSON** shape: `features[0].properties`).
- `43nn-pn8j` → `J([MAZZAT_A, MAZZAT_B])`.

Trigger the short link via `triggerMaps`, `waitForSelector('.card', { timeout: 20000 })`.
Assert: `photonHit === true` (Nominatim 429 → Photon fallback fired); exactly 1 `.card`;
`#status` includes `matched by address`; `.addr` includes `SMITH ST`; `#osm-attr` visible.

### Status live-region re-announce (test 59, v1.27.1)
`setStatus` appends a trailing zero-width space (U+200B) when the new status text equals
the last, so the `role="status"` aria-live region re-announces a repeated message for
VoiceOver. No mocks needed — exercise the **empty-input guard**, the genuine
back-to-back-identical path (a successful search interleaves a "Looking up…" status, so its
result already differs from the prior text and re-announces on its own). Build
`const ZWSP = String.fromCharCode(0x200B);` (don't type the invisible char — Write/Edit can
drop it). Click `#go` with `#q` empty; assert `#status` text includes `Enter a restaurant name`
and does NOT include `ZWSP`. Click `#go` again (still empty); assert the status now includes
both `Enter a restaurant name` **and** `ZWSP`. U+200B is invisible, so every other test's
visible-substring `.includes()` checks are unaffected.

### getJSON failover (tests 60/60b/60c, v1.28.0)
`getJSON` is three-tier: primary `data.cityofnewyork.us` → `data.ny.gov` mirror → `corsproxy.io`.
Plain DOHMH search (`#q` fill + `#go`); route the three hosts separately with hit-flags declared
outside `setup`/`fn`.
- **Test 60:** `data.cityofnewyork.us` → HTTP 500; `data.ny.gov` (flag `mirrorHit`) → `J([MAZZAT])`;
  `corsproxy.io` (flag `proxyHit`) → also serves it. Assert `mirrorHit && !proxyHit` (mirror
  preferred over proxy) and the card renders.
- **Test 60b:** `data.cityofnewyork.us` → 500; `data.ny.gov` → 404; `corsproxy.io` (flag) →
  `J([MAZZAT])`. Assert `proxyHit` and the card renders (proxy is last resort).
- **Test 60c:** `data.cityofnewyork.us` → `J([MAZZAT])`; mirror/proxy handlers set their flag then
  `r.abort()`. Assert neither was hit (primary success short-circuits — no regression).

The mirror swap only fires for URLs with the `API` prefix, so the violation CSV and resolver
fetches are unaffected.

### Live grade distribution (tests 61/61b, v1.29.0)
`loadGradeDist()` fires lazily on first open of the `#about` panel and replaces `#a-rate`
("9 in 10") with the live citywide figure. The dist query hits `43nn-pn8j` but is uniquely
identified by `group=grade` (only `$select`/`$where` are encodeURIComponent-wrapped, so
`$group=grade` stays a literal substring).
- **Test 61:** function handler on `43nn-pn8j` — when `u.includes('group=grade')` set
  `distHit=true` and return `J([{grade:'A',n:'910'},{grade:'B',n:'70'},{grade:'C',n:'20'}])`,
  else `J([MAZZAT])`. After load: `#a-rate` text === `9 in 10`, `!distHit` (lazy). Click
  `#about > summary`, `waitForFunction` until `#a-rate` !== `9 in 10`, then assert `distHit`
  and `#a-rate` === `91 in 100`.
- **Test 61b:** same split handler, count non-dist `43nn-pn8j` calls. Plain `#q`+`#go` search;
  assert `!distHit` and `searchCalls === 1` (no extra request on the search path).

No other call-counting test is affected — they never open the `#about` panel.

### History-derived insights (tests 62–64b, v1.30.0)
Plain DOHMH searches; multi-row fixtures share one `camis` so `groupByRestaurant` folds them.
All three derivations are pure client-side (no extra network).
- **Test 62 (repeat badge):** two rows, same `violation_code:'04L'`, distinct `inspection_date`s
  (latest + earlier). Assert `.viol-repeat` present (`{ state:'attached' }` — the `<details>` is
  collapsed) and its text includes `repeat`. **Test 62b:** code only at the latest date → no
  `.viol-repeat`.
- **Test 63 (last-critical):** a `critical_flag:'Critical'` row at an *earlier* date + a
  critical-free latest row. Assert `.last-critical` present, text includes `Last critical`.
  **Test 63b:** latest inspection itself has the `Critical` flag → no `.last-critical`.
- **Test 64 (A-consistency):** three rows, distinct dates, grades A/B/A. Assert
  `.grade-consistency` text === `Grade A at 2 of 3 recent inspections`. **Test 64b:** single
  inspection → no `.grade-consistency`.

### Borough comparison (tests 65/65b, v1.31.0)
Each card with a boro has an opt-in `.boro-compare` panel; `loadBoroGradeDist(boro)` (cached in
`boroDistCache`) fires only on first open. The query carries `$group=grade`, so split the
`43nn-pn8j` mock like test 61.
- **Test 65:** function handler — `u.includes('group=grade')` sets `boroHit=true`, captures
  `boroUrl`, returns `J([{grade:'A',n:'880'},{grade:'B',n:'90'},{grade:'C',n:'30'}])`; else count
  `searchCalls`, return `J([MAZZAT])` (Brooklyn). After a plain search: `.boro-compare` present,
  `!boroHit && searchCalls===1`, summary names the boro. Click `.boro-compare summary`,
  `waitForFunction` until `.boro-compare-body` lacks "Loading", then assert `boroHit`,
  `decodeURIComponent(boroUrl)` includes `upper(boro)='BROOKLYN'`, body includes `88 in 100`
  and `majority`.
- **Test 65b:** boro query + `data.ny.gov` + `corsproxy.io` all 500 → body includes
  `Couldn't load`.

Only fires on a user toggle, so no other test is affected.

### Accessible input labels (test 66, v1.32.0)
Static — no search, `setupRoute(p, [])`. Assert `label[for="q"]`, `label[for="loc"]`, and
`label[for="maps-input"]` all exist with non-empty `textContent`, each `for` attribute resolves
to a real element via `document.getElementById`, and each label is visually hidden:
`getComputedStyle(label).position === 'absolute'` (the `.sr-only` clip-rect technique).

### Copy-link button (test 67, v1.33.0)
Plain DOHMH search (`J([MAZZAT])`, `#q` fill + `#go` click, wait for `.card`). Before
`page.goto`, stub the Clipboard API via `page.addInitScript(() => { window.__copied = null;
navigator.clipboard.writeText = t => { window.__copied = t; return Promise.resolve(); }; })` —
real clipboard access is unavailable/permission-gated under `file://` + headless Chromium.
Assert `.copy-link` exists, click it, `waitForFunction(() => window.__copied !== null)`, assert
`window.__copied` includes `q=MAZZAT`, and assert the button's `textContent` becomes
`✓ Link copied`.

### Favorites / pinned list (test 68, v1.34.0)
Plain DOHMH search (`J([MAZZAT])`, `#q` fill + `#go` click, wait for `.card`). Assert `#favorites`
is empty before any interaction, and `.fav-toggle` exists with `textContent === '☆ Save'` and
`getAttribute('aria-pressed') === 'false'`. Click `.fav-toggle`; assert it becomes `★ Saved` /
`aria-pressed="true"` and `#favorites` shows a `.fav-chip` whose text includes `MAZZAT`. Reload
the page (same DOHMH mock) and assert the `.fav-chip` still shows `MAZZAT` (localStorage
persistence). Click `.fav-chip`, wait for `.card`, assert `#q` is refilled with `MAZZAT` and the
re-rendered `.fav-toggle` shows `★ Saved` / `aria-pressed="true"`. Click `.fav-toggle` again to
un-favorite — assert it returns to `☆ Save` / `aria-pressed="false"` and `#favorites` is empty.
Re-add a favorite, then click `.favorites-clear` and assert `#favorites` is empty again.

**Mocking gotcha (from this test's authoring):** the harness's `J`/`TX`/`E` helpers must return
full `route.fulfill()` option objects — `{ status, contentType, body: JSON.stringify(...) }` for
`J`, `{ status: 200, contentType: 'text/plain', body }` for `TX`, and `{ status: 503,
contentType: 'text/plain', body: 'error' }` for `E`. A `{ body: <object> }`-only shape (missing
`status`/`contentType`, unstringified body) makes every `r.fulfill({...J(...)})` call hang
indefinitely. `setupRoute` should read `resp.contentType ?? resp.ct` so both naming styles work.

### Multi-result sort (test 69, v1.35.0)
Three fixtures sharing a `dba` substring but distinct full names — `AAA PLACE` (grade C, score
30), `BBB PLACE` (grade A, score 3), `CCC PLACE` (grade B, score 15), each with a distinct
`camis` — mocked via `J([AAA, BBB, CCC])` for a search on "PLACE" (all three match, none carry
`dist`). Wait for `.card`, then assert `.sort-row` and `#sort-select` are present, and
`#sort-select option` values are exactly `['default','grade-asc','grade-desc','name']` (no
`distance` option). Assert `.name` order is `[AAA, BBB, CCC]` (fetch order) by default.
`page.selectOption('#sort-select', 'grade-asc')` → assert order `[BBB, CCC, AAA]` (A, B, C).
`page.selectOption('#sort-select', 'name')` → assert order `[AAA, BBB, CCC]` (alphabetical).
Then a separate single-result search (`J([MAZZAT])`) asserts `.sort-row` is absent.

### Multi-result grade filter (tests 70/70b, v1.36.0)
Reuse test 69's `AAA PLACE` (grade C), `BBB PLACE` (grade A), `CCC PLACE` (grade B) fixtures, plus
a new `DDD PLACE` (no grade — Pending), mocked via `J([AAA, BBB, CCC, DDD])` for a search on
"PLACE". Wait for `.card`, then assert `.filter-row` is present with exactly 4 `.filter-chip`s in
order A/B/C/Pending (`textContent` `A`/`B`/`C`/`Pending`), all `aria-pressed="false"`. Click the A
chip → assert exactly 1 visible card (`BBB PLACE`) and `#status` includes `1 of 4 shown`. Click the
Pending chip too (additive, multi-select) → assert 2 visible cards (`BBB PLACE`+`DDD PLACE`) and
`#status` includes `2 of 4 shown`. Click both chips again to deselect → assert all 4 cards visible
and `#status` reads the plain `4 match(es) · official data` (no `shown` suffix). To check
composition with sort: `page.selectOption('#sort-select', 'grade-asc')` then click the C chip →
assert exactly 1 visible card (`AAA PLACE`). **Test 70b:** a separate search returning two
same-grade-A fixtures (`EEE PLACE`/`FFF PLACE`) → assert `.filter-row` is absent (filtering would
do nothing) while `.sort-row` is still present.

### Web Share API handoff (tests 73/73b, v1.38.0)
Plain DOHMH search (`#q` fill + `#go`), `J([MAZZAT])`. Before `goto`, register via `addInitScript`:
```js
page.addInitScript(() => {
  window.__clipboardCalled = false;
  navigator.clipboard.writeText = () => { window.__clipboardCalled = true; return Promise.resolve(); };
  navigator.share = data => { window.__shared = data; return Promise.resolve(); }; // test 73
  // test 73b instead: navigator.share = () => Promise.reject(new DOMException('cancel', 'AbortError'));
});
```
`addInitScript` can define `navigator.share`/override `navigator.clipboard.writeText` on a `file://`
page even though headless Chromium doesn't implement `navigator.share` by default. After `.card`
renders, capture `.copy-link`'s `textContent` (the original label), click it, then:
- **Test 73:** assert `window.__shared.url` includes `q=MAZZAT`, `window.__shared.title` includes
  `MAZZAT`, `.copy-link` `textContent` is unchanged from the captured original (no "Link copied"
  flash — `navigator.share` resolving returns early before the clipboard path), and
  `window.__clipboardCalled === false`.
- **Test 73b:** assert `.copy-link` `textContent` is unchanged and `window.__clipboardCalled ===
  false` — an `AbortError` (user cancelled the share sheet) returns early without falling back to
  clipboard or flashing "Copy failed".

### Cuisine comparison (tests 74/74b, v1.39.0)
Identical structure to the borough-comparison tests (65/65b), just a different dimension. Mock a
single `43nn-pn8j` row with `cuisine_description: 'Japanese'` and grade A (e.g. `MAZZAT` with
`cuisine_description:'Japanese'`). The query carries `$group=grade`, so split the `43nn-pn8j`
mock the same way as test 61/65.
- **Test 74:** function handler — `u.includes('group=grade')` sets `cuisineHit=true`, captures
  `cuisineUrl`, returns `J([{grade:'A',n:'850'},{grade:'B',n:'110'},{grade:'C',n:'40'}])`; else
  count `searchCalls`, return `J([MAZZAT])`. After a plain search: `.cuisine-compare` present,
  `!cuisineHit && searchCalls===1`, summary names the cuisine ("Japanese"). Click
  `.cuisine-compare summary`, `waitForFunction` until `.cuisine-compare-body` lacks "Loading",
  then assert `cuisineHit`, `decodeURIComponent(cuisineUrl)` includes
  `upper(cuisine_description)='JAPANESE'`, body includes `85 in 100` and `majority`.
- **Test 74b:** cuisine query + `data.ny.gov` + `corsproxy.io` all 500 → body includes
  `Couldn't load`.

Only fires on a user toggle, so no other test is affected.

### Score-history sparkline (tests 75/75b, v1.40.0)
Plain DOHMH search (`#q`+`#go`), single `43nn-pn8j` mock returning multi-row fixtures that share
one `camis` so `groupByRestaurant` folds them into one restaurant's `history`.
- **Test 75:** three rows, distinct `inspection_date`s, scores `5`/`18`/`30` (grades A/B/C). After
  `.card`: assert `.sparkline` present, `.spark-bar` count `=== 3`, oldest-first order (read each
  bar's band class via `p.$$eval('.spark-bar', els => els.map(e => [...e.classList].find(c =>
  c.startsWith('spark-') && c !== 'spark-bar')))` — index 0 is `spark-C` for the score-30 oldest
  inspection, index 2 is `spark-A` for the score-5 newest), and `.sparkline-label` text includes
  `lower is better`. Bars are colour-banded by the *score's implied grade* (`≤13` A / `≤27` B /
  `28+` C), and ordered via `history.reverse()` (history is newest-first).
- **Test 75b:** a single inspection (`J([MAZZAT])`) → assert `.sparkline` is absent
  (`sparklineHtml` needs ≥2 numeric scores).

Adds no network calls; existing multi-inspection card tests (36/54/64) gain a sibling `.sparkline`
but assert against unrelated selectors, so they're unaffected.

### Offline result cache (test 72, v1.37.0)
One `T()` runs two phases on the same page so `localStorage` persists across them.
**Phase 1 (seed):** `setupRoute(p, [['43nn-pn8j', J([MAZZAT])]])`, fill `#q` MAZZAT, click `#go`,
wait for `.card`, assert `.name === 'MAZZAT'` and `.cache-banner` is absent (`await p.$('.cache-banner')`
is null — a live result isn't stale). **Phase 2 (outage):** `await p.unroute('**/*')`, then
`setupRoute(p, [['43nn-pn8j', { status: 500, ct: 'text/plain', body: 'down' }]])` — the single
`43nn-pn8j` substring matches the primary host, the `data.ny.gov` mirror, and the `corsproxy.io`
proxy URL (all contain `43nn-pn8j`), so all three getJSON tiers 500. Re-fill `#q` MAZZAT, click
`#go`, `waitForSelector('.cache-banner', { timeout: 15000 })`, then assert `.name === 'MAZZAT'`
(served from cache), the banner text matches `/cached|unavailable/i`, and `#status` matches
`/cached/i`. The cache key is the normalized name+loc, so phase 2 must reuse the same query string.

### getJSON timeout fallback (test 71, v1.36.1)
`getJSON` now wraps every failover tier in `timeoutFetch(url, undefined, GETJSON_TIMEOUT_MS)`
(10s). Plain DOHMH search (`#q` fill + `#go`). Mock `data.cityofnewyork.us` with a route handler
that intentionally does nothing — no `r.fulfill()`/`r.abort()`/`r.continue()` — to simulate a host
that accepts the connection but never responds. Mock `data.ny.gov` → `J([MAZZAT])`.
`waitForSelector('.card', { timeout: 15000 })` must resolve comfortably under 15s: the 10s abort
on the primary fires, then the mirror responds immediately. If this hangs to the full 15s timeout,
`getJSON`'s primary-tier fetch is back to a bare `fetch()` (no `timeoutFetch` wrapper).

**General fix-notes from the v1.35.0 test-suite rewrite** (the app code needed zero changes —
all fixes were in `test.mjs`; useful if rewriting the harness from scratch again):
- **Tests 60/60b/60c (getJSON failover):** mock `corsproxy.io` BEFORE `data.ny.gov`/
  `data.cityofnewyork.us` in the route-pattern list — pattern order matters since `setupRoute`
  checks patterns in order and `corsproxy.io` URLs can also contain the other hostnames as a
  query param substring.
- **Test 23 (Firebase junk-title):** the `jina.ai` mock body must be `TX('')` (an empty string),
  not a `'Title: \nURL Source: \n\n'` placeholder — the latter parses as a non-empty title and
  defeats the `JUNK_TITLE` rejection.
- **Test 25 (iOS tip):** the tip container's id is `#tip-wrap`, not `#tip` — a typo'd selector
  silently matches nothing and the tip-visibility assertions pass vacuously (both "visible" and
  "hidden" checks on a non-existent element can read as falsy).
- **Test 45 (violation category):** `.viol-cat` lives inside the collapsed `.viols` `<details>`.
  `page.waitForSelector('.viol-cat')` needs `{ state: 'attached' }` — the default `visible`
  state never resolves for a hidden-but-present element.
- **Test 48 (near me):** the "FAR PLACE" fixture's coordinates must still be within
  `NEAR_RADIUS` (300 m) of the mocked position — just farther than "NEAR PLACE" — otherwise it's
  filtered out entirely and the nearest-first ordering assertion has only one card to compare.

## Step 4 — Iterate

Re-run after every fix. Do not stop until output shows `0 failed`.

## Step 5 — Clean up and push

```bash
rm test.mjs
git add nyc-restaurant-grade.html
git commit -m "..."
git push -u origin main
```

## Done

Report: how many passed, how many iterations it took, and any gotchas encountered.
