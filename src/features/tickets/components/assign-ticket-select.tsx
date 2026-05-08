"use client";

import { useState } from "react";

interface AssignTicketSelectProps {
    ticketId: string;

    currentAssigneeId?: string | null;

    agents: {
        id: string;
        email: string;
    }[];
}

export function AssignTicketSelect({
    ticketId,
    currentAssigneeId,
    agents,
}: AssignTicketSelectProps) {
    const [value, setValue] =
        useState(
            currentAssigneeId || ""
        );

    const [loading, setLoading] =
        useState(false);

    async function handleAssign(
        assigneeId: string
    ) {
        try {
            setLoading(true);

            setValue(assigneeId);

            const res = await fetch(
                `/api/tickets/${ticketId}/assign`,
                {
                    method: "PATCH",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        assigneeId,
                    }),
                }
            );

            if (!res.ok) {
                console.error(
                    "Assignment failed"
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
                Assigned To
            </p>

            <select
                value={value}
                disabled={loading}
                onChange={(e) =>
                    handleAssign(
                        e.target.value
                    )
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-zinc-600"
            >
                <option value="">
                    Unassigned
                </option>

                {agents.map((agent) => (
                    <option
                        key={agent.id}
                        value={agent.id}
                    >
                        {agent.email}
                    </option>
                ))}
            </select>
        </div>
    );
}