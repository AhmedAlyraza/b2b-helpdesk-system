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

export async function POST(
    req: Request,
    context: RouteContext
) {

    try {

        // =========================
        // RBAC
        // =========================
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

        // =========================
        // TENANT AUTH
        // =========================
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
            ticket,
            user,
        } = authorized;

        const body =
            await req.json();

        const {
            macroId,
        } = body;

        // =========================
        // FIND MACRO
        // =========================
        const macro =
            await db.ticketMacro.findFirst({
                where: {
                    id: macroId,

                    userId: user.id,
                },
            });

        if (!macro) {
            return NextResponse.json(
                {
                    error:
                        "Macro not found",
                },
                {
                    status: 404,
                }
            );
        }

        // =========================
        // CREATE COMMENT
        // =========================
        const comment =
            await db.comment.create({
                data: {
                    message:
                        macro.content,

                    ticketId:
                        ticket.id,

                    authorId:
                        user.id,

                    isInternal: false,
                },
            });

        // =========================
        // OPTIONAL STATUS UPDATE
        // =========================
        let updatedTicket =
            ticket;

        if (
            macro.status &&
            macro.status !==
            ticket.status
        ) {

            updatedTicket =
                await db.ticket.update({
                    where: {
                        id: ticket.id,
                    },

                    data: {
                        status:
                            macro.status,
                    },
                });

            await createActivity({
                ticketId:
                    ticket.id,

                actorId:
                    user.id,

                type:
                    "MACRO_STATUS_UPDATE",

                message: `Macro changed status to ${macro.status}`,
            });
        }

        // =========================
        // ACTIVITY
        // =========================
        await createActivity({
            ticketId:
                ticket.id,

            actorId:
                user.id,

            type:
                "MACRO_APPLIED",

            message: `Applied macro: ${macro.name}`,
        });

        // =========================
        // NOTIFY CUSTOMER
        // =========================
        if (
            ticket.createdById !==
            user.id
        ) {

            await createNotification({
                userId:
                    ticket.createdById,

                title:
                    "Ticket Updated",

                message: `A response was added to ticket: ${ticket.title}`,

                ticketId:
                    ticket.id,
            });
        }

        return NextResponse.json({
            success: true,

            comment,

            ticket:
                updatedTicket,
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