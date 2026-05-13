import { NextResponse } from "next/server";

import { getAuthorizedTicket } from "@/lib/permissions";

import { db } from "@/lib/db";

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

        const { assigneeId } = body;

        const assignedUser = await db.user.findFirst({
            where: {
                id: assigneeId,
                organizationId: user.organizationId,
            },
        });

        if (!assignedUser) {
            return NextResponse.json(
                { error: "Assigned user not found" },
                { status: 404 }
            );
        }

        const updatedTicket =
            await db.ticket.update({
                where: {
                    id: ticket.id,
                },

                data: {
                    assignedToId: assignedUser.id || null,
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

        // 🚨 ADD ACTIVITY LOG HERE
        await createActivity({
            ticketId: ticket.id,
            actorId: user.id,
            type: "TICKET_ASSIGNED",
            message: `Ticket assigned to ${assignedUser.name || assignedUser.email}`,
        });

        return NextResponse.json(updatedTicket);


    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }


}
