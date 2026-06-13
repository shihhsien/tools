# NYC Restaurant Grade

Look up a restaurant's NYC Health Department inspection grade by name or Google Maps link.

**[Open the app](https://shihhsien.github.io/tools/nyc-restaurant-grade.html)**

---

## What it does

- Type a restaurant name (and optionally a street, borough, or ZIP) to get the current grade, score, and last inspection date from the city's official DOHMH database.
- Paste a Google Maps link — full URL or short link — and the app extracts the name and searches automatically.
- If the exact name returns no results, the app retries with one fewer word until it finds a match (solves the common Maps vs. DOHMH naming mismatch, e.g. "Oita Sushi" → "Oita").
- Tap **📍 Graded restaurants near me** to find graded restaurants within 300 m of your current location, sorted nearest first with distance shown on each card.
- Each card links out to the restaurant's reviews: **Map ↗** opens the Google Maps place card (rating + reviews) and **Yelp ↗** opens its Yelp search result.

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
Expands the short link **on your phone** — no third-party resolver involved.
1. Shortcuts → **+** → name it **NYC Grade**
2. Tap **ⓘ** → enable **Show in Share Sheet** → **URLs** checked (URLs only)
3. Actions:
   - **Receive** URLs from Share Sheet
   - **Text** (content: Shortcut Input)
   - **Split Text** by **Custom**: `?`
   - **Get Item from List** → First Item
   - **Expand URL** (input: Item from List)
   - **URL Encode** (input: Expanded URL)
   - **Open URLs** → `https://shihhsien.github.io/tools/nyc-restaurant-grade.html?share=` + URL Encoded Text

(The Text → Split steps matter: iOS appends a `?g_st=…` param that breaks the redirect,
and converting the link via the plain **Text** action is the only way that reliably yields
the URL string — other conversions fetch the page *title* instead. See CLAUDE.md for details.)

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
# Write + run the 59-case suite (see CLAUDE.md §Testing for the full harness)
node test.mjs
```

59 cases, 243 assertions covering: search, apostrophe/smart-quote/prime normalization, all three Maps resolver paths, coordinate rejection, auto-retry (mapu/microlink/jina), deep links (`?q=`, `?maps=` — encoded and unencoded — and the v1.19.0 `?share=` payload handler with name-first search and URL fallback), borough extraction, ZIP stripping from place names, progressive word-drop fallback, Firebase junk-title rejection, XSS escaping of API data, multi-result status count, iOS Shortcut tip visibility/dismiss, the v1.15.0 card panels (score bar, violation chips, history timeline, closure banner), the v1.16.0 card meta line (cuisine, phone, map link) + `role="status"`, the v1.16.1 microlink title-borough fallback, the v1.16.2 `?query=` Maps-link name extraction, the v1.16.3 short-link tracking-query stripping, the v1.17.0 splitPlace ZIP fallback, the v1.18.0 grade-context line, "about grades" panel, and violation-code categories, the v1.20.0 "near me" geolocation search (within_circle query, bounding-box fallback, permission-denied handling), the v1.21.0 review links (Google place-search Map link + Yelp link), the v1.22.0 address-based chain disambiguation (narrows multi-result matches to one location via building/street scoring), the v1.23.0 Resy review link + recently-searched list, and the v1.24.0 trend indicator + inspection freshness chip, and the v1.25.0 design-system pass (brand logomark header, focus ring, placard webfont), the v1.25.1 compact recent-chip layout guard, the v1.26.0 Nominatim reverse-geocode address recovery for dropped-pin Maps shares, the v1.27.0 Photon reverse-geocode fallback when Nominatim is rate-limited, and the v1.27.1 status live-region re-announce (zero-width-space toggle for VoiceOver).

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
