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

  const [
    open,
    setOpen,
  ] = useState(false);

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

      pusherClient.unsubscribe(
        `user-${userId}`
      );

    };

  }, [userId]);

  return (
    <div className="relative">

      {/* Trigger */}
      <button
        type="button"
        onClick={() =>
          setOpen(!open)
        }
        className="relative flex items-center"
      >

        <Bell className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />

        {unreadCount > 0 && (

          <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">

            {unreadCount}

          </span>

        )}

      </button>

      {/* Dropdown */}
      {open && (

        <div className="absolute right-0 z-50 mt-3 w-96 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">

            <h3 className="font-semibold text-zinc-900 dark:text-white">
              Notifications
            </h3>

            <Link
              href="/notifications"
              className="text-xs text-blue-500 hover:underline"
              onClick={() =>
                setOpen(false)
              }
            >
              View all
            </Link>

          </div>

          {/* Notifications */}
          <div className="max-h-[400px] overflow-y-auto">

            {notifications.length === 0 && (

              <div className="p-6 text-center text-sm text-zinc-500">
                No notifications
              </div>

            )}

            {notifications.map(
              (notification) => (

                <div
                  key={notification.id}
                  onClick={async () => {

                    try {

                      await fetch(
                        `/api/notifications/${notification.id}/read`,
                        {
                          method: "PATCH",
                        }
                      );

                      setNotifications((prev) =>
                        prev.map((item) =>
                          item.id === notification.id
                            ? {
                              ...item,
                              read: true,
                            }
                            : item
                        )
                      );

                      setUnreadCount((prev) =>
                        Math.max(prev - 1, 0)
                      );

                    } catch (error) {

                      console.error(error);

                    }

                    setOpen(false);

                    window.location.href =
                      notification.ticketId
                        ? `/tickets/${notification.ticketId}`
                        : "/notifications";

                  }}
                  className={`cursor-pointer border-b border-zinc-200 p-4 transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800 ${!notification.read
                      ? "bg-blue-50 dark:bg-blue-950/20"
                      : ""
                    }`}
                >

                  <h4 className="font-semibold text-zinc-900 dark:text-white">

                    {notification.title}

                  </h4>

                  <p className="mt-1 text-sm text-zinc-500">

                    {notification.message}

                  </p>

                  <p className="mt-2 text-xs text-zinc-400">

                    {
                      new Date(
                        notification.createdAt
                      ).toLocaleDateString()
                    }

                  </p>

                </div>

              )
            )}

          </div>

        </div>

      )}

    </div>
  );
}