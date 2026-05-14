"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import { Eye } from "lucide-react";

import { pusherClient } from "@/lib/pusher-client";

interface Viewer {
    userId: string;

    name: string;
}

interface ActiveViewersProps {
    ticketId: string;

    currentUserId: string;
}

export function ActiveViewers({
    ticketId,
    currentUserId,
}: ActiveViewersProps) {

    const [
        viewers,
        setViewers,
    ] = useState<Viewer[]>(
        []
    );

    const timeoutRef =
        useRef<
            Record<string, NodeJS.Timeout>
        >({});

    // =========================
    // HEARTBEAT
    // =========================
    useEffect(() => {

        async function sendPresence() {

            try {

                await fetch(
                    `/api/tickets/${ticketId}/viewing`,
                    {
                        method: "POST",
                    }
                );

            } catch (error) {

                console.error(error);

            }
        }

        // immediately
        sendPresence();

        // repeat
        const interval =
            setInterval(
                sendPresence,
                15000
            );

        return () =>
            clearInterval(
                interval
            );

    }, [ticketId]);

    // =========================
    // SUBSCRIBE
    // =========================
    useEffect(() => {

        const channel =
            pusherClient.subscribe(
                `ticket-${ticketId}`
            );

        channel.bind(
            "viewer-active",
            (
                viewer: Viewer
            ) => {

                // ignore self
                if (
                    viewer.userId ===
                    currentUserId
                ) {
                    return;
                }

                setViewers(
                    (prev) => {

                        const exists =
                            prev.some(
                                (v) =>
                                    v.userId ===
                                    viewer.userId
                            );

                        if (exists) {
                            return prev;
                        }

                        return [
                            ...prev,
                            viewer,
                        ];
                    }
                );

                // reset timeout
                if (
                    timeoutRef.current[
                    viewer.userId
                    ]
                ) {

                    clearTimeout(
                        timeoutRef.current[
                        viewer.userId
                        ]
                    );
                }

                // auto-remove
                timeoutRef.current[
                    viewer.userId
                ] = setTimeout(() => {

                    setViewers(
                        (prev) =>
                            prev.filter(
                                (v) =>
                                    v.userId !==
                                    viewer.userId
                            )
                    );

                }, 25000);
            }
        );

        return () => {

            channel.unbind_all();

            channel.unsubscribe();

        };

    }, [
        ticketId,
        currentUserId,
    ]);

    return (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">

            <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">

                <Eye size={16} />

                Active Viewers

            </div>

            {viewers.length === 0 && (

                <span className="text-sm text-zinc-500">
                    No other viewers
                </span>

            )}

            {viewers.map(
                (viewer) => (

                    <div
                        key={viewer.userId}
                        className="flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800"
                    >

                        <div className="h-2 w-2 rounded-full bg-green-500" />

                        <span className="text-sm text-zinc-700 dark:text-zinc-300">

                            {viewer.name}

                        </span>

                    </div>

                )
            )}

        </div>
    );
}