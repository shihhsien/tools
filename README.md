# NYC Restaurant Grade

Look up a restaurant's NYC Health Department inspection grade by name or Google Maps link.

**[Open the app](https://shihhsien.github.io/tools/nyc-restaurant-grade.html)**

---

## What it does

- Type a restaurant name (and optionally a street, borough, or ZIP) to get the current grade, score, and last inspection date from the city's official DOHMH database.
- Paste a Google Maps link — full URL or short link — and the app extracts the name and searches automatically.
- If the exact name returns no results, the app retries with one fewer word until it finds a match (solves the common Maps vs. DOHMH naming mismatch, e.g. "Oita Sushi" → "Oita").

Data is live from [NYC Open Data](https://data.cityofnewyork.us/resource/43nn-pn8j.json). No login, no tracking, no server.

---

## Usage

### Search by name
Type the restaurant name in the first field. Add a street, borough, or ZIP in the second field to narrow results. Press **Look up grade** or hit Enter.

### Paste a Maps link
Paste any Google Maps URL into the blue input field — full URL (`google.com/maps/place/…`) or short link (`maps.app.goo.gl/…`). The app extracts the name and searches automatically.

> **Short links often fail.** `maps.app.goo.gl` links require a server-side redirect that third-party resolvers handle inconsistently. If the link fails, tap **Open it ↗**, let the map load, then copy the full URL from the address bar and paste it back — or just type the name.

### Deep link
`?q=Name&loc=Borough` auto-fills and searches on load — useful for bookmarks or the iOS Shortcut below.

### iOS Shortcut (reliable Maps integration)
1. Shortcuts → **+** → name it **NYC Grade**
2. Tap **ⓘ** → enable **Show in Share Sheet** → URLs checked
3. Actions:
   - **Receive** URLs from Share Sheet
   - **Ask for Input** — prompt: `Restaurant name?`
   - **URL Encode** the input
   - **Open URLs** → `https://shihhsien.github.io/tools/nyc-restaurant-grade.html?q=` + encoded text

### Debug mode
Append `?debug=1` to see a timestamped trace of every resolver attempt — useful for diagnosing why a Maps link failed.

---

## Development

The entire app is one file: `nyc-restaurant-grade.html`. No build step, no dependencies, no bundler. Edit and open in a browser.

```bash
# Deploy: push to main
git push origin main
# GitHub Actions deploys to GitHub Pages automatically
```

### Testing

Tests use Playwright (pre-installed at `/opt/node22/lib/node_modules/playwright`):

```bash
# Write + run the 37-case suite (see CLAUDE.md §Testing for the full harness)
node test.mjs
```

37 cases, 129 assertions covering: search, apostrophe/smart-quote/prime normalization, all three Maps resolver paths, coordinate rejection, auto-retry (mapu/microlink/jina), deep links (`?q=` and `?maps=` — encoded and unencoded), borough extraction, ZIP stripping from place names, progressive word-drop fallback, Firebase junk-title rejection, XSS escaping of API data, multi-result status count, iOS Shortcut tip visibility/dismiss, and the v1.15.0 card panels (score bar, violation chips, history timeline, closure banner).

After any change, bump the version string in `<div class="ver">vX.Y.Z</div>` near the bottom of the HTML.

### Git hooks (local clone only)

The pre-push consistency check lives in `.githooks/`. Wire it up once per clone:

```bash
git config core.hooksPath .githooks
```

After that, every `git push` runs `.githooks/check-consistency.sh` and aborts if the version string, test-case count, or assertion count are out of sync.

### Architecture notes

See `CLAUDE.md` for detailed notes on the DOHMH API, Maps link resolution pipeline, the `normalize()`/`displayName`/`name` escaping chain, known gotchas, and the known-good baseline for Maps parsing.

---

## Data

NYC Health Department inspections via [NYC Open Data](https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j). Updated daily. Grades: **A** (0–13 points), **B** (14–27), **C** (28+).
