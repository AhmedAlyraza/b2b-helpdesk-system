import fs from "fs/promises";

import path from "path";

import { v4 as uuid } from "uuid";

import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

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
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { ticketId } =
            await context.params;

        const ticket =
            await db.ticket.findFirst({
                where: {
                    id: ticketId,

                    organizationId:
                        user.organizationId!,
                },
            });

        if (!ticket) {
            return NextResponse.json(
                { error: "Ticket not found" },
                { status: 404 }
            );
        }

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

                    ticketId,

                    uploaderId: user.id,
                },
            });

        return NextResponse.json(
            attachment
        );

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}