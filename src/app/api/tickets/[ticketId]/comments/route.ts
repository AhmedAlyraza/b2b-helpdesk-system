import { NextResponse } from "next/server";

import { db } from "@/lib/db";

import { getAuthorizedTicket } from "@/lib/permissions";

import { createActivity } from "@/lib/activity";

import { createNotification } from "@/lib/notifications";

import { processMentions } from "@/lib/mentions";

import { pusherServer } from "@/lib/pusher";

interface RouteContext {
  params: Promise<{
    ticketId: string;
  }>;
}

export async function POST(
  req: Request,
  context: RouteContext
) {

  try {

    const { ticketId } =
      await context.params;

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
      message,
      isInternal,
    } = body;

    // =========================
    // VALIDATION
    // =========================
    if (!message?.trim()) {
      return NextResponse.json(
        {
          error:
            "Message required",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // INTERNAL NOTE RBAC
    // =========================
    if (
      isInternal &&
      ![
        "ADMIN",
        "AGENT",
      ].includes(user.role)
    ) {
      return NextResponse.json(
        {
          error:
            "Only admins and agents can create internal notes",
        },
        {
          status: 403,
        }
      );
    }

    // =========================
    // CREATE COMMENT
    // =========================
    const comment = await db.comment.create({
      data: {
        message:
          message.trim(),

        isInternal:
          isInternal ?? false,

        ticketId:
          ticket.id,

        authorId:
          user.id,
      },

      include: {
        author: true,
      },
    });


    await pusherServer.trigger(
      `ticket-${ticket.id}`,
      "new-comment",
      {
        id: comment.id,

        message:
          comment.message,

        createdAt:
          comment.createdAt,

        isInternal:
          comment.isInternal,

        author: {
          id: user.id,

          name:
            user.name,

          email:
            user.email,
        },
      }
    );

    await processMentions({
      commentId: comment.id,

      message,

      organizationId:
        user.organizationId!,

      authorId: user.id,

      ticketId: ticket.id,
    });


    await createActivity({
      ticketId:
        ticket.id,

      actorId:
        user.id,

      type:
        "COMMENT_ADDED",

      message:
        isInternal
          ? "Internal note added"
          : "Comment added",
    });


    // notify assigned agent
    if (
      ticket.assignedToId &&
      ticket.assignedToId !==
      user.id
    ) {

      await createNotification({
        userId:
          ticket.assignedToId,

        title:
          isInternal
            ? "New Internal Note"
            : "New Ticket Comment",

        message: `${user.name ||
          user.email
          } ${isInternal
            ? "added an internal note on"
            : "commented on"
          } ticket: ${ticket.title
          }`,

        ticketId:
          ticket.id,
      });
    }

    // notify ticket creator
    if (
      !isInternal &&
      ticket.createdById !==
      user.id &&
      ticket.createdById !==
      ticket.assignedToId
    ) {

      await createNotification({
        userId:
          ticket.createdById,

        title:
          "New Ticket Reply",

        message: `${user.name ||
          user.email
          } replied to ticket: ${ticket.title
          }`,

        ticketId:
          ticket.id,
      });
    }

    return NextResponse.json(
      comment
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