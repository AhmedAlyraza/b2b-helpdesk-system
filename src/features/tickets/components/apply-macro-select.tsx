"use client";

import { useState } from "react";

import { TicketMacro } from "@prisma/client";

interface ApplyMacroSelectProps {
    ticketId: string;

    macros: TicketMacro[];
}

export function ApplyMacroSelect({
    ticketId,
    macros,
}: ApplyMacroSelectProps) {

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        selectedMacro,
        setSelectedMacro,
    ] = useState("");

    async function applyMacro() {

        if (!selectedMacro) {
            return;
        }

        try {

            setLoading(true);

            const response =
                await fetch(
                    `/api/tickets/${ticketId}/apply-macro`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            macroId:
                                selectedMacro,
                        }),
                    }
                );

            const result =
                await response.json();

            if (!response.ok) {
                alert(
                    result.error ||
                    "Failed to apply macro"
                );

                return;
            }

            alert(
                "Macro applied successfully"
            );

            window.location.reload();

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
        <div className="flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

            <div>

                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    Apply Macro
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                    Run reusable workflows instantly.
                </p>

            </div>

            <div className="flex flex-col gap-3 md:flex-row">

                <select
                    value={selectedMacro}

                    onChange={(e) =>
                        setSelectedMacro(
                            e.target.value
                        )
                    }

                    className="flex-1 rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-950"
                >

                    <option value="">
                        Select Macro
                    </option>

                    {macros.map((macro) => (

                        <option
                            key={macro.id}
                            value={macro.id}
                        >
                            {macro.name}
                        </option>

                    ))}

                </select>

                <button
                    onClick={applyMacro}

                    disabled={
                        loading ||
                        !selectedMacro
                    }

                    className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black"
                >

                    {loading
                        ? "Applying..."
                        : "Apply"}

                </button>

            </div>

        </div>
    );
}