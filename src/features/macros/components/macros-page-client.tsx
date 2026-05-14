"use client";

import { useState } from "react";

import {
    TicketStatus,
    TicketMacro,
} from "@prisma/client";

import {
    Plus,
    Workflow,
} from "lucide-react";

interface MacrosPageClientProps {
    initialMacros: TicketMacro[];
}

export function MacrosPageClient({
    initialMacros,
}: MacrosPageClientProps) {

    const [
        macros,
        setMacros,
    ] = useState(
        initialMacros
    );

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        name,
        setName,
    ] = useState("");

    const [
        content,
        setContent,
    ] = useState("");

    const [
        status,
        setStatus,
    ] = useState("");

    async function createMacro(
        e: React.FormEvent
    ) {

        e.preventDefault();

        try {

            setLoading(true);

            const response =
                await fetch(
                    "/api/ticket-macros",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            name,
                            content,
                            status:
                                status || null,
                        }),
                    }
                );

            const result =
                await response.json();

            if (!response.ok) {
                alert(
                    result.error ||
                    "Failed to create macro"
                );

                return;
            }

            setMacros([
                result.macro,
                ...macros,
            ]);

            setName("");

            setContent("");

            setStatus("");

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
        <div className="space-y-8">

            {/* Header */}
            <div>

                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    Ticket Macros
                </h1>

                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    Create reusable workflows and canned responses.
                </p>

            </div>

            {/* Create Form */}
            <form
                onSubmit={createMacro}
                className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >

                <div className="flex items-center gap-3">

                    <div className="rounded-2xl bg-zinc-100 p-3 dark:bg-zinc-800">

                        <Workflow
                            size={22}
                            className="text-zinc-600 dark:text-zinc-300"
                        />

                    </div>

                    <div>

                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                            Create Macro
                        </h2>

                        <p className="text-sm text-zinc-500">
                            Save reusable support workflows.
                        </p>

                    </div>

                </div>

                {/* Name */}
                <div>

                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Macro Name
                    </label>

                    <input
                        required

                        value={name}

                        onChange={(e) =>
                            setName(
                                e.target.value
                            )
                        }

                        placeholder="Awaiting Customer"

                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-950"
                    />

                </div>

                {/* Content */}
                <div>

                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Reply Content
                    </label>

                    <textarea
                        required

                        rows={6}

                        value={content}

                        onChange={(e) =>
                            setContent(
                                e.target.value
                            )
                        }

                        placeholder="Please provide additional logs..."

                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-950"
                    />

                </div>

                {/* Status */}
                <div>

                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Optional Status Change
                    </label>

                    <select
                        value={status}

                        onChange={(e) =>
                            setStatus(
                                e.target.value
                            )
                        }

                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-950"
                    >

                        <option value="">
                            No Status Change
                        </option>

                        {Object.values(
                            TicketStatus
                        ).map((status) => (

                            <option
                                key={status}
                                value={status}
                            >
                                {status}
                            </option>

                        ))}

                    </select>

                </div>

                {/* Submit */}
                <button
                    type="submit"

                    disabled={loading}

                    className="inline-flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black"
                >

                    <Plus size={18} />

                    {loading
                        ? "Creating..."
                        : "Create Macro"}

                </button>

            </form>

            {/* Macro List */}
            <div className="space-y-4">

                {macros.length === 0 && (

                    <div className="rounded-3xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">

                        <p className="text-sm text-zinc-500">
                            No macros created yet.
                        </p>

                    </div>

                )}

                {macros.map((macro) => (

                    <div
                        key={macro.id}
                        className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                    >

                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                            <div className="space-y-3">

                                <div className="flex flex-wrap items-center gap-3">

                                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                        {macro.name}
                                    </h2>

                                    {macro.status && (

                                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                            {macro.status}
                                        </span>

                                    )}

                                </div>

                                <p className="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
                                    {macro.content}
                                </p>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}