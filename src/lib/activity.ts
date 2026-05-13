import { db } from "@/lib/db";

interface CreateActivityParams {
    ticketId: string;

    actorId: string;

    type: string;

    message: string;
}

export async function createActivity({
    ticketId,
    actorId,
    type,
    message,
}: CreateActivityParams) {

    return db.ticketActivity.create({
        data: {
            ticketId,

            actorId,

            type,

            message,
        },
    });
}