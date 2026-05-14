import { NextResponse } from "next/server";

import { Role } from "@prisma/client";

import { db } from "@/lib/db";

import { requireRole } from "@/lib/rbac";

interface RouteContext {
    params: Promise<{
        userId: string;
    }>;
}

const allowedRoles: Role[] = [
    "ADMIN",
    "AGENT",
    "CUSTOMER",
];

export async function PATCH(
    req: Request,
    context: RouteContext
) {

    try {

        // ADMIN ONLY
        const currentUser =
            await requireRole([
                "ADMIN",
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

        const { userId } =
            await context.params;

        const body =
            await req.json();

        const {
            role,
        } = body;

        // validate role
        if (
            !role ||
            !allowedRoles.includes(role)
        ) {
            return NextResponse.json(
                {
                    error: "Invalid role",
                },
                {
                    status: 400,
                }
            );
        }

        // find member
        const member =
            await db.user.findFirst({
                where: {
                    id: userId,

                    organizationId:
                        currentUser.organizationId,
                },
            });

        if (!member) {
            return NextResponse.json(
                {
                    error: "User not found",
                },
                {
                    status: 404,
                }
            );
        }

        // prevent removing last admin
        if (
            member.role === "ADMIN" &&
            role !== "ADMIN"
        ) {

            const adminCount =
                await db.user.count({
                    where: {
                        organizationId:
                            currentUser.organizationId,

                        role: "ADMIN",
                    },
                });

            if (adminCount <= 1) {
                return NextResponse.json(
                    {
                        error:
                            "Organization must have at least one admin",
                    },
                    {
                        status: 400,
                    }
                );
            }
        }

        // prevent useless updates
        if (member.role === role) {
            return NextResponse.json(
                {
                    error:
                        "User already has this role",
                },
                {
                    status: 400,
                }
            );
        }

        // update role
        const updatedUser =
            await db.user.update({
                where: {
                    id: member.id,
                },

                data: {
                    role,
                },
            });

        return NextResponse.json(
            updatedUser
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