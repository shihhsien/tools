export function Trend({ current, previous, style, ...rest }) {
  const cur = parseInt(current, 10);
  const prev = parseInt(previous, 10);
  if (isNaN(cur) || isNaN(prev)) return null;
  const diff = Math.abs(cur - prev);
  const pts = diff ? ` (${diff} pt${diff > 1 ? "s" : ""})` : "";
  let color, arrow, label;
  if (cur < prev) { color = "var(--grade-b)"; arrow = "▲"; label = "Improving"; }
  else if (cur > prev) { color = "var(--grade-c)"; arrow = "▼"; label = "Declining"; }
  else { color = "var(--text-secondary)"; arrow = "▬"; label = "No change"; }
  return (
    <div style={{ fontSize: "12px", fontWeight: "var(--weight-semibold)", marginTop: "6px", color, fontFamily: "var(--font-sans)", ...style }} {...rest}>
      <span style={{ fontSize: "11px" }}>{arrow}</span> {label}{pts} since previous inspection
    </div>
  );
}
