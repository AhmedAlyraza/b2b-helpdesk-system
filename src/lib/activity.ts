import { db } from "@/lib/db";

import { pusherServer } from "@/lib/pusher";

interface CreateActivityProps {
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
}: CreateActivityProps) {

  const activity =
    await db.ticketActivity.create({
      data: {
        ticketId,

        actorId,

        type,

        message,
      },

      include: {
        actor: true,
      },
    });

  // =========================
  // REALTIME EVENT
  // =========================
  await pusherServer.trigger(
    `ticket-${ticketId}`,
    "new-activity",
    {
      id: activity.id,

      type:
        activity.type,

      message:
        activity.message,

      createdAt:
        activity.createdAt,

      actor: {
        id:
          activity.actor.id,

        name:
          activity.actor.name,

        email:
          activity.actor.email,
      },
    }
  );

  return activity;
}