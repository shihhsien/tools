export function Divider({ label, style, ...rest }) {
  const line = {
    content: '""',
    flex: 1,
    height: "1px",
    background: "var(--border-default)",
  };
  if (!label) {
    return <div style={{ height: "1px", background: "var(--border-default)", ...style }} {...rest} />;
  }
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: "10px", margin: "12px 0 4px", ...style }}
      {...rest}
    >
      <span style={line} />
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-eyebrow)",
          color: "var(--text-tertiary)",
          textTransform: "uppercase",
          letterSpacing: "var(--tracking-eyebrow)",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <span style={line} />
    </div>
  );
}
