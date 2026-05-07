export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-xl font-bold">
          HelpDesk System
        </h2>

        <nav className="mt-6 space-y-2">
          <a
            href="/dashboard"
            className="block rounded px-3 py-2 hover:bg-gray-800"
          >
            Dashboard
          </a>

          <a
            href="/tickets"
            className="block rounded px-3 py-2 hover:bg-gray-800"
          >
            Tickets
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-100">
        {children}
      </main>
    </div>
  );
}