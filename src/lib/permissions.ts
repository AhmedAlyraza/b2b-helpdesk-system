import { Role } from "@prisma/client";

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