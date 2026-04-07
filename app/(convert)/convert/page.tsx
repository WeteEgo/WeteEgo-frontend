"use client";

import { ConvertFlow } from "@/components/convert/ConvertFlow";

export default function ConvertPage() {
  return (
    <div className="py-10">
      <section className="mb-6 text-center" aria-labelledby="convert-heading">
        <h1 id="convert-heading" className="text-lg font-semibold text-slate-100">
          Convert USDC to NGN
        </h1>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Fast, secure stablecoin to Naira conversion on Base.
        </p>
      </section>
      <ConvertFlow />
    </div>
  );
}
