import Link from "next/link";

import {
  ArrowLeft,
  Mail,
  Building2,
  MapPin,
  Briefcase,
  Ticket,
  Clock3,
} from "lucide-react";

import {
  redirect,
  notFound,
} from "next/navigation";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/rbac";

interface CustomerDetailsPageProps {
  params: Promise<{
    customerId: string;
  }>;
}

type CustomerTicket = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: Date;
  assignedTo: {
    name: string | null;
    email: string;
  } | null;
};

export default async function CustomerDetailsPage({
  params,
}: CustomerDetailsPageProps) {
  const currentUser =
    await requireRole([
      "ADMIN",
      "AGENT",
    ]);

  if (!currentUser) {
    redirect("/dashboard");
  }

  const organizationId =
    currentUser.organizationId || undefined;

  const { customerId } =
    await params;

  const customer =
    await db.user.findFirst({
      where: {
        id: customerId,
        organizationId,
        role: "CUSTOMER",
      },

      include: {
        createdTickets: {
          include: {
            assignedTo: true,
          },

          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

  if (!customer) {
    notFound();
  }

  const customerTickets =
    customer.createdTickets as CustomerTicket[];

  const totalTickets =
    customerTickets.length;

  const openTickets =
    customerTickets.filter(
      (ticket: CustomerTicket) =>
        ticket.status === "OPEN"
    ).length;

  const resolvedTickets =
    customerTickets.filter(
      (ticket: CustomerTicket) =>
        ticket.status === "RESOLVED"
    ).length;

  return (
    <div className="space-y-8">
      <Link
        href="/customers"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-900 dark:hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to Customers
      </Link>

      <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black text-2xl font-bold text-white dark:bg-white dark:text-black">
              {customer.email.charAt(0).toUpperCase()}
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {customer.name || "Unnamed Customer"}
              </h1>

              <p className="mt-2 text-zinc-500">
                {customer.email}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <p className="text-sm text-zinc-500">
                Total Tickets
              </p>

              <h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
                {totalTickets}
              </h2>
            </div>

            <div className="rounded-2xl border border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <p className="text-sm text-zinc-500">
                Open Tickets
              </p>

              <h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
                {openTickets}
              </h2>
            </div>

            <div className="rounded-2xl border border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <p className="text-sm text-zinc-500">
                Resolved
              </p>

              <h2 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
                {resolvedTickets}
              </h2>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-5 text-lg font-semibold text-zinc-900 dark:text-white">
              Customer Information
            </h2>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <Mail
                  size={18}
                  className="mt-0.5 text-zinc-500"
                />

                <div>
                  <p className="text-xs text-zinc-500">
                    Email
                  </p>

                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {customer.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2
                  size={18}
                  className="mt-0.5 text-zinc-500"
                />

                <div>
                  <p className="text-xs text-zinc-500">
                    Company
                  </p>

                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {customer.company || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="mt-0.5 text-zinc-500"
                />

                <div>
                  <p className="text-xs text-zinc-500">
                    Location
                  </p>

                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {customer.location || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase
                  size={18}
                  className="mt-0.5 text-zinc-500"
                />

                <div>
                  <p className="text-xs text-zinc-500">
                    Job Title
                  </p>

                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {customer.jobTitle || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock3
                  size={18}
                  className="mt-0.5 text-zinc-500"
                />

                <div>
                  <p className="text-xs text-zinc-500">
                    Joined
                  </p>

                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {
                      new Date(customer.createdAt)
                        .toISOString()
                        .split("T")[0]
                    }
                  </p>
                </div>
              </div>
            </div>
          </section>
        </aside>

        <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <Ticket
                size={18}
                className="text-zinc-500"
              />

              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Ticket History
              </h2>
            </div>
          </div>

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {customerTickets.length === 0 && (
              <div className="px-6 py-16 text-center">
                <p className="text-sm text-zinc-500">
                  No tickets found.
                </p>
              </div>
            )}

            {customerTickets.map((ticket: CustomerTicket) => (
              <Link
                key={ticket.id}
                href={`/tickets/${ticket.id}`}
                className="block px-6 py-5 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-semibold text-zinc-900 dark:text-white">
                        {ticket.title}
                      </h3>

                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {ticket.status.replace("_", " ")}
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-2 text-sm text-zinc-500">
                      {ticket.description}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      {ticket.assignedTo?.name ||
                        ticket.assignedTo?.email ||
                        "Unassigned"}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {
                        new Date(ticket.createdAt)
                          .toISOString()
                          .split("T")[0]
                      }
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}