"use client";

import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function Input({ className = "", error, ...props }: InputProps) {
  const base =
    "w-full rounded-lg border bg-white/[0.04] text-sm text-slate-50 placeholder:text-[var(--text-muted)] px-3 py-2 focus:border-blue-500 focus:ring-0 shadow-sm focus:shadow-focus";
  const border = error ? "border-danger" : "border-[var(--border-subtle)]";

  return (
    <div className="space-y-1.5">
      <input className={[base, border, className].filter(Boolean).join(" ")} {...props} />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

