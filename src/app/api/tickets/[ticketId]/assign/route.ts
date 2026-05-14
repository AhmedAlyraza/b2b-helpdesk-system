import { NextResponse } from "next/server";

import { db } from "@/lib/db";

import { requireRole } from "@/lib/rbac";

import { getAuthorizedTicket } from "@/lib/permissions";

import { createActivity } from "@/lib/activity";

import { createNotification } from "@/lib/notifications";

interface RouteContext {
  params: Promise<{
    ticketId: string;
  }>;
}

export async function PATCH(
  req: Request,
  context: RouteContext
) {

  try {

    // RBAC
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

    // tenant + ownership validation
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
      assigneeId,
    } = body;

    // =========================
    // UNASSIGN
    // =========================
    if (!assigneeId) {

      const updatedTicket =
        await db.ticket.update({
          where: {
            id: ticket.id,
          },

          data: {
            assignedToId: null,
          },
        });

      // activity log
      await createActivity({
        ticketId: ticket.id,

        actorId: user.id,

        type: "TICKET_UNASSIGNED",

        message:
          "Ticket unassigned",
      });

      return NextResponse.json(
        updatedTicket
      );
    }

    // =========================
    // VALIDATE ASSIGNED USER
    // =========================
    const assignedUser =
      await db.user.findFirst({
        where: {
          id: assigneeId,

          organizationId:
            user.organizationId,
        },
      });

    if (!assignedUser) {
      return NextResponse.json(
        {
          error:
            "Assigned user not found",
        },
        {
          status: 404,
        }
      );
    }

    // prevent assigning customers
    if (
      assignedUser.role ===
      "CUSTOMER"
    ) {
      return NextResponse.json(
        {
          error:
            "Customers cannot be assigned tickets",
        },
        {
          status: 400,
        }
      );
    }

    // prevent redundant assignment
    if (
      ticket.assignedToId ===
      assignedUser.id
    ) {
      return NextResponse.json(
        {
          error:
            "Ticket already assigned to this user",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // UPDATE TICKET
    // =========================
    const updatedTicket =
      await db.ticket.update({
        where: {
          id: ticket.id,
        },

        data: {
          assignedToId:
            assignedUser.id,
        },

        include: {
          assignedTo: true,
        },
      });

    // =========================
    // ACTIVITY LOG
    // =========================
    await createActivity({
      ticketId: ticket.id,

      actorId: user.id,

      type: "TICKET_ASSIGNED",

      message: `Ticket assigned to ${
        assignedUser.name ||
        assignedUser.email
      }`,
    });

    // =========================
    // NOTIFICATION
    // =========================
    await createNotification({
      userId:
        assignedUser.id,

      title:
        "New Ticket Assignment",

      message: `You were assigned ticket: ${ticket.title}`,

      ticketId:
        ticket.id,
    });

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