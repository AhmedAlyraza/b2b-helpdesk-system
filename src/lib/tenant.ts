import { getCurrentUser } from "@/lib/auth";

export async function getCurrentTenantUser() {

  const user =
    await getCurrentUser();

  if (
    !user ||
    !user.organizationId
  ) {
    return null;
  }

  return user;
}