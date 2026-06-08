export function StatusLine({ children, tone = "default", style, ...rest }) {
  const color = tone === "error" ? "var(--text-error)" : "var(--text-secondary)";
  return (
    <div
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-body)",
        color,
        margin: "14px 2px",
        lineHeight: "var(--leading-snug)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
