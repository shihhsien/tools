---
name: verify
description: Visually verify nyc-restaurant-grade.html in a real browser. Drives the local file with Playwright, screenshots key states (bare load, search result, Maps error), and reports what it sees. Use after any change to confirm the UI looks right before pushing. GitHub Pages is unreachable from the sandbox — this skill uses the local file instead (same code).
---

# NYC Restaurant Grade — Visual Verifier

Launch the app in a headless browser, drive it to the relevant state, screenshot it, and send the screenshots.

## Setup

Playwright is pre-installed at `/opt/node22/lib/node_modules/playwright`.
The local file is served via `pathToFileURL` — no server needed.
GitHub Pages (`shihhsien.github.io`) is blocked by the sandbox network policy; always use the local file.

## Harness

```js
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import { pathToFileURL } from 'url';
const { chromium } = pw;
const BASE = pathToFileURL(process.cwd() + '/nyc-restaurant-grade.html').href;

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14 viewport

// Block external network — screenshots show local behaviour, not live API
await page.route('**/*', r =>
  r.request().url().startsWith('file:') ? r.continue() : r.abort()
);
```

Mock DOHMH responses the same way as the test suite (`page.route` before `page.goto`).

## Standard screenshot states

Always capture these three as a baseline:

### 1. Bare load
```js
await page.goto(BASE, { waitUntil: 'load' });
await page.screenshot({ path: '/tmp/verify-load.png' });
```

### 2. Search result
```js
await page.route('**/*', r => {
  if (r.request().url().startsWith('file:')) return r.continue();
  if (r.request().url().includes('43nn-pn8j')) return r.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify([{
      camis:'2', dba:'MAZZAT', building:'234', street:'ATLANTIC AVE',
      boro:'Brooklyn', zipcode:'11231', grade:'A', score:'5',
      grade_date:'2025-05-07T00:00:00.000', inspection_date:'2025-05-07T00:00:00.000',
      inspection_type:'Cycle Inspection', violation_description:null, critical_flag:null, action:null
    }])
  });
  return r.abort();
});
await page.goto(BASE, { waitUntil: 'load' });
await page.fill('#q', 'MAZZAT');
await page.click('#go');
await page.waitForSelector('.card', { timeout: 10000 });
await page.screenshot({ path: '/tmp/verify-result.png' });
```

### 3. Maps error (coordinate URL — triggers immediately, no resolver calls)
```js
await page.evaluate(() => {
  const el = document.getElementById('maps-input');
  el.value = 'https://www.google.com/maps?q=40.7580,-73.9855';
  el.dispatchEvent(new Event('input', { bubbles: true }));
});
await page.waitForFunction(
  () => document.getElementById('status').className.includes('err'),
  { timeout: 10000 }
);
await page.screenshot({ path: '/tmp/verify-error.png' });
```

## Send screenshots

```js
await browser.close();
```

Then use `SendUserFile` to deliver all screenshots:
```
/tmp/verify-load.png, /tmp/verify-result.png, /tmp/verify-error.png
```

## For targeted verification

If verifying a specific change (e.g. error message wording, card layout), add a focused step that drives exactly that state and screenshot it. Send that screenshot alongside the three baseline ones.

## Report format

```
PASS/FAIL — <one line what was verified>

Version: vX.Y.Z (confirmed from footer)
Steps:
  ✓/✗ bare load — <observation>
  ✓/✗ search result — <observation>
  ✓/✗ Maps error — <observation>
  ✓/✗ <targeted step if any> — <observation>
```
