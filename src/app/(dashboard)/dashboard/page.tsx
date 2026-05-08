import {
  Ticket,
  Clock3,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Tickets",
      value: "128",
      icon: Ticket,
    },
    {
      title: "Open Tickets",
      value: "32",
      icon: AlertCircle,
    },
    {
      title: "Resolved",
      value: "84",
      icon: CheckCircle2,
    },
    {
      title: "Avg Response",
      value: "2.4h",
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
            {[
              "New ticket created by Ahmed",
              "Ticket #102 marked as resolved",
              "Sarah assigned to Ticket #88",
              "Customer replied to Ticket #41",
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <span>{item}</span>

                <span className="text-xs text-zinc-500">
                  2m ago
                </span>
              </div>
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
            {[
              {
                name: "Ahmed",
                tickets: 24,
              },
              {
                name: "Sarah",
                tickets: 18,
              },
              {
                name: "Ali",
                tickets: 13,
              },
            ].map((agent) => (
              <div
                key={agent.name}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {agent.name}
                  </span>

                  <span className="text-zinc-500">
                    {agent.tickets} tickets
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-black dark:bg-white"
                    style={{
                      width: `${agent.tickets * 3}%`,
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