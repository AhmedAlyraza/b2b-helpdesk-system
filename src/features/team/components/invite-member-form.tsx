"use client";

import { useState } from "react";

import { Role } from "@prisma/client";

export function InviteMemberForm() {

    const [
        email,
        setEmail,
    ] = useState("");

    const [
        role,
        setRole,
    ] = useState<Role>(
        "CUSTOMER"
    );

    const [
        loading,
        setLoading,
    ] = useState(false);

    async function handleInvite(
        e: React.FormEvent
    ) {

        e.preventDefault();

        try {

            setLoading(true);

            const response =
                await fetch(
                    "/api/team/invite",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            email,
                            role,
                        }),
                    }
                );

            const result =
                await response.json();

            if (!response.ok) {
                alert(
                    result.error ||
                    "Failed to send invite"
                );

                return;
            }

            alert(
                "Invite created successfully"
            );

            setEmail("");

            setRole("CUSTOMER");

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
            onSubmit={handleInvite}
            className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >

            <div className="mb-6">

                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    Invite Team Member
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                    Invite a new member to your organization.
                </p>

            </div>

            <div className="space-y-4">

                {/* Email */}
                <div>

                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Email
                    </label>

                    <input
                        type="email"

                        required

                        value={email}

                        onChange={(e) =>
                            setEmail(
                                e.target.value
                            )
                        }

                        placeholder="john@example.com"

                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-950"
                    />

                </div>

                {/* Role */}
                <div>

                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Role
                    </label>

                    <select
                        value={role}

                        onChange={(e) =>
                            setRole(
                                e.target
                                    .value as Role
                            )
                        }

                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-950"
                    >

                        <option value="ADMIN">
                            ADMIN
                        </option>

                        <option value="AGENT">
                            AGENT
                        </option>

                        <option value="CUSTOMER">
                            CUSTOMER
                        </option>

                    </select>

                </div>

                {/* Submit */}
                <button
                    type="submit"

                    disabled={loading}

                    className="w-full rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black"
                >

                    {loading
                        ? "Sending Invite..."
                        : "Invite Member"}

                </button>

            </div>

        </form>
    );
}