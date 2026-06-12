export function ClosureBanner({ date, style, ...rest }) {
  return (
    <div
      style={{
        marginBottom: "10px",
        padding: "8px 12px",
        borderRadius: "var(--radius-sm)",
        fontSize: "var(--text-body)",
        fontWeight: "var(--weight-semibold)",
        fontFamily: "var(--font-sans)",
        background: "rgba(248,113,113,.1)",
        color: "var(--text-error)",
        border: "1px solid rgba(248,113,113,.25)",
        ...style,
      }}
      {...rest}
    >
      ⚠ Closed by DOHMH{date ? ` · ${date}` : ""}
    </div>
  );
}
