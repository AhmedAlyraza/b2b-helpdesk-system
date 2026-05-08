"use client";

import { useState } from "react";

interface TicketStatusSelectProps {
    ticketId: string;

    currentStatus: string;
}

const statuses = [
    "OPEN",
    "IN_PROGRESS",
    "RESOLVED",
    "CLOSED",
];

export function TicketStatusSelect({
    ticketId,
    currentStatus,
}: TicketStatusSelectProps) {
    const [value, setValue] =
        useState(currentStatus);

    const [loading, setLoading] =
        useState(false);

    async function handleChange(
        status: string
    ) {
        try {
            setLoading(true);

            setValue(status);

            const res = await fetch(
                `/api/tickets/${ticketId}/status`,
                {
                    method: "PATCH",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        status,
                    }),
                }
            );

            if (!res.ok) {
                console.error(
                    "Status update failed"
                );
            }

        } catch (error) {
            console.error(error);

        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Ticket Status
            </p>

            <select
                value={value}
                disabled={loading}
                onChange={(e) =>
                    handleChange(
                        e.target.value
                    )
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-zinc-600"
            >
                {statuses.map((status) => (
                    <option
                        key={status}
                        value={status}
                    >
                        {status.replace("_", " ")}
                    </option>
                ))}
            </select>
        </div>
    );
}