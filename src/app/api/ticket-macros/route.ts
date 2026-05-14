import { NextResponse } from "next/server";

import {
    TicketStatus,
} from "@prisma/client";

import { db } from "@/lib/db";

import { requireRole } from "@/lib/rbac";

const allowedStatuses = [
    "OPEN",
    "IN_PROGRESS",
    "RESOLVED",
    "CLOSED",
];

export async function GET() {

    try {

        const user =
            await requireRole([
                "ADMIN",
                "AGENT",
            ]);

        if (!user) {
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

        const macros =
            await db.ticketMacro.findMany({
                where: {
                    userId: user.id,
                },

                orderBy: {
                    createdAt: "desc",
                },
            });

        return NextResponse.json(
            macros
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

export async function POST(
    req: Request
) {

    try {

        const user =
            await requireRole([
                "ADMIN",
                "AGENT",
            ]);

        if (!user) {
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

        const body =
            await req.json();

        const {
            name,
            content,
            status,
        } = body;

        // =========================
        // VALIDATION
        // =========================
        if (
            !name ||
            typeof name !== "string"
        ) {
            return NextResponse.json(
                {
                    error:
                        "Macro name required",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            !content ||
            typeof content !== "string"
        ) {
            return NextResponse.json(
                {
                    error:
                        "Macro content required",
                },
                {
                    status: 400,
                }
            );
        }

        if (
            status &&
            !allowedStatuses.includes(
                status
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid status",
                },
                {
                    status: 400,
                }
            );
        }

        // duplicate name prevention
        const existingMacro =
            await db.ticketMacro.findFirst({
                where: {
                    userId: user.id,

                    name,
                },
            });

        if (existingMacro) {
            return NextResponse.json(
                {
                    error:
                        "Macro name already exists",
                },
                {
                    status: 400,
                }
            );
        }

        // =========================
        // CREATE
        // =========================
        const macro =
            await db.ticketMacro.create({
                data: {
                    name,

                    content,

                    status:
                        status as TicketStatus,

                    userId: user.id,
                },
            });

        return NextResponse.json({
            success: true,

            macro,
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