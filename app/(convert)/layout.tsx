/**
 * App flow routes: centered column matching legacy convert shell.
 */
export default function ConvertLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main id="main-content" className="app-main outline-none">
      <div className="app-container w-full">{children}</div>
    </main>
  );
}
