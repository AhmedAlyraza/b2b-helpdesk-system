"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import { pusherClient } from "@/lib/pusher-client";

interface TypingIndicatorProps {
    ticketId: string;

    currentUserId: string;
}

export function TypingIndicator({
    ticketId,
    currentUserId,
}: TypingIndicatorProps) {

    const [
        typingUsers,
        setTypingUsers,
    ] = useState<string[]>(
        []
    );

    const timeoutRef =
        useRef<
            Record<string, NodeJS.Timeout>
        >({});

    // =========================
    // SUBSCRIBE
    // =========================
    useEffect(() => {

        const channel =
            pusherClient.subscribe(
                `ticket-${ticketId}`
            );

        channel.bind(
            "typing",
            (
                data: {
                    userId: string;

                    name: string;
                }
            ) => {

                // ignore self
                if (
                    data.userId ===
                    currentUserId
                ) {
                    return;
                }

                setTypingUsers(
                    (prev) => {

                        if (
                            prev.includes(
                                data.name
                            )
                        ) {
                            return prev;
                        }

                        return [
                            ...prev,
                            data.name,
                        ];
                    }
                );

                // clear existing timeout
                if (
                    timeoutRef.current[
                    data.userId
                    ]
                ) {

                    clearTimeout(
                        timeoutRef.current[
                        data.userId
                        ]
                    );
                }

                // auto-remove
                timeoutRef.current[
                    data.userId
                ] = setTimeout(() => {

                    setTypingUsers(
                        (prev) =>
                            prev.filter(
                                (name) =>
                                    name !==
                                    data.name
                            )
                    );

                }, 3000);
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

    if (
        typingUsers.length === 0
    ) {
        return null;
    }

    return (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/5 dark:text-blue-400">

            {typingUsers.join(
                ", "
            )}{" "}

            {typingUsers.length === 1
                ? "is"
                : "are"}{" "}

            typing...

        </div>
    );
}