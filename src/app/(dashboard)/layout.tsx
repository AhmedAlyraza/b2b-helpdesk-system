import Link from "next/link";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Settings,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-100 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="hidden w-72 border-r border-zinc-200 bg-white dark:bg-zinc-900 lg:flex lg:flex-col">
        {/* Logo */}
        <div className="border-b border-zinc-200 px-6 py-5">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            HelpDesk System
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            B2B Support Platform
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link
            href="/tickets"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            <Ticket size={18} />
            Tickets
          </Link>

          <Link
            href="/tickets/new"
            className="flex items-center gap-3 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            <PlusCircle size={18} />
            New Ticket
          </Link>
        </nav>

        {/* Bottom */}
        <div className="border-t border-zinc-200 p-4">
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100">
            <Settings size={18} />
            Settings
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 dark:bg-zinc-900/80 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                Dashboard
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />

              <div className="hidden rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 md:block">
                Search...
              </div>

              <NotificationBell />

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-semibold text-white dark:bg-white dark:text-black">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}