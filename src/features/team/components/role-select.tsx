"use client";

import { useState } from "react";

import { Role } from "@prisma/client";

interface RoleSelectProps {
    userId: string;

    currentRole: Role;
}

export function RoleSelect({
    userId,
    currentRole,
}: RoleSelectProps) {

    const [
        role,
        setRole,
    ] = useState(currentRole);

    const [
        loading,
        setLoading,
    ] = useState(false);

    async function updateRole(
        newRole: Role
    ) {

        if (newRole === role) {
            return;
        }

        try {

            setLoading(true);

            const response =
                await fetch(
                    `/api/team/${userId}/role`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            role: newRole,
                        }),
                    }
                );

            const result =
                await response.json();

            if (!response.ok) {
                alert(
                    result.error ||
                    "Failed to update role"
                );

                return;
            }

            setRole(newRole);

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
        <select
            value={role}

            disabled={loading}

            onChange={(e) =>
                updateRole(
                    e.target.value as Role
                )
            }

            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-900"
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
    );
}