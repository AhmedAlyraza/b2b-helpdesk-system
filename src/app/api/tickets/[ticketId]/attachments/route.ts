import fs from "fs/promises";

import path from "path";

import { v4 as uuid } from "uuid";

import { NextResponse } from "next/server";

import { db } from "@/lib/db";

import { getAuthorizedTicket } from "@/lib/permissions";

import { createActivity } from "@/lib/activity";

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
                    error: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        const { user, ticket } =
            authorized;

        const formData =
            await req.formData();

        const file =
            formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        // validation
        const allowedTypes = [
            "image/png",
            "image/jpeg",
            "application/pdf",
        ];

        if (
            !allowedTypes.includes(
                file.type
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid file type",
                },
                { status: 400 }
            );
        }

        // max 5MB
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                {
                    error:
                        "File too large",
                },
                { status: 400 }
            );
        }

        const bytes =
            await file.arrayBuffer();

        const buffer =
            Buffer.from(bytes);

        const extension =
            file.name.split(".").pop();

        const fileName = `${uuid()}.${extension}`;

        const uploadPath = path.join(
            process.cwd(),
            "public/uploads",
            fileName
        );

        await fs.writeFile(
            uploadPath,
            buffer
        );

        const attachment =
            await db.attachment.create({
                data: {
                    name: file.name,
                    url: `/uploads/${fileName}`,
                    size: file.size,
                    ticketId: ticket.id, 
                    uploaderId: user.id,
                },
            });

        await createActivity({
            ticketId: ticket.id,
            actorId: user.id,
            type: "ATTACHMENT_UPLOADED",
            message: `Uploaded attachment: ${attachment.name}`,
        });

        return NextResponse.json(attachment);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}