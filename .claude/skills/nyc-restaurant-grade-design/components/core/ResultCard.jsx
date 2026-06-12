import { Card } from "./Card.jsx";
import { GradeBadge } from "./GradeBadge.jsx";
import { ScoreBar } from "./ScoreBar.jsx";
import { Trend } from "./Trend.jsx";
import { ClosureBanner } from "./ClosureBanner.jsx";
import { ViolationsList } from "./ViolationsList.jsx";
import { InspectionHistory } from "./InspectionHistory.jsx";

const GRADE_CONTEXT = {
  A: "Cleanest tier (0–13 points). About 9 in 10 NYC restaurants earn an A.",
  B: "Some violations found (14–27 points) — not necessarily unsafe.",
  C: "28+ points: multiple or more serious violations at this inspection.",
};
const PENDING_CONTEXT =
  "A grade is issued after a graded cycle inspection; a below-A result is re-inspected (often within about 30 days) before a letter is posted.";

export function ResultCard({
  grade,
  name = "Unknown",
  address,
  score,
  gradedDate,
  inspectedDate,
  inspectionType,
  pending = false,
  meta = [],
  freshness,
  overdue = false,
  showContext = false,
  violations,
  history,
  closedDate,
  style,
  ...rest
}) {
  const g = pending ? null : grade;
  const metaParts = [];
  if (freshness) {
    metaParts.push(
      <span key="fresh" style={overdue ? { color: "var(--grade-c)", fontWeight: "var(--weight-semibold)" } : null}>{freshness}</span>
    );
  }
  for (let i = 0; i < meta.length; i++) metaParts.push(<span key={i}>{meta[i]}</span>);

  const prevScore = history && history.length > 1 ? history[1].score : null;
  const curScore = history && history.length > 1 ? history[0].score : null;

  return (
    <Card style={{ marginTop: "var(--space-6)", ...style }} {...rest}>
      {closedDate ? <ClosureBanner date={closedDate} /> : null}

      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <GradeBadge grade={g || "?"} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "var(--text-name)", fontWeight: "var(--weight-semibold)", color: "var(--text-primary)" }}>{name}</div>
          {address ? (
            <div style={{ fontSize: "var(--text-body)", color: "var(--text-secondary)", marginTop: "2px" }}>{address}</div>
          ) : null}
          {metaParts.length ? (
            <div style={{ fontSize: "var(--text-small)", color: "var(--text-secondary)", marginTop: "3px", display: "flex", flexWrap: "wrap", gap: "0 4px" }}>
              {metaParts.map((p, i) => (
                <React.Fragment key={i}>
                  {i > 0 ? <span> · </span> : null}
                  {p}
                </React.Fragment>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ fontSize: "var(--text-body)", marginTop: "10px", lineHeight: "var(--leading-snug)", color: "var(--text-primary)" }}>
        {pending ? (
          <span>
            <span style={{ color: "var(--text-secondary)" }}>No letter grade on record yet</span>
            {score != null ? <span style={{ color: "var(--text-secondary)" }}> (latest score {score})</span> : null}
          </span>
        ) : (
          <span>
            Grade <b style={{ fontWeight: "var(--weight-semibold)" }}>{grade}</b>
            {score != null ? <> · score {score}</> : null}
            {gradedDate ? <> · graded {gradedDate}</> : null}
          </span>
        )}
      </div>

      {showContext ? (
        <div style={{ fontSize: "var(--text-small)", color: "var(--text-secondary)", marginTop: "6px", lineHeight: 1.45 }}>
          {pending ? PENDING_CONTEXT : GRADE_CONTEXT[String(grade || "").toUpperCase()] || null}
        </div>
      ) : null}

      {score != null ? <ScoreBar score={score} grade={g} /> : null}
      {curScore != null && prevScore != null ? <Trend current={curScore} previous={prevScore} /> : null}

      {inspectedDate ? (
        <div style={{ fontSize: "var(--text-body)", marginTop: "10px", color: "var(--text-secondary)" }}>
          Last inspection: {inspectedDate}
          {inspectionType ? ` · ${inspectionType}` : ""}
        </div>
      ) : null}

      {violations !== undefined ? <ViolationsList violations={violations} /> : null}
      {history ? <InspectionHistory history={history} /> : null}
    </Card>
  );
}
