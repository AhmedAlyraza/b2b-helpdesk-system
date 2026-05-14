"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import { pusherClient } from "@/lib/pusher-client";

interface OnlineUser {
    id: string;

    name: string;
}

interface OnlineUsersProps {
    currentUserId: string;
}

export function OnlineUsers({
    currentUserId,
}: OnlineUsersProps) {

    const [
        onlineUsers,
        setOnlineUsers,
    ] = useState<
        OnlineUser[]
    >([]);

    const timeoutRef =
        useRef<
            Record<string, NodeJS.Timeout>
        >({});

    // =========================
    // HEARTBEAT
    // =========================
    useEffect(() => {

        async function sendHeartbeat() {

            try {

                await fetch(
                    "/api/presence",
                    {
                        method: "POST",
                    }
                );

            } catch (error) {

                console.error(error);

            }
        }

        // send immediately
        sendHeartbeat();

        // repeat every 20s
        const interval =
            setInterval(
                sendHeartbeat,
                20000
            );

        return () =>
            clearInterval(
                interval
            );

    }, []);

    // =========================
    // SUBSCRIBE
    // =========================
    useEffect(() => {

        const channel =
            pusherClient.subscribe(
                "presence-global"
            );

        channel.bind(
            "user-online",
            (
                user: OnlineUser
            ) => {

                // ignore self
                if (
                    user.id ===
                    currentUserId
                ) {
                    return;
                }

                setOnlineUsers(
                    (prev) => {

                        const exists =
                            prev.some(
                                (u) =>
                                    u.id ===
                                    user.id
                            );

                        if (exists) {
                            return prev;
                        }

                        return [
                            ...prev,
                            user,
                        ];
                    }
                );

                // clear old timeout
                if (
                    timeoutRef.current[
                    user.id
                    ]
                ) {

                    clearTimeout(
                        timeoutRef.current[
                        user.id
                        ]
                    );
                }

                // auto-remove offline
                timeoutRef.current[
                    user.id
                ] = setTimeout(() => {

                    setOnlineUsers(
                        (prev) =>
                            prev.filter(
                                (u) =>
                                    u.id !==
                                    user.id
                            )
                    );

                }, 30000);
            }
        );

        return () => {

            channel.unbind_all();

            channel.unsubscribe();

        };

    }, [currentUserId]);

    return (
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

            <div className="mb-4">

                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    Online Agents
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                    Live collaborative presence.
                </p>

            </div>

            <div className="space-y-3">

                {onlineUsers.length === 0 && (

                    <div className="text-sm text-zinc-500">
                        No agents online
                    </div>

                )}

                {onlineUsers.map(
                    (user) => (

                        <div
                            key={user.id}
                            className="flex items-center gap-3"
                        >

                            <div className="relative">

                                <div className="h-10 w-10 rounded-full bg-black dark:bg-white" />

                                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-zinc-900" />

                            </div>

                            <div>

                                <p className="font-medium text-zinc-900 dark:text-white">
                                    {user.name}
                                </p>

                                <p className="text-xs text-green-600 dark:text-green-400">
                                    Online
                                </p>

                            </div>

                        </div>

                    )
                )}

            </div>

        </div>
    );
}