import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

import { AnalyticsCharts } from "@/features/analytics/components/analytics-charts";

export default async function AnalyticsPage() {
    const user = await getCurrentUser();

    if (!user) {
        return null;
    }

    const tickets = await db.ticket.findMany({
        where: {
            organizationId:
                user.organizationId!,
        },

        include: {
            assignedTo: true,
        },
    });

    // KPIs
    const totalTickets =
        tickets.length;

    const openTickets =
        tickets.filter(
            (ticket) => ticket.status === "OPEN"
        ).length;

    const resolvedTickets =
        tickets.filter(
            (ticket) =>
                ticket.status === "RESOLVED"
        ).length;

    const urgentTickets =
        tickets.filter(
            (ticket) =>
                ticket.priority === "URGENT"
        ).length;

    // status analytics
    const statusData = [
        {
            name: "Open",
            value: tickets.filter(
                (ticket) =>
                    ticket.status === "OPEN"
            ).length,
        },

        {
            name: "In Progress",
            value: tickets.filter(
                (ticket) =>
                    ticket.status ===
                    "IN_PROGRESS"
            ).length,
        },

        {
            name: "Resolved",
            value: tickets.filter(
                (ticket) =>
                    ticket.status ===
                    "RESOLVED"
            ).length,
        },

        {
            name: "Closed",
            value: tickets.filter(
                (ticket) =>
                    ticket.status ===
                    "CLOSED"
            ).length,
        },
    ];

    // agent analytics
    const agentMap =
        new Map();

    tickets.forEach((ticket) => {
        if (
            ticket.assignedTo
        ) {
            const email =
                ticket.assignedTo.email;

            agentMap.set(
                email,
                (agentMap.get(email) || 0) +
                1
            );
        }
    });

    const agentData =
        Array.from(
            agentMap.entries()
        ).map(
            ([name, tickets]) => ({
                name,
                tickets,
            })
        );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Analytics
                </h1>

                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    Operational insights and
                    ticket performance.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {[
                    {
                        label:
                            "Total Tickets",
                        value: totalTickets,
                    },

                    {
                        label:
                            "Open Tickets",
                        value: openTickets,
                    },

                    {
                        label:
                            "Resolved",
                        value:
                            resolvedTickets,
                    },

                    {
                        label:
                            "Urgent Tickets",
                        value:
                            urgentTickets,
                    },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                    >
                        <p className="text-sm font-medium text-zinc-500">
                            {item.label}
                        </p>

                        <h2 className="mt-4 text-4xl font-bold tracking-tight">
                            {item.value}
                        </h2>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <AnalyticsCharts
                statusData={statusData}
                agentData={agentData}
            />
        </div>
    );
}