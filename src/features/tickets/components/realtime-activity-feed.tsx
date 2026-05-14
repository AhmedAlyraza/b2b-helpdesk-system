"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    Activity,
    CheckCircle2,
} from "lucide-react";

import { pusherClient } from "@/lib/pusher-client";

interface ActivityItem {
    id: string;

    type: string;

    message: string;

    createdAt: string;

    actor: {
        id: string;

        name: string | null;

        email: string;
    };
}

interface RealtimeActivityFeedProps {
    ticketId: string;

    initialActivities: ActivityItem[];
}

export function RealtimeActivityFeed({
    ticketId,
    initialActivities,
}: RealtimeActivityFeedProps) {

    const [
        activities,
        setActivities,
    ] = useState(
        initialActivities
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
            "new-activity",
            (
                activity: ActivityItem
            ) => {

                setActivities(
                    (prev) => {

                        const exists =
                            prev.some(
                                (a) =>
                                    a.id ===
                                    activity.id
                            );

                        if (exists) {
                            return prev;
                        }

                        return [
                            activity,
                            ...prev,
                        ];
                    }
                );
            }
        );

        return () => {

            channel.unbind_all();

            channel.unsubscribe();

        };

    }, [ticketId]);

    return (
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

            <div className="mb-6 flex items-center gap-3">

                <Activity
                    className="text-zinc-500"
                    size={22}
                />

                <div>

                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                        Live Activity Timeline
                    </h2>

                    <p className="text-sm text-zinc-500">
                        Realtime operational history.
                    </p>

                </div>

            </div>

            <div className="space-y-4">

                {activities.length === 0 && (

                    <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">

                        No activity yet.

                    </div>

                )}

                {activities.map(
                    (activity) => (

                        <div
                            key={activity.id}
                            className="flex items-start gap-4 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800"
                        >

                            <div className="mt-1 rounded-full bg-zinc-100 p-2 dark:bg-zinc-800">

                                <CheckCircle2
                                    size={16}
                                    className="text-zinc-600 dark:text-zinc-300"
                                />

                            </div>

                            <div className="min-w-0 flex-1">

                                <p className="font-medium text-zinc-900 dark:text-white">

                                    {activity.message}

                                </p>

                                <p className="mt-1 text-sm text-zinc-500">

                                    By {
                                        activity.actor.name ||
                                        activity.actor.email
                                    }

                                </p>

                                <p className="mt-1 text-xs text-zinc-400">

                                    {
                                        new Date(
                                            activity.createdAt
                                        )
                                            .toISOString()
                                            .split("T")[0]
                                    }

                                </p>

                            </div>

                        </div>

                    )
                )}

            </div>

        </section>
    );
}