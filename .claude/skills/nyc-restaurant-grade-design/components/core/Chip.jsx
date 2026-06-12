export function Chip({ children, style, ...rest }) {
  return (
    <button
      type="button"
      style={{
        width: "auto",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-small)",
        padding: "5px 10px",
        borderRadius: "14px",
        background: "var(--surface-card)",
        border: "1px solid var(--border-default)",
        color: "var(--text-primary)",
        cursor: "pointer",
        transition: "opacity var(--motion-fast)",
        ...style,
      }}
      onPointerDown={(e) => { e.currentTarget.style.opacity = "var(--press-opacity)"; }}
      onPointerUp={(e) => { e.currentTarget.style.opacity = "1"; }}
      onPointerLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
      {...rest}
    >
      {children}
    </button>
  );
}
