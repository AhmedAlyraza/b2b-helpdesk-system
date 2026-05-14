"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

interface AcceptInviteFormProps {
    token: string;

    email: string;

    role: string;
}

export function AcceptInviteForm({
    token,
    email,
    role,
}: AcceptInviteFormProps) {

    const router =
        useRouter();

    const [
        name,
        setName,
    ] = useState("");

    const [
        password,
        setPassword,
    ] = useState("");

    const [
        loading,
        setLoading,
    ] = useState(false);

    async function handleSubmit(
        e: React.FormEvent
    ) {

        e.preventDefault();

        try {

            setLoading(true);

            const response =
                await fetch(
                    "/api/team/accept-invite",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            token,
                            name,
                            password,
                        }),
                    }
                );

            const result =
                await response.json();

            if (!response.ok) {
                alert(
                    result.error ||
                    "Failed to accept invite"
                );

                return;
            }

            alert(
                "Account created successfully"
            );

            router.push("/login");

        } catch (error) {

            console.error(error);

            alert(
                "Something went wrong"
            );

        } finally {

            setLoading(false);

        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5"
        >

            {/* Email */}
            <div>

                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Email
                </label>

                <input
                    type="email"

                    value={email}

                    disabled

                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-100 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800"
                />

            </div>

            {/* Role */}
            <div>

                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Role
                </label>

                <input
                    value={role}

                    disabled

                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-100 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800"
                />

            </div>

            {/* Name */}
            <div>

                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Full Name
                </label>

                <input
                    required

                    value={name}

                    onChange={(e) =>
                        setName(
                            e.target.value
                        )
                    }

                    className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-950"
                />

            </div>

            {/* Password */}
            <div>

                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Password
                </label>

                <input
                    type="password"

                    required

                    value={password}

                    onChange={(e) =>
                        setPassword(
                            e.target.value
                        )
                    }

                    className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-950"
                />

            </div>

            <button
                type="submit"

                disabled={loading}

                className="w-full rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black"
            >

                {loading
                    ? "Creating Account..."
                    : "Accept Invite"}

            </button>

        </form>
    );
}