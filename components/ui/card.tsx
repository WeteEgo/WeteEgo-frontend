import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  header?: ReactNode;
  footer?: ReactNode;
}

export function Card({ header, footer, className = "", children, ...props }: CardProps) {
  const base =
    "rounded-xl border border-[var(--border-subtle)]/70 bg-[var(--bg-card)]/80 shadow-card backdrop-blur-md";

  return (
    <section className={[base, className].filter(Boolean).join(" ")} {...props}>
      {header && <div className="border-b border-[var(--border-subtle)]/60 px-5 py-4">{header}</div>}
      <div className="px-5 py-4">{children}</div>
      {footer && <div className="border-t border-[var(--border-subtle)]/60 px-5 py-3">{footer}</div>}
    </section>
  );
}

