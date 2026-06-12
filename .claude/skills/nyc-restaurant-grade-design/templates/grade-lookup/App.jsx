const { useState } = React;

// ---- Mock DOHMH data (stand-in for the live 43nn-pn8j API) ------------
const DATA = [
  {
    dba: "JOE'S PIZZA", grade: "A", score: 12, building: "7", street: "CARMINE ST", boro: "Manhattan", zip: "10014",
    graded: "Mar 3, 2025", inspected: "Mar 3, 2025", type: "Cycle Inspection / Re-inspection",
    cuisine: "Pizza", phone: "(212) 555-1234", freshness: "Inspected 3 months ago",
    violations: [
      { desc: "Non-food contact surface improperly constructed.", flag: "Not Critical", code: "10F", category: "Facility maintenance" },
    ],
    history: [
      { date: "Mar 3, 2025", grade: "A", score: 12, type: "Re-inspection" },
      { date: "Jan 20, 2025", grade: "B", score: 19, type: "Initial" },
      { date: "Feb 12, 2024", grade: "A", score: 10, type: "Initial" },
    ],
  },
  {
    dba: "OITA", grade: "A", score: 9, building: "21", street: "PELL ST", boro: "Manhattan", zip: "10013",
    graded: "Jan 14, 2025", inspected: "Jan 14, 2025", type: "Cycle Inspection / Initial",
    cuisine: "Japanese", phone: "(212) 555-8821", freshness: "Inspected 5 months ago",
    violations: [
      { desc: "Food contact surface not properly washed, rinsed and sanitized.", flag: "Critical", code: "02G", category: "Food handling" },
    ],
    history: [
      { date: "Jan 14, 2025", grade: "A", score: 9, type: "Initial" },
      { date: "Nov 2, 2023", grade: "A", score: 11, type: "Initial" },
    ],
  },
  {
    dba: "MAZZAT", grade: "B", score: 19, building: "208", street: "COLUMBIA ST", boro: "Brooklyn", zip: "11231",
    graded: "Feb 2, 2025", inspected: "Feb 2, 2025", type: "Cycle Inspection / Re-inspection",
    cuisine: "Middle Eastern", phone: "(718) 555-0177", freshness: "Inspected 4 months ago",
    violations: [
      { desc: "Cold food item held above 41°F.", flag: "Critical", code: "02B", category: "Temperature control" },
      { desc: "Plumbing not properly installed or maintained.", flag: "Not Critical", code: "10B", category: "Facility maintenance" },
    ],
    history: [
      { date: "Feb 2, 2025", grade: "B", score: 19, type: "Re-inspection" },
      { date: "Dec 18, 2024", score: 31, type: "Initial" },
      { date: "Mar 5, 2024", grade: "A", score: 8, type: "Initial" },
    ],
  },
  {
    dba: "GOLDEN DRAGON", grade: "C", score: 41, building: "140", street: "ROOSEVELT AVE", boro: "Queens", zip: "11354",
    graded: "Apr 9, 2025", inspected: "Apr 9, 2025", type: "Cycle Inspection / Re-inspection",
    cuisine: "Chinese", phone: "(718) 555-3402", freshness: "Inspected 2 months ago", closedDate: "Apr 9, 2025",
    violations: [
      { desc: "Evidence of mice or live mice present in facility's food and/or non-food areas.", flag: "Critical", code: "04L", category: "Pests" },
      { desc: "Hot food item not held at or above 140°F.", flag: "Critical", code: "02A", category: "Temperature control" },
      { desc: "Non-food contact surface improperly constructed.", flag: "Not Critical", code: "10F", category: "Facility maintenance" },
    ],
    history: [
      { date: "Apr 9, 2025", closed: true, score: 41, type: "Re-inspection" },
      { date: "Feb 27, 2025", grade: "C", score: 34, type: "Initial" },
      { date: "Jun 11, 2024", grade: "B", score: 21, type: "Re-inspection" },
    ],
  },
  {
    dba: "NEW SPOT CAFE", grade: null, score: 9, building: "55", street: "BEDFORD AVE", boro: "Brooklyn", zip: "11211",
    graded: null, inspected: "May 1, 2025", type: "Pre-permit (Operational) / Initial",
    cuisine: "Coffee/Tea", phone: "(718) 555-9090", freshness: "Inspected 1 month ago",
    violations: [],
    history: [],
  },
];

