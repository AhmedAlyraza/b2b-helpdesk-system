import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "Missing fields" },
                { status: 400 }
            );
        }

        const user = await db.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 400 }
            );
        }

        const isValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isValid) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 400 }
            );
        }

        const sessionToken = crypto.randomUUID();

        const session = await db.session.create({
            data: {
                token: sessionToken,
                userId: user.id,
                expiresAt: new Date(
                    Date.now() + 1000 * 60 * 60 * 24 * 7
                ), // 7 days
            },
        });

        const cookieStore = await cookies();

        cookieStore.set("session", session.token, {
            httpOnly: true,
            secure: false,
            path: "/",
        });

        return NextResponse.json({
            success: true,
        });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}