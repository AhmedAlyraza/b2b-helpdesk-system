import { db } from "@/lib/db";

export async function GET() {
  try {
    const users = await db.user.findMany();

    return Response.json({
      success: true,
      data: users,
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: String(error),
    });
  }
}