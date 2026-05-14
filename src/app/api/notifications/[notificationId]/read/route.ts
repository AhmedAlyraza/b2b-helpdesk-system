import { NextResponse } from "next/server";

import { db } from "@/lib/db";

import { getCurrentTenantUser } from "@/lib/tenant";

interface RouteContext {
    params: Promise<{
        notificationId: string;
    }>;
}

export async function PATCH(
    req: Request,
    context: RouteContext
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

        const { notificationId } =
            await context.params;

        const notification =
            await db.notification.findFirst({
                where: {
                    id: notificationId,

                    userId: user.id,
                },
            });

        if (!notification) {
            return NextResponse.json(
                {
                    error:
                        "Notification not found",
                },
                {
                    status: 404,
                }
            );
        }

        const updatedNotification =
            await db.notification.update({
                where: {
                    id: notification.id,
                },

                data: {
                    read: true,
                },
            });

        return NextResponse.json(
            updatedNotification
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