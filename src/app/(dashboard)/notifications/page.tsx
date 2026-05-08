import Link from "next/link";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export default async function NotificationsPage() {
    const user = await getCurrentUser();

    if (!user) {
        return null;
    }

    const notifications =
        await db.notification.findMany({
            where: {
                userId: user.id,
            },

            orderBy: {
                createdAt: "desc",
            },
        });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Notifications
                </h1>

                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    Recent ticket activity and updates.
                </p>
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
                        <p className="text-zinc-500">
                            No notifications yet.
                        </p>
                    </div>
                ) : (
                    notifications.map(
                        (notification) => (
                            <Link
                                key={notification.id}
                                href={
                                    notification.ticketId
                                        ? `/tickets/${notification.ticketId}`
                                        : "#"
                                }
                                className={`block rounded-2xl border p-5 transition hover:bg-zinc-50 dark:hover:bg-zinc-900 ${notification.read
                                        ? "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
                                        : "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20"
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-6">
                                    <div>
                                        <h2 className="font-semibold">
                                            {notification.title}
                                        </h2>

                                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                                            {notification.message}
                                        </p>
                                    </div>

                                    <span className="text-xs text-zinc-500">
                                        {new Date(
                                            notification.createdAt
                                        ).toLocaleString()}
                                    </span>
                                </div>
                            </Link>
                        )
                    )
                )}
            </div>
        </div>
    );
}