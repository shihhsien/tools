function Header() {
  const { Logomark } = window.NYCRestaurantGradeDesignSystem_09ad2a;
  return (
    <header style={{ margin: "10px 0 22px" }}>
      <Logomark size={34} />
      <p style={{ fontSize: "var(--text-small)", color: "var(--text-secondary)", lineHeight: "var(--leading-normal)", margin: "10px 0 0" }}>
        Official NYC Health Dept data (DOHMH).
      </p>
    </header>
  );
}

function FieldLabel({ htmlFor, children, hint }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: "6px",
        fontSize: "var(--text-small)",
        fontWeight: "var(--weight-semibold)",
        color: "var(--text-secondary)",
        margin: "0 2px 6px",
      }}
    >
      {children}
      {hint ? (
        <span style={{ fontWeight: "var(--weight-regular)", color: "var(--text-tertiary)" }}>{hint}</span>
      ) : null}
    </label>
  );
}

function SearchPanel({ name, loc, maps, loading, onName, onLoc, onMaps, onSearch }) {
  const { Input, Divider, Button } = window.NYCRestaurantGradeDesignSystem_09ad2a;
  const onEnter = (e) => { if (e.key === "Enter") onSearch(); };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div>
        <FieldLabel htmlFor="f-name">Restaurant</FieldLabel>
        <Input id="f-name" value={name} onChange={(e) => onName(e.target.value)} onKeyDown={onEnter}
          placeholder="e.g. Joe's Pizza" autoCapitalize="characters" autoComplete="off" />
      </div>
      <div>
        <FieldLabel htmlFor="f-loc" hint="optional · street, borough, or ZIP — not neighborhood">Location</FieldLabel>
        <Input id="f-loc" value={loc} onChange={(e) => onLoc(e.target.value)} onKeyDown={onEnter}
          placeholder="e.g. Carmine St, Manhattan, or 10014" autoCapitalize="words" autoComplete="off" />
      </div>
      <Divider label="or paste a link" style={{ margin: "2px 0 -2px" }} />
      <div>
        <Input variant="accent" value={maps} onChange={(e) => onMaps(e.target.value)}
          placeholder="Paste a Google Maps link…" autoComplete="off" autoCapitalize="none"
          aria-label="Google Maps link" />
      </div>
      <Button onClick={onSearch} disabled={loading} style={{ marginTop: "2px" }}>
        {loading ? "Looking up…" : "Look up grade"}
      </Button>
    </div>
  );
}

function Explainer() {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ marginTop: "18px" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{ all: "unset", display: "block", fontSize: "var(--text-body)", color: "var(--text-secondary)", cursor: "pointer", padding: "4px 0", userSelect: "none" }}
      >
        {open ? "\u25BE" : "\u25B8"}  What do these grades mean?
      </button>
      {open ? (
        <div style={{ fontSize: "var(--text-body)", color: "var(--text-secondary)", lineHeight: 1.55, marginTop: "4px" }}>
          <p style={{ margin: "8px 0" }}>Grades reflect points for health-code violations found at inspection — <b style={{ color: "var(--text-primary)", fontWeight: "var(--weight-semibold)" }}>lower is better</b>. A = 0–13 points, B = 14–27, C = 28 or more.</p>
          <p style={{ margin: "8px 0" }}><b style={{ color: "var(--text-primary)", fontWeight: "var(--weight-semibold)" }}>Critical</b> violations (pests, unsafe food temperatures, bare-hand contact) carry more points than upkeep issues.</p>
          <p style={{ margin: "8px 0" }}>About <b style={{ color: "var(--text-primary)", fontWeight: "var(--weight-semibold)" }}>9 in 10</b> NYC restaurants score an A, so a B or C is genuinely worth noting — and an A right at 13 points is borderline.</p>
        </div>
      ) : null}
    </div>
  );
}

window.GradeLookupKit = { Header, SearchPanel, FieldLabel, Explainer };
