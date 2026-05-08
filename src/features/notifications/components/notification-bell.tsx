import Link from "next/link";

import { Bell } from "lucide-react";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function NotificationBell() {
    const user = await getCurrentUser();

    if (!user) return null;

    const unreadCount =
        await db.notification.count({
            where: {
                userId: user.id,

                read: false,
            },
        });

    return (
        <Link
            href="/notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
            <Bell size={18} />

            {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount}
                </span>
            )}
        </Link>
    );
}