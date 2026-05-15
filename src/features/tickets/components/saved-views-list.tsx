import Link from "next/link";

import { Bookmark } from "lucide-react";

import { db } from "@/lib/db";

import { getCurrentTenantUser } from "@/lib/tenant";

type SavedViewFilters = {
  search?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  sort?: string;
};

type SavedViewItem = {
  id: string;
  name: string;
  createdAt: Date;
  filters: SavedViewFilters;
};

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
    }) as SavedViewItem[];

  if (views.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

      <div className="mb-5 flex items-center gap-3">

        <Bookmark
          size={18}
          className="text-zinc-500"
        />

        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Saved Views
        </h2>

      </div>

      <div className="space-y-2">

        {views.map(
          (
            view: SavedViewItem
          ) => {

            const filters =
              view.filters;

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
                className="block rounded-2xl border border-zinc-200 px-4 py-3 transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
              >

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      {view.name}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">

                      Created{" "}

                      {
                        new Date(
                          view.createdAt
                        )
                          .toISOString()
                          .split("T")[0]
                      }

                    </p>

                  </div>

                </div>

              </Link>
            );
          }
        )}

      </div>

    </div>
  );
}