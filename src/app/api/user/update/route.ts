import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
    req: Request
) {
    try {

        const user =
            await getCurrentUser();

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

        const updatedUser =
            await db.user.update({
                where: {
                    id: user.id,
                },

                data: {
                    name: body.name,
                    email: body.email,
                    phone: body.phone,
                    company: body.company,
                    location: body.location,
                    jobTitle: body.jobTitle,
                    bio: body.bio,
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