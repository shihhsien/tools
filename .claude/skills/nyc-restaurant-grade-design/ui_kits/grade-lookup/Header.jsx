function Header() {
  return (
    <div style={{ marginBottom: "16px" }}>
      <h1 style={{ fontSize: "var(--text-title)", fontWeight: "var(--weight-semibold)", color: "var(--text-primary)", margin: "4px 0 2px" }}>
        NYC Restaurant Grade
      </h1>
      <div style={{ fontSize: "var(--text-small)", color: "var(--text-secondary)", lineHeight: "var(--leading-normal)" }}>
        Official NYC Health Dept data (DOHMH). Name + optional location (street, borough, or ZIP — not neighborhood).
      </div>
    </div>
  );
}

function SearchPanel({ name, loc, maps, onName, onLoc, onMaps, onSearch }) {
  const { Input, Divider, Button } = window.NYCRestaurantGradeDesignSystem_09ad2a;
  const onEnter = (e) => { if (e.key === "Enter") onSearch(); };
  return (
    <div>
      <div style={{ display: "flex", gap: "8px" }}>
        <Input value={name} onChange={(e) => onName(e.target.value)} onKeyDown={onEnter}
          placeholder="Restaurant name" autoCapitalize="characters" autoComplete="off" />
      </div>
      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
        <Input value={loc} onChange={(e) => onLoc(e.target.value)} onKeyDown={onEnter}
          placeholder="Street, borough, or ZIP (optional)" autoCapitalize="words" autoComplete="off" />
      </div>
      <Divider label="or paste a link" />
      <div style={{ display: "flex", gap: "8px" }}>
        <Input variant="accent" value={maps} onChange={(e) => onMaps(e.target.value)}
          placeholder="Paste a Google Maps link…" autoComplete="off" autoCapitalize="none" />
      </div>
      <Button onClick={onSearch}>Look up grade</Button>
    </div>
  );
}

window.GradeLookupKit = { Header, SearchPanel };
