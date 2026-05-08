import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
console.log("USER:", user);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      title,
      description,
      priority,
    } = body;

    const ticket = await db.ticket.create({
      data: {
        title,
        description,
        priority,

        organizationId:
          user.organizationId!,

        createdById: user.id,
      },
    });

    return NextResponse.json(ticket);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}