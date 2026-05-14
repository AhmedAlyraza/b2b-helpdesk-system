import { db } from "@/lib/db";

interface CreateNotificationParams {
  userId: string;

  title: string;

  message: string;

  ticketId?: string;
}

export async function createNotification({
  userId,
  title,
  message,
  ticketId,
}: CreateNotificationParams) {

  return db.notification.create({
    data: {
      userId,

      title,

      message,

      ticketId,
    },
  });
}

export async function markNotificationAsRead(
  notificationId: string
) {

  return db.notification.update({
    where: {
      id: notificationId,
    },

    data: {
      read: true,
    },
  });
}

export async function markAllNotificationsAsRead(
  userId: string
) {

  return db.notification.updateMany({
    where: {
      userId,

      read: false,
    },

    data: {
      read: true,
    },
  });
}

export async function getUnreadNotificationsCount(
  userId: string
) {

  return db.notification.count({
    where: {
      userId,

      read: false,
    },
  });
}