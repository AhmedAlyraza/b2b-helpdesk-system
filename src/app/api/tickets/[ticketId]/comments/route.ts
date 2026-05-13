import { NextResponse } from "next/server";

import { getAuthorizedTicket } from "@/lib/permissions";
import { createActivity } from "@/lib/activity";
import { db } from "@/lib/db";

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
      await getAuthorizedTicket(ticketId);

    if (!authorized) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { user, ticket } = authorized;
    const body = await req.json();
    const {
      message,
      isInternal,
    } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message required" },
        { status: 400 }
      );
    }



    const comment =
      await db.comment.create({
        data: {
          message,
          isInternal: isInternal ?? false,
          ticketId: ticket.id,
          authorId: user.id,
        },
      });

    await createActivity({
      ticketId: ticket.id,
      actorId: user.id,
      type: "COMMENT_ADDED",
      message: isInternal
        ? "Internal note added"
        : "Comment added",
    });

    return NextResponse.json(comment);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