const SUGGESTIONS = ["Joe's Pizza", "Oita Sushi", "Mazzat", "Golden Dragon"];

const fmtAddr = (r) => `${r.building} ${r.street}, ${r.boro} ${r.zip}`.replace(/\s+/g, " ").trim();

// Progressive word-drop search against the mock set
function lookup(rawName, loc) {
  const name = rawName.trim().toUpperCase();
  if (!name) return { kind: "empty" };
  const words = name.split(/\s+/);
  for (let len = words.length; len >= 1; len--) {
    const q = words.slice(0, len).join(" ");
    let hits = DATA.filter((r) => r.dba.includes(q));
    if (loc) {
      const L = loc.trim().toUpperCase();
      hits = hits.filter((r) => fmtAddr(r).toUpperCase().includes(L) || r.boro.toUpperCase().includes(L) || r.zip === loc.trim());
    }
    if (hits.length) return { kind: "ok", hits, shortened: len < words.length ? name : null };
  }
  return { kind: "none", name };
}

// Extract a place name from a /maps/place/NAME or ?q=NAME URL (no network)
function nameFromUrl(url) {
  const isName = (s) => s.length > 1 && /[a-zA-Z]/.test(s) && !/[?=]/.test(s) && !/^https?:\/\//i.test(s);
  const place = url.match(/\/maps\/place\/([^/@?&"'\s]+)/);
  if (place) { const n = decodeURIComponent(place[1].replace(/\+/g, " ")).trim(); return isName(n) ? n : ""; }
  try { const q = (new URL(url).searchParams.get("q") || "").trim(); return isName(q) ? q : ""; } catch { return ""; }
}

function metaFor(r) {
  const locStr = `${r.building} ${r.street}, ${r.boro} NY ${r.zip}`;
  const mapsUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(`${r.dba} ${locStr}`);
  const yelpUrl = "https://www.yelp.com/search?find_desc=" + encodeURIComponent(r.dba) + "&find_loc=" + encodeURIComponent(locStr);
  const resyUrl = "https://resy.com/cities/ny/venues?query=" + encodeURIComponent(r.dba);
  const linkStyle = { color: "var(--text-secondary)", textDecoration: "underline" };
  return [
    <span key="cui">{r.cuisine}</span>,
    <a key="tel" style={linkStyle} href={"tel:+1" + r.phone.replace(/\D/g, "")}>{r.phone}</a>,
    <a key="map" style={linkStyle} href={mapsUrl} target="_blank" rel="noopener">Map ↗</a>,
    <a key="yelp" style={linkStyle} href={yelpUrl} target="_blank" rel="noopener">Yelp ↗</a>,
    <a key="resy" style={linkStyle} href={resyUrl} target="_blank" rel="noopener">Resy ↗</a>,
  ];
}

function App() {
  const { Header, SearchPanel, Explainer } = window.GradeLookupKit;
  const { StatusLine, ResultCard, GradePlacard, Chip, Button } = window.NYCRestaurantGradeDesignSystem_09ad2a;

  const [name, setName] = useState("");
  const [loc, setLoc] = useState("");
  const [maps, setMaps] = useState("");
  const [status, setStatus] = useState(null);
  const [statusTone, setStatusTone] = useState("default");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState([]);

  function finishSearch(nm, lc) {
    const res = lookup(nm, lc);
    setLoading(false);
    if (res.kind === "empty") { setStatus("Enter a restaurant name."); setStatusTone("default"); setResults([]); return; }
    if (res.kind === "none") { setStatus(`No active record for "${res.name}". Try a shorter name, drop the location, or check spelling.`); setStatusTone("default"); setResults([]); return; }
    const note = res.shortened ? ` · shortened from "${res.shortened}"` : "";
    setStatus(`${res.hits.length} match${res.hits.length > 1 ? "es" : ""} · official data${note}`);
    setStatusTone("default");
    setResults(res.hits);
    setRecent((prev) => [nm.trim().toUpperCase(), ...prev.filter((x) => x !== nm.trim().toUpperCase())].slice(0, 4));
  }

  function runSearch(nm = name, lc = loc) {
    if (!nm.trim()) { finishSearch(nm, lc); return; }
    setLoading(true);
    setStatus("Looking up official data…");
    setStatusTone("default");
    setTimeout(() => finishSearch(nm, lc), 420);
  }

  function onMaps(val) {
    setMaps(val);
    if (!val.trim().startsWith("http")) return;
    const nm = nameFromUrl(val.trim());
    if (nm) {
      const place = nm.split(",")[0].trim();
      const boro = (val.match(/Brooklyn|Manhattan|Queens|Bronx|Staten Island/i) || [""])[0];
      setName(place); if (boro) setLoc(boro); setMaps("");
      runSearch(place, boro);
    } else {
      setStatusTone("error");
      setStatus("__maps_error__");
      setResults([]);
    }
  }

  function nearMe() {
    setLoading(true);
    setStatus("Getting your location…");
    setStatusTone("default");
    setTimeout(() => {
      setLoading(false);
      setStatus(`${DATA.length} restaurant(s) within 300 m · nearest first`);
      setResults(DATA);
    }, 600);
  }

  function trySuggestion(s) {
    setName(s); setLoc("");
    runSearch(s, "");
  }

  const chips = recent.length ? recent : SUGGESTIONS.map((s) => s.toUpperCase());
  const chipsLabel = recent.length ? "Recently searched" : "Try a search";
  const showChips = !loading && results.length === 0;
  const hero = results.length === 1 ? (results[0].grade || "PENDING") : null;

  return (
    <div data-screen-label="Grade Lookup" style={{ maxWidth: "var(--layout-max)", margin: "0 auto", padding: "16px 16px 72px" }}>
      <Header />
      <SearchPanel
        name={name} loc={loc} maps={maps} loading={loading}
        onName={setName} onLoc={setLoc} onMaps={onMaps}
        onSearch={() => runSearch()}
      />
      <Button variant="secondary" onClick={nearMe} disabled={loading}>📍 Graded restaurants near me</Button>

      <div aria-live="polite">
        {status === "__maps_error__" ? (
          <StatusLine tone="error">
            Couldn't find a restaurant name in this link.{" "}
            <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "var(--text-link)", textDecoration: "none" }}>Open it ↗</a>{" "}
            — once the map loads, copy the full URL from the address bar and paste it here, or type the name above.
          </StatusLine>
        ) : status ? (
          <StatusLine tone={statusTone}>{status}</StatusLine>
        ) : null}
      </div>

      {showChips ? (
        <div style={{ marginTop: status ? "2px" : "18px" }}>
          <div style={{ fontSize: "var(--text-eyebrow)", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "var(--tracking-eyebrow)", margin: "0 2px 8px" }}>
            {chipsLabel}
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {chips.map((s) => (
              <Chip key={s} onClick={() => trySuggestion(s)}>{s}</Chip>
            ))}
          </div>
        </div>
      ) : null}

      {hero ? (
        <div className="enter" style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}>
          <GradePlacard grade={hero} />
        </div>
      ) : null}

      {results.map((r) => (
        <div className="enter" key={r.dba}>
          <ResultCard
            grade={r.grade} pending={!r.grade}
            name={r.dba} address={fmtAddr(r)}
            score={r.score} gradedDate={r.graded}
            inspectedDate={r.inspected} inspectionType={r.type}
            freshness={r.freshness}
            meta={metaFor(r)}
            showContext={results.length === 1}
            violations={r.violations}
            history={r.history}
            closedDate={r.closedDate}
          />
        </div>
      ))}

      <Explainer />

      <footer style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        padding: "10px 16px",
        fontSize: "var(--text-eyebrow)", color: "var(--text-tertiary)",
        background: "var(--surface-page)", borderTop: "1px solid var(--border-default)",
      }}>
        <span>v1.24.0</span>
        <span>NYC Open Data · DOHMH 43nn-pn8j</span>
      </footer>
    </div>
  );
}

window.GradeLookupApp = App;
