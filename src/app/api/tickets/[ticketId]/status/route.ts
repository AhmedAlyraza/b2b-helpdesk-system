import { NextResponse } from "next/server";

import {
  TicketStatus,
} from "@prisma/client";

import { db } from "@/lib/db";

import { requireRole } from "@/lib/rbac";

import { getAuthorizedTicket } from "@/lib/permissions";

import { createActivity } from "@/lib/activity";

import { createNotification } from "@/lib/notifications";

import { pusherServer } from "@/lib/pusher";

interface RouteContext {
  params: Promise<{
    ticketId: string;
  }>;
}

const allowedStatuses = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

export async function PATCH(
  req: Request,
  context: RouteContext
) {

  try {

    // =========================
    // RBAC
    // =========================
    const currentUser =
      await requireRole([
        "ADMIN",
        "AGENT",
      ]);

    if (!currentUser) {
      return NextResponse.json(
        {
          error: "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    const { ticketId } =
      await context.params;

    // =========================
    // TENANT + AUTHORIZATION
    // =========================
    const authorized =
      await getAuthorizedTicket(
        ticketId
      );

    if (!authorized) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const {
      user,
      ticket,
    } = authorized;

    const body =
      await req.json();

    const {
      status,
    } = body;

    // =========================
    // VALIDATION
    // =========================
    if (
      !status ||
      !allowedStatuses.includes(
        status
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid status",
        },
        {
          status: 400,
        }
      );
    }

    // prevent duplicate updates
    if (
      ticket.status === status
    ) {
      return NextResponse.json(
        {
          error:
            "Ticket already has this status",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // WORKFLOW RULES
    // =========================

    // prevent reopening closed tickets
    if (
      ticket.status ===
      "CLOSED" &&
      status !== "CLOSED"
    ) {
      return NextResponse.json(
        {
          error:
            "Closed tickets cannot be reopened",
        },
        {
          status: 400,
        }
      );
    }

    // prevent direct OPEN -> RESOLVED skip
    if (
      ticket.status ===
      "OPEN" &&
      status === "RESOLVED"
    ) {
      return NextResponse.json(
        {
          error:
            "Ticket must be IN_PROGRESS before RESOLVED",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // UPDATE
    // =========================
    const updatedTicket =
      await db.ticket.update({
        where: {
          id: ticket.id,
        },

        data: {
          status:
            status as TicketStatus,
        },

        include: {
          assignedTo: true,
          createdBy: true,
        },
      });


    await pusherServer.trigger(
      `ticket-${ticket.id}`,
      "ticket-updated",
      {
        type: "status",

        status:
          updatedTicket.status,
      }
    );
    await createActivity({
      ticketId: ticket.id,

      actorId: user.id,

      type: "STATUS_CHANGED",

      message: `Ticket status changed to ${status}`,
    });

    // =========================
    // NOTIFICATIONS
    // =========================

    // notify creator
    if (
      ticket.createdById !==
      user.id
    ) {

      await createNotification({
        userId:
          ticket.createdById,

        title:
          "Ticket Status Updated",

        message: `Ticket "${ticket.title}" changed to ${status}`,

        ticketId:
          ticket.id,
      });
    }

    // notify assigned agent
    if (
      ticket.assignedToId &&
      ticket.assignedToId !==
      user.id &&
      ticket.assignedToId !==
      ticket.createdById
    ) {

      await createNotification({
        userId:
          ticket.assignedToId,

        title:
          "Ticket Status Updated",

        message: `Ticket "${ticket.title}" changed to ${status}`,

        ticketId:
          ticket.id,
      });
    }

    return NextResponse.json(
      updatedTicket
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