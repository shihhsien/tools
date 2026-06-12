export function Button({ children, variant = "primary", disabled = false, style, onFocus, onBlur, ...rest }) {
  const [ring, setRing] = React.useState(false);
  const secondary = variant === "secondary";
  return (
    <button
      disabled={disabled}
      style={{
        width: "100%",
        marginTop: secondary ? "var(--space-4)" : "var(--space-5)",
        padding: secondary ? "12px 18px" : "15px 18px",
        fontFamily: "var(--font-sans)",
        fontSize: secondary ? "15px" : "var(--text-button)",
        fontWeight: "var(--weight-semibold)",
        border: secondary ? "1px solid var(--border-default)" : "none",
        borderRadius: "var(--radius-lg)",
        background: secondary ? "var(--surface-card)" : "var(--surface-inverse)",
        color: secondary ? "var(--text-primary)" : "var(--text-inverse)",
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? "default" : "pointer",
        outline: "none",
        boxShadow: ring ? "var(--focus-ring)" : "none",
        transition: "opacity var(--motion-fast), box-shadow var(--motion-fast)",
        ...style,
      }}
      onPointerDown={(e) => { if (!disabled) e.currentTarget.style.opacity = "var(--press-opacity)"; }}
      onPointerUp={(e) => { if (!disabled) e.currentTarget.style.opacity = "1"; }}
      onPointerLeave={(e) => { if (!disabled) e.currentTarget.style.opacity = "1"; }}
      onFocus={(e) => { setRing(e.currentTarget.matches(":focus-visible")); if (onFocus) onFocus(e); }}
      onBlur={(e) => { setRing(false); if (onBlur) onBlur(e); }}
      {...rest}
    >
      {children}
    </button>
  );
}
