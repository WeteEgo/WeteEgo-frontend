import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "WeteEgo — Crypto to Fiat on Base",
  description: "Stablecoin-to-fiat conversion on Base. Powered by Paycrest.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="app-shell">
            <SiteHeader />
            <main className="app-main">
              <div className="app-container">{children}</div>
            </main>
            <footer className="border-t border-[var(--border-subtle)]/60 py-4 text-xs text-center text-[var(--text-muted)]">
              WeteEgo · Built for the Base ecosystem
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
