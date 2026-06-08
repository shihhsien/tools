export function GradeBadge({ grade = "A", soft = false, size = 48, style, ...rest }) {
  const known = ["A", "B", "C"];
  const letter = grade == null || grade === "" ? "?" : String(grade);
  const isKnown = known.includes(letter.toUpperCase());
  const isMulti = letter.length > 1;

  const tone = {
    A: "var(--grade-pass)",
    B: "var(--grade-caution)",
    C: "var(--grade-fail)",
  }[letter.toUpperCase()] || "var(--grade-pending)";

  const base = {
    flex: "0 0 auto",
    width: size,
    height: size,
    lineHeight: `${size}px`,
    textAlign: "center",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-sans)",
    fontWeight: "var(--weight-bold)",
    fontSize: isMulti || !isKnown ? Math.round(size * 0.31) : Math.round(size * 0.54),
    userSelect: "none",
  };

  const skin = soft
    ? {
        background: "color-mix(in srgb, " + tone + " 18%, transparent)",
        color: tone,
        boxShadow: "inset 0 0 0 1px color-mix(in srgb, " + tone + " 45%, transparent)",
      }
    : { background: tone, color: "var(--text-on-grade)" };

  return (
    <div style={{ ...base, ...skin, ...style }} {...rest}>
      {letter}
    </div>
  );
}
