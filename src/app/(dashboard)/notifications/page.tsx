export const dynamic = "force-dynamic";

import Link from "next/link";

import {
  Bell,
  ExternalLink,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { db } from "@/lib/db";

import { redirect } from "next/navigation";

import { getCurrentTenantUser } from "@/lib/tenant";

type DashboardNotification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  userId: string;
  ticketId: string | null;
  createdAt: Date;
};

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
    }) as DashboardNotification[];

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

          <div className="flex items-center gap-3">

            <Bell
              size={20}
              className="text-zinc-500"
            />

            <CardTitle>
              All Notifications
            </CardTitle>

          </div>

        </CardHeader>

        <CardContent className="space-y-4">

          {notifications.length === 0 && (

            <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">

              <p className="text-sm text-zinc-500">
                No notifications found
              </p>

            </div>

          )}

          {notifications.map(
            (
              notification: DashboardNotification
            ) => (

              <Link
                key={notification.id}
                href={
                  notification.ticketId
                    ? `/tickets/${notification.ticketId}`
                    : "#"
                }
                className="block"
              >

                <div
                  className={`rounded-2xl border p-5 transition hover:bg-zinc-50 dark:hover:bg-zinc-800 ${
                    notification.read
                      ? "border-zinc-200 dark:border-zinc-800"
                      : "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30"
                  }`}
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="min-w-0 flex-1">

                      <div className="flex items-center gap-2">

                        <h3 className="font-semibold text-zinc-900 dark:text-white">

                          {notification.title}

                        </h3>

                        {!notification.read && (

                          <span className="rounded-full bg-blue-500 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-white">

                            New

                          </span>

                        )}

                      </div>

                      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">

                        {notification.message}

                      </p>

                    </div>

                    {notification.ticketId && (

                      <ExternalLink
                        size={16}
                        className="shrink-0 text-zinc-400"
                      />

                    )}

                  </div>

                  <div className="mt-4 flex items-center justify-between">

                    <p className="text-xs text-zinc-400">

                      {
                        new Date(
                          notification.createdAt
                        )
                          .toISOString()
                          .split("T")[0]
                      }

                    </p>

                    <p className="text-xs text-zinc-400">

                      {notification.read
                        ? "Read"
                        : "Unread"}

                    </p>

                  </div>

                </div>

              </Link>

            )
          )}

        </CardContent>

      </Card>

    </div>
  );
}