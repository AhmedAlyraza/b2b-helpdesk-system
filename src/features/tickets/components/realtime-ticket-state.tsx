"use client";

import {
    useEffect,
    useState,
} from "react";

import { pusherClient } from "@/lib/pusher-client";

interface RealtimeTicketStateProps {
    ticketId: string;

    initialStatus: string;

    initialAssignedTo?: {
        id: string;

        name: string;
    } | null;
}

export function RealtimeTicketState({
    ticketId,
    initialStatus,
    initialAssignedTo,
}: RealtimeTicketStateProps) {

    const [
        status,
        setStatus,
    ] = useState(
        initialStatus
    );

    const [
        assignedTo,
        setAssignedTo,
    ] = useState(
        initialAssignedTo
    );

    // =========================
    // SUBSCRIBE
    // =========================
    useEffect(() => {

        const channel =
            pusherClient.subscribe(
                `ticket-${ticketId}`
            );

        channel.bind(
            "ticket-updated",
            (
                data: any
            ) => {

                // status update
                if (
                    data.type ===
                    "status"
                ) {

                    setStatus(
                        data.status
                    );
                }

                // assignment update
                if (
                    data.type ===
                    "assignment"
                ) {

                    setAssignedTo(
                        data.assignedTo
                    );
                }
            }
        );

        return () => {

            channel.unbind_all();

            channel.unsubscribe();

        };

    }, [ticketId]);

    return (
        <div className="grid gap-4 md:grid-cols-2">

            {/* Status */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">

                <p className="mb-2 text-sm text-zinc-500">
                    Live Status
                </p>

                <div
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${status === "OPEN"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                            : status ===
                                "IN_PROGRESS"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400"
                                : status ===
                                    "RESOLVED"
                                    ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                                    : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                        }`}
                >

                    {status.replace(
                        "_",
                        " "
                    )}

                </div>

            </div>

            {/* Assignee */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">

                <p className="mb-2 text-sm text-zinc-500">
                    Assigned Agent
                </p>

                <p className="font-medium text-zinc-900 dark:text-white">

                    {assignedTo
                        ? assignedTo.name
                        : "Unassigned"}

                </p>

            </div>

        </div>
    );
}