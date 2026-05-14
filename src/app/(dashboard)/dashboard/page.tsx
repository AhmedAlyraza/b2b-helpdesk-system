import Link from "next/link";

import {
  Ticket,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Activity,
  Users,
  ArrowRight,
} from "lucide-react";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";

import { getCurrentTenantUser } from "@/lib/tenant";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  isTicketOverdue,
  getRemainingSlaTime,
} from "@/lib/ticket-sla";

export default async function DashboardPage() {

  const user =
    await getCurrentTenantUser();

  if (!user) {
    redirect("/login");
  }

  // =========================
  // STATS
  // =========================

  const tickets =
    await db.ticket.findMany({
      where: {
        organizationId:
          user.organizationId,
      },

      include: {
        assignedTo: true,
        createdBy: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  const activities =
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

      take: 8,
    });

  const customers =
    await db.user.count({
      where: {
        organizationId:
          user.organizationId,

        role: "CUSTOMER",
      },
    });

  const agents =
    await db.user.findMany({
      where: {
        organizationId:
          user.organizationId,

        role: {
          in: [
            "ADMIN",
            "AGENT",
          ],
        },
      },

      include: {
        assignedTickets: {
          where: {
            status: {
              notIn: [
                "RESOLVED",
                "CLOSED",
              ],
            },
          },
        },
      },
    });

  const totalTickets =
    tickets.length;

  const openTickets =
    tickets.filter(
      (ticket) =>
        ticket.status === "OPEN"
    ).length;

  const overdueTickets =
    tickets.filter(
      isTicketOverdue
    ).length;

  const urgentTickets =
    tickets.filter(
      (ticket) =>
        ticket.priority ===
          "URGENT" &&
        ticket.status !==
          "RESOLVED" &&
        ticket.status !==
          "CLOSED"
    ).length;

  const resolvedTickets =
    tickets.filter(
      (ticket) =>
        ticket.status ===
        "RESOLVED"
    ).length;

  const stats = [
    {
      title:
        "Total Tickets",

      value:
        totalTickets,

      icon:
        Ticket,

      href:
        "/tickets",
    },

    {
      title:
        "Open Tickets",

      value:
        openTickets,

      icon:
        Clock3,

      href:
        "/tickets?status=OPEN",
    },

    {
      title:
        "Overdue Tickets",

      value:
        overdueTickets,

      icon:
        AlertTriangle,

      href:
        "/tickets",
    },

    {
      title:
        "Resolved Tickets",

      value:
        resolvedTickets,

      icon:
        CheckCircle2,

      href:
        "/tickets?status=RESOLVED",
    },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>

          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Operational overview of your support organization.
          </p>

        </div>

      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat) => {

          const Icon =
            stat.icon;

          return (
            <Link
              key={stat.title}
              href={stat.href}
            >

              <Card className="transition hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">

                <CardContent className="flex items-center justify-between p-6">

                  <div>

                    <p className="text-sm text-zinc-500">
                      {stat.title}
                    </p>

                    <h2 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-white">
                      {stat.value}
                    </h2>

                  </div>

                  <div className="rounded-2xl bg-zinc-100 p-3 dark:bg-zinc-800">

                    <Icon className="h-7 w-7 text-zinc-500" />

                  </div>

                </CardContent>

              </Card>

            </Link>
          );
        })}

      </div>

      {/* Operational Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">

        {/* Recent Activity */}
        <Card className="dark:border-zinc-800 dark:bg-zinc-900">

          <CardHeader className="flex flex-row items-center justify-between">

            <CardTitle>
              Recent Activity
            </CardTitle>

            <Activity
              size={18}
              className="text-zinc-500"
            />

          </CardHeader>

          <CardContent className="space-y-4">

            {activities.length === 0 && (

              <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">

                <p className="text-sm text-zinc-500">
                  No recent activity.
                </p>

              </div>

            )}

            {activities.map(
              (activity) => (

                <Link
                  key={activity.id}
                  href={`/tickets/${activity.ticketId}`}
                  className="block rounded-2xl border border-zinc-200 bg-zinc-50 p-5 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="text-sm text-zinc-700 dark:text-zinc-300">

                        <span className="font-semibold">
                          {activity.actor.name ||
                            activity.actor.email}
                        </span>{" "}

                        {activity.message}

                      </p>

                      <p className="mt-2 text-xs text-zinc-500">
                        Ticket:{" "}
                        {activity.ticket.title}
                      </p>

                    </div>

                    <span className="shrink-0 text-xs text-zinc-500">

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

        {/* Right Column */}
        <div className="space-y-6">

          {/* Team Workload */}
          <Card className="dark:border-zinc-800 dark:bg-zinc-900">

            <CardHeader className="flex flex-row items-center justify-between">

              <CardTitle>
                Team Workload
              </CardTitle>

              <Users
                size={18}
                className="text-zinc-500"
              />

            </CardHeader>

            <CardContent className="space-y-4">

              {agents.length === 0 && (

                <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">

                  <p className="text-sm text-zinc-500">
                    No agents found.
                  </p>

                </div>

              )}

              {agents.map((agent) => (

                <div
                  key={agent.id}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950"
                >

                  <div className="flex items-center justify-between gap-4">

                    <div>

                      <h3 className="font-semibold text-zinc-900 dark:text-white">
                        {agent.name ||
                          agent.email}
                      </h3>

                      <p className="mt-1 text-xs text-zinc-500">
                        {agent.role}
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="text-2xl font-bold text-zinc-900 dark:text-white">

                        {
                          agent
                            .assignedTickets
                            .length
                        }

                      </p>

                      <p className="text-xs text-zinc-500">
                        Active Tickets
                      </p>

                    </div>

                  </div>

                </div>

              ))}

            </CardContent>

          </Card>

          {/* SLA / Urgency */}
          <Card className="dark:border-zinc-800 dark:bg-zinc-900">

            <CardHeader>

              <CardTitle>
                SLA Watchlist
              </CardTitle>

            </CardHeader>

            <CardContent className="space-y-4">

              {tickets
                .filter(
                  (ticket) =>
                    ticket.status !==
                      "RESOLVED" &&
                    ticket.status !==
                      "CLOSED"
                )
                .slice(0, 5)
                .map((ticket) => (

                  <Link
                    key={ticket.id}
                    href={`/tickets/${ticket.id}`}
                    className="block rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <h3 className="font-medium text-zinc-900 dark:text-white">
                          {ticket.title}
                        </h3>

                        <p className="mt-1 text-xs text-zinc-500">
                          {ticket.priority}
                        </p>

                      </div>

                      <div>

                        {isTicketOverdue(
                          ticket
                        ) ? (

                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-500/10 dark:text-red-400">
                            Overdue
                          </span>

                        ) : (

                          <span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">

                            {
                              getRemainingSlaTime(
                                ticket.slaDueAt
                              )
                            }

                          </span>

                        )}

                      </div>

                    </div>

                  </Link>

                ))}

              <Link
                href="/tickets"
                className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-black dark:text-zinc-400 dark:hover:text-white"
              >

                View all tickets

                <ArrowRight size={16} />

              </Link>

            </CardContent>

          </Card>

        </div>

      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-5 md:grid-cols-3">

        <Card className="dark:border-zinc-800 dark:bg-zinc-900">

          <CardContent className="p-6">

            <p className="text-sm text-zinc-500">
              Customers
            </p>

            <h2 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-white">
              {customers}
            </h2>

          </CardContent>

        </Card>

        <Card className="dark:border-zinc-800 dark:bg-zinc-900">

          <CardContent className="p-6">

            <p className="text-sm text-zinc-500">
              Urgent Active Tickets
            </p>

            <h2 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-white">
              {urgentTickets}
            </h2>

          </CardContent>

        </Card>

        <Card className="dark:border-zinc-800 dark:bg-zinc-900">

          <CardContent className="p-6">

            <p className="text-sm text-zinc-500">
              SLA Breaches
            </p>

            <h2 className="mt-3 text-3xl font-bold text-red-600 dark:text-red-400">
              {overdueTickets}
            </h2>

          </CardContent>

        </Card>

      </div>

    </div>
  );
}