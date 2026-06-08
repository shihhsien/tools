const { useState, useRef } = React;

// ---- Mock DOHMH data (stand-in for the live 43nn-pn8j API) ------------
const DATA = [
  { dba: "JOE'S PIZZA", grade: "A", score: 12, building: "7", street: "CARMINE ST", boro: "Manhattan", zip: "10014", graded: "Mar 3, 2025", inspected: "Mar 3, 2025", type: "Cycle Inspection / Re-inspection", viol: "Non-food contact surface improperly constructed.", flag: "Not Critical" },
  { dba: "OITA", grade: "A", score: 9, building: "21", street: "PELL ST", boro: "Manhattan", zip: "10013", graded: "Jan 14, 2025", inspected: "Jan 14, 2025", type: "Cycle Inspection / Initial", viol: "Food contact surface not properly washed.", flag: "Critical" },
  { dba: "MAZZAT", grade: "B", score: 19, building: "208", street: "COLUMBIA ST", boro: "Brooklyn", zip: "11231", graded: "Feb 2, 2025", inspected: "Feb 2, 2025", type: "Cycle Inspection / Re-inspection", viol: "Cold food held above 41°F.", flag: "Critical" },
  { dba: "GOLDEN DRAGON", grade: "C", score: 41, building: "140", street: "ROOSEVELT AVE", boro: "Queens", zip: "11354", graded: "Apr 9, 2025", inspected: "Apr 9, 2025", type: "Cycle Inspection / Re-inspection", viol: "Evidence of mice or live mice present.", flag: "Critical" },
  { dba: "NEW SPOT CAFE", grade: null, score: 9, building: "55", street: "BEDFORD AVE", boro: "Brooklyn", zip: "11211", graded: null, inspected: "May 1, 2025", type: "Pre-permit (Operational) / Initial", viol: "", flag: "" },
];

const fmtAddr = r => `${r.building} ${r.street}, ${r.boro} ${r.zip}`.replace(/\s+/g, " ").trim();

// Progressive word-drop search against the mock set
function lookup(rawName, loc) {
  const name = rawName.trim().toUpperCase();
  if (!name) return { kind: "empty" };
  const words = name.split(/\s+/);
  for (let len = words.length; len >= 1; len--) {
    const q = words.slice(0, len).join(" ");
    let hits = DATA.filter(r => r.dba.includes(q));
    if (loc) {
      const L = loc.trim().toUpperCase();
      hits = hits.filter(r => fmtAddr(r).toUpperCase().includes(L) || r.boro.toUpperCase().includes(L) || r.zip === loc.trim());
    }
    if (hits.length) return { kind: "ok", hits, shortened: len < words.length ? name : null };
  }
  return { kind: "none", name };
}

// Extract a place name from a /maps/place/NAME or ?q=NAME URL (no network)
function nameFromUrl(url) {
  const isName = s => s.length > 1 && /[a-zA-Z]/.test(s) && !/[?=&]/.test(s) && !/^https?:\/\//i.test(s);
  const place = url.match(/\/maps\/place\/([^/@?&"'\s]+)/);
  if (place) { const n = decodeURIComponent(place[1].replace(/\+/g, " ")).trim(); return isName(n) ? n : ""; }
  try { const q = (new URL(url).searchParams.get("q") || "").trim(); return isName(q) ? q : ""; } catch { return ""; }
}

function App() {
  const { Header, SearchPanel } = window.GradeLookupKit;
  const { StatusLine, ResultCard } = window.NYCRestaurantGradeDesignSystem_09ad2a;

  const [name, setName] = useState("");
  const [loc, setLoc] = useState("");
  const [maps, setMaps] = useState("");
  const [status, setStatus] = useState(null);
  const [statusTone, setStatusTone] = useState("default");
  const [results, setResults] = useState([]);

  function runSearch(nm = name, lc = loc) {
    const res = lookup(nm, lc);
    if (res.kind === "empty") { setStatus("Enter a restaurant name."); setStatusTone("default"); setResults([]); return; }
    if (res.kind === "none") { setStatus(`No active record for "${res.name}". Try a shorter name, drop the location, or check spelling.`); setStatusTone("default"); setResults([]); return; }
    const note = res.shortened ? ` · shortened from "${res.shortened}"` : "";
    setStatus(`${res.hits.length} match${res.hits.length > 1 ? "es" : ""} · official data${note}`);
    setStatusTone("default");
    setResults(res.hits);
  }

  function onMaps(val) {
    setMaps(val);
    if (!val.trim().startsWith("http")) return;
    const nm = nameFromUrl(val.trim());
    if (nm) {
      const split = nm.split(",");
      const place = split[0].trim();
      const boro = (val.match(/Brooklyn|Manhattan|Queens|Bronx|Staten Island/i) || [""])[0];
      setName(place); if (boro) setLoc(boro); setMaps("");
      runSearch(place, boro);
    } else {
      setStatusTone("error");
      setStatus("__maps_error__");
      setResults([]);
    }
  }

  return (
    <div style={{ maxWidth: "var(--layout-max)", margin: "0 auto", padding: "16px 16px 60px" }}>
      <Header />
      <SearchPanel
        name={name} loc={loc} maps={maps}
        onName={setName} onLoc={setLoc} onMaps={onMaps}
        onSearch={() => runSearch()}
      />
      {status === "__maps_error__" ? (
        <StatusLine tone="error">
          Couldn't find a restaurant name in this link.{" "}
          <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "var(--text-link)", textDecoration: "none" }}>Open it ↗</a>{" "}
          — once the map loads, copy the full URL from the address bar and paste it here, or type the name above.
        </StatusLine>
      ) : status ? (
        <StatusLine tone={statusTone}>{status}</StatusLine>
      ) : null}
      {results.map((r, i) => (
        <ResultCard
          key={i}
          grade={r.grade} pending={!r.grade}
          name={r.dba} address={fmtAddr(r)}
          score={r.score} gradedDate={r.graded}
          inspectedDate={r.inspected} inspectionType={r.type}
          violation={r.viol} criticalFlag={r.flag}
        />
      ))}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "10px 16px",
        fontSize: "var(--text-eyebrow)", color: "var(--text-tertiary)",
        background: "var(--surface-page)", borderTop: "1px solid var(--border-default)", textAlign: "left" }}>
        v1.12.9
      </div>
    </div>
  );
}

window.GradeLookupApp = App;
