export function Button({ children, disabled = false, style, ...rest }) {
  return (
    <button
      disabled={disabled}
      style={{
        width: "100%",
        marginTop: "var(--space-5)",
        padding: "15px 18px",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-button)",
        fontWeight: "var(--weight-semibold)",
        border: "none",
        borderRadius: "var(--radius-lg)",
        background: "var(--surface-inverse)",
        color: "var(--text-inverse)",
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? "default" : "pointer",
        transition: "opacity .12s ease",
        ...style,
      }}
      onPointerDown={(e) => { if (!disabled) e.currentTarget.style.opacity = "0.7"; }}
      onPointerUp={(e) => { if (!disabled) e.currentTarget.style.opacity = "1"; }}
      onPointerLeave={(e) => { if (!disabled) e.currentTarget.style.opacity = "1"; }}
      {...rest}
    >
      {children}
    </button>
  );
}
