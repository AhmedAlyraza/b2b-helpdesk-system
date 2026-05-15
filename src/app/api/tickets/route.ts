import { NextResponse } from "next/server";

import { db } from "@/lib/db";

import { getCurrentTenantUser } from "@/lib/tenant";

import { createActivity } from "@/lib/activity";

import { calculateSlaDueDate } from "@/lib/sla";

import { pusherServer } from "@/lib/pusher";

import { createNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  try {

    const user =
      await getCurrentTenantUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await req.json();

    const {
      title,
      description,
      priority,
    } = body;

    // basic validation
    if (
      !title ||
      !description
    ) {
      return NextResponse.json(
        {
          error:
            "Title and description are required",
        },
        {
          status: 400,
        }
      );
    }

    const ticket =
      await db.ticket.create({
        data: {
          title,

          description,

          priority,

          slaDueAt:
            calculateSlaDueDate(
              priority
            ),

          organizationId:
            user.organizationId!,

          createdById:
            user.id,
        },
      });

    // activity log
    await createActivity({
      ticketId: ticket.id,

      actorId: user.id,

      type: "TICKET_CREATED",

      message: `Created ticket: ${ticket.title}`,
    });

    // notify admins/agents

    const adminsAndAgents =
      await db.user.findMany({
        where: {
          organizationId:
            user.organizationId!,

          role: {
            in: [
              "ADMIN",
              "AGENT",
            ],
          },

          id: {
            not: user.id,
          },
        },
      });

    for (const member of adminsAndAgents) {

      const notification =
        await createNotification({
          userId: member.id,

          title:
            "New Ticket Created",

          message: `${user.name || user.email
            } created ticket: ${ticket.title}`,

          ticketId:
            ticket.id,
        });

      await pusherServer.trigger(
        `user-${member.id}`,
        "new-notification",
        {
          ...notification,
          createdAt:
            notification.createdAt.toISOString(),
        }
      );
    }

    return NextResponse.json(
      ticket
    );

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error:
          "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}