export function GradePlacard({ grade = "A", size = 200, style, ...rest }) {
  const g = String(grade || "").toUpperCase();
  const known = ["A", "B", "C"].includes(g);
  const pending = !known;
  const ink = pending
    ? "#1a1a1a"
    : { A: "var(--grade-a)", B: "var(--grade-b)", C: "var(--grade-c)" }[g];
  const k = size / 200; // production card is 200px wide
  const px = (v) => Math.max(1, Math.round(v * k));

  return (
    <div
      style={{
        width: size,
        background: "var(--placard-paper)",
        borderRadius: px(4),
        padding: `${px(10)}px ${px(14)}px ${px(12)}px`,
        textAlign: "center",
        fontFamily: "var(--font-placard)",
        boxShadow: "var(--shadow-placard)",
        color: ink,
        boxSizing: "border-box",
        ...style,
      }}
      {...rest}
    >
      <div
        style={{
          paddingBottom: px(6),
          marginBottom: px(6),
          borderBottom: `${pending ? px(1) : px(2)}px solid ${ink}`,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        <div style={{ fontSize: px(9), opacity: 0.8 }}>Sanitary Inspection</div>
        <div style={{ fontSize: px(13), fontWeight: 900, letterSpacing: "0.12em", marginTop: px(2) }}>Grade</div>
      </div>

      {pending ? (
        <div style={{ fontSize: px(22), fontWeight: 700, lineHeight: 1.2, margin: `${px(16)}px 0`, letterSpacing: "0.02em", textTransform: "uppercase" }}>
          Grade<br />Pending
        </div>
      ) : (
        <div style={{ fontSize: px(110), fontWeight: 900, lineHeight: 1, margin: `${px(4)}px 0 ${px(2)}px`, letterSpacing: "-0.02em" }}>
          {g}
        </div>
      )}

      <div
        style={{
          paddingTop: px(6),
          marginTop: px(4),
          borderTop: `1px solid ${ink}`,
          fontSize: px(8),
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        NYC Dept of Health &amp; Mental Hygiene
      </div>
    </div>
  );
}
