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
- `assets/fonts/` — `LiberationSansNarrow-Regular/Bold.ttf`, the placard webfont (v1.25.0)
- `.github/workflows/pages.yml` — deploys on push to `main`
- `.githooks/check-consistency.sh` — enforces three invariants (see below)
- `.githooks/pre-push` — runs the consistency check before every push
- `.claude/settings.json` — runs the consistency check at every SessionStart
- `.claude/skills/test/` — Playwright test skill (71 cases, 334 assertions)
- `.claude/skills/verify/` — visual screenshot verification skill
- `.claude/skills/nyc-restaurant-grade-design/` — design system skill v2 (tokens incl. fonts/interaction, components, UI kit, templates)

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
phone as a `tel:` link formatted via `fmtPhone()` (`(212) 555-1234`), and three review/
booking links built from name+address whenever `dba` is present: "Map ↗" (v1.21.0) →
`google.com/maps/search/?api=1&query=NAME ADDRESS` (a place search that lands on the
Google place card with its rating/reviews — replaced the old bare `?q=LAT,LNG`
coordinate pin, which selected nothing), "Yelp ↗" (v1.21.0) →
`yelp.com/search?find_desc=NAME&find_loc=ADDRESS`, and "Resy ↗" (v1.23.0) →
`resy.com/cities/ny/venues?query=NAME`. The link-out approach is deliberate:
Yelp's Fusion API has no free tier (reviews need the paid Plus plan), returns only 3
truncated excerpts, and blocks browser calls (no CORS) by design — so inline Yelp data
would need a paid key plus a Worker proxy for 3 snippets; Resy has no public API at
all. The Resy link doubles as an Amex-Resy-credit check — the credit applies to any
restaurant taken via Resy's "Pay at Restaurant" feature (no separate curated list), so
"is this place on Resy" is the only signal that matters, and a search link is enough
to answer that without scraping. Dataset coordinates are now
used only for the nearby-search distance math. `nta` (neighborhood) is fetched but not
yet displayed — reserved for a future enrichment.

`getJSON` fetches with a **three-tier failover** (v1.28.0): the primary
`data.cityofnewyork.us` host first; on any error (CORS, network, non-200), the
official **`data.ny.gov` Socrata mirror** of the same dataset id (CORS-open,
first-party — preferred over a third-party proxy); and finally the
`corsproxy.io` proxy as a last resort. Only DOHMH calls (URLs with the `API`
prefix) are host-swapped to the mirror — resolver and CSV fetches don't go
through `getJSON`. The mirror id is **deploy-verify** (the sandbox can't confirm
data.ny.gov hosts `43nn-pn8j`); if it 404s, `getJSON` falls through to the proxy,
so there's no regression even if the hypothesis is wrong.

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
{ name, boro, addr }      — name → #q input, boro → #loc input (boro may hold
                            either a borough name or a ZIP — #loc/buildUrl accept both),
                            addr → the raw "123 St, Brooklyn, NY 11231" remainder
                            (v1.22.0), passed through to search() as an address hint
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

