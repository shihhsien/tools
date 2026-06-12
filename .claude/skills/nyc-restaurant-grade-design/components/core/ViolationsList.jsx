export function ViolationsList({ violations = [], style, ...rest }) {
  if (!violations.length) {
    return (
      <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "8px", fontFamily: "var(--font-sans)", ...style }} {...rest}>
        ✓ No violations at last inspection
      </div>
    );
  }
  const crits = violations.filter((v) => v.flag === "Critical").length;
  const label = `${violations.length} violation${violations.length > 1 ? "s" : ""}${crits ? ` · ${crits} critical` : ""}`;
  const sorted = violations.slice().sort((a) => (a.flag === "Critical" ? -1 : 1));
  const [open, setOpen] = React.useState(false);

  return (
    <div style={{ marginTop: "8px", fontFamily: "var(--font-sans)", ...style }} {...rest}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{ all: "unset", display: "block", fontSize: "12px", color: "var(--text-secondary)", cursor: "pointer", padding: "2px 0", userSelect: "none" }}
      >
        {open ? "▾" : "▸"}&nbsp;&nbsp;{label}
      </button>
      {open ? (
        <div style={{ marginTop: "6px" }}>
          {sorted.map((v, i) => (
            <div key={i} style={{ padding: "6px 0", borderTop: "1px solid var(--border-default)" }}>
              {v.flag === "Critical" || v.flag === "Not Critical" ? (
                <span
                  style={{
                    display: "inline-block", fontSize: "10px", fontWeight: "var(--weight-semibold)",
                    padding: "1px 6px", borderRadius: "4px", marginBottom: "3px",
                    background: v.flag === "Critical" ? "rgba(201,111,32,.15)" : "var(--border-default)",
                    color: v.flag === "Critical" ? "var(--grade-c)" : "var(--text-secondary)",
                  }}
                >
                  {v.flag}
                </span>
              ) : null}
              {v.code ? <span style={{ fontSize: "10px", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", marginLeft: "4px" }}>{v.code}</span> : null}
              {v.category ? <span style={{ fontSize: "10px", color: "var(--text-secondary)", marginLeft: "6px" }}>{v.category}</span> : null}
              <div style={{ fontSize: "12px", color: "var(--text-primary)", lineHeight: 1.45 }}>{v.desc}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
