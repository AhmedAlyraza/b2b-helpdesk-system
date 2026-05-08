"use client";

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Tooltip,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
} from "recharts";

interface AnalyticsChartsProps {
    statusData: {
        name: string;
        value: number;
    }[];

    agentData: {
        name: string;
        tickets: number;
    }[];
}

const COLORS = [
    "#3b82f6",
    "#f59e0b",
    "#22c55e",
    "#71717a",
];

export function AnalyticsCharts({
    statusData,
    agentData,
}: AnalyticsChartsProps) {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Status Chart */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-lg font-semibold">
                    Ticket Status
                </h2>

                <div className="mt-6 h-[320px]">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <PieChart>
                            <Pie
                                data={statusData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={110}
                            >
                                {statusData.map(
                                    (_, index) => (
                                        <Cell
                                            key={index}
                                            fill={
                                                COLORS[
                                                index %
                                                COLORS.length
                                                ]
                                            }
                                        />
                                    )
                                )}
                            </Pie>

                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Agent Performance */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-lg font-semibold">
                    Agent Performance
                </h2>

                <div className="mt-6 h-[320px]">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <BarChart
                            data={agentData}
                        >
                            <XAxis dataKey="name" />

                            <YAxis />

                            <Tooltip />

                            <Bar
                                dataKey="tickets"
                                fill="#18181b"
                                radius={[
                                    8,
                                    8,
                                    0,
                                    0,
                                ]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}