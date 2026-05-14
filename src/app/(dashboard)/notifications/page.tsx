import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { db } from "@/lib/db";

import { redirect } from "next/navigation";

import { getCurrentTenantUser } from "@/lib/tenant";

export default async function NotificationsPage() {

  const user =
    await getCurrentTenantUser();

  if (!user) {
    redirect("/login");
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
    <div className="space-y-6">

      {/* Header */}
      <div>

        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Notifications
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Recent updates and alerts
        </p>

      </div>

      <Card className="dark:border-zinc-800 dark:bg-zinc-900">

        <CardHeader>

          <CardTitle>
            All Notifications
          </CardTitle>

        </CardHeader>

        <CardContent className="space-y-4">

          {notifications.length === 0 && (
            <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
              No notifications found
            </div>
          )}

          {notifications.map(
            (notification) => (

              <Link
                key={notification.id}
                href={
                  notification.ticketId
                    ? `/tickets/${notification.ticketId}`
                    : "#"
                }
              >

                <div
                  className={`rounded-2xl border p-5 transition hover:bg-zinc-50 dark:hover:bg-zinc-800 ${
                    notification.read
                      ? "border-zinc-200 dark:border-zinc-800"
                      : "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30"
                  }`}
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <h3 className="font-semibold text-zinc-900 dark:text-white">
                        {notification.title}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {notification.message}
                      </p>

                    </div>

                    {!notification.read && (
                      <span className="rounded-full bg-blue-500 px-2 py-1 text-xs font-medium text-white">
                        New
                      </span>
                    )}

                  </div>

                  <p className="mt-4 text-xs text-zinc-400">

                    {
                      new Date(
                        notification.createdAt
                      )
                        .toISOString()
                        .split("T")[0]
                    }

                  </p>

                </div>

              </Link>

            )
          )}

        </CardContent>

      </Card>

    </div>
  );
}