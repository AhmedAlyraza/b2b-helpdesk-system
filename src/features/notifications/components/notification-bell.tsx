"use client";

import Link from "next/link";

import { useEffect, useState } from "react";

import { Bell } from "lucide-react";

import { pusherClient } from "@/lib/pusher-client";

interface Notification {
  id: string;

  title: string;

  message: string;

  read: boolean;

  ticketId?: string | null;

  createdAt: string;
}

interface NotificationBellProps {
  initialNotifications: Notification[];

  initialUnreadCount: number;

  userId: string;
}

export function NotificationBell({
  initialNotifications,
  initialUnreadCount,
  userId,
}: NotificationBellProps) {

  const [
    notifications,
    setNotifications,
  ] = useState(
    initialNotifications
  );

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(
    initialUnreadCount
  );

  // =========================
  // REALTIME SUBSCRIPTION
  // =========================
  useEffect(() => {

    const channel =
      pusherClient.subscribe(
        `user-${userId}`
      );

    channel.bind(
      "new-notification",
      (
        notification: Notification
      ) => {

        setNotifications(
          (prev) => [
            notification,
            ...prev,
          ]
        );

        setUnreadCount(
          (prev) => prev + 1
        );
      }
    );

    return () => {

      channel.unbind_all();

      channel.unsubscribe();

    };

  }, [userId]);

  return (
    <div className="relative">

      <details className="relative">

        <summary className="flex cursor-pointer list-none items-center">

          <div className="relative">

            <Bell className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />

            {unreadCount > 0 && (

              <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">

                {unreadCount}

              </span>

            )}

          </div>

        </summary>

        <div className="absolute right-0 z-50 mt-3 w-96 rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">

          <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">

            <div className="flex items-center justify-between">

              <h3 className="font-semibold text-zinc-900 dark:text-white">
                Notifications
              </h3>

              <Link
                href="/notifications"
                className="text-xs text-blue-500 hover:underline"
              >
                View all
              </Link>

            </div>

          </div>

          <div className="max-h-[400px] overflow-y-auto">

            {notifications.length === 0 && (

              <div className="p-6 text-center text-sm text-zinc-500">
                No notifications
              </div>

            )}

            {notifications.map(
              (notification) => (

                <Link
                  key={notification.id}
                  href={
                    notification.ticketId
                      ? `/tickets/${notification.ticketId}`
                      : "/notifications"
                  }
                >

                  <div
                    className={`border-b border-zinc-100 px-4 py-4 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 ${
                      !notification.read
                        ? "bg-blue-50 dark:bg-zinc-800/60"
                        : ""
                    }`}
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <p className="font-medium text-zinc-900 dark:text-white">
                          {notification.title}
                        </p>

                        <p className="mt-1 text-sm text-zinc-500">
                          {notification.message}
                        </p>

                      </div>

                    </div>

                    <p className="mt-2 text-xs text-zinc-400">

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

          </div>

        </div>

      </details>

    </div>
  );
}