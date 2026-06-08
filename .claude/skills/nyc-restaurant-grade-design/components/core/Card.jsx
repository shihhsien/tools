export function Card({ children, style, ...rest }) {
  return (
    <div
      style={{
        background: "var(--surface-card)",
        border: "var(--border-width) solid var(--border-default)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-7)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
