import { NextResponse } from "next/server";

import { db } from "@/lib/db";

import { getCurrentTenantUser } from "@/lib/tenant";

export async function GET(
    req: Request
) {

    try {

        const user =
            await getCurrentTenantUser();

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

        const { searchParams } =
            new URL(req.url);

        const query =
            searchParams.get("query");

        if (!query) {
            return NextResponse.json(
                []
            );
        }

        const users =
            await db.user.findMany({
                where: {
                    organizationId:
                        user.organizationId || undefined,

                    id: {
                        not: user.id,
                    },

                    OR: [
                        {
                            name: {
                                contains:
                                    query,
                                mode:
                                    "insensitive",
                            },
                        },

                        {
                            email: {
                                contains:
                                    query,
                                mode:
                                    "insensitive",
                            },
                        },
                    ],
                },

                select: {
                    id: true,
                    name: true,
                    email: true,
                },

                take: 5,
            });

        return NextResponse.json(
            users
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