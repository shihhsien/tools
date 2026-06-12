export function Input({ variant = "default", style, onFocus, onBlur, ...rest }) {
  const [focused, setFocused] = React.useState(false);
  const accent = variant === "accent";
  const restingBorder = accent ? "var(--border-accent)" : "var(--border-default)";
  return (
    <input
      style={{
        flex: 1,
        width: "100%",
        padding: "14px",
        boxSizing: "border-box",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-input)",
        background: accent ? "var(--surface-accent)" : "var(--surface-card)",
        border: "1px solid " + (focused ? "var(--focus-border)" : restingBorder),
        borderRadius: "var(--radius-lg)",
        color: "var(--text-primary)",
        outline: "none",
        boxShadow: focused ? "var(--focus-ring)" : "none",
        transition: "border-color var(--motion-fast), box-shadow var(--motion-fast)",
        ...style,
      }}
      onFocus={(e) => { setFocused(true); if (onFocus) onFocus(e); }}
      onBlur={(e) => { setFocused(false); if (onBlur) onBlur(e); }}
      {...rest}
    />
  );
}
