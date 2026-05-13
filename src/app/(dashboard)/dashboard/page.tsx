import {
  Ticket,
  Clock3,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { db } from "@/lib/db";

export default async function DashboardPage() {

  const tickets =
    await db.ticket.findMany({
      include: {
        assignedTo: true,
      },
    });

  const totalTickets =
    tickets.length;

  const openTickets =
    tickets.filter(
      (ticket) =>
        ticket.status === "OPEN"
    ).length;

  const resolvedTickets =
    tickets.filter(
      (ticket) =>
        ticket.status === "RESOLVED"
    ).length;

  const closedTickets =
    tickets.filter(
      (ticket) =>
        ticket.status === "CLOSED"
    ).length;

  const stats = [
    {
      title: "Total Tickets",
      value: totalTickets,
      icon: Ticket,
    },
    {
      title: "Open Tickets",
      value: openTickets,
      icon: AlertCircle,
    },
    {
      title: "Resolved",
      value: resolvedTickets,
      icon: CheckCircle2,
    },
    {
      title: "Closed Tickets",
      value: closedTickets,
      icon: Clock3,
    },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Overview of your support system performance.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {

          const Icon = stat.icon;

          return (
            <Link key={stat.title} href="/tickets">
              <Card
                key={stat.title}
                className="border-zinc-200 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

                  <CardTitle className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    {stat.title}
                  </CardTitle>

                  <Icon
                    size={18}
                    className="text-zinc-500"
                  />

                </CardHeader>

                <CardContent>
                  <div className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {stat.value}
                  </div>
                </CardContent>

              </Card>
            </Link>
          );
        })}
      </div>

      {/* Lower Grid */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Recent Activity */}
        <Card className="lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900">

          <CardHeader>
            <CardTitle>
              Recent Activity
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            {tickets
              .slice(0, 5)
              .map((ticket) => (

                <Link
                  key={ticket.id}
                  href={`/tickets/${ticket.id}`}
                >

                  <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900">

                    <div>

                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {ticket.title}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        Status:
                        {" "}
                        {ticket.status.replace(
                          "_",
                          " "
                        )}
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="text-xs text-zinc-500">
                        {new Date(
                          ticket.createdAt
                        ).toLocaleDateString()}
                      </p>

                    </div>

                  </div>

                </Link>

              ))}

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

            {Object.entries(

              tickets.reduce((acc: any, ticket: any) => {

                const assignee =
                  ticket.assignedTo?.name ||
                  "Unassigned";

                if (!acc[assignee]) {
                  acc[assignee] = 0;
                }

                acc[assignee]++;

                return acc;

              }, {})

            ).map(([name, count]: any) => (

              <Link
                href="/tickets"
                key={name}
              >
                <div key={name}>

                  <div className="mb-2 flex items-center justify-between text-sm">

                    <span className="font-medium">
                      {name}
                    </span>

                    <span className="text-zinc-500">
                      {count} tickets
                    </span>

                  </div>

                  <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800">

                    <div
                      className="h-2 rounded-full bg-blue-500 transition-all"
                      style={{
                        width: `${Math.min(count * 12, 100)}%`,
                      }}
                    />

                  </div>

                </div>
              </Link>

            ))}

          </CardContent>

        </Card>
      </div>
    </div>
  );
}