import { Role } from "@prisma/client";

import { getCurrentTenantUser } from "@/lib/tenant";

export async function requireRole(
    allowedRoles: Role[]
) {

    const user =
        await getCurrentTenantUser();

    if (!user) {
        return null;
    }

    const hasAccess =
        allowedRoles.includes(
            user.role
        );

    if (!hasAccess) {
        return null;
    }

    return user;
}

export async function isAdmin() {

    const user =
        await getCurrentTenantUser();

    return (
        user?.role === "ADMIN"
    );
}

export async function isAgent() {

    const user =
        await getCurrentTenantUser();

    return (
        user?.role === "AGENT"
    );
}

export async function isCustomer() {

    const user =
        await getCurrentTenantUser();

    return (
        user?.role === "CUSTOMER"
    );
}