export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main id="main-content" className="app-main outline-none">
      <div className="app-container w-full py-10">{children}</div>
    </main>
  );
}
