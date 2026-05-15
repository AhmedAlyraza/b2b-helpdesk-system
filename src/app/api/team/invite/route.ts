import { NextResponse } from "next/server";

import crypto from "crypto";

import { Role } from "@prisma/client";

import { db } from "@/lib/db";

import { requireRole } from "@/lib/rbac";

const allowedRoles: Role[] = [
  "ADMIN",
  "AGENT",
  "CUSTOMER",
];

interface InviteRequestBody {
  email: string;
  role: Role;
}

export async function POST(
  req: Request
) {

  try {

    // =========================
    // ADMIN ONLY
    // =========================
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

    const organizationId =
      currentUser.organizationId ||
      undefined;

    if (!organizationId) {
      return NextResponse.json(
        {
          error:
            "Organization not found",
        },
        {
          status: 400,
        }
      );
    }

    const body:
      InviteRequestBody =
      await req.json();

    const {
      email,
      role,
    } = body;

    // =========================
    // VALIDATION
    // =========================
    if (
      !email ||
      typeof email !== "string"
    ) {
      return NextResponse.json(
        {
          error:
            "Valid email required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !role ||
      !allowedRoles.includes(role)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid role",
        },
        {
          status: 400,
        }
      );
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    // =========================
    // EXISTING USER CHECK
    // =========================
    const existingUser =
      await db.user.findFirst({
        where: {
          email:
            normalizedEmail,

          organizationId,
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "User already exists in organization",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // EXISTING INVITE CHECK
    // =========================
    const existingInvite =
      await db.invite.findFirst({
        where: {
          email:
            normalizedEmail,

          organizationId,

          accepted: false,
        },
      });

    if (existingInvite) {
      return NextResponse.json(
        {
          error:
            "Pending invite already exists",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // TOKEN
    // =========================
    const token =
      crypto.randomBytes(32)
        .toString("hex");

    // =========================
    // CREATE INVITE
    // =========================
    const invite =
      await db.invite.create({
        data: {
          email:
            normalizedEmail,

          role,

          token,

          organizationId,

          invitedById:
            currentUser.id,
        },
      });

    return NextResponse.json({
      success: true,

      invite,
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