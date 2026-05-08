import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

import { isAgent } from "@/lib/permissions";

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
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        if (!isAgent(user.role)) {
            return NextResponse.json(
                { error: "Forbidden" },
                { status: 403 }
            );
        }

        const { ticketId } =
            await context.params;

        const body = await req.json();

        const { assigneeId } = body;

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

        const updatedTicket =
            await db.ticket.update({
                where: {
                    id: ticket.id,
                },

                data: {
                    assignedToId:
                        assigneeId || null,
                },
            });

        if (assigneeId) {
            await createNotification({
                title: "Ticket Assigned",

                message: `You were assigned ticket: ${ticket.title}`,

                userId: assigneeId,

                ticketId: ticket.id,
            });
        }

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
