"use client";

import { useState } from "react";

import { Send } from "lucide-react";

interface CommentFormProps {
    ticketId: string;
}

export function CommentForm({
    ticketId,
}: CommentFormProps) {
    const [message, setMessage] =
        useState("");

    const [isInternal, setIsInternal] =
        useState(false);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    async function handleSubmit(
        e: React.FormEvent
    ) {
        e.preventDefault();

        if (!message.trim()) return;

        try {
            setIsSubmitting(true);

            const res = await fetch(
                `/api/tickets/${ticketId}/comments`,
                {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        message,
                        isInternal,
                    }),
                }
            );

            if (!res.ok) {
                const error =
                    await res.json();

                console.error(error);

                return;
            }

            setMessage("");

            window.location.reload();

        } catch (error) {
            console.error(error);

        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4"
        >
            <textarea
                value={message}
                onChange={(e) =>
                    setMessage(e.target.value)
                }
                placeholder="Write a reply..."
                className="min-h-[140px] w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-sm leading-7 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600 dark:focus:bg-zinc-900"
            />
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                    <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={(e) =>
                            setIsInternal(
                                e.target.checked
                            )
                        }
                        className="h-4 w-4 rounded border-zinc-300"
                    />

                    Internal note
                </label>
            </div>
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:scale-[1.02] hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black"
                >
                    <Send size={16} />

                    {isSubmitting
                        ? "Sending..."
                        : "Send Reply"}
                </button>
            </div>
        </form>
    );
}