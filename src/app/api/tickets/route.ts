import { NextResponse } from "next/server";

import { db } from "@/lib/db";

import { getCurrentTenantUser } from "@/lib/tenant";

import { createActivity } from "@/lib/activity";

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

          organizationId:
            user.organizationId,

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