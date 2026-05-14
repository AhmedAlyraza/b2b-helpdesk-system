import { redirect } from "next/navigation";

import { RoleSelect } from "@/features/team/components/role-select";

import { InviteMemberForm } from "@/features/team/components/invite-member-form";

import {
    Shield,
    User,
    Users,
} from "lucide-react";

import { db } from "@/lib/db";

import { requireRole } from "@/lib/rbac";

interface TeamPageProps { }

export default async function TeamPage(
    { }: TeamPageProps
) {

    const user =
        await requireRole([
            "ADMIN",
        ]);

    if (!user) {
        redirect("/dashboard");
    }

    const members =
        await db.user.findMany({
            where: {
                organizationId:
                    user.organizationId,
            },

            orderBy: {
                createdAt: "asc",
            },
        });

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">

                <div>

                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        Team Members
                    </h1>

                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        Manage your organization users and permissions.
                    </p>

                </div>

            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">

                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-zinc-500">
                                Total Members
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                                {members.length}
                            </h2>

                        </div>

                        <Users className="text-zinc-400" />

                    </div>

                </div>

                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-zinc-500">
                                Admins
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                                {
                                    members.filter(
                                        (member) =>
                                            member.role ===
                                            "ADMIN"
                                    ).length
                                }
                            </h2>

                        </div>

                        <Shield className="text-zinc-400" />

                    </div>

                </div>

                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-zinc-500">
                                Agents
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                                {
                                    members.filter(
                                        (member) =>
                                            member.role ===
                                            "AGENT"
                                    ).length
                                }
                            </h2>

                        </div>

                        <User className="text-zinc-400" />

                    </div>

                </div>

            </div>

            <InviteMemberForm />
            
            {/* Members List */}
            <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

                <div className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">

                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        Organization Members
                    </h2>

                </div>

                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">

                    {members.map((member) => (

                        <div
                            key={member.id}
                            className="flex flex-col gap-5 px-6 py-5 md:flex-row md:items-center md:justify-between"
                        >

                            <div className="flex items-center gap-4">

                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-sm font-bold text-white dark:bg-white dark:text-black">

                                    {member.email
                                        .charAt(0)
                                        .toUpperCase()}

                                </div>

                                <div>

                                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                                        {member.name ||
                                            "Unnamed User"}
                                    </h3>

                                    <p className="text-sm text-zinc-500">
                                        {member.email}
                                    </p>

                                </div>

                            </div>

                            <div className="flex items-center gap-3">

                                <RoleSelect
                                    userId={member.id}
                                    currentRole={member.role}
                                />

                                <span className="text-xs text-zinc-500">
                                    Joined{" "}
                                    {
                                        new Date(
                                            member.createdAt
                                        )
                                            .toISOString()
                                            .split("T")[0]
                                    }
                                </span>

                            </div>

                        </div>

                    ))}

                </div>

            </section>

        </div>
    );
}