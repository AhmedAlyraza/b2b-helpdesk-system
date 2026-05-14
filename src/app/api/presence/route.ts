import { NextResponse } from "next/server";

import { pusherServer } from "@/lib/pusher";

import { getCurrentTenantUser } from "@/lib/tenant";

export async function POST() {

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

        await pusherServer.trigger(
            "presence-global",
            "user-online",
            {
                id: user.id,

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