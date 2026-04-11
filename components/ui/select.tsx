"use client";

import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export function Select({ className = "", error, children, ...props }: SelectProps) {
  const base =
    "w-full rounded-lg border bg-white/[0.04] text-sm text-slate-50 px-3 py-2 focus:border-blue-500 focus:ring-0 shadow-sm focus:shadow-focus";
  const border = error ? "border-danger" : "border-[var(--border-subtle)]";

  return (
    <div className="space-y-1.5">
      <select className={[base, border, className].filter(Boolean).join(" ")} {...props}>
        {children}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

