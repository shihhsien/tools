import { Card } from "./Card.jsx";
import { GradeBadge } from "./GradeBadge.jsx";

export function ResultCard({
  grade,
  name = "Unknown",
  address,
  score,
  gradedDate,
  inspectedDate,
  inspectionType,
  violation,
  criticalFlag,
  pending = false,
  style,
  ...rest
}) {
  return (
    <Card style={{ marginTop: "var(--space-6)", ...style }} {...rest}>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <GradeBadge grade={pending ? "?" : grade} />
        <div>
          <div
            style={{
              fontSize: "var(--text-name)",
              fontWeight: "var(--weight-semibold)",
              color: "var(--text-primary)",
            }}
          >
            {name}
          </div>
          {address ? (
            <div style={{ fontSize: "var(--text-body)", color: "var(--text-secondary)", marginTop: "2px" }}>
              {address}
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ fontSize: "var(--text-body)", marginTop: "10px", lineHeight: "var(--leading-snug)", color: "var(--text-primary)" }}>
        {pending ? (
          <span style={{ color: "var(--grade-caution)" }}>
            No letter grade on record yet
          </span>
        ) : (
          <span>
            Grade <b style={{ fontWeight: "var(--weight-semibold)" }}>{grade}</b>
            {score != null ? <> · score {score}</> : null}
            {gradedDate ? <> · graded {gradedDate}</> : null}
          </span>
        )}
        {pending && score != null ? <span style={{ color: "var(--text-secondary)" }}> (latest score {score})</span> : null}
      </div>

      {inspectedDate ? (
        <div style={{ fontSize: "var(--text-body)", marginTop: "10px", color: "var(--text-secondary)" }}>
          Last inspection: {inspectedDate}
          {inspectionType ? ` · ${inspectionType}` : ""}
        </div>
      ) : null}

      {violation ? (
        <div style={{ fontSize: "var(--text-small)", color: "var(--text-secondary)", marginTop: "6px", lineHeight: "var(--leading-snug)" }}>
          Latest cited{criticalFlag ? ` (${criticalFlag})` : ""}: {violation}
        </div>
      ) : null}
    </Card>
  );
}
