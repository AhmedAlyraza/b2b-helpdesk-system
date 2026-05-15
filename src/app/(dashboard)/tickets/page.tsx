export const dynamic = "force-dynamic";

import Link from "next/link";

import {
  Search,
  Filter,
  Clock3,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Prisma } from "@prisma/client";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";

import { getCurrentTenantUser } from "@/lib/tenant";

interface TicketsPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    priority?: string;
    sort?: string;
    page?: string;
  }>;
}

type TicketListItem = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: Date;
  slaDueAt: Date | null;

  createdBy: {
    name: string | null;
    email: string;
  };

  assignedTo: {
    name: string | null;
    email: string;
  } | null;
};

function getStatusStyles(
  status: string
) {
  switch (status) {
    case "OPEN":
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";

    case "IN_PROGRESS":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400";

    case "RESOLVED":
      return "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400";

    case "CLOSED":
      return "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300";

    default:
      return "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300";
  }
}

function getPriorityStyles(
  priority: string
) {
  switch (priority) {
    case "URGENT":
      return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400";

    case "HIGH":
      return "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400";

    case "MEDIUM":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400";

    default:
      return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  }
}

export default async function TicketsPage({
  searchParams,
}: TicketsPageProps) {

  const user =
    await getCurrentTenantUser();

  if (!user) {
    redirect("/login");
  }

  const organizationId =
    user.organizationId || undefined;

  const params =
    await searchParams;

  const search =
    params.search || "";

  const status =
    params.status || "";

  const priority =
    params.priority || "";

  const sort =
    params.sort || "latest";

  const currentPage =
    Number(params.page || "1");

  const pageSize = 10;

  const skip =
    (currentPage - 1) * pageSize;

  const whereClause: Prisma.TicketWhereInput = {
    organizationId,

    ...(search && {
      OR: [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },

        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    }),

    ...(status && {
      status:
        status as Prisma.EnumTicketStatusFilter,
    }),

    ...(priority && {
      priority:
        priority as Prisma.EnumTicketPriorityFilter,
    }),
  };

  const orderBy:
    Prisma.TicketOrderByWithRelationInput =
    sort === "oldest"
      ? {
          createdAt: "asc",
        }
      : {
          createdAt: "desc",
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

      orderBy,

      skip,

      take: pageSize,
    }),

    db.ticket.count({
      where: whereClause,
    }),

  ]);

  const typedTickets =
    tickets as TicketListItem[];

  const totalPages =
    Math.ceil(
      totalTickets / pageSize
    );

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Tickets
          </h1>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Manage support requests and ticket workflow.
          </p>

        </div>

      </div>

      {/* Filters */}
      <form className="grid gap-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-4">

        <div className="relative">

          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
          />

          <input
            type="text"

            name="search"

            defaultValue={search}

            placeholder="Search tickets..."

            className="w-full rounded-2xl border border-zinc-200 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-950"
          />

        </div>

        <select
          name="status"
          defaultValue={status}
          className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none dark:border-zinc-700 dark:bg-zinc-950"
        >

          <option value="">
            All Statuses
          </option>

          <option value="OPEN">
            Open
          </option>

          <option value="IN_PROGRESS">
            In Progress
          </option>

          <option value="RESOLVED">
            Resolved
          </option>

          <option value="CLOSED">
            Closed
          </option>

        </select>

        <select
          name="priority"
          defaultValue={priority}
          className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none dark:border-zinc-700 dark:bg-zinc-950"
        >

          <option value="">
            All Priorities
          </option>

          <option value="LOW">
            Low
          </option>

          <option value="MEDIUM">
            Medium
          </option>

          <option value="HIGH">
            High
          </option>

          <option value="URGENT">
            Urgent
          </option>

        </select>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black"
        >

          <Filter size={16} />

          Apply Filters

        </button>

      </form>

      {/* Ticket List */}
      <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

        <div className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">

          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Showing {typedTickets.length} tickets
          </h2>

        </div>

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">

          {typedTickets.length === 0 && (

            <div className="px-6 py-16 text-center">

              <p className="text-sm text-zinc-500">
                No tickets found.
              </p>

            </div>

          )}

          {typedTickets.map(
            (
              ticket: TicketListItem
            ) => (

              <Link
                href={`/tickets/${ticket.id}`}
                key={ticket.id}
                className="block px-6 py-5 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >

                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-3">

                      <h3 className="truncate font-semibold text-zinc-900 dark:text-white">
                        {ticket.title}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyles(
                          ticket.status
                        )}`}
                      >
                        {ticket.status.replace(
                          "_",
                          " "
                        )}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityStyles(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority}
                      </span>

                    </div>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-500">
                      {ticket.description}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-5 text-xs text-zinc-500">

                      <span>
                        Created by{" "}
                        {ticket.createdBy.name ||
                          ticket.createdBy.email}
                      </span>

                      <span>
                        Assigned to{" "}
                        {ticket.assignedTo?.name ||
                          ticket.assignedTo?.email ||
                          "Unassigned"}
                      </span>

                    </div>

                  </div>

                  <div className="flex items-center gap-6">

                    {ticket.slaDueAt && (

                      <div className="flex items-center gap-2 rounded-xl bg-orange-100 px-3 py-2 text-xs text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">

                        <Clock3 size={14} />

                        SLA{" "}
                        {
                          new Date(
                            ticket.slaDueAt
                          )
                            .toISOString()
                            .split("T")[0]
                        }

                      </div>

                    )}

                    {ticket.priority ===
                      "URGENT" && (

                      <div className="flex items-center gap-2 rounded-xl bg-red-100 px-3 py-2 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-400">

                        <AlertTriangle size={14} />

                        Urgent

                      </div>

                    )}

                  </div>

                </div>

              </Link>

            )
          )}

        </div>

      </section>

      {/* Pagination */}
      {totalPages > 1 && (

        <div className="flex items-center justify-between">

          <Link
            href={`?page=${Math.max(
              currentPage - 1,
              1
            )}`}

            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm transition ${
              currentPage === 1
                ? "pointer-events-none opacity-50"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >

            <ChevronLeft size={16} />

            Previous

          </Link>

          <p className="text-sm text-zinc-500">

            Page {currentPage} of{" "}
            {totalPages}

          </p>

          <Link
            href={`?page=${Math.min(
              currentPage + 1,
              totalPages
            )}`}

            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm transition ${
              currentPage === totalPages
                ? "pointer-events-none opacity-50"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >

            Next

            <ChevronRight size={16} />

          </Link>

        </div>

      )}

    </div>
  );
}