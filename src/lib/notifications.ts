import { db } from "@/lib/db";

import { pusherServer } from "@/lib/pusher";

interface CreateNotificationProps {
  title: string;

  message: string;

  userId: string;

  ticketId?: string;
}

export async function createNotification({
  title,
  message,
  userId,
  ticketId,
}: CreateNotificationProps) {

  const notification =
    await db.notification.create({
      data: {
        title,
        message,
        userId,
        ticketId,
      },
    });

  // =========================
  // REALTIME EVENT
  // =========================
  await pusherServer.trigger(
    `user-${userId}`,
    "new-notification",
    notification
  );

  return notification;
}