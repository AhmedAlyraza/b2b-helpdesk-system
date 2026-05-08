import { db } from "@/lib/db";

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
    return db.notification.create({
        data: {
            title,
            message,
            userId,
            ticketId,
        },
    });
}