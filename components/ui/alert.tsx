import type { HTMLAttributes } from "react";

type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

const variantClasses: Record<AlertVariant, string> = {
  info: "border-blue-500/40 bg-blue-500/10 text-blue-100",
  success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-100",
  error: "border-danger/50 bg-danger/10 text-red-100",
};

export function Alert({ variant = "info", className = "", children, ...props }: AlertProps) {
  const base = "rounded-lg border px-3 py-2 text-xs leading-relaxed";
  const composed = [base, variantClasses[variant], className].filter(Boolean).join(" ");

  return (
    <div className={composed} role="status" {...props}>
      {children}
    </div>
  );
}

