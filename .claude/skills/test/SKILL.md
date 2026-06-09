---
name: test
description: Run the full Playwright test suite for nyc-restaurant-grade.html. Writes test.mjs, runs all 26 required cases, fixes failures, iterates until all pass, then deletes the file. Use after any change to nyc-restaurant-grade.html to validate at 95%+ confidence.
---

# NYC Restaurant Grade — Test Suite

Run the full 26-case Playwright test suite, fix any failures, and confirm 85/85 assertions pass.

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
  critical_flag:null, action:null, ...o
});
const MAZZAT = mkRow({ camis:'2', dba:'MAZZAT', boro:'Brooklyn', zipcode:'11231', score:'13',
  grade_date:'2025-05-07T00:00:00.000', inspection_date:'2025-05-07T00:00:00.000' });
const MAZZAT2 = mkRow({ camis:'9', dba:'MAZZAT UPTOWN', boro:'Manhattan', zipcode:'10001', score:'5',
  grade_date:'2025-05-07T00:00:00.000', inspection_date:'2025-05-07T00:00:00.000' });
const MIAS = mkRow({ camis:'3', dba:"MIA'S BROOKLYN BAKERY", boro:'Brooklyn', zipcode:'11201' });

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

Then implement all 25 test cases exactly as specified in CLAUDE.md §Testing.

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

Expected output ends with: `85 tests: 85 passed, 0 failed`

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
`normalize()` in `search()` handles three codepoints: U+2018, U+2019, U+2032. Write these directly in Python heredocs — never via the Edit or Write tool, which will corrupt them. Test 7 needs intentional U+2019 in the input; test 21 needs intentional U+2032. Both verify the captured DOHMH URL contains `MIA''S`.

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
Test 25 uses `browser.newContext({ userAgent: IOS_UA })` (a real iPhone UA string). Multiple sub-tests share one `chromium.launch()` browser but each use a fresh context. **Critical:** pre-seeding localStorage for the "tip hidden after dismiss on reload" sub-test MUST use `page.addInitScript(() => localStorage.setItem('tip-v1', '1'))` BEFORE `page.goto()`. Calling `page.evaluate()` before goto on a `file://` page causes `SecurityError: Access is denied for this document`. The `addInitScript` hook runs before the page's own scripts, so the tip IIFE sees `tip-v1 === '1'` and hides the wrap immediately.

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
