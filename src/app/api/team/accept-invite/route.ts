import { NextResponse } from "next/server";

import bcrypt from "bcrypt";

import { db } from "@/lib/db";

export async function POST(
    req: Request
) {

    try {

        const body =
            await req.json();

        const {
            token,
            name,
            password,
        } = body;

        // =========================
        // VALIDATION
        // =========================
        if (
            !token ||
            !name ||
            !password
        ) {
            return NextResponse.json(
                {
                    error:
                        "All fields are required",
                },
                {
                    status: 400,
                }
            );
        }

        // =========================
        // FIND INVITE
        // =========================
        const invite =
            await db.invite.findUnique({
                where: {
                    token,
                },
            });

        if (
            !invite ||
            invite.accepted
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid invite",
                },
                {
                    status: 400,
                }
            );
        }

        // =========================
        // EXISTING USER CHECK
        // =========================
        const existingUser =
            await db.user.findUnique({
                where: {
                    email:
                        invite.email,
                },
            });

        if (existingUser) {
            return NextResponse.json(
                {
                    error:
                        "Account already exists",
                },
                {
                    status: 400,
                }
            );
        }

        // =========================
        // HASH PASSWORD
        // =========================
        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );

        // =========================
        // CREATE USER
        // =========================
        const user =
            await db.user.create({
                data: {
                    email:
                        invite.email,

                    name,

                    password:
                        hashedPassword,

                    role:
                        invite.role,

                    organizationId:
                        invite.organizationId,
                },
            });

        // =========================
        // MARK INVITE ACCEPTED
        // =========================
        await db.invite.update({
            where: {
                id: invite.id,
            },

            data: {
                accepted: true,
            },
        });

        return NextResponse.json({
            success: true,

            userId:
                user.id,
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