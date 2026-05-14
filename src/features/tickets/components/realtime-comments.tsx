"use client";

import {
    useEffect,
    useState,
} from "react";

import { pusherClient } from "@/lib/pusher-client";

import { RenderMessageWithMentions } from "@/components/ui/render-message-with-mentions";

interface Comment {
    id: string;

    message: string;

    createdAt: string;

    isInternal: boolean;

    author: {
        id: string;

        name: string | null;

        email: string;
    };
}

interface RealtimeCommentsProps {
    ticketId: string;

    initialComments: Comment[];
}

export function RealtimeComments({
    ticketId,
    initialComments,
}: RealtimeCommentsProps) {

    const [
        comments,
        setComments,
    ] = useState(
        initialComments
    );

    // =========================
    // REALTIME SUBSCRIPTION
    // =========================
    useEffect(() => {

        const channel =
            pusherClient.subscribe(
                `ticket-${ticketId}`
            );

        channel.bind(
            "new-comment",
            (comment: Comment) => {

                setComments(
                    (prev) => {

                        // prevent duplicates
                        const exists =
                            prev.some(
                                (c) =>
                                    c.id ===
                                    comment.id
                            );

                        if (exists) {
                            return prev;
                        }

                        return [
                            ...prev,
                            comment,
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
        <div className="space-y-4">

            {comments.map(
                (comment) => (

                    <div
                        key={comment.id}
                        className={`rounded-3xl border p-5 shadow-sm ${comment.isInternal
                                ? "border-yellow-200 bg-yellow-50 dark:border-yellow-500/20 dark:bg-yellow-500/5"
                                : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                            }`}
                    >

                        <div className="mb-3 flex items-center justify-between gap-4">

                            <div>

                                <p className="font-medium text-zinc-900 dark:text-white">

                                    {comment.author.name ||
                                        comment.author.email}

                                </p>

                                <p className="text-xs text-zinc-500">

                                    {
                                        new Date(
                                            comment.createdAt
                                        )
                                            .toISOString()
                                            .split("T")[0]
                                    }

                                </p>

                            </div>

                            {comment.isInternal && (

                                <span className="rounded-full bg-yellow-200 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-300">

                                    Internal Note

                                </span>

                            )}

                        </div>

                        <RenderMessageWithMentions
                            message={
                                comment.message
                            }
                        />

                    </div>

                )
            )}

        </div>
    );
}