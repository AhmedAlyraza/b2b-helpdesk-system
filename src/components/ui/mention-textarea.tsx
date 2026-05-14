"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import { pusherClient } from "@/lib/pusher-client";

interface MentionUser {
    id: string;

    name: string | null;

    email: string;
}

interface MentionTextareaProps {
    value: string;

    ticketId?: string;

    currentUserName?: string;

    onChange: (
        value: string
    ) => void;

    placeholder?: string;

    rows?: number;
}

export function MentionTextarea({
    value,
    onChange,
    placeholder,
    rows = 6,
    ticketId,
    currentUserName,
}: MentionTextareaProps) {

    const textareaRef =
        useRef<HTMLTextAreaElement | null>(
            null
        );

    const [
        users,
        setUsers,
    ] = useState<
        MentionUser[]
    >([]);

    const [
        showSuggestions,
        setShowSuggestions,
    ] = useState(false);

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        mentionQuery,
        setMentionQuery,
    ] = useState("");

    // =========================
    // DETECT @MENTIONS
    // =========================
    useEffect(() => {

        const match =
            value.match(
                /@([a-zA-Z0-9._-]*)$/
            );

        if (!match) {

            setShowSuggestions(
                false
            );

            setUsers([]);

            return;
        }

        const query =
            match[1];

        setMentionQuery(query);

        if (!query.trim()) {

            setShowSuggestions(
                false
            );

            return;
        }

        async function searchUsers() {

            try {

                setLoading(true);

                const response =
                    await fetch(
                        `/api/users/search?query=${query}`
                    );

                const result =
                    await response.json();

                setUsers(result);

                setShowSuggestions(
                    true
                );

            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);

            }
        }

        searchUsers();

    }, [value]);

    function insertMention(
        user: MentionUser
    ) {

        const updated =
            value.replace(
                /@([a-zA-Z0-9._-]*)$/,
                `@${user.email.split(
                    "@"
                )[0]
                } `
            );

        onChange(updated);

        setShowSuggestions(
            false
        );

        textareaRef.current?.focus();
    }

    return (
        <div className="relative">

            <textarea
                ref={textareaRef}

                rows={rows}

                value={value}

                onChange={(e) => {

                    const newValue =
                        e.target.value;

                    onChange(newValue);

                    if (
                        ticketId &&
                        currentUserName
                    ) {

                        pusherClient.send_event(
                            "client-typing",
                            {
                                user:
                                    currentUserName,
                            },
                            `presence-ticket-${ticketId}`
                        );
                    }
                }}

                placeholder={
                    placeholder
                }

                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-950"
            />

            {/* Suggestions */}
            {showSuggestions && (

                <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">

                    {loading && (

                        <div className="px-4 py-3 text-sm text-zinc-500">
                            Searching...
                        </div>

                    )}

                    {!loading &&
                        users.length === 0 && (

                            <div className="px-4 py-3 text-sm text-zinc-500">
                                No users found
                            </div>

                        )}

                    {users.map(
                        (user) => (

                            <button
                                key={user.id}

                                type="button"

                                onClick={() =>
                                    insertMention(
                                        user
                                    )
                                }

                                className="flex w-full items-center justify-between border-b border-zinc-100 px-4 py-3 text-left transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
                            >

                                <div>

                                    <p className="font-medium text-zinc-900 dark:text-white">
                                        {user.name ||
                                            user.email}
                                    </p>

                                    <p className="text-xs text-zinc-500">
                                        {user.email}
                                    </p>

                                </div>

                            </button>

                        )
                    )}

                </div>

            )}

        </div>
    );
}