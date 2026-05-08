"use client";

import { useRouter } from "next/navigation";

interface TicketsFiltersProps {
    search: string;

    status: string;

    priority: string;
}

export function TicketsFilters({
    search,
    status,
    priority,
}: TicketsFiltersProps) {
    const router = useRouter();

    function updateFilters(
        values: {
            search?: string;

            status?: string;

            priority?: string;
        }
    ) {
        const params =
            new URLSearchParams();

        const nextSearch =
            values.search ??
            search;

        const nextStatus =
            values.status ??
            status;

        const nextPriority =
            values.priority ??
            priority;

        if (nextSearch) {
            params.set(
                "search",
                nextSearch
            );
        }

        if (nextStatus) {
            params.set(
                "status",
                nextStatus
            );
        }

        if (nextPriority) {
            params.set(
                "priority",
                nextPriority
            );
        }

        router.push(
            `/tickets?${params.toString()}`
        );
    }

    return (
        <div className="grid gap-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-3">
            {/* Search */}
            <input
                type="text"
                defaultValue={search}
                placeholder="Search tickets..."
                onChange={(e) =>
                    updateFilters({
                        search:
                            e.target.value,
                    })
                }
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
            />

            {/* Status */}
            <select
                value={status}
                onChange={(e) =>
                    updateFilters({
                        status:
                            e.target.value,
                    })
                }
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
            >
                <option value="">
                    All Statuses
                </option>

                <option value="OPEN">
                    Open
                </option>

                <option value="IN_PROGRESS">
                    In Progress
                </option>

                <option value="RESOLVED">
                    Resolved
                </option>

                <option value="CLOSED">
                    Closed
                </option>
            </select>

            {/* Priority */}
            <select
                value={priority}
                onChange={(e) =>
                    updateFilters({
                        priority:
                            e.target.value,
                    })
                }
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
            >
                <option value="">
                    All Priorities
                </option>

                <option value="LOW">
                    Low
                </option>

                <option value="MEDIUM">
                    Medium
                </option>

                <option value="HIGH">
                    High
                </option>

                <option value="URGENT">
                    Urgent
                </option>
            </select>
        </div>
    );
}