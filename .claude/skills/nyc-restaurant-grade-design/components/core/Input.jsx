export function Input({ variant = "default", style, ...rest }) {
  const accent = variant === "accent";
  return (
    <input
      style={{
        flex: 1,
        width: "100%",
        padding: "14px",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-input)",
        background: accent ? "var(--surface-accent)" : "var(--surface-card)",
        border: "1px solid " + (accent ? "var(--border-accent)" : "var(--border-default)"),
        borderRadius: "var(--radius-lg)",
        color: "var(--text-primary)",
        outline: "none",
        ...style,
      }}
      {...rest}
    />
  );
}
