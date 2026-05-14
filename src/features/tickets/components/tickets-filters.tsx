"use client";

import { useRouter } from "next/navigation";

interface TicketsFiltersProps {
  search: string;

  status: string;

  priority: string;

  assignee: string;

  sort: string;

  agents: {
    id: string;
    name: string | null;
    email: string;
  }[];
}

export function TicketsFilters({
  search,
  status,
  priority,
  assignee,
  sort,
  agents,
}: TicketsFiltersProps) {

  const router =
    useRouter();

  function updateFilter(
    key: string,
    value: string
  ) {

    const params =
      new URLSearchParams();

    if (
      key === "search"
        ? value
        : search
    ) {
      params.set(
        "search",
        key === "search"
          ? value
          : search
      );
    }

    if (
      key === "status"
        ? value
        : status
    ) {
      params.set(
        "status",
        key === "status"
          ? value
          : status
      );
    }

    if (
      key === "priority"
        ? value
        : priority
    ) {
      params.set(
        "priority",
        key === "priority"
          ? value
          : priority
      );
    }

    if (
      key === "assignee"
        ? value
        : assignee
    ) {
      params.set(
        "assignee",
        key === "assignee"
          ? value
          : assignee
      );
    }

    if (
      key === "sort"
        ? value
        : sort
    ) {
      params.set(
        "sort",
        key === "sort"
          ? value
          : sort
      );
    }

    router.push(
      `/tickets?${params.toString()}`
    );
  }

  return (
    <div className="grid gap-4 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-5">

      {/* Search */}
      <input
        type="text"

        defaultValue={search}

        placeholder="Search tickets..."

        onChange={(e) =>
          updateFilter(
            "search",
            e.target.value
          )
        }

        className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-950"
      />

      {/* Status */}
      <select
        value={status}

        onChange={(e) =>
          updateFilter(
            "status",
            e.target.value
          )
        }

        className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-950"
      >

        <option value="">
          All Statuses
        </option>

        <option value="OPEN">
          OPEN
        </option>

        <option value="IN_PROGRESS">
          IN PROGRESS
        </option>

        <option value="RESOLVED">
          RESOLVED
        </option>

        <option value="CLOSED">
          CLOSED
        </option>

      </select>

      {/* Priority */}
      <select
        value={priority}

        onChange={(e) =>
          updateFilter(
            "priority",
            e.target.value
          )
        }

        className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-950"
      >

        <option value="">
          All Priorities
        </option>

        <option value="LOW">
          LOW
        </option>

        <option value="MEDIUM">
          MEDIUM
        </option>

        <option value="HIGH">
          HIGH
        </option>

        <option value="URGENT">
          URGENT
        </option>

      </select>

      {/* Assignee */}
      <select
        value={assignee}

        onChange={(e) =>
          updateFilter(
            "assignee",
            e.target.value
          )
        }

        className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-950"
      >

        <option value="">
          All Assignees
        </option>

        <option value="unassigned">
          Unassigned
        </option>

        {agents.map((agent) => (

          <option
            key={agent.id}
            value={agent.id}
          >
            {agent.name ||
              agent.email}
          </option>

        ))}

      </select>

      {/* Sort */}
      <select
        value={sort}

        onChange={(e) =>
          updateFilter(
            "sort",
            e.target.value
          )
        }

        className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-950"
      >

        <option value="newest">
          Newest
        </option>

        <option value="oldest">
          Oldest
        </option>

        <option value="priority">
          Priority
        </option>

        <option value="sla">
          SLA Urgency
        </option>

      </select>

    </div>
  );
}