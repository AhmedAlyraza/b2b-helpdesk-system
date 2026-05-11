import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { email, password } = body;

    // basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    // check if user exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
console.log("Register route hit");
    // create user
    const organization = await db.organization.create({
      data: {
        name: `${email.split("@")[0]}'s Organization`,
      },
    });
console.log("User created");
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "ADMIN",

        organizationId: organization.id,
      },
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}