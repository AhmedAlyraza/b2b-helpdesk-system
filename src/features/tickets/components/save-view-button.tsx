"use client";

import { useState } from "react";

interface SaveViewButtonProps {
    filters: {
        search: string;

        status: string;

        priority: string;

        assignee: string;

        sort: string;
    };
}

export function SaveViewButton({
    filters,
}: SaveViewButtonProps) {

    const [
        loading,
        setLoading,
    ] = useState(false);

    async function saveView() {

        const name =
            prompt(
                "Enter view name"
            );

        if (!name) {
            return;
        }

        try {

            setLoading(true);

            const response =
                await fetch(
                    "/api/saved-views",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            name,

                            filters,
                        }),
                    }
                );

            const result =
                await response.json();

            if (!response.ok) {
                alert(
                    result.error ||
                    "Failed to save view"
                );

                return;
            }

            alert(
                "View saved successfully"
            );

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
        <button
            onClick={saveView}

            disabled={loading}

            className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >

            {loading
                ? "Saving..."
                : "Save View"}

        </button>
    );
}