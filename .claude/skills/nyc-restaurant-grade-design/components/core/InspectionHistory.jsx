export function InspectionHistory({ history = [], style, ...rest }) {
  const [open, setOpen] = React.useState(false);
  if (history.length < 2) return null;

  const chipColor = (g) =>
    ({ A: "var(--grade-a)", B: "var(--grade-b-dense)", C: "var(--grade-c-dense)" }[String(g || "").toUpperCase()] || "var(--color-gray)");

  return (
    <div style={{ marginTop: "8px", fontFamily: "var(--font-sans)", ...style }} {...rest}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{ all: "unset", display: "block", fontSize: "12px", color: "var(--text-secondary)", cursor: "pointer", padding: "2px 0", userSelect: "none" }}
      >
        {open ? "▾" : "▸"}&nbsp;&nbsp;Inspection history
      </button>
      {open ? (
        <div style={{ marginTop: "6px" }}>
          {history.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", padding: "4px 0", borderTop: "1px solid var(--border-default)" }}>
              <span style={{ color: "var(--text-secondary)", flex: "0 0 90px" }}>{r.date}</span>
              {r.closed ? (
                <span style={{ fontSize: "11px", fontWeight: "var(--weight-semibold)", color: "var(--text-error)" }}>Closed</span>
              ) : (
                <span
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: "22px", height: "22px", borderRadius: "5px",
                    fontWeight: "var(--weight-bold)", fontSize: "11px", color: "#fff", flexShrink: 0,
                    background: chipColor(r.grade),
                  }}
                >
                  {r.grade || "—"}
                </span>
              )}
              <span style={{ color: "var(--text-secondary)", flex: "0 0 auto" }}>{r.score != null ? r.score : "—"}</span>
              <span style={{ color: "var(--text-secondary)", fontSize: "11px", flex: 1, textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {r.type || ""}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
