import type { ReactNode } from "react";

const sizes = {
  sm: "p-4 rounded-xl",
  md: "p-6 rounded-2xl",
  lg: "p-8 rounded-[var(--radius-feature)]",
} as const;

export function GlassCard({
  children,
  className = "",
  size = "md",
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  size?: keyof typeof sizes;
  hover?: boolean;
}) {
  return (
    <div
      className={`glass-card-base ${sizes[size]} transition-colors duration-300 ${
        hover ? "hover:bg-white/[0.07] hover:border-white/[0.14]" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
