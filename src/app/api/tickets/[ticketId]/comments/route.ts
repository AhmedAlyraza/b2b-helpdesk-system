import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

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
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { ticketId } =
      await context.params;

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

    // organization-safe lookup
    const ticket =
      await db.ticket.findFirst({
        where: {
          id: ticketId,

          organizationId:
            user.organizationId!,
        },
      });

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    const comment =
      await db.comment.create({
        data: {
          message,

          isInternal:
            isInternal ?? false,

          ticketId,

          authorId: user.id,
        },
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
