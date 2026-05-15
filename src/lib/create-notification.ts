import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";

interface Props {
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
}: Props) {

    const notification =
        await db.notification.create({
            data: {
                userId,
                title,
                message,
                ticketId,
            },
        });

    await pusherServer.trigger(
        `user-${userId}`,
        "new-notification",
        {
            ...notification,
            createdAt:
                notification.createdAt.toISOString(),
        }
    );

    return notification;
}