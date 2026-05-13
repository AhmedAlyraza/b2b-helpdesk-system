import { Role } from "@prisma/client";

import { db } from "@/lib/db";
import { getCurrentTenantUser } from "@/lib/tenant";

export function isAdmin(
  role?: Role
) {
  return role === "ADMIN";
}

export function isAgent(
  role?: Role
) {
  return (
    role === "ADMIN" ||
    role === "AGENT"
  );
}

export function isCustomer(
  role?: Role
) {
  return role === "CUSTOMER";
}



export async function getAuthorizedTicket(
  ticketId: string
) {

  const user =
    await getCurrentTenantUser();

  if (!user) {
    return null;
  }

  const ticket =
    await db.ticket.findFirst({
      where: {
        id: ticketId,

        organizationId:
          user.organizationId,
      },
    });

  if (!ticket) {
    return null;
  }

  return {
    user,
    ticket,
  };
}