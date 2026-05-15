
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import { requireRole } from "@/lib/rbac";

import { db } from "@/lib/db";

import { MacrosPageClient } from "@/features/macros/components/macros-page-client";

export default async function MacrosPage() {

    const user =
        await requireRole([
            "ADMIN",
            "AGENT",
        ]);

    if (!user) {
        redirect("/dashboard");
    }

    const macros =
        await db.ticketMacro.findMany({
            where: {
                userId: user.id,
            },

            orderBy: {
                createdAt: "desc",
            },
        });

    return (
        <MacrosPageClient
            initialMacros={macros}
        />
    );
}