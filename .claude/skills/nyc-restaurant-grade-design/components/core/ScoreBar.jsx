export function ScoreBar({ score, grade, max = 40, style, ...rest }) {
  const s = parseInt(score, 10);
  if (isNaN(s)) return null;
  const g = String(grade || "").toUpperCase();
  const pct = Math.min(100, Math.round((s / max) * 100));
  const fill =
    { A: "var(--grade-a)", B: "var(--grade-b)", C: "var(--grade-c)" }[g] || "var(--color-gray)";

  let note = "";
  if (s <= 5 && g === "A") note = "Excellent";
  else if (s >= 11 && s <= 13) { const d = 14 - s; note = `${d} pt${d > 1 ? "s" : ""} from B`; }
  else if (s >= 24 && s <= 27 && g === "B") { const d = 28 - s; note = `${d} pt${d > 1 ? "s" : ""} from C`; }

  const tick = (left, label) => (
    <div style={{ position: "absolute", top: "-3px", left, width: "1px", height: "10px", background: "var(--color-muted)", opacity: 0.4 }}>
      <span style={{ position: "absolute", top: "11px", left: "-4px", fontSize: "9px", color: "var(--text-secondary)" }}>{label}</span>
    </div>
  );

  return (
    <div style={{ margin: "8px 0 4px", display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-sans)", ...style }} {...rest}>
      <div style={{ flex: 1, position: "relative", height: "4px", background: "var(--border-default)", borderRadius: "2px" }}>
        <div style={{ height: "100%", borderRadius: "2px", width: `${pct}%`, background: fill }}></div>
        {tick("35%", "B")}
        {tick("70%", "C")}
      </div>
      {note ? (
        <span style={{ fontSize: "11px", color: "var(--text-secondary)", whiteSpace: "nowrap", flexShrink: 0 }}>{note}</span>
      ) : null}
    </div>
  );
}
