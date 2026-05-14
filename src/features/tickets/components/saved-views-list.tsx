import Link from "next/link";

import { db } from "@/lib/db";

import { getCurrentTenantUser } from "@/lib/tenant";

export async function SavedViewsList() {

    const user =
        await getCurrentTenantUser();

    if (!user) {
        return null;
    }

    const views =
        await db.savedView.findMany({
            where: {
                userId: user.id,
            },

            orderBy: {
                createdAt: "desc",
            },
        });

    if (views.length === 0) {
        return null;
    }

    return (
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                Saved Views
            </h2>

            <div className="space-y-2">

                {views.map((view) => {

                    const filters =
                        view.filters as {
                            search?: string;

                            status?: string;

                            priority?: string;

                            assignee?: string;

                            sort?: string;
                        };

                    const params =
                        new URLSearchParams();

                    if (filters.search) {
                        params.set(
                            "search",
                            filters.search
                        );
                    }

                    if (filters.status) {
                        params.set(
                            "status",
                            filters.status
                        );
                    }

                    if (filters.priority) {
                        params.set(
                            "priority",
                            filters.priority
                        );
                    }

                    if (filters.assignee) {
                        params.set(
                            "assignee",
                            filters.assignee
                        );
                    }

                    if (filters.sort) {
                        params.set(
                            "sort",
                            filters.sort
                        );
                    }

                    return (
                        <Link
                            key={view.id}
                            href={`/tickets?${params.toString()}`}
                            className="block rounded-2xl border border-zinc-200 px-4 py-3 text-sm transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
                        >

                            {view.name}

                        </Link>
                    );
                })}

            </div>

        </div>
    );
}