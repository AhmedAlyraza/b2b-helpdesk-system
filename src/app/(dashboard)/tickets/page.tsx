import Link from "next/link";

import {
  Plus,
  ChevronRight,
} from "lucide-react";

import {
  TicketPriority,
  TicketStatus,
} from "@prisma/client";

import { db } from "@/lib/db";

import { redirect } from "next/navigation";

import { getCurrentTenantUser } from "@/lib/tenant";

import { TicketsFilters } from "@/features/tickets/components/tickets-filters";

interface TicketsPageProps {
  searchParams: Promise<{
    search?: string;

    status?: string;

    priority?: string;

    page?: string;
  }>;
}

export default async function TicketsPage({
  searchParams,
}: TicketsPageProps) {

  const user =
    await getCurrentTenantUser();

  if (!user) {
    redirect("/login");
  }

  const params =
    await searchParams;

  const search =
    params.search || "";

  const status =
    params.status || "";

  const priority =
    params.priority || "";

  const currentPage =
    Number(params.page) || 1;

  const pageSize = 10;

  const skip =
    (currentPage - 1) *
    pageSize;

  const whereClause = {
    organizationId:
      user.organizationId,

    ...(search && {
      OR: [
        {
          title: {
            contains: search,
            mode: "insensitive" as const,
          },
        },

        {
          description: {
            contains: search,
            mode: "insensitive" as const,
          },
        },
      ],
    }),

    ...(status && {
      status:
        status as TicketStatus,
    }),

    ...(priority && {
      priority:
        priority as TicketPriority,
    }),
  };

  const [
    tickets,
    totalTickets,
  ] = await Promise.all([

    db.ticket.findMany({
      where: whereClause,

      include: {
        assignedTo: true,
        createdBy: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      skip,

      take: pageSize,
    }),

    db.ticket.count({
      where: whereClause,
    }),

  ]);

  const totalPages =
    Math.ceil(
      totalTickets / pageSize
    );

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>

          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Tickets
          </h1>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Manage and track support requests.
          </p>

        </div>

        <Link
          href="/tickets/new"
          className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black"
        >

          <Plus size={18} />

          Create Ticket

        </Link>

      </div>

      {/* Filters */}
      <TicketsFilters
        search={search}
        status={status}
        priority={priority}
      />

      {/* Ticket List */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

        {tickets.length === 0 ? (

          <div className="flex flex-col items-center justify-center px-6 py-24 text-center">

            <div className="rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-800">

              <Plus
                size={32}
                className="text-zinc-500"
              />

            </div>

            <h2 className="mt-6 text-xl font-semibold text-zinc-900 dark:text-white">
              No tickets found
            </h2>

            <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
              Try changing filters or create a new support ticket.
            </p>

            <Link
              href="/tickets/new"
              className="mt-6 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black"
            >
              Create Ticket
            </Link>

          </div>

        ) : (

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">

            {tickets.map((ticket) => (

              <Link
                href={`/tickets/${ticket.id}`}
                key={ticket.id}
                className="flex flex-col gap-4 px-6 py-5 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50 md:flex-row md:items-center md:justify-between"
              >

                {/* Left */}
                <div className="min-w-0 flex-1">

                  <div className="flex flex-wrap items-center gap-3">

                    <h2 className="truncate text-lg font-semibold text-zinc-900 dark:text-white">
                      {ticket.title}
                    </h2>

                    {/* Status */}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        ticket.status === "OPEN"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                          : ticket.status ===
                            "IN_PROGRESS"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400"
                          : ticket.status ===
                            "RESOLVED"
                          ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                          : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {ticket.status.replace(
                        "_",
                        " "
                      )}
                    </span>

                    {/* Priority */}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        ticket.priority === "URGENT"
                          ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                          : ticket.priority ===
                            "HIGH"
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400"
                          : ticket.priority ===
                            "MEDIUM"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                          : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {ticket.priority}
                    </span>

                  </div>

                  <p className="mt-2 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                    {ticket.description}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-400">

                    <span>
                      Created by:
                      {" "}
                      {ticket.createdBy.name ||
                        ticket.createdBy.email}
                    </span>

                    <span>
                      Assigned:
                      {" "}
                      {ticket.assignedTo?.name ||
                        "Unassigned"}
                    </span>

                    <span>
                      {
                        new Date(
                          ticket.createdAt
                        ).toLocaleDateString()
                      }
                    </span>

                  </div>

                </div>

                {/* Right */}
                <div className="flex items-center gap-2 text-zinc-400">

                  <ChevronRight size={20} />

                </div>

              </Link>

            ))}

          </div>

        )}

      </div>

      {/* Pagination */}
      {totalPages > 1 && (

        <div className="flex items-center justify-between">

          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Page {currentPage} of {totalPages}
          </p>

          <div className="flex items-center gap-2">

            {currentPage > 1 && (

              <Link
                href={`/tickets?search=${search}&status=${status}&priority=${priority}&page=${currentPage - 1}`}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
              >
                Previous
              </Link>

            )}

            {currentPage < totalPages && (

              <Link
                href={`/tickets?search=${search}&status=${status}&priority=${priority}&page=${currentPage + 1}`}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
              >
                Next
              </Link>

            )}

          </div>

        </div>

      )}

    </div>
  );
}