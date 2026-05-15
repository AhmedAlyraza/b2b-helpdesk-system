export const dynamic = "force-dynamic";

import Link from "next/link";

import {
  Users,
  Shield,
  UserCog,
  ChevronRight,
  Mail,
} from "lucide-react";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";

import { requireRole } from "@/lib/rbac";

type TeamMember = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
};

export default async function TeamPage() {

  const currentUser =
    await requireRole([
      "ADMIN",
      "AGENT",
    ]);

  if (!currentUser) {
    redirect("/dashboard");
  }

  const organizationId =
    currentUser.organizationId || undefined;

  const members =
    await db.user.findMany({
      where: {
        organizationId,
      },

      orderBy: {
        createdAt: "asc",
      },
    }) as TeamMember[];

  const totalMembers =
    members.length;

  const adminCount =
    members.filter(
      (member: TeamMember) =>
        member.role === "ADMIN"
    ).length;

  const agentCount =
    members.filter(
      (member: TeamMember) =>
        member.role === "AGENT"
    ).length;

  const customerCount =
    members.filter(
      (member: TeamMember) =>
        member.role === "CUSTOMER"
    ).length;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>

          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Team
          </h1>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Manage organization members and support staff.
          </p>

        </div>

      </div>

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-zinc-500">
                Total Members
              </p>

              <h2 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-white">
                {totalMembers}
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

              <h2 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-white">
                {adminCount}
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

              <h2 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-white">
                {agentCount}
              </h2>

            </div>

            <UserCog className="text-zinc-400" />

          </div>

        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-zinc-500">
                Customers
              </p>

              <h2 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-white">
                {customerCount}
              </h2>

            </div>

            <Mail className="text-zinc-400" />

          </div>

        </div>

      </div>

      {/* Members */}
      <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">

          {members.length === 0 && (

            <div className="px-6 py-16 text-center">

              <p className="text-sm text-zinc-500">
                No team members found.
              </p>

            </div>

          )}

          {members.map(
            (
              member: TeamMember
            ) => (

              <Link
                key={member.id}
                href="#"
                className="flex flex-col gap-5 px-6 py-5 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50 md:flex-row md:items-center md:justify-between"
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

                <div className="flex items-center gap-6">

                  <div className="text-right">

                    <p className="text-sm font-medium text-zinc-900 dark:text-white">

                      {member.role}

                    </p>

                    <p className="text-xs text-zinc-500">

                      Joined{" "}

                      {
                        new Date(
                          member.createdAt
                        )
                          .toISOString()
                          .split("T")[0]
                      }

                    </p>

                  </div>

                  <ChevronRight
                    size={18}
                    className="text-zinc-400"
                  />

                </div>

              </Link>

            )
          )}

        </div>

      </section>

    </div>
  );
}