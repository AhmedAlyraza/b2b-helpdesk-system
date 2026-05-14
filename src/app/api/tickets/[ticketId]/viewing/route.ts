import { NextResponse } from "next/server";

import { pusherServer } from "@/lib/pusher";

import { getAuthorizedTicket } from "@/lib/permissions";

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
                    error:
                        "Unauthorized",
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

        await pusherServer.trigger(
            `ticket-${ticket.id}`,
            "viewer-active",
            {
                userId: user.id,

                name:
                    user.name ||
                    user.email,
            }
        );

        return NextResponse.json({
            success: true,
        });

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