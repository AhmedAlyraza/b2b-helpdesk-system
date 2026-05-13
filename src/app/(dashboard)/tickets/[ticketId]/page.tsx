import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { CommentForm } from "@/features/comments/components/comment-form";
import { AssignTicketSelect } from "@/features/tickets/components/assign-ticket-select";
import { TicketStatusSelect } from "@/features/tickets/components/ticket-status-select";
import { UploadAttachment } from "@/features/tickets/components/upload-attachment";

import {
  Clock3,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { db } from "@/lib/db";
import { getCurrentTenantUser } from "@/lib/tenant";

interface TicketDetailsPageProps {
  params: Promise<{
    ticketId: string;
  }>;
}

export default async function TicketDetailsPage({
  params,
}: TicketDetailsPageProps) {
  const { ticketId } = await params;

  const user = await getCurrentTenantUser();
  if (!user) {
    redirect("/login");
  }
  const ticket = await db.ticket.findFirst({
    where: {
      id: ticketId,
      organizationId: user.organizationId,
    },

    include: {
      assignedTo: true,

      comments: {
        include: {
          author: true,
        },

        orderBy: {
          createdAt: "asc",
        },
      },

      activities: {
        include: {
          actor: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      },

      attachments: {
        include: {
          uploader: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  const agents = await db.user.findMany({
    where: {
      organizationId:
        user.organizationId,

      role: {
        in: ["ADMIN", "AGENT"],
      },
    },

    orderBy: {
      createdAt: "asc",
    },
  });

  if (!ticket) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {ticket.title}
              </h1>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${ticket.status === "OPEN"
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

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${ticket.priority === "URGENT"
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

            <p className="max-w-3xl leading-7 text-zinc-600 dark:text-zinc-400">
              {ticket.description}
            </p>
          </div>

          {/* Ticket Meta */}
          <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-3">
              <Clock3
                size={18}
                className="text-zinc-500"
              />

              <div>
                <p className="text-xs text-zinc-500">
                  Created
                </p>

                <p className="text-sm font-medium">
                  {new Date(ticket.createdAt)
                    .toISOString()
                    .split("T")[0]}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <AlertCircle
                size={18}
                className="text-zinc-500"
              />

              <div>
                <p className="text-xs text-zinc-500">
                  Priority
                </p>

                <p className="text-sm font-medium">
                  {ticket.priority}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle2
                size={18}
                className="text-zinc-500"
              />

              <div>
                <p className="text-xs text-zinc-500">
                  Status
                </p>

                <p className="text-sm font-medium">
                  {ticket.status.replace(
                    "_",
                    " "
                  )}
                </p>
              </div>

              <AssignTicketSelect
                ticketId={ticket.id}
                currentAssigneeId={
                  ticket.assignedToId
                }
                agents={agents}
              />
              <TicketStatusSelect
                ticketId={ticket.id}
                currentStatus={ticket.status}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Placeholder */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-xl font-semibold">
          Activity
        </h2>

        <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
          <div className="space-y-6 text-zinc-500">

            <UploadAttachment
              ticketId={ticket.id}
            />

            {ticket.attachments.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  Attachments
                </h3>

                <div className="space-y-3">
                  {ticket.attachments.map(
                    (attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.url}
                        target="_blank"
                        className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-5 py-4 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                      >
                        <div>
                          <p className="font-medium">
                            {attachment.name}
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            Uploaded by{" "}
                            {
                              attachment
                                .uploader
                                .email
                            }
                          </p>
                        </div>

                        <span className="text-xs text-zinc-500">
                          {(
                            attachment.size /
                            1024
                          ).toFixed(1)}{" "}
                          KB
                        </span>
                      </a>
                    )
                  )}
                </div>
              </div>
            )}
            <CommentForm
              ticketId={ticket.id}
            />

            {ticket.activities.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  Activity
                </h3>

                <div className="space-y-3">
                  {ticket.activities.map(
                    (activity) => (
                      <div
                        key={activity.id}
                        className="rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-zinc-700 dark:text-zinc-300">
                            <span className="font-semibold">
                              {
                                activity.actor
                                  .email
                              }
                            </span>{" "}
                            {activity.message}
                          </p>

                          <span className="text-xs text-zinc-500">
                            {new Date(activity.createdAt)
                              .toISOString()
                              .split("T")[0]}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="space-y-8">
              {ticket.comments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
                  <p className="text-zinc-500">
                    No comments yet.
                  </p>
                </div>
              ) : (
                ticket.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex gap-4"
                  >
                    {/* Avatar */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-sm font-semibold text-white dark:bg-white dark:text-black">
                      {comment.author.email
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className={`rounded-2xl border p-5 shadow-sm ${comment.isInternal
                        ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"
                        : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                        }`}>
                        {/* Top */}
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {comment.author.email}
                          </h3>

                          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            Support Agent
                          </span>
                          {comment.isInternal && (
                            <span className="rounded-full bg-amber-200 px-2.5 py-1 text-[11px] font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                              Internal Note
                            </span>
                          )}
                          <span className="text-xs text-zinc-500">
                            {new Date(comment.createdAt)
                              .toISOString()
                              .split("T")[0]}
                          </span>
                        </div>

                        {/* Message */}
                        <div className="mt-4">
                          <p className="whitespace-pre-wrap leading-7 text-zinc-700 dark:text-zinc-300">
                            {comment.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}