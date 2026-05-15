export const dynamic = "force-dynamic";
import Link from "next/link";

import {
  Ticket,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  Activity,
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

type DashboardTicket = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: Date;
  slaDueAt: Date | null;

  assignedTo: {
    id: string;
    name: string | null;
    email: string;
  } | null;
};

type DashboardActivity = {
  id: string;
  message: string;
  createdAt: Date;
  ticketId: string;

  actor: {
    name: string | null;
    email: string;
  };

  ticket: {
    title: string;
  };
};

type DashboardAgent = {
  id: string;
  name: string | null;
  email: string;
  role: string;

  assignedTickets: {
    id: string;
  }[];
};

export default async function DashboardPage() {

  const user =
    await getCurrentTenantUser();

  if (!user) {
    redirect("/login");
  }

  const organizationId =
    user.organizationId || undefined;

  // tickets
  const tickets =
    await db.ticket.findMany({
      where: {
        organizationId,
      },

      include: {
        assignedTo: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    }) as DashboardTicket[];

  // activities
  const activities =
    await db.ticketActivity.findMany({
      where: {
        ticket: {
          organizationId,
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
    }) as DashboardActivity[];

  // agents
  const agents =
    await db.user.findMany({
      where: {
        organizationId,

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
    }) as DashboardAgent[];

  function isTicketOverdue(
    ticket: DashboardTicket
  ) {
    if (!ticket.slaDueAt) {
      return false;
    }

    if (
      ticket.status === "RESOLVED" ||
      ticket.status === "CLOSED"
    ) {
      return false;
    }

    return (
      new Date(ticket.slaDueAt) <
      new Date()
    );
  }

  const totalTickets =
    tickets.length;

  const openTickets =
    tickets.filter(
      (ticket: DashboardTicket) =>
        ticket.status === "OPEN"
    ).length;

  const overdueTickets =
    tickets.filter(
      (ticket: DashboardTicket) =>
        isTicketOverdue(ticket)
    ).length;

  const urgentTickets =
    tickets.filter(
      (ticket: DashboardTicket) =>
        ticket.priority ===
          "URGENT" &&
        ticket.status !==
          "RESOLVED" &&
        ticket.status !==
          "CLOSED"
    ).length;

  const resolvedTickets =
    tickets.filter(
      (ticket: DashboardTicket) =>
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
              (
                activity: DashboardActivity
              ) => (

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

        {/* Team Workload */}
        <Card className="dark:border-zinc-800 dark:bg-zinc-900">

          <CardHeader>

            <CardTitle>
              Team Workload
            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-4">

            {agents.length === 0 && (

              <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">

                <p className="text-sm text-zinc-500">
                  No agents found.
                </p>

              </div>

            )}

            {agents.map(
              (
                agent: DashboardAgent
              ) => (

                <div
                  key={agent.id}
                  className="flex items-center justify-between rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800"
                >

                  <div>

                    <p className="font-medium text-zinc-900 dark:text-white">
                      {agent.name ||
                        agent.email}
                    </p>

                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      {agent.role}
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-lg font-bold text-zinc-900 dark:text-white">

                      {
                        agent.assignedTickets
                          .length
                      }

                    </p>

                    <p className="text-xs text-zinc-500">
                      Active Tickets
                    </p>

                  </div>

                </div>
              )
            )}

          </CardContent>

        </Card>

      </div>

      {/* Urgent Tickets */}
      <Card className="dark:border-zinc-800 dark:bg-zinc-900">

        <CardHeader>

          <CardTitle>
            Urgent Ticket Queue
          </CardTitle>

        </CardHeader>

        <CardContent className="space-y-4">

          {urgentTickets === 0 && (

            <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">

              <p className="text-sm text-zinc-500">
                No urgent tickets right now.
              </p>

            </div>

          )}

          {tickets
            .filter(
              (
                ticket: DashboardTicket
              ) =>
                ticket.priority ===
                  "URGENT" &&
                ticket.status !==
                  "RESOLVED" &&
                ticket.status !==
                  "CLOSED"
            )
            .slice(0, 5)
            .map(
              (
                ticket: DashboardTicket
              ) => (

                <Link
                  key={ticket.id}
                  href={`/tickets/${ticket.id}`}
                  className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-5 transition hover:bg-red-100 dark:border-red-900 dark:bg-red-950/30 dark:hover:bg-red-950/50"
                >

                  <div>

                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      {ticket.title}
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500">
                      Status: {ticket.status}
                    </p>

                  </div>

                  <div className="rounded-xl bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900 dark:text-red-200">

                    URGENT

                  </div>

                </Link>
              )
            )}

        </CardContent>

      </Card>

    </div>
  );
}