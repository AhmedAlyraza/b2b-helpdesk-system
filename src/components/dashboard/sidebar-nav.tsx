"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Settings,
} from "lucide-react";

export function SidebarNav() {

  const pathname =
    usePathname();

  return (
    <>
      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">

        <Link
          href="/dashboard"
          className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
            pathname === "/dashboard"
              ? "bg-black text-white"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          <LayoutDashboard size={18} />

          Dashboard
        </Link>

        <Link
          href="/tickets"
          className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
            pathname.startsWith("/tickets") &&
            pathname !== "/tickets/new"
              ? "bg-black text-white"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          <Ticket size={18} />

          Tickets
        </Link>

        <Link
          href="/tickets/new"
          className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
            pathname === "/tickets/new"
              ? "bg-black text-white"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          <PlusCircle size={18} />

          New Ticket
        </Link>

      </nav>

      {/* Bottom */}
      <div className="border-t border-zinc-200 p-4">

        <Link
          href="/settings"
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
            pathname === "/settings"
              ? "bg-black text-white"
              : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          <Settings size={18} />

          Settings
        </Link>

      </div>
    </>
  );
}