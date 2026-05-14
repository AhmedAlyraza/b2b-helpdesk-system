import { NextResponse } from "next/server";

import { db } from "@/lib/db";

import { getCurrentTenantUser } from "@/lib/tenant";

export async function GET() {

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

        const views =
            await db.savedView.findMany({
                where: {
                    userId: user.id,
                },

                orderBy: {
                    createdAt: "desc",
                },
            });

        return NextResponse.json(
            views
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
            name,
            filters,
        } = body;

        // validation
        if (
            !name ||
            typeof name !== "string"
        ) {
            return NextResponse.json(
                {
                    error:
                        "View name required",
                },
                {
                    status: 400,
                }
            );
        }

        if (!filters) {
            return NextResponse.json(
                {
                    error:
                        "Filters required",
                },
                {
                    status: 400,
                }
            );
        }

        // duplicate check
        const existingView =
            await db.savedView.findFirst({
                where: {
                    userId: user.id,

                    name,
                },
            });

        if (existingView) {
            return NextResponse.json(
                {
                    error:
                        "View name already exists",
                },
                {
                    status: 400,
                }
            );
        }

        const savedView =
            await db.savedView.create({
                data: {
                    name,

                    filters,

                    userId: user.id,
                },
            });

        return NextResponse.json({
            success: true,

            savedView,
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