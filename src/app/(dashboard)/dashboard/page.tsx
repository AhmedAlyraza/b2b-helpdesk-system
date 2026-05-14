import Link from "next/link";

import {
  Ticket,
  CheckCircle2,
  Clock3,
  AlertCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { db } from "@/lib/db";

import { redirect } from "next/navigation";

import { getCurrentTenantUser } from "@/lib/tenant";

export default async function DashboardPage() {

  const user =
    await getCurrentTenantUser();

  if (!user) {
    redirect("/login");
  }

  // ticket stats
  const totalTickets =
    await db.ticket.count({
      where: {
        organizationId:
          user.organizationId,
      },
    });

  const openTickets =
    await db.ticket.count({
      where: {
        organizationId:
          user.organizationId,

        status: "OPEN",
      },
    });

  const resolvedTickets =
    await db.ticket.count({
      where: {
        organizationId:
          user.organizationId,

        status: "RESOLVED",
      },
    });

  const urgentTickets =
    await db.ticket.count({
      where: {
        organizationId:
          user.organizationId,

        priority: "URGENT",
      },
    });

  // recent activities
  const recentActivities =
    await db.ticketActivity.findMany({
      where: {
        ticket: {
          organizationId:
            user.organizationId,
        },
      },

      include: {
        actor: true,
        ticket: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 5,
    });

  // team stats
  const agents =
    await db.user.findMany({
      where: {
        organizationId:
          user.organizationId,

        role: "AGENT",
      },

      include: {
        assignedTickets: true,
      },
    });

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Overview of your support system
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <Link href="/tickets">
          <Card className="transition hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <CardContent className="flex items-center justify-between p-6">

              <div>
                <p className="text-sm text-zinc-500">
                  Total Tickets
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  {totalTickets}
                </h2>
              </div>

              <Ticket className="h-8 w-8 text-zinc-400" />

            </CardContent>
          </Card>
        </Link>

        <Link href="/tickets">
          <Card className="transition hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <CardContent className="flex items-center justify-between p-6">

              <div>
                <p className="text-sm text-zinc-500">
                  Open Tickets
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  {openTickets}
                </h2>
              </div>

              <Clock3 className="h-8 w-8 text-zinc-400" />

            </CardContent>
          </Card>
        </Link>

        <Link href="/tickets">
          <Card className="transition hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <CardContent className="flex items-center justify-between p-6">

              <div>
                <p className="text-sm text-zinc-500">
                  Resolved
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  {resolvedTickets}
                </h2>
              </div>

              <CheckCircle2 className="h-8 w-8 text-zinc-400" />

            </CardContent>
          </Card>
        </Link>

        <Link href="/tickets">
          <Card className="transition hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <CardContent className="flex items-center justify-between p-6">

              <div>
                <p className="text-sm text-zinc-500">
                  Urgent Tickets
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  {urgentTickets}
                </h2>
              </div>

              <AlertCircle className="h-8 w-8 text-zinc-400" />

            </CardContent>
          </Card>
        </Link>

      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Recent Activity */}
        <Card className="lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900">

          <CardHeader>
            <CardTitle>
              Recent Activity
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            {recentActivities.length === 0 && (
              <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
                No recent activity found
              </div>
            )}

            {recentActivities.map(
              (activity) => (

                <Link
                  key={activity.id}
                  href={`/tickets/${activity.ticketId}`}
                >
                  <div
                    className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                  >

                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white">
                        {activity.message}
                      </p>

                      <p className="text-xs text-zinc-500">
                        by{" "}
                        {activity.actor.name ||
                          activity.actor.email}
                      </p>
                    </div>

                    <span className="text-xs text-zinc-500">
                      {
                        new Date(
                          activity.createdAt
                        )
                          .toISOString()
                          .split("T")[0]
                      }
                    </span>

                  </div>
                </Link>

              )
            )}

          </CardContent>

        </Card>

        {/* Team Performance */}
        <Card className="dark:border-zinc-800 dark:bg-zinc-900">

          <CardHeader>
            <CardTitle>
              Team Performance
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">

            {agents.length === 0 && (
              <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
                No agents found
              </div>
            )}

            {agents.map((agent) => (

              <div key={agent.id}>

                <div className="mb-2 flex items-center justify-between text-sm">

                  <span className="font-medium">
                    {agent.name || agent.email}
                  </span>

                  <span className="text-zinc-500">
                    {agent.assignedTickets.length} tickets
                  </span>

                </div>

                <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">

                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{
                      width: `${Math.min(
                        agent.assignedTickets.length * 10,
                        100
                      )}%`,
                    }}
                  />

                </div>

              </div>

            ))}

          </CardContent>

        </Card>

      </div>

    </div>
  );
}