import { cookies } from "next/headers";

import { db } from "@/lib/db";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();

    const sessionToken =
      cookieStore.get("session")?.value;

    console.log("SESSION TOKEN:", sessionToken);

    if (!sessionToken) {
      return null;
    }

    const session =
      await db.session.findUnique({
        where: {
          token: sessionToken,
        },

        include: {
          user: true,
        },
      });

    console.log("SESSION:", session);

    if (!session) {
      return null;
    }

    return session.user;

  } catch (error) {
    console.error(error);

    return null;
  }
}