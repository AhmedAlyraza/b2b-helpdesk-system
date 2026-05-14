import Link from "next/link";

import { db } from "@/lib/db";

import { getCurrentTenantUser } from "@/lib/tenant";

import { SidebarNav } from "@/components/dashboard/sidebar-nav";

import { NotificationBell } from "@/features/notifications/components/notification-bell";

import { ThemeToggle } from "@/components/theme/theme-toggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {

  const user =
    await getCurrentTenantUser();

  const notifications =
    user
      ? await db.notification.findMany({
          where: {
            userId: user.id,
          },

          orderBy: {
            createdAt: "desc",
          },

          take: 5,
        })
      : [];

  const unreadCount =
    user
      ? await db.notification.count({
          where: {
            userId: user.id,

            read: false,
          },
        })
      : 0;

  return (
    <div className="flex min-h-screen bg-zinc-100 dark:bg-zinc-950">

      {/* Sidebar */}
      <aside className="hidden w-72 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:flex lg:flex-col">

        {/* Logo */}
        <div className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">

          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            HelpDesk System
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            B2B Support Platform
          </p>

        </div>

        <SidebarNav />

      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">

        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">

          <div className="flex h-16 items-center justify-between px-6">

            <div>

              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Dashboard
              </h2>

            </div>

            <div className="flex items-center gap-4">

              <ThemeToggle />

              <div className="hidden rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 md:block">
                Search...
              </div>

              <NotificationBell
                initialNotifications={notifications.map(
                  (notification) => ({
                    ...notification,

                    createdAt:
                      notification.createdAt.toISOString(),
                  })
                )}

                initialUnreadCount={
                  unreadCount
                }
              />

              <Link href="/settings">

                <div className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-black text-sm font-bold text-white transition hover:scale-105 dark:bg-white dark:text-black">

                  {user?.name?.[0] ?? "U"}

                </div>

              </Link>

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