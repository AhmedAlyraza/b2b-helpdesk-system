import { NextResponse } from "next/server";

import { db } from "@/lib/db";

import { getAuthorizedTicket } from "@/lib/permissions";


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

        const { status } = body;



        const updatedTicket =
            await db.ticket.update({
                where: {
                    id: ticket.id,
                },

                data: {
                    status,
                },
            });

        // activity log
        await db.ticketActivity.create({
            data: {
                type: "STATUS_CHANGED",

                message: `Status changed to ${status.replace(
                    "_",
                    " "
                )}`,

                ticketId: ticket.id,

                actorId: user.id,
            },
        });

        return NextResponse.json(
            updatedTicket
        );

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}