export function GradePlacard({ grade = "A", size = 200, style, ...rest }) {
  const letter = String(grade || "").toUpperCase();
  const pending = letter === "PENDING" || letter === "P" || letter === "";

  const ink = pending
    ? "var(--placard-pending)"
    : { A: "var(--grade-a)", B: "var(--grade-b)", C: "var(--grade-c)" }[letter] || "var(--placard-pending)";

  const w = size;
  const h = Math.round(size * 1.28);
  const pad = Math.round(size * 0.1);

  return (
    <div
      style={{
        width: w,
        height: h,
        background: "var(--placard-paper)",
        borderRadius: Math.round(size * 0.03),
        boxShadow: "var(--shadow-overlay)",
        padding: `${pad}px ${pad}px ${Math.round(pad * 0.8)}px`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "var(--font-sans)",
        color: ink,
        boxSizing: "border-box",
        ...style,
      }}
      {...rest}
    >
      {/* header */}
      <div style={{ width: "100%", textAlign: "center", borderBottom: `${Math.max(2, size * 0.012)}px solid ${ink}`, paddingBottom: Math.round(size * 0.04) }}>
        <div style={{ fontSize: Math.round(size * 0.078), fontWeight: 700, letterSpacing: "0.02em", lineHeight: 1.1, fontStretch: "condensed", textTransform: "uppercase" }}>
          Sanitary Inspection
        </div>
        <div style={{ fontSize: Math.round(size * 0.115), fontWeight: 800, letterSpacing: "0.04em", lineHeight: 1.05, fontStretch: "condensed", textTransform: "uppercase" }}>
          Grade
        </div>
      </div>

      {/* the giant letter (or PENDING) */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
        {pending ? (
          <div style={{ textAlign: "center", fontWeight: 800, lineHeight: 0.95, letterSpacing: "0.01em", fontSize: Math.round(size * 0.2), textTransform: "uppercase" }}>
            Grade<br />Pending
          </div>
        ) : (
          <div style={{ fontWeight: 800, fontSize: Math.round(size * 0.62), lineHeight: 1, letterSpacing: "-0.02em" }}>
            {letter}
          </div>
        )}
      </div>

      {/* footer */}
      <div style={{ width: "100%", textAlign: "center", borderTop: `${Math.max(1, size * 0.006)}px solid ${ink}`, paddingTop: Math.round(size * 0.04) }}>
        <div style={{ fontSize: Math.round(size * 0.05), fontWeight: 600, letterSpacing: "0.02em", lineHeight: 1.25, textTransform: "uppercase" }}>
          New York City Department of<br />Health and Mental Hygiene
        </div>
      </div>
    </div>
  );
}