`?share=PAYLOAD` (v1.19.0) accepts the **raw iOS share-sheet payload** — a bare
name, a bare Maps URL, or Google Maps' share text blob
(`"Mazzat\n247 Smith St, Brooklyn, NY 11231\nhttps://maps.app.goo.gl/x"`).
Read raw like `?maps=` (`location.search.startsWith('?share=')` + `.slice(7)` +
best-effort `decodeURIComponent`). `parseShare(text)` extracts the first Maps URL
(via `MAPS_HOSTS`), takes the first non-URL line as the name (stripping "Check
out " / " - Google Maps" decorations, splitting on comma via `splitPlace`), and
mines the remaining lines for a borough (`boroFromAddr`) or 5-digit ZIP to
prefill `#loc`. `onShare()` then **prefers the name** — searching DOHMH directly
with zero resolver calls — and falls back to `onMapsLink(url)` only when the
payload had no usable name **or** the name search rendered 0 results (`render`/
`search` return the group count to make this detectable). This exists because
Google blocks the third-party resolvers' datacenter IPs inconsistently; when the
share text carries the name, the hostile short link never needs to be expanded
at all. Used by the 3-action iOS Shortcut: **Receive Text/URLs from Share Sheet
→ URL Encode → Open URL** with `?share=` + encoded input.

### Nearby search (v1.20.0)

The **📍 Graded restaurants near me** button (`#near`) calls `searchNearby()`,
which is fired **only on an explicit tap — never on page load**. iOS
home-screen web apps can hang forever on the geolocation permission prompt in
`display: standalone` mode (it never appears), so the tap gate plus a 10 s
`getCurrentPosition` timeout are load-bearing, not just UX politeness.

On success, `buildNearbyUrl(lat, lng, bbox)` queries `43nn-pn8j` with the same
`SELECT_FIELDS` as `buildUrl`. Two query strategies:

1. **Primary** — `within_circle(location_point1, lat, lng, NEAR_RADIUS)`
   (Socrata's geo-filter on the dataset's Point column; `location_point1` is
   the hypothesized column name, unverified from the sandbox).
2. **Fallback** — if the primary query 400s, retry with a plain lat/lng
   bounding box (`latitude > … and latitude < … and longitude > … and longitude < …`),
   which works on the separate numeric `latitude`/`longitude` fields regardless
   of whether `location_point1` exists.

`NEAR_RADIUS` = 300 m (~4-minute walk), `NEAR_MAX` = 25 cards. Results are
grouped via `groupByRestaurant`, filtered to rows with coordinates, distance is
computed client-side via `distM()` (Haversine), filtered to `dist <= NEAR_RADIUS`,
and sorted nearest-first. `cardHtml` accepts a `dist` field and `fmtDist()`
renders it as the first item in the `.meta` line (`"120 m away"` or `"1.2 km
away"`). Geolocation errors are surfaced via `setError`: permission-denied
(`code === 1`) gets a specific message; other errors (including timeout)
suggest opening the site in Safari instead of the home-screen app.

### Address-based chain disambiguation (v1.22.0)

A resolved Maps link or `?share=` payload often carries a full address
(`splitPlace`'s `addr` remainder, e.g. `"247 Smith St, Brooklyn, NY 11231"`),
but `search()` only matches on `dba`/`loc` — a chain with multiple NYC
locations (e.g. several "MAZZAT" branches) returns multiple same-name rows
with no way to tell which one the user actually shared.

`onMapsLink()` and `onShare()` now pass the parsed `addr` to `search(addressHint)`,
which threads it to `render(rows, name, originalName, addressHint)`. When
`render` sees more than one group **and** an `addressHint`, it scores every
group via `scoreAddressMatch(addr, info)`:

- exact match between the address's leading number and `info.building` → **+2**
- any address word (≥3 chars, with `ST`/`AVE`/`RD`/etc. suffixes stripped)
  found as a substring of `info.street` → **+1**

If there is a single group with the strictly highest score (and that score is
> 0), `render` narrows to just that group — showing the hero placard as if it
were the only match — and appends `· matched by address` to the status line.
Any tie, or a zero top score, falls back unchanged to showing all groups. This
is a **ranking signal, not a query filter**: DOHMH street abbreviations
("AVE" vs "Avenue") make a strict SoQL match unreliable, so disambiguation
happens client-side after the existing name-only query.

A plain manual search (`#go` click, Enter key) passes no `addressHint`
(`addressHint === undefined`), so `scoreAddressMatch` is never invoked and
multi-result behavior is unchanged for that path.

### Reverse-geocoded address recovery (v1.26.0, tiered in v1.27.0)

The v1.22.0 disambiguation only fires when the resolved link carries an address
in its place path (`/maps/place/Mazzat,+247+Smith+St,+Brooklyn,+NY+11231/`).
A **dropped-pin or name-only share** (`/maps/place/Mazzat/@40.6782,-73.9929,17z`)
has a name but no address — so `splitPlace`'s `addr` is empty and a same-name
chain can't be narrowed. v1.26.0 closes that gap by reverse-geocoding the
coordinates that such a URL always carries.

Implements the previously-deferred tiered design (place path first, coordinates
second):

- The three resolvers now also return the resolved URL as `link` (`viaMapu` →
  `full_link`, `viaMicrolink` → `data.url`, `viaJina` → the `URL Source:` line).
- `resolveMapsLink` keeps `fullUrl` (the input URL for a direct resolution, else
  the winning resolver's `link`). **Only when `splitPlace` yielded no `addr`**,
  it runs `coordsFromUrl(fullUrl)` (regex `@(-?\d+\.\d+),(-?\d+\.\d+)`) and, if
  coordinates are present, `await`s `reverseGeocode(lat, lng)`.
- `reverseGeocode` is itself **tiered (v1.27.0)** — it tries two OSM-derived
  geocoders in order and returns the first usable result:
  1. **`viaNominatim`** — `nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1&lat=…&lon=…`;
     builds the address from `address.house_number` + `road` +
     (`borough`/`suburb`/`city_district`, else `COUNTY_BORO[county]`) + `postcode`.
  2. **`viaPhoton`** — `photon.komoot.io/reverse?lat=…&lon=…` (GeoJSON);
     builds it from `properties.housenumber` + `street`/`name` +
     (`district`/`city`, else `COUNTY_BORO[county]`) + `postcode`.
  Both feed a shared `buildGeoAddr(street, boro, county, zip)` helper that
  assembles `"247 Smith Street, Brooklyn, NY, 11231"` and returns
  `{ addr, boro }` (or `null` when nothing usable was found). Each tier **throws**
  on failure so the loop falls through to the next; the `addr` becomes the
  disambiguation hint and `boro` fills `#loc` only if no borough was found earlier.

This is **best-effort and degrades silently**: Nominatim is keyless and CORS-open
on success but omits CORS headers on a 429 rate-limit (1 req/s cap), which
surfaces as a fetch error. v1.26.0 simply gave up there; **v1.27.0 falls back to
Photon** (komoot's keyless, CORS-open OSM geocoder — a demo server with no hard
per-second cap, so still best-effort) before giving up. If both tiers fail,
`reverseGeocode` returns `null`, no address is recovered, and the card still
renders name-only. The call is **gated on `!place.addr`**, so it never fires for
place-path shares or manual searches — only the dropped-pin case pays the extra
round-trip(s).

**ODbL attribution.** Using OSM data obliges attribution. Both tiers are
OSM-derived, so one hidden `#osm-attr` footer line ("Location lookups ©
OpenStreetMap contributors") covers them — revealed (`display: block`) the first
time **either** geocoder returns a usable result, shown only when OSM data was
actually used, not on every load.

### Recently searched (v1.23.0)

A `#recent` chip list below the Maps-link input shows the last `RECENT_MAX`
(6) successful searches, most-recent-first, persisted in `localStorage` under
`recent-searches` as `[{ name, loc }, ...]`. `search()` calls `saveRecent(name,
loc)` whenever `render()` returns a non-zero group count — covering manual
searches, deep links, and resolved Maps/share links alike, since they all funnel
through `search()`. `saveRecent` dedupes on exact `name`+`loc` (case-sensitive,
since `name` is already uppercased) and caps the list before re-rendering.

Clicking a `.recent-chip` refills `#q`/`#loc` and re-runs `search()`; a
"Clear recent" button (rendered alongside the chips, only when the list is
non-empty) removes the `localStorage` key. All rendering goes through `htmlEsc`.

Chips render as compact inline pills that wrap (`.recent` is `flex-wrap: wrap`).
`.recent-chip` (and `.recent-clear`) must declare `width: auto; margin-top: 0` —
the app's global `button { width: 100%; margin-top: 10px }` rule otherwise makes
every chip a full-width stacked bar (the v1.25.1 bug). Long names are capped at
`max-width: 180px` with ellipsis so one entry can't monopolise a row.
This is purely local/client-side — no new network dependency — and is the
underlying motivation for the v1.23.0 "Resy ↗" review link (below): both let
the user quickly act on a place they've already looked up.

### Copy link to this search (v1.33.0)

Every non-empty `render()` result (single or multi-match) prepends a
`<button class="copy-link">🔗 Copy link to this search</button>` to `#results`,
ahead of the hero placard / cards. Its `data-url` is built from the same
`?q=Name&loc=Location` shape as the deep-link reader: `new URLSearchParams({
q: name })` plus `loc` from `locInput.value.trim()` when non-empty, joined onto
`${location.origin}${location.pathname}`. A single delegated click listener on
`#results` (registered once, since `render()` replaces `innerHTML` wholesale)
calls `navigator.clipboard.writeText(data-url)`, flashing the button text to
"✓ Link copied" (or "Copy failed" on a clipboard error) for 1.5s. Pure
client-side, no new network dependency — turns any search result (manual,
deep-link, or resolved Maps/share link) into a shareable bookmark without
re-deriving the iOS Shortcut flow.

### Favorites / pinned list (v1.34.0)

A second, manually-curated localStorage list — separate from the v1.23.0
`#recent` history, which records every successful search automatically.
Each card's `.meta` line gains a `.fav-toggle` button ("☆ Save" /
"★ Saved", `aria-pressed`) alongside the Map/Yelp/Resy links, keyed on
`info.dba` (name) + `info.boro` (loc) — the same pair used for the place,
not the searched term, so a chain's individual locations can be pinned
separately. `toggleFavorite(name, loc)` adds/removes `{ name, loc }` from
`localStorage` under `favorites` and returns the new pinned state;
`isFavorite(name, loc)` (called from `cardHtml`) determines each button's
initial label. `renderFavorites()` rebuilds `#favorites` — a `.recent`-style
chip row of `.fav-chip`s plus a "Clear favorites" button, shown only when
non-empty — and is called on load and after every toggle.

The existing delegated click listener on `#results` (added in v1.33.0 for
`.copy-link`) also handles `.fav-toggle`: it toggles the favorite, updates
the clicked button's text/`aria-pressed` in place (no full re-render), and
returns early. Clicking a `.fav-chip` refills `#q`/`#loc` and re-runs
`search()`, exactly like `.recent-chip`. `.fav-chip`/`.favorites-clear`/
`.fav-toggle` all declare `width: auto; margin-top: 0` per the v1.25.1
global-button-rule gotcha. Pure client-side, no new network dependency.

### Multi-result sort (v1.35.0)

When `render()` has more than one group, it prepends a `.sort-row` —
a `<select id="sort-select">` with options **As found** (default, the
DOHMH/address-match order), **Grade: best first** / **Grade: worst first**
(`gradeRank`: A=0, B=1, C=2, pending=3, tie-broken by score), **Name (A-Z)**
(`info.dba`), and — only when every group carries a `dist` (i.e. the
v1.20.0 "near me" results) — **Distance: nearest first**. `render()` stashes
the post-disambiguation `groups` array in module-level `currentGroups` and
wraps the card list in `<div id="cards-wrap">`. A delegated `change` listener
on `#results` re-sorts `currentGroups` via `sortGroups(groups, mode)` and
replaces only `#cards-wrap`'s `innerHTML` — the sort control, copy-link
button, and (absent, since `groups.length > 1`) hero placard are untouched.
Pure client-side re-ordering of already-fetched rows; no new request, no
change to single-result rendering (`.sort-row` is omitted entirely).

### Multi-result grade filter (v1.36.0)

Complements the v1.35.0 sort control. When `render()` has more than one
group **and** those groups span 2+ distinct grade categories (`filterCategory`
= `gradeClass(g.graded?.grade ?? null)`, i.e. `A`/`B`/`C`/`other` where
`other` covers Pending), it prepends a `.filter-row` of `.filter-chip`
toggle buttons — one per category *present*, in order A/B/C/Pending, each
labeled `A`/`B`/`C`/`Pending` with `aria-pressed="false"`. If only one
category is present (or there's a single result), `.filter-row` is omitted
entirely — filtering would do nothing.

Clicking a chip toggles its category in/out of the module-level
`activeFilters` Set (multi-select — e.g. show A and Pending together) and
flips its own `aria-pressed`, then calls `updateCardsWrap()`, which:
`visibleGroups(currentGroups)` filters to groups whose category is in
`activeFilters` (or all groups when the set is empty), re-sorts the result
via the existing `sortGroups(visible, currentSortMode)` so the filter
composes with whatever sort is selected, replaces only `#cards-wrap`, and
updates `#status` — appending ` · N of M shown` to `baseStatusText` when the
filter narrows the list, or restoring the plain `baseStatusText` when it
doesn't. `render()` resets `activeFilters` to empty and `currentSortMode` to
`'default'` on every new search. Pure client-side re-filtering of
already-fetched rows; no new request, no change to single-result or
single-category rendering.

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
   **Built in v1.26.0** (`reverseGeocode`) — see "Reverse-geocoded address recovery"
   above.

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

**Tiered design — implemented in v1.26.0:** parse the place path for
street/borough/ZIP → else regex `@lat,lng` and call Nominatim → keep
microlink/Jina as name-only resolvers. Added Nominatim as a new (best-effort)
network dependency and test 57 as the mocked case. See "Reverse-geocoded address
recovery (v1.26.0)" above.

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
  **Implemented in v1.26.0** (`reverseGeocode`, `COUNTY_BORO`, `#osm-attr`).
- **Photon** (`photon.komoot.io/reverse`) — best no-key fallback, CORS-open,
  returns `postcode`; demo server, no SLA. **Wired in as the v1.27.0 second tier**
  (`viaPhoton`) — `reverseGeocode` falls back to it when Nominatim 429s.
- **BigDataCloud is DISALLOWED for this app**: its fair-use policy permits only
  live device-GPS coordinates; feeding it coordinates parsed from a Maps URL
  violates policy (HTTP 402 + IP bans).
- **US Census geocoder**: reverse returns geographies only (no street/ZIP), JSONP
  not CORS — not useful.
- **Socrata sends CORS `*` platform-wide** (incl. data.ny.gov) → NYS Liquor
  Authority active-licenses joinable by address; data.ny.gov also mirrors
  `43nn-pn8j` (free failover instead of corsproxy.io). **Wired in as the v1.28.0
  `getJSON` tier-2 mirror** (`MIRROR`, deploy-verify id). Keyless Socrata shares a
  throttled per-IP pool; a free app token lifts to ~1000 req/hr (token not yet
  added — would need the user to register one).
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
  zero-width space to force re-announcement). **Both implemented**: `role="status"`
  in v1.16.0, the U+200B re-announce toggle in `setStatus` in v1.27.1. Do NOT add
  `role="button"`/
  `aria-expanded` to `<summary>` — native semantics already map them; extra ARIA
  causes double announcements. Keep a visible disclosure marker.
- `#q`/`#loc`/`#maps-input` relied on `placeholder` alone, with no programmatic
  label — screen readers announce placeholder text inconsistently and it
  disappears once the field has a value. **Implemented in v1.32.0**: a
  visually-hidden `<label for="...">` (`.sr-only`, clip-rect technique) per
  input, mirroring the placeholder text.
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
| Small helpers | `decode`, `setStatus`, `setError`, `gradeClass`, `fmtDate`, `fmtPhone`, `fmtDist`, `fmtFreshness`, `distM` |
| NYC DOHMH API | `buildUrl`, `buildNearbyUrl`, `getJSON` (tiered: primary → data.ny.gov mirror → corsproxy.io), `loadGradeDist`, `loadBoroGradeDist` |
| Violation-code categories | `splitCsvLine`, `parseViolCsv`, `loadViolCodes` (best-effort CSV enrichment) |
| Rendering | `groupByRestaurant`, `gradeContextHtml`, `scoreBarHtml`, `trendHtml`, `violationsHtml`, `historyHtml`, `lastCriticalHtml`, `gradeConsistencyHtml`, `boroCompareHtml`, `closureBannerHtml`, `cardHtml`, `placardHtml`, `scoreAddressMatch`, `render` |
| Search | `search`, `searchNearby` |
| Maps parsing | `stripShortLinkQuery`, `nameFromUrl`, `cleanTitle`, `boroFromAddr`, `coordsFromUrl`, `buildGeoAddr`, `viaNominatim`, `viaPhoton`, `reverseGeocode`, `splitPlace`, `parseShare`, `timeoutFetch`, `viaMapu`, `viaMicrolink`, `viaJina`, `resolveMapsLink` |
| Recently searched | `loadRecent`, `saveRecent`, `renderRecent` (localStorage-backed search history) |
| Wiring | `onMapsLink` (with auto-retry), `onShare` (name-first share-payload handler), event listeners, deep-link init on load |

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

## Design system v2 (v1.25.0)

The `.claude/skills/nyc-restaurant-grade-design/` skill was replaced wholesale with a
user-supplied v2 bundle (reverse-engineered from the v1.24 app, so tokens/components match
production). New in v2: components for the v1.15–v1.24 features (ScoreBar, Trend,
ViolationsList, InspectionHistory, ClosureBanner, Chip), `tokens/fonts.css` +
`assets/fonts/` (Liberation Sans Narrow), `tokens/interaction.css` (motion/focus/press
tokens), and a `templates/grade-lookup/` starter. Favicons are unchanged from the repo's.

Four production deltas were applied to the app from that spec:

1. **Brand logomark header.** `<h1>` replaced by `<header class="brand">` — a 34px
   `.brand-chip` (NYC-blue "A", 7px radius, white 700) beside the wordmark
   (`h1`, 17px/600, "NYC Restaurant" in `--text` + `<span>Grade</span>` in `--muted`).
   Mirrors the design system's `Logomark` component (horizontal, size 34).
2. **Placard webfont.** `@font-face` for Liberation Sans Narrow (Regular + Bold 700–900,
   `font-display: swap`) served from `assets/fonts/`; `.placard` font stack is now
   `"Liberation Sans Narrow", "Arial Narrow", Arial, sans-serif` — metric-compatible with
   Arial Narrow, so devices that have the commercial font render identically.
3. **Focus ring.** Inputs get a 3px NYC-blue halo (`box-shadow: 0 0 0 3px
   rgba(31,87,166,.45)`, the `--A` at 45%) plus an `--A` border on **any** focus;
   buttons only on `:focus-visible`. The `#maps-input:focus` selector is required
   separately — the plain `input:focus` rule loses specificity to `#maps-input`'s
   ID-selector border-color. This replaces the old bare `outline: none` (a11y fix).
4. **Result entrance motion.** `.card`/`.placard-wrap` get a 220ms
   `cubic-bezier(.2,.7,.3,1)` rise-in (opacity + 6px translateY), wrapped in
   `@media (prefers-reduced-motion: no-preference)` so reduced-motion users get none.

No JS changes — all four are markup/CSS only. Test 56 covers the lot.

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

### Live citywide grade distribution (v1.29.0)

The panel's "About **9 in 10** NYC restaurants score an A" sentence wraps its quantity in
`<span id="a-rate">9 in 10</span>`. The **first time the `#about` panel is opened**
(an `aboutEl` `toggle` listener, gated on `aboutEl.open`), `loadGradeDist()` runs one cached
aggregate query against the same dataset — `?$select=grade,count(*) as n&$where=grade in
('A','B','C')&$group=grade` (built with `encodeURIComponent` on the SoQL, via `getJSON` so it
inherits the v1.28.0 mirror/proxy failover) — and replaces the span text with the real figure
("91 in 100"). It's **deliberately lazy**: firing on panel-open (not on load, not in
`search()`) means the citywide query never runs during a plain lookup, so it adds no load-time
request and **can't perturb any test's `43nn-pn8j` call counting**. Best-effort and cached via
`gradeDistPromise` (like `violCodePromise`): a fetch error, non-200, or empty/zero total leaves
the static "9 in 10" copy untouched. Only the about-panel figure is made live — the per-card
`GRADE_CONTEXT.A` line keeps its static "9 in 10" wording (a card render must stay
network-free beyond its own search).

### Borough comparison (v1.31.0)

Each card with a borough carries a collapsed `<details class="boro-compare" data-boro=…
data-grade=…>` ("How does {Boro} compare?"). `loadBoroGradeDist(boro)` runs the same
`$group=grade` aggregate scoped to one borough (`upper(boro)='BROOKLYN' and grade in
('A','B','C')`, via `getJSON`), cached per borough in `boroDistCache`. The fetch is
**deferred to first open**: a single **capturing** `toggle` listener on `#results` (capturing
because the `toggle` event doesn't bubble) catches the panel's expansion, guards on
`.boro-compare` + `.open` + a `data-loaded` once-flag, fetches, and writes
`About N in 100 graded {Boro} restaurants are A. This one is graded X — in the
majority/minority.` On failure the body reads "Couldn't load borough comparison." Because the
fetch only fires on a user toggle, **a plain search makes no extra `43nn-pn8j` request** and no
existing card test (which never opens the panel) is perturbed — same lazy strategy as the
about-panel citywide figure (v1.29.0).

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

## Trend indicator & inspection freshness (v1.24.0)

Two more pure client-side derivations from data the app already has, both motivated by a
June 2026 research run on making the page more useful at a glance:

1. **Trend indicator.** `trendHtml(history)` compares `history[0].score` (most recent
   inspection) against `history[1].score` (the one before it) — `history` is already sorted
   newest-first by `groupByRestaurant`. Lower score is better, so a decrease renders
   `▲ Improving (N pts) since previous inspection` in green (`.trend-up`, `var(--B)`), an
   increase renders `▼ Declining (N pts) …` in orange (`.trend-down`, `var(--C)`), and an
   unchanged score renders `▬ No change …` in grey (`.trend-flat`, `var(--muted)`). Returns
   `''` when `history.length < 2` (same guard as `historyHtml`) or either score is
   non-numeric. Rendered in `cardHtml` directly after the score bar.

2. **Inspection freshness chip.** `fmtFreshness(latest.inspection_date)` (in "Small helpers")
   computes days since the most recent inspection of any type. NYC's inspection cycle is
   roughly annual, so `FRESHNESS_OVERDUE_DAYS` (545, ~18 months) without a new inspection is
   unusually overdue and surfaced as `Inspection overdue` (styled `.freshness-overdue`,
   `var(--C)`, bold). Otherwise renders `Inspected today` / `Inspected 1 day ago` / `Inspected
   N days ago` (< 60 days) / `Inspected N month(s) ago`. Rendered as the first item in
   `cardHtml`'s `.meta` line (before distance/cuisine/phone/review links).

## History-derived insights (v1.30.0)

Three more pure client-side derivations from rows `groupByRestaurant` already folds — **zero
new network calls**:

1. **Repeat-violation badge.** `groupByRestaurant` precomputes `priorDates` (`violation_code`
   → set of *earlier* inspection_dates) and tags each current violation with a `repeat` count.
   `violationsHtml` renders a `↻ repeat` chip (`.viol-repeat`, `var(--C)`, with a `title` of
   how many earlier inspections cited it) on any violation whose code recurred — distinguishing
   a systemic problem from a one-off. `repeat` is 0 (no badge) when the code only appears at the
   latest inspection.

2. **Last-critical line.** `groupByRestaurant` sets `g.lastCritical` to the most recent
   `critical_flag === 'Critical'` row across all inspections. `lastCriticalHtml(lastCritical,
   latestDate)` renders `Last critical violation: DATE · none at the latest inspection`
   (`.last-critical`) **only when that critical predates the latest inspection** — i.e. the
   latest visit was critical-free, a reassuring "they fixed it" signal. Hidden when the latest
   inspection itself has a critical (the current violation list already shows it).

3. **Grade-A consistency.** `gradeConsistencyHtml(history)` counts graded rows in the (≤6)
   history window and renders `Grade A at N of M recent inspections` (`.grade-consistency`),
   guarded on `≥2` graded inspections. Complements the per-card single-grade view with a
   track record.

All three are rendered by `cardHtml` (consistency after the trend line; last-critical after the
violation list) and need only data already fetched — they add no request and don't touch the
search/resolve paths.

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
the grade load automatically.

**Recommended — proven on-device June 2026 (7 actions, zero third-party resolvers):**
1. Shortcuts → **+** → name it **NYC Grade**
2. Tap **ⓘ** → enable **Show in Share Sheet** → **URLs** checked (URLs only) → Done
3. Actions in order:
   - **Receive** URLs from Share Sheet
   - **Text** — content: the Shortcut Input variable (converts the URL item to its
     URL *string*; see the coercion gotchas below)
   - **Split Text** — by **Custom**: `?` (strips iOS's `?g_st=…` share-sheet param,
     which makes Firebase serve its error page instead of redirecting)
   - **Get Item from List** — **First Item**
   - **Expand URL** — input: Item from List (follows Google's redirect **on-device**,
     residential IP; verified working June 2026 — returned a full
     `google.com/maps?q=NAME` URL, no consent interstitial)
   - **URL Encode** — input: Expanded URL
   - **Open URLs** → `https://shihhsien.github.io/tools/nyc-restaurant-grade.html?share=` + URL Encoded Text

The app receives a full Maps URL and parses the name client-side — the
mapu/microlink/jina resolver race never runs for the Shortcut flow. If Expand
ever fails, `?share=` still falls back to the resolver pipeline (worst case =
manual-paste behavior).

**Shortcuts coercion gotchas (hard-won, June 2026):**
- Google Maps shares a **URL-only payload** — no name text. The v1.19.0 hope that
  the share text carries the restaurant name is dead for this share path.
- A shared link is an *object*, not a string. Actions that coerce it to text
  (URL Encode directly on Shortcut Input, **Get URLs from Input**) make iOS fetch
  the link's **page title** — for a `g_st`-poisoned short link that's Firebase's
  "Invalid Dynamic Link" error page. "Get URLs from Input" then finds no URL in
  that title and outputs an **empty list**, which flows silently to the end
  (`?share=` arrives empty — Shortcuts never fails loudly). The plain **Text**
  action is the one conversion observed to yield the URL string itself.
- If the Receive types get unchecked (e.g. "Maps Links" checked instead of
  **URLs**), the same title-coercion failure occurs before the first action.

**Older `?q=` version (manual typing fallback):**
- Receive URLs → **Ask for Input** (`Restaurant name?`) → **URL Encode** →
  **Open URLs** `…?q=` + encoded text.

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

**Required test cases (71 cases, 334 assertions — all must pass):**

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
| 38 | Card meta line (cuisine, phone, map link) + `role="status"` | `.meta` text includes cuisine; `.meta a[href^="tel:"]` text is formatted phone; `.meta a[href*="google.com/maps/search"]` href (decoded) includes the restaurant name; `#status` has `role="status"` |
| 39 | viaMicrolink falls back to title for borough when URL has none | mock microlink `data.url` with no borough + `data.title` containing "Brooklyn, NY"; `#loc === 'BROOKLYN'`; card shown with name MAZZAT |
| 40 | nameFromUrl extracts from `/maps/search/?api=1&query=NAME` | full URL via `triggerMaps`, no resolver call; `#q` filled with MAZZAT; card shown |
| 41 | stripShortLinkQuery drops tracking query string from short links | short link with `?g_st=...` via `triggerMaps`; captured `mapu` request URL has no `g_st`; card shown |
| 42 | splitPlace falls back to ZIP when no borough is found in the address | mapu returns place URL with address lacking a borough name but containing a 5-digit ZIP; `#loc === '11231'`; card shown |
| 43 | "What do these grades mean?" explainer panel (static) | `#about` present and collapsed; text includes `0–13` + "lower is better" + mentions "Grade Pending" and "Closed by DOHMH" |
| 44 | Per-card grade-context line (A tier) | `.grade-ctx` present; text mentions "9 in 10" |
| 44b | Pending context line when no letter grade | row with `grade:null` → `.grade-ctx` present; text mentions "re-inspected" |
| 45 | Violation category label from reference CSV | mock `raw.githubusercontent.com` CSV; violation `04L` → `.viol-cat` text === "Vermin / Pests" |
| 45b | Violation category degrades gracefully when CSV unavailable | mock CSV → `E`; `.viol-item` still renders; no `.viol-cat` |
| 46 | `?share=` blob with name+address+link — direct search, no resolvers | resolver routes never hit; `#q` = name; `#loc` = borough from address line; card shown |
| 46b | `?share=` bare short link falls back to resolver pipeline | payload is only a short link; mock mapu → card shown |
| 47 | `?share=` name search finds nothing → falls back to URL resolution | name "Ghostplace" returns `[]`, then resolved URL's name returns a row; ≥2 DOHMH calls; card shown |
| 47b | `?share=` junk page title rejected, no search fired | payload `Invalid Dynamic Link` (no URL); DOHMH never called; `#q` stays empty; status shows "Couldn't read" |
| 48 | Near me — `within_circle` query, sorted nearest first | `#near` clicked; mocked geolocation; query has `within_circle`; 2 cards, nearest first; status mentions radius; card `.meta` shows distance |
| 48b | Near me falls back to lat/lng bounding box when `within_circle` 400s | `within_circle` attempted first; fallback query has `latitude >`/`latitude <`; card shown via bbox |
| 49 | Near me — geolocation permission denied | mocked `getCurrentPosition` error code 1; DOHMH never called; error mentions "permission denied" |
| 50 | Review links (Google place search + Yelp + Resy) on card meta | Map link href includes `google.com/maps/search/?api=1`, decoded query has name + street; Yelp link href includes `yelp.com/search`, decoded has `find_desc=` name and street in `find_loc`; Resy link href includes `resy.com`, decoded includes the restaurant name |
| 51 | Address-based chain disambiguation | Resolved short link's address narrows 2 same-name DOHMH matches to 1 card; status notes "matched by address"; placard hero shown; `.addr` matches the address-hint location |
| 52 | Recently-searched list | empty on first load; successful search adds a `.recent-chip` with the searched name; chip is a compact pill, not full-width (offsetWidth < half of `#recent`'s); persists across reload (localStorage); clicking a chip refills `#q` and re-searches; "Clear recent" empties the list |
| 53 | `&` in name extracted from `?q=` URL | `https://www.google.com/maps?q=Muteki+Udon+%26+Ramen` resolves directly (no resolver calls); `#q`/`.name` show "MUTEKI UDON & RAMEN" |
| 54 | Trend indicator — improving | two-inspection history, latest score lower than previous → `.trend.trend-up` present, text includes "Improving" and "(N pts)" |
| 54b | Trend hidden for single inspection | `history.length < 2` → no `.trend` element |
| 55 | Inspection freshness chip — today | row with `inspection_date` = now → `.meta .freshness` text === "Inspected today" |
| 55b | Inspection freshness chip — overdue | row with `inspection_date` far in the past → `.meta .freshness.freshness-overdue` text === "Inspection overdue" |
| 56 | Design system v2 — brand header, focus ring, placard webfont | `.brand-chip` text === "A"; `h1` text === "NYC Restaurant Grade"; focused `#q` has a non-`none` computed `box-shadow`; `.placard` computed font-family includes "Liberation Sans Narrow" |
| 57 | Nominatim reverse-geocode enriches a coordinate-only Maps link for disambiguation | resolver returns a name-only `@lat,lng` place URL; Nominatim mock hit; 2 same-name DOHMH matches narrowed to 1 card; status "matched by address"; `.addr` includes "SMITH ST"; `#osm-attr` visible |
| 58 | Photon reverse-geocode fallback when Nominatim 429s | name-only `@lat,lng` place URL; Nominatim returns HTTP 429; Photon mock hit; 2 same-name DOHMH matches narrowed to 1 card; status "matched by address"; `.addr` includes "SMITH ST"; `#osm-attr` visible |
| 59 | Status live-region re-announce on identical repeat | press `#go` with `#q` empty twice; first status has guard text and no U+200B; second (identical) status gets a trailing U+200B appended so `role="status"` re-announces |
| 60 | getJSON failover — primary fails → data.ny.gov mirror serves it | primary host 500s; mirror (`data.ny.gov`) returns the row; `corsproxy.io` never hit; card renders |
| 60b | getJSON failover — primary + mirror fail → corsproxy.io last resort | primary 500s, mirror 404s; proxy serves the row; card renders |
| 60c | getJSON happy path — primary OK, no failover calls | primary returns 200; neither mirror nor proxy is touched |
| 61 | Live citywide grade distribution replaces "9 in 10" on about-panel open | `#a-rate` is "9 in 10" before; dist query (`$group=grade`) NOT fired on load; opening `#about` fires it; `#a-rate` becomes "91 in 100" (910/1000) |
| 61b | Grade-dist query doesn't interfere with a plain search | a normal search makes exactly 1 `43nn-pn8j` call; the `$group=grade` dist query never fires; card renders |
| 62 | Repeat-violation badge | a `violation_code` cited at the latest inspection AND an earlier one renders a `.viol-repeat` chip; text says "repeat" |
| 62b | No badge for a one-off violation | a code present only at the latest inspection → no `.viol-repeat` |
| 63 | Last-critical line when latest is clean | a prior `Critical` row with a critical-free latest inspection → `.last-critical` present, text "Last critical" |
| 63b | Last-critical hidden when latest has a critical | latest inspection itself has a `Critical` flag → no `.last-critical` |
| 64 | Grade-A consistency count | 3 graded inspections, 2 grade A → `.grade-consistency` text "Grade A at 2 of 3 recent inspections" |
| 64b | Consistency hidden for a single inspection | one inspection → no `.grade-consistency` |
| 65 | Borough comparison panel (opt-in, fetched on open) | card has a collapsed `.boro-compare`; a plain search fires no boro query (1 search call); opening it runs the `$group=grade` query scoped to `upper(boro)='BROOKLYN'` and shows "About 88 in 100 graded Brooklyn restaurants are A. This one is graded A — in the majority." |
| 65b | Borough comparison degrades gracefully | boro query (and mirror/proxy) all 500 → panel body reads "Couldn't load borough comparison." |
| 66 | Accessible labels for `#q`/`#loc`/`#maps-input` (v1.32.0) | `label[for="q"]`, `label[for="loc"]`, `label[for="maps-input"]` all present with non-empty text, each `for` resolves to a real input id, and each label is visually hidden via `.sr-only` |
| 67 | "Copy link to this search" button (v1.33.0) | `.copy-link` present on a non-empty result; click copies a `?q=...` URL via `navigator.clipboard.writeText` (stubbed); button text becomes "✓ Link copied" |
| 68 | Favorites / pinned list (v1.34.0) | `#favorites` empty before any interaction; `.fav-toggle` shows "☆ Save" (`aria-pressed="false"`); click toggles to "★ Saved" (`aria-pressed="true"`) and adds a `.fav-chip` to `#favorites`; persists across reload; clicking `.fav-chip` refills `#q` and re-searches with `.fav-toggle` showing "★ Saved"; toggling off removes it; "Clear favorites" empties the list |
| 69 | Multi-result sort (v1.35.0) | 3-result search shows `.sort-row`/`#sort-select` with `default`/`grade-asc`/`grade-desc`/`name` options (no `distance`, no `dist` data); default order is fetch order; `grade-asc` re-orders best-grade-first; `name` re-orders A-Z; single-result search has no `.sort-row` |
| 70 | Multi-result grade filter (v1.36.0) | 4-result search (grades C/A/B/Pending) shows `.filter-row` with exactly 4 `.filter-chip`s in order A/B/C/Pending, all `aria-pressed="false"`; clicking the A chip shows only the A result and status reads "1 of 4 shown"; additively clicking the Pending chip shows A+Pending (2 of 4 shown); deselecting both restores all 4 and the plain status text; composes with `#sort-select` (grade-asc + C filter shows only the C result) |
| 70b | Same-grade multi-result has no filter row | 2-result search where both results are grade A → `.filter-row` absent (filtering would do nothing), `.sort-row` still present |

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
- For the card meta test (test 38, v1.16.0, updated v1.21.0): mock a row with `cuisine_description:'Japanese'`, `phone:'2125551234'`. Assert `.meta` textContent includes `Japanese`; `.meta a[href^="tel:"]` textContent === `(212) 555-1234` (via `fmtPhone`); `decodeURIComponent` of `.meta a[href*="google.com/maps/search"]`'s href includes the restaurant name (the v1.21.0 place-search link replaced the old `maps.google.com/?q=LAT,LNG` pin); and `#status` `getAttribute('role') === 'status'`.
- For the microlink title-borough-fallback test (test 39, v1.16.1): trigger a `maps.app.goo.gl` short link via `triggerMaps`. Mock `mapu.retiolus.net` and `jina.ai` as always-fail (`E`). Mock `microlink.io` to return `{ data: { url: 'https://www.google.com/maps/place/Mazzat/@40.6840,-73.9970,17z', title: 'Mazzat - Brooklyn, NY - Google Maps' } }` — note the `data.url` has no borough (no comma-separated address segment), but `data.title` has "Brooklyn, NY". Mock `43nn-pn8j` to `J([MAZZAT])`. Wait for `.card`, then assert `#loc` value `=== 'BROOKLYN'` (proves `boroFromAddr(data.title)` fallback fired since `boroFromAddr(data.url)` finds nothing) and `.name === 'MAZZAT'`.
- For the `?query=` param test (test 40, v1.16.2): trigger `https://www.google.com/maps/search/?api=1&query=Mazzat&g_st=ic` via `triggerMaps`. Mock only `43nn-pn8j` to `J([MAZZAT])` — no resolver routes should be hit, since `nameFromUrl` resolves `?query=` directly without a network call. Wait for `.card`, then assert `#q` (uppercased) `=== 'MAZZAT'` and `.name === 'MAZZAT'`.
- For the `stripShortLinkQuery` test (test 41, v1.16.3): trigger `https://maps.app.goo.gl/TEST?g_st=com.apple.shortcuts.Run-Workflow.(null)` via `triggerMaps`. Mock `mapu.retiolus.net` with a function handler that captures the request URL and returns `J({ full_link: 'https://www.google.com/maps/place/Mazzat/@40.6840,-73.9970,17z' })`; mock `microlink.io`/`jina.ai` as always-fail (`E`); mock `43nn-pn8j` to `J([MAZZAT])`. Wait for `.card`, then assert the captured `mapu` URL's `link` param (decoded) does NOT include `g_st`, and `.name === 'MAZZAT'`.
- For the splitPlace ZIP-fallback test (test 42, v1.17.0): mock mapu to return `{ full_link: 'https://www.google.com/maps/place/Mazzat,+247+Smith+St,+11231/@40.67,-73.99' }` — note the address has no borough keyword (no "Brooklyn"/"Manhattan"/etc), only a 5-digit ZIP. Mock `microlink.io`/`jina.ai` as always-fail (`E`); mock `43nn-pn8j` to `J([MAZZAT])`. Wait for `.card`, then assert `#loc === '11231'` (proves the ZIP fallback in `splitPlace` fired since `boroFromAddr` found nothing) and `.name === 'MAZZAT'`.
- For the about-grades panel test (test 43, v1.18.0): static — `setupRoute(p, [])`, no search. Assert `#about` present, `el.open === false`, and its `textContent` includes `0–13` (use an en dash, not a hyphen — it must match the HTML) and `lower is better`, and mentions both `Grade Pending` and `Closed by DOHMH`.
- For the grade-context tests (tests 44/44b, v1.18.0): plain DOHMH search. Test 44: `J([MAZZAT])` (grade A) → `.grade-ctx` present, text includes `9 in 10`. Test 44b: a row with `grade:null, grade_date:null` → `.grade-ctx` present, text includes `re-inspected` (the `PENDING_CONTEXT` string).
- For the violation-category tests (tests 45/45b, v1.18.0): test 45 mocks `raw.githubusercontent.com` → `TX(csv)` where `csv` is a header line `Violation_Code,Health_Code,Violation_Summary,Category_Description` plus a row `04L,§81.11,Live mice present,Vermin / Pests`, and `43nn-pn8j` with a row whose `violation_code:'04L'` + a `violation_description`. Wait for `.card`, assert `.viol-cat` present and text `=== 'Vermin / Pests'`. Test 45b mocks `raw.githubusercontent.com` → `E`; assert the `.viol-item` still renders and `.viol-cat` is absent (graceful degradation). **All other tests leave `raw.githubusercontent.com` unmocked** — `setupRoute` aborts it, `loadViolCodes` swallows the failure → `{}` → no `.viol-cat` and no `pageerror`, so the existing cases are unaffected.

- For the `?share=` tests (tests 46/46b/47, v1.19.0): pass `pageUrl = BASE + '?share=' + encodeURIComponent(payload)` and set up routes in `setup` (load-time resolution). Test 46's payload is `'Mazzat\n247 Smith St, Brooklyn, NY 11231\nhttps://maps.app.goo.gl/TEST'` — assert no resolver route is hit (name wins), `#q` = MAZZAT, `#loc` = BROOKLYN (mined from the address line), card shown. Test 46b's payload is the bare short link — `parseShare` finds no name, so `onShare` routes it to `onMapsLink` (mock mapu → card). Test 47's payload is `'Ghostplace\nhttps://maps.app.goo.gl/TEST'` with a conditional DOHMH mock returning `[]` unless the decoded URL contains MAZZAT — proves the empty name search falls back to URL resolution (`dohmhCalls >= 2`). Test 47b's payload is the bare text `Invalid Dynamic Link` (a Firebase error-page title — iOS coercing a URL-only share payload to text can fetch the link's page title, and the g_st-poisoned short link serves Firebase's error page). `parseShare` rejects `JUNK_TITLE` matches as names; with no URL either, `onShare` shows the "Couldn't read the shared content" status and never queries DOHMH (mock `43nn-pn8j` with a hit-flag handler and assert it stays false, `#q` stays empty).
- For the near-me tests (48/48b/49, v1.20.0): mock `navigator.geolocation.getCurrentPosition` via `page.addInitScript` (must run before `goto` on `file://` pages) — e.g. `navigator.geolocation.getCurrentPosition = ok => ok({ coords: { latitude: 40.68, longitude: -73.99 } })` for success, or `(ok, err) => err({ code: 1, message: 'denied' })` for test 49. Click `#near` (not `#go`) and `waitForSelector('.card')` or `waitErr`. Test 48: mock `43nn-pn8j` to return two fixtures with `latitude`/`longitude` at different distances from the mocked position; assert the captured `$where` (decoded) includes `within_circle`, the nearer restaurant's card is first, status mentions `within 300`, and `.meta` includes "m away". Test 48b: have the `43nn-pn8j` mock return HTTP 400 when the URL contains `within_circle` and 200 otherwise; assert the bbox fallback fires and its `$where` (after replacing `+` with a space before `decodeURIComponent`, since `+` isn't decoded by `decodeURIComponent`) includes `latitude >`. Test 49: assert DOHMH is never called and the error message mentions "permission denied".
- For the review-links test (test 50, v1.21.0, updated v1.23.0): plain DOHMH search with `J([MAZZAT])`. All three links are built with `encodeURIComponent` (spaces become `%20`, recovered by `decodeURIComponent` — unlike the `+` from `URLSearchParams` elsewhere). Assert the Map link: `.meta a[href*="google.com/maps/search"]` exists, its href includes `api=1`, and its decoded href includes `MAZZAT` and `MAIN ST` (name + street in the query). Assert the Yelp link: `.meta a[href*="yelp.com/search"]` exists, its decoded href includes `find_desc=MAZZAT` and `MAIN ST` (street in `find_loc`). Assert the Resy link: `.meta a[href*="resy.com"]` exists and its decoded href includes `MAZZAT`. All three render whenever `dba` is present — no coordinates required.
- For the address-disambiguation test (test 51, v1.22.0): mock `mapu.retiolus.net` → `J({ full_link: 'https://www.google.com/maps/place/Mazzat,+247+Smith+St,+Brooklyn,+NY+11231/@40.67,-73.99' })` (microlink/jina as `E`), and `43nn-pn8j` → `J([MAZZAT_A, MAZZAT_B])` where both fixtures share `dba: 'MAZZAT'` but differ in `camis`/`building`/`street`/`boro`/`zipcode` — `MAZZAT_A` (`building:'247', street:'SMITH ST', boro:'Brooklyn', zipcode:'11231'`) matches the resolved address; `MAZZAT_B` (`building:'500', street:'ATLANTIC AVE', boro:'Brooklyn', zipcode:'11217'`) does not. Trigger the short link via `triggerMaps`, wait for `.card`, then assert exactly 1 `.card`, `#status` includes "matched by address", `.placard-wrap` is present (hero shown for the narrowed single result), and `.addr` includes "SMITH ST".
- For the recently-searched test (test 52, v1.23.0, updated v1.25.1): plain DOHMH search with `J([MAZZAT])`. Assert `#recent` is empty (`innerHTML.trim() === ''`) before any search. Search for `MAZZAT`, wait for `.recent-chip`, assert its `textContent === 'MAZZAT'`. Assert the chip renders as a compact pill, not a full-width bar: `chip.offsetWidth < recentEl.offsetWidth / 2` (guards the v1.25.1 `width: auto; margin-top: 0` override of the global `button { width: 100% }` rule). Reload the page and assert the chip still shows `MAZZAT` (proves `localStorage` persistence). Clear `#q`, click `.recent-chip`, wait for `.card`, and assert `#q` is refilled with `MAZZAT`. Click `.recent-clear` and assert `#recent` is empty again.
- For the `&`-in-name test (test 53, v1.23.1): trigger `https://www.google.com/maps?q=Muteki+Udon+%26+Ramen` via `triggerMaps`. Mock `mapu.retiolus.net`/`microlink.io`/`jina.ai` as always-fail (`E`) — `nameFromUrl` should resolve `?q=` directly without any resolver call. Mock `43nn-pn8j` to `J([mkRow({ dba: 'MUTEKI UDON & RAMEN' })])`. Wait for `.card`, then assert `#q` (uppercased) `=== 'MUTEKI UDON & RAMEN'` and `.name === 'MUTEKI UDON & RAMEN'` — proves `isName`'s reject-regex no longer rejects names containing `&`.
- For the trend tests (tests 54/54b, v1.24.0): plain DOHMH search. Test 54 mocks two rows sharing `camis`/`dba`, distinct `inspection_date`s — newest with `score:'5'`, older with `score:'20'`. `groupByRestaurant` sorts `history` newest-first, so `history[0].score (5) < history[1].score (20)` → improving. Assert `.trend.trend-up` present and its text includes `Improving` and `(15 pts)`. Test 54b mocks a single row (`J([MAZZAT])`) — `history.length < 2` → assert `.trend` is absent.
- For the freshness tests (tests 55/55b, v1.24.0): plain DOHMH search. Test 55 mocks a row with `inspection_date: new Date().toISOString()` (today, computed at test-run time so it's always "now") — assert `.meta .freshness` present and `textContent === 'Inspected today'`. Test 55b mocks a row with `inspection_date: '2018-01-01T00:00:00.000'` (always > `FRESHNESS_OVERDUE_DAYS` old) — assert `.meta .freshness.freshness-overdue` present and `textContent === 'Inspection overdue'`.

- For the design-system test (test 56, v1.25.0): plain DOHMH search with `J([MAZZAT])` (single result so `.placard` renders). Before searching, assert `.brand-chip` textContent `=== 'A'` and `h1` textContent `=== 'NYC Restaurant Grade'`. Then `page.focus('#q')` and assert `getComputedStyle` `boxShadow !== 'none'` (the NYC-blue focus ring). After the card renders, assert `getComputedStyle(document.querySelector('.placard')).fontFamily` includes `Liberation Sans Narrow` — computed font-family reports the declared stack, so this holds even if the TTF doesn't load under `file://`.
- For the Nominatim reverse-geocode test (test 57, v1.26.0): two same-name DOHMH fixtures (reuse test 51's `MAZZAT_A` = `building:'247', street:'SMITH ST'` and `MAZZAT_B` = `building:'500', street:'ATLANTIC AVE'`). Mock `mapu.retiolus.net` → `J({ full_link: 'https://www.google.com/maps/place/Mazzat/@40.6782,-73.9929,17z' })` — a **name-only place path with `@lat,lng` but no comma-address**, so `splitPlace`'s `addr` is empty and the coordinate path fires. Mock `microlink.io`/`jina.ai` → `E`. Mock `nominatim.openstreetmap.org` with a flag handler (`nominatimHit = true`) returning `J({ address: { house_number:'247', road:'Smith Street', borough:'Brooklyn', county:'Kings County', state:'New York', postcode:'11231' } })`. Mock `43nn-pn8j` → `J([MAZZAT_A, MAZZAT_B])`. Trigger the short link via `triggerMaps`, `waitForSelector('.card', { timeout: 20000 })` (resolver + Nominatim round-trips). Assert: `nominatimHit === true` (coords extracted and reverse-geocode called), exactly 1 `.card` (disambiguation narrowed), `#status` includes `matched by address`, `.addr` includes `SMITH ST` (the 247 location won), and `#osm-attr` is visible (`getComputedStyle(el).display !== 'none'` — attribution revealed on use). Declare `nominatimHit` outside `setup`/`fn`. **Note:** the existing resolver tests whose mapu mock returns a name-only `@coords` URL (e.g. tests 12/15/41) now also reach `reverseGeocode`, but `nominatim.openstreetmap.org` **and** `photon.komoot.io` are both unmocked there → `setupRoute` aborts them → each tier's fetch rejects → `reverseGeocode` returns `null` → card still renders name-only, no `pageerror`. Do not add geocoder mocks to those tests.
- For the Photon reverse-geocode fallback test (test 58, v1.27.0): identical setup to test 57 (reuse `MAZZAT_A`/`MAZZAT_B`, name-only `@lat,lng` mapu mock, microlink/jina → `E`), but mock `nominatim.openstreetmap.org` → **HTTP 429** (`{ status: 429, ct: 'text/plain', body: 'rate limited' }`) so tier 1 fails, and mock `photon.komoot.io` with a flag handler (`photonHit = true`) returning the GeoJSON shape `J({ features: [{ properties: { housenumber:'247', street:'Smith Street', district:'Brooklyn', county:'Kings County', postcode:'11231' } }] })`. Mock `43nn-pn8j` → `J([MAZZAT_A, MAZZAT_B])`. Trigger the short link via `triggerMaps`, `waitForSelector('.card', { timeout: 20000 })`. Assert: `photonHit === true` (Nominatim 429 → Photon fallback fired), exactly 1 `.card`, `#status` includes `matched by address`, `.addr` includes `SMITH ST`, and `#osm-attr` is visible. Declare `photonHit` outside `setup`/`fn`.
- For the history-insight tests (tests 62–64b, v1.30.0): plain DOHMH searches (`#q`+`#go`), single `43nn-pn8j` mock returning multi-row fixtures that share one `camis` so `groupByRestaurant` folds them. Test 62: two rows, same `violation_code:'04L'`, distinct `inspection_date`s (latest + an earlier one) → assert `.viol-repeat` present (`state:'attached'`, the `<details>` is collapsed) and its text includes `repeat`. Test 62b: a code only at the latest date → no `.viol-repeat`. Test 63: a `critical_flag:'Critical'` row at an *earlier* date plus a critical-free latest row → assert `.last-critical` present, text includes `Last critical`. Test 63b: the latest inspection itself carries the `Critical` flag → no `.last-critical`. Test 64: three rows, distinct dates, grades A/B/A → assert `.grade-consistency` text === `Grade A at 2 of 3 recent inspections`. Test 64b: a single inspection → no `.grade-consistency`. None of these add network calls.
- For the borough-comparison tests (tests 65/65b, v1.31.0): the boro query also carries `$group=grade` (so split the `43nn-pn8j` mock the same way as test 61). Test 65: function handler — `u.includes('group=grade')` sets `boroHit=true`, captures `boroUrl`, returns `J([{grade:'A',n:'880'},{grade:'B',n:'90'},{grade:'C',n:'30'}])`; otherwise count `searchCalls` and return `J([MAZZAT])` (MAZZAT's boro is Brooklyn). After a plain search assert `.boro-compare` present, `!boroHit && searchCalls===1` (deferred), and the summary names the borough. Click `.boro-compare summary`, `waitForFunction` until `.boro-compare-body` no longer contains "Loading", then assert `boroHit`, `decodeURIComponent(boroUrl)` includes `upper(boro)='BROOKLYN'`, and the body includes `88 in 100` + `majority` (880/1000 → 88%). Test 65b: make the boro query and the `data.ny.gov`/`corsproxy.io` failover all return 500 → assert the body includes `Couldn't load`. **Note:** like the v1.29.0 dist query, this only fires on a user toggle, so no other test is affected.
- For the live grade-distribution tests (tests 61/61b, v1.29.0): the dist query hits the same `43nn-pn8j` host but is uniquely identifiable by `$group=grade` (which survives as the literal substring `group=grade` because only the `$select`/`$where` are `encodeURIComponent`-wrapped). Test 61: mock `43nn-pn8j` with a function handler that, when `u.includes('group=grade')`, sets `distHit=true` and returns `J([{grade:'A',n:'910'},{grade:'B',n:'70'},{grade:'C',n:'20'}])`, else returns `J([MAZZAT])`. After load assert `#a-rate` text === `9 in 10` and `!distHit` (lazy — not fired on load). Click `#about > summary`, `waitForFunction` until `#a-rate` text !== `9 in 10`, then assert `distHit` and `#a-rate` === `91 in 100` (910/1000 → 91%). Test 61b: same split handler but count non-dist `43nn-pn8j` calls in `searchCalls`; do a plain `#q`+`#go` search and assert `!distHit` (never fires for a search) and `searchCalls === 1` (the dist query adds no search-path request). **Note:** because the dist query only fires on `#about` open, no other test that counts `43nn-pn8j` calls is affected — they never open the panel.
- For the getJSON failover tests (tests 60/60b/60c, v1.28.0): plain DOHMH search (`#q` fill + `#go`), but route the three hosts separately with hit-flags declared outside `setup`/`fn`. Test 60: `data.cityofnewyork.us` → HTTP 500, `data.ny.gov` (flag `mirrorHit`) → `J([MAZZAT])`, `corsproxy.io` (flag `proxyHit`) → also serves it; assert `mirrorHit && !proxyHit` (the official mirror is preferred over the proxy) and the card renders. Test 60b: `data.cityofnewyork.us` → 500, `data.ny.gov` → 404, `corsproxy.io` (flag) → `J([MAZZAT])`; assert `proxyHit` and the card renders (proxy is the last resort). Test 60c: `data.cityofnewyork.us` → `J([MAZZAT])`, mirror/proxy handlers set flags then `r.abort()`; assert neither was hit (primary success short-circuits — no regression). Note the mirror swap only fires for URLs with the `API` prefix, so the violation CSV and resolver fetches are unaffected.
- For the status re-announce test (test 59, v1.27.1): no mocks needed for the search path — exercise the empty-input guard, which calls `setStatus` directly with no intervening status change (a successful search interleaves a "Looking up…" status, so its result already differs from the prior text and re-announces naturally — the guard double-press is the genuine back-to-back-identical case). Build `ZWSP = String.fromCharCode(0x200B)` (don't type the literal char — Write/Edit can mangle invisible codepoints). Click `#go` with `#q` empty, assert `#status` text includes `Enter a restaurant name` and does NOT include `ZWSP`. Click `#go` again (still empty), assert the status now includes both `Enter a restaurant name` **and** `ZWSP` (the toggle appended it so the aria-live region re-announces). The substring checks elsewhere are unaffected because U+200B is invisible and `.includes()` on the visible text still matches.
- For the multi-result sort test (test 69, v1.35.0): three fixtures sharing a query term but distinct `dba`s — `AAA PLACE` (grade C, score 30), `BBB PLACE` (grade A, score 3), `CCC PLACE` (grade B, score 15) — mocked via `J([AAA, BBB, CCC])` for a search on "PLACE" (all three match). None carry a `dist` field. Wait for `.card`, then assert `.sort-row` and `#sort-select` are present, and `#sort-select option` values are exactly `default`/`grade-asc`/`grade-desc`/`name` (no `distance` option, since no group has `dist`). Assert default `.name` order is `[AAA, BBB, CCC]` (fetch order). `page.selectOption('#sort-select', 'grade-asc')` → assert order `[BBB, CCC, AAA]` (A, B, C by `gradeRank`). `page.selectOption('#sort-select', 'name')` → assert order `[AAA, BBB, CCC]` (alphabetical). Then a separate plain single-result search (`J([MAZZAT])`) asserts `.sort-row` is absent (`groups.length === 1`).
- For the multi-result grade filter tests (tests 70/70b, v1.36.0): reuse the test 69 `AAA PLACE` (grade C) / `BBB PLACE` (grade A) / `CCC PLACE` (grade B) fixtures plus a new `DDD PLACE` (no grade, i.e. Pending), mocked via `J([AAA, BBB, CCC, DDD])` for a search on "PLACE". Wait for `.card`, then assert `.filter-row` is present with exactly 4 `.filter-chip`s in order A/B/C/Pending (text content `A`/`B`/`C`/`Pending`), all `aria-pressed="false"`. Click the A chip → assert exactly 1 visible card (`BBB PLACE`) and `#status` includes `1 of 4 shown`. Click the Pending chip too (additive) → assert 2 visible cards (`BBB PLACE`+`DDD PLACE`) and `#status` includes `2 of 4 shown`. Click both chips again to deselect → assert all 4 cards visible and `#status` reads the plain `4 match(es) · official data` (no `shown` suffix). To check composition with sort, `page.selectOption('#sort-select', 'grade-asc')` then click the C chip → assert exactly 1 visible card (`AAA PLACE`). Test 70b: a separate search returning two same-grade-A fixtures (`EEE PLACE`/`FFF PLACE`) → assert `.filter-row` is absent (filtering would do nothing) while `.sort-row` is still present.

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
  `?`/`=`, must not start with `http`. This prevents coordinates, raw short
  codes (`qMJfabamuYZjqp4W8?g_st=ic`), and unexpanded URLs from reaching the
  name field.

- **`isName` must NOT reject `&` (v1.23.1).** `&` is a legitimate character in
  restaurant names ("Muteki Udon & Ramen"). A `?q=`/`?query=` value already comes
  from `URLSearchParams`, which decodes `%26` to a literal `&` — it can't carry an
  unencoded `&` separator. The `?`/`=` checks alone are sufficient to reject
  tracking-param garbage like `?g_st=ic`. Do not re-add `&` to the reject regex.

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
Current: **v1.36.0**

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
- v1.18.1 — `viaMicrolink` debug trace now logs the resolved `data.url`/`data.title` (mirrors `viaJina`'s logging), closing a diagnostic gap: a live failure showed microlink returning HTTP 200 with an unusable URL, but the trace couldn't show what Google actually served it
- v1.19.0 — `?share=` deep link accepts the raw iOS share-sheet payload (name, Maps URL, or Google Maps' "name\naddress\nlink" text blob); `parseShare` extracts name + borough/ZIP, `onShare` searches the name directly (zero resolver calls) and falls back to URL resolution only when the name is missing or finds nothing; `render`/`search` now return the result count to enable the fallback; recommended iOS Shortcut becomes 3 actions (Receive Text/URLs → URL Encode → Open `?share=`); motivated by live resolver failures — Google blocking mapu/microlink/jina's datacenter IPs — that the share text sidesteps entirely; tests 46–47 added (47 cases, 171 assertions)
- v1.19.1 — `parseShare` rejects `JUNK_TITLE` matches as names, and `JUNK_TITLE` gains "Invalid Dynamic Link": live testing showed Google Maps shares a URL-only payload, and Shortcuts' text coercion fetches the link's page title on-device — for a `g_st`-poisoned short link that's Firebase's error page, so the app was searching DOHMH for "INVALID DYNAMIC LINK"; test 47b added (47 cases, 175 assertions)
- v1.19.2 — iOS tip's Install Shortcut button now links the proven 7-action Expand-URL shortcut (icloud.com/shortcuts/15ee0520647c4598a2da68b9d3070e6c), replacing the old 4-action ?maps= version
- v1.20.0 — "📍 Graded restaurants near me" button (`#near`), fired only on explicit tap (never on load, to avoid the iOS standalone-PWA geolocation-prompt hang); `searchNearby()` queries `43nn-pn8j` via `buildNearbyUrl` using `within_circle(location_point1, …)` with a lat/lng bounding-box fallback if that 400s; results within 300 m sorted nearest-first (capped at 25), each card's `.meta` line shows distance via `fmtDist`/`distM` (Haversine); tests 48–49 added (49 cases, 188 assertions)
- v1.21.0 — review links on every card: "Map ↗" upgraded from a bare `?q=LAT,LNG` coordinate pin to a `google.com/maps/search/?api=1&query=NAME ADDRESS` place search (lands on the Google place card with rating/reviews), plus a new "Yelp ↗" link (`yelp.com/search?find_desc=NAME&find_loc=ADDRESS`); link-out chosen over inline Yelp data because the Fusion API is paid-only for reviews (Plus plan), returns just 3 truncated excerpts, and blocks browser calls (no CORS) — inline would need a key + Worker proxy; test 38 updated, test 50 added (50 cases, 188 assertions)
- v1.22.0 — address-based chain disambiguation: `splitPlace`/`parseShare`/`resolveMapsLink` now also return the raw address remainder (`addr`) alongside name/borough; `onMapsLink`/`onShare` pass it to `search(addressHint)` → `render(rows, name, originalName, addressHint)`. When a search returns multiple same-name DOHMH matches and an `addressHint` is available, `scoreAddressMatch(addr, info)` scores each match (building-number exact match = +2, street-name-token overlap = +1) and — only when there's a single clear winner with score > 0 — narrows to that one restaurant, showing the hero placard with a "· matched by address" status note; otherwise falls back unchanged to showing all matches. Fixed a latent bug where `btn.addEventListener('click', search)` passed the click `MouseEvent` as `search`'s `addressHint` argument, breaking `scoreAddressMatch`'s `.toUpperCase()` on every manual search — now wrapped in `() => search()`. Test 51 added (51 cases, 192 assertions)
- v1.23.0 — "Resy ↗" review link added alongside Map/Yelp (`resy.com/cities/ny/venues?query=NAME`); since the Amex Resy credit applies to any Resy "Pay at Restaurant" purchase (no separate curated list), a Resy search link is the cheap way to surface that without scraping Resy's API-less site. Also adds a `#recent` "recently searched" chip list (localStorage-backed, last 6 searches, click to re-search, "Clear recent" to reset) — `search()` now calls `saveRecent(name, loc)` on any successful render, covering manual searches, deep links, and resolved Maps/share links. Test 50 updated, test 52 added (52 cases, 199 assertions)
- v1.23.1 — fixed `isName`'s reject-regex (`nameFromUrl`, `cleanTitle`, `parseShare`) rejecting any name containing `&` — restaurants like "Muteki Udon & Ramen" failed with "Couldn't find a restaurant name in this link" even though `?q=Muteki+Udon+%26+Ramen` resolves the name with zero network calls. The `&` check was redundant: it was meant to reject tracking-param garbage (`?g_st=ic`), which the existing `?`/`=` checks already catch. Regex narrowed from `/[?=&]/` to `/[?=]/` in all three call sites. Test 53 added (53 cases, 202 assertions)
- v1.24.0 — two new card features from a June 2026 research run: a `.trend` indicator (`trendHtml`) comparing the two most recent inspection scores (lower = better) — ▲ "Improving (N pts)" in green, ▼ "Declining (N pts)" in orange, or ▬ "No change", shown after the score bar whenever ≥2 inspections exist; and an "inspection freshness" chip (`fmtFreshness`) as the first item in `.meta` — "Inspected today/N days/N month(s) ago", or "Inspection overdue" past `FRESHNESS_OVERDUE_DAYS` (545 days, ~18 months) without a new inspection. Both are pure client-side derivations from data the app already fetches. Tests 54–55b added (55 cases, 222 assertions)
- v1.25.0 — design system v2 applied: the `nyc-restaurant-grade-design` skill replaced with the user-supplied v2 bundle (new components for the v1.15–1.24 features, fonts + interaction tokens, templates), and its four production deltas implemented in the app — brand logomark header (34px NYC-blue "A" chip + "NYC Restaurant Grade" wordmark replacing the plain `<h1>`), Liberation Sans Narrow placard webfont (`assets/fonts/`, `@font-face`, ahead of the "Arial Narrow" fallback), NYC-blue focus ring (3px `rgba(31,87,166,.45)` halo — inputs on any focus, buttons on `:focus-visible`; replaces the bare `outline: none`), and a 220ms rise-in entrance for `.card`/`.placard-wrap` gated on `prefers-reduced-motion`. Markup/CSS only, no JS changes. Test 56 added (56 cases, 227 assertions)
- v1.25.1 — fixed recent-search chips rendering as full-width stacked bars: the global `button { width: 100%; margin-top: 10px }` rule was leaking into `.recent-chip` (the chip rule never declared `width`/`margin-top`), so each entry spanned the whole row and the history filled the top of the page. `.recent-chip`/`.recent-clear` now declare `width: auto; margin-top: 0`, and chips get `max-width: 180px` + ellipsis so a long name can't monopolise a row — the list renders as 1–2 rows of compact wrapping pills, the original intent. CSS only. Test 52 gains a not-full-width assertion (56 cases, 228 assertions)
- v1.26.0 — reverse-geocoded address recovery for dropped-pin Maps shares: when a resolved link is name-only with `@lat,lng` but no place-path address, `resolveMapsLink` now extracts the coordinates (`coordsFromUrl`) and reverse-geocodes them via Nominatim (`reverseGeocode`, keyless/CORS-open OpenStreetMap) to recover a street/borough/ZIP, feeding the v1.22.0 chain-disambiguation that previously had nothing to match on for pin shares. Gated on `!place.addr` (place-path shares and manual searches never call it); degrades silently on rate-limit/error. The three resolvers now also return the resolved URL as `link`. ODbL attribution shown in a `#osm-attr` footer line, revealed only once OSM data is actually used. Implements the long-deferred tiered address-extraction design. Test 57 added (57 cases, 234 assertions)
- v1.27.0 — Photon reverse-geocode fallback: `reverseGeocode` is now tiered — `viaNominatim` first, then `viaPhoton` (`photon.komoot.io/reverse`, komoot's keyless/CORS-open OSM geocoder) when Nominatim 429s (its 1 req/s cap surfaces as a CORS/fetch error). v1.26.0 gave up on a rate-limit; v1.27.0 falls back before giving up, then degrades silently if both tiers fail. A shared `buildGeoAddr(street, boro, county, zip)` helper assembles the address for both tiers; each tier throws on failure so the loop falls through. Both geocoders are OSM-derived, so the single `#osm-attr` ODbL attribution still covers them. Addresses the documented Nominatim-rate-limit weakness; the research notes flagged Photon as the natural second tier. Test 58 added (58 cases, 240 assertions)
- v1.27.1 — accessibility: `setStatus` now toggles a trailing zero-width space (U+200B) when the new status text is identical to the last, so the `role="status"` aria-live region re-announces a repeated message (e.g. pressing "Look up" twice with an empty field) instead of staying silent for VoiceOver. The U+200B is invisible and harmless to the `.includes()` substring checks throughout the suite. Implements the documented a11y note. Test 59 added (59 cases, 243 assertions)
- v1.28.0 — `getJSON` resilience: a three-tier failover (primary `data.cityofnewyork.us` → official `data.ny.gov` Socrata mirror → `corsproxy.io`) replaces the old two-tier primary→proxy path. The first-party NY State mirror (CORS-open, same dataset id/SoQL) is preferred over the third-party proxy, which itself blocklists some hosts. Only DOHMH calls (the `API` prefix) are host-swapped; resolver/CSV fetches are untouched. The mirror id is deploy-verify — if data.ny.gov doesn't host `43nn-pn8j`, `getJSON` falls through to the proxy, so no regression. Tests 60–60c added (60 cases, 251 assertions)
- v1.29.0 — live citywide grade distribution: the "What do these grades mean?" panel's "About **9 in 10** NYC restaurants score an A" now shows the real figure ("91 in 100"). `loadGradeDist()` runs one cached `$group=grade` aggregate query against the same `43nn-pn8j` dataset (no new dependency, via `getJSON` so it inherits the mirror/proxy failover), fired **lazily on first open of the `#about` panel** so it never runs during a plain search and can't perturb any test's DOHMH call counting; degrades silently to the static copy on any failure. Tests 61–61b added (61 cases, 260 assertions)
- v1.30.0 — three history-derived insights (pure client-side, zero new network calls): a `↻ repeat` badge (`.viol-repeat`) on a violation whose `violation_code` recurred at an earlier inspection (`groupByRestaurant` precomputes `priorDates`); a `Last critical violation: DATE · none at the latest inspection` line (`lastCriticalHtml`, fed by `g.lastCritical`) shown only when the most recent critical predates the latest (clean-latest) inspection; and a `Grade A at N of M recent inspections` consistency line (`gradeConsistencyHtml`) over the ≤6 history window. All derived from rows already fetched. Tests 62–64b added (64 cases, 275 assertions)
- v1.31.0 — borough comparison: each card with a borough gains an opt-in "How does {Boro} compare?" panel (`boroCompareHtml`) that, on first open, runs the citywide `$group=grade` aggregate scoped to that borough (`loadBoroGradeDist`, cached per boro via `boroDistCache`) and shows "About N in 100 graded {Boro} restaurants are A. This one is graded X — in the majority/minority." The fetch is deferred to a user toggle via a single capturing `toggle` listener on `#results` (the event doesn't bubble), so a plain search makes no extra request and no existing card test is perturbed; degrades to "Couldn't load borough comparison." on failure. Completes the Tier-1/Tier-2 no-infra research backlog. Tests 65–65b added (65 cases, 284 assertions)
- v1.32.0 — accessibility: `#q`, `#loc`, and `#maps-input` gain visually-hidden `<label for="...">` elements (`.sr-only`, clip-rect technique) mirroring their placeholder text, so screen readers announce a stable field name instead of relying on `placeholder` (which some AT skips, and which disappears once the field has a value). Markup/CSS only, no JS changes. Closes the documented Tier-4 a11y gap. Test 66 added (66 cases, 282 assertions)
- v1.33.0 — "🔗 Copy link to this search" button: every non-empty `render()` result prepends a button whose `data-url` is the same `?q=Name&loc=Location` deep-link shape the app already reads on load, built from the current search name and `#loc` value; a delegated click listener on `#results` copies it via `navigator.clipboard.writeText` and flashes "✓ Link copied"/"Copy failed" for 1.5s. Pure client-side, no new dependency — gives any search result (manual, deep-link, or resolved Maps/share link) a one-tap shareable bookmark. Test 67 added (67 cases, 293 assertions)
- v1.34.0 — favorites/pinned list: each card gains a `.fav-toggle` button ("☆ Save"/"★ Saved") in its `.meta` line, keyed on the restaurant's `dba`+`boro` (not the searched term, so individual chain locations pin separately); `toggleFavorite`/`isFavorite` persist `{name, loc}` pairs in `localStorage` under `favorites`, and `renderFavorites()` shows them as `.fav-chip` pills in a new `#favorites` row (mirroring the v1.23.0 `#recent` list, plus a "Clear favorites" button) — clicking a chip refills `#q`/`#loc` and re-searches. The existing v1.33.0 delegated `#results` click listener also handles `.fav-toggle` in place (no full re-render). Pure client-side, no new dependency. Test 68 added (68 cases, 314 assertions)
- v1.35.0 — multi-result client-side sort: when `render()` has more than one group, a `.sort-row`/`<select id="sort-select">` (As found / Grade: best first / Grade: worst first / Name A-Z, plus Distance: nearest first when every group has a `dist`) lets the user re-order the cards without re-querying DOHMH. `render()` stashes `groups` in module-level `currentGroups` and wraps the cards in `#cards-wrap`; a delegated `change` listener on `#results` calls `sortGroups(currentGroups, mode)` and replaces only `#cards-wrap`. Single-result views omit `.sort-row` entirely. Pure client-side, no new dependency. Test 69 added (69 cases, 317 assertions)
- v1.36.0 — multi-result grade filter: complements the v1.35.0 sort control with a `.filter-row` of `.filter-chip` toggle buttons (A/B/C/Pending, one per grade category actually present) shown whenever `render()` has more than one group spanning 2+ categories. Clicking a chip toggles its category in/out of the module-level `activeFilters` Set (multi-select), updates `aria-pressed`, and calls `updateCardsWrap()` — which filters `currentGroups` via `visibleGroups()`, re-sorts via the existing `sortGroups(visible, currentSortMode)` so the filter composes with whatever sort is active, replaces only `#cards-wrap`, and appends ` · N of M shown` to the status line (or restores the plain status when unfiltered). `render()` resets `activeFilters`/`currentSortMode` on every new search; `.filter-row` is omitted entirely for a single result or when all results share one category. Pure client-side re-filtering of already-fetched rows; no new request. Tests 70–70b added (71 cases, 334 assertions)

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
