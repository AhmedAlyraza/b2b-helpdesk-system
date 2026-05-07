import { cookies } from "next/headers";

import { db } from "@/lib/db";

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const sessionToken =
    cookieStore.get("session")?.value;

  if (!sessionToken) return null;

  const session = await db.session.findUnique({
    where: {
      token: sessionToken,
    },
    include: {
      user: true,
    },
  });

  if (!session) return null;

  return session.user;
}