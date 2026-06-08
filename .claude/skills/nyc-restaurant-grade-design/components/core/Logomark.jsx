export function Logomark({ layout = "horizontal", grade = "A", size = 40, showWordmark = true, style, ...rest }) {
  const tone = {
    A: "var(--grade-pass)",
    B: "var(--grade-caution)",
    C: "var(--grade-fail)",
  }[String(grade).toUpperCase()] || "var(--grade-pending)";

  const radius = Math.round(size * 0.22);
  const chip = (
    <div
      style={{
        flex: "0 0 auto",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: tone,
        color: "var(--text-on-grade)",
        fontFamily: "var(--font-sans)",
        fontWeight: "var(--weight-bold)",
        fontSize: Math.round(size * 0.57),
        borderRadius: radius,
        userSelect: "none",
      }}
    >
      {String(grade)}
    </div>
  );

  if (!showWordmark) {
    return <div style={{ display: "inline-flex", ...style }} {...rest}>{chip}</div>;
  }

  const stacked = layout === "stacked";
  const wordSize = stacked ? Math.round(size * 0.42) : Math.round(size * 0.5);
  const word = (
    <div
      style={{
        fontFamily: "var(--font-sans)",
        fontWeight: "var(--weight-semibold)",
        fontSize: wordSize,
        letterSpacing: "-0.01em",
        lineHeight: 1.05,
        textAlign: stacked ? "center" : "left",
        whiteSpace: stacked ? "normal" : "nowrap",
      }}
    >
      <span style={{ color: "var(--text-primary)" }}>NYC Restaurant</span>
      {stacked ? <br /> : " "}
      <span style={{ color: "var(--text-secondary)" }}>Grade</span>
    </div>
  );

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: stacked ? "column" : "row",
        alignItems: "center",
        gap: stacked ? Math.round(size * 0.22) : Math.round(size * 0.3),
        ...style,
      }}
      {...rest}
    >
      {chip}
      {word}
    </div>
  );
}
