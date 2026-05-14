import {
  notFound,
  redirect,
} from "next/navigation";

import {
  Clock3,
  AlertCircle,
  CheckCircle2,
  Paperclip,
  MessageSquare,
  Activity,
} from "lucide-react";

import { db } from "@/lib/db";
import { getCurrentTenantUser } from "@/lib/tenant";

import { CommentForm } from "@/features/comments/components/comment-form";
import { AssignTicketSelect } from "@/features/tickets/components/assign-ticket-select";
import { TicketStatusSelect } from "@/features/tickets/components/ticket-status-select";
import { UploadAttachment } from "@/features/tickets/components/upload-attachment";

interface TicketDetailsPageProps {
  params: Promise<{
    ticketId: string;
  }>;
}

function formatDate(date: Date) {
  return new Date(date)
    .toISOString()
    .split("T")[0];
}

export default async function TicketDetailsPage({
  params,
}: TicketDetailsPageProps) {
  const { ticketId } = await params;

  const user =
    await getCurrentTenantUser();

  if (!user) {
    redirect("/login");
  }

  const ticket =
    await db.ticket.findFirst({
      where: {
        id: ticketId,
        organizationId:
          user.organizationId,
      },

      include: {
        assignedTo: true,
        createdBy: true,

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

  if (!ticket) {
    notFound();
  }

  const agents =
    await db.user.findMany({
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

  const canManageTicket =
    user.role === "ADMIN" ||
    user.role === "AGENT";

  return (
    <div className="space-y-8">

      {/* Header */}
      <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">

          <div className="min-w-0 flex-1 space-y-4">

            <div className="flex flex-wrap items-center gap-3">

              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {ticket.title}
              </h1>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  ticket.status === "OPEN"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                    : ticket.status === "IN_PROGRESS"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400"
                    : ticket.status === "RESOLVED"
                    ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                    : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                }`}
              >
                {ticket.status.replace("_", " ")}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  ticket.priority === "URGENT"
                    ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                    : ticket.priority === "HIGH"
                    ? "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400"
                    : ticket.priority === "MEDIUM"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                    : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                }`}
              >
                {ticket.priority}
              </span>

            </div>

            <p className="max-w-3xl whitespace-pre-wrap leading-7 text-zinc-600 dark:text-zinc-400">
              {ticket.description}
            </p>

          </div>

          {/* Controls */}
          {canManageTicket && (
            <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950 lg:min-w-[280px]">

              <AssignTicketSelect
                ticketId={ticket.id}
                currentAssigneeId={
                  ticket.assignedToId
                }
                agents={agents}
              />

              <TicketStatusSelect
                ticketId={ticket.id}
                currentStatus={
                  ticket.status
                }
              />

            </div>
          )}

        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

        {/* Main Column */}
        <div className="space-y-8">

          {/* Comments */}
          <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

            <div className="mb-6 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <MessageSquare
                  size={20}
                  className="text-zinc-500"
                />

                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                  Conversation
                </h2>

              </div>

              <span className="text-sm text-zinc-500">
                {ticket.comments.length} comments
              </span>

            </div>

            <div className="space-y-6">

              <CommentForm
                ticketId={ticket.id}
              />

              {ticket.comments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
                  <p className="text-sm text-zinc-500">
                    No comments yet.
                  </p>
                </div>
              ) : (
                ticket.comments.map(
                  (comment) => (
                    <div
                      key={comment.id}
                      className="flex gap-4"
                    >

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-sm font-semibold text-white dark:bg-white dark:text-black">
                        {comment.author.email
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="flex-1">

                        <div
                          className={`rounded-2xl border p-5 shadow-sm ${
                            comment.isInternal
                              ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"
                              : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                          }`}
                        >

                          <div className="flex flex-wrap items-center gap-3">

                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {comment.author.name ||
                                comment.author.email}
                            </h3>

                            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                              {comment.author.role}
                            </span>

                            {comment.isInternal && (
                              <span className="rounded-full bg-amber-200 px-2.5 py-1 text-[11px] font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                Internal Note
                              </span>
                            )}

                            <span className="text-xs text-zinc-500">
                              {formatDate(
                                comment.createdAt
                              )}
                            </span>

                          </div>

                          <p className="mt-4 whitespace-pre-wrap leading-7 text-zinc-700 dark:text-zinc-300">
                            {comment.message}
                          </p>

                        </div>

                      </div>

                    </div>
                  )
                )
              )}

            </div>

          </section>

          {/* Activity Timeline */}
          <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

            <div className="mb-6 flex items-center gap-3">

              <Activity
                size={20}
                className="text-zinc-500"
              />

              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                Activity Timeline
              </h2>

            </div>

            {ticket.activities.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
                <p className="text-sm text-zinc-500">
                  No activity yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {ticket.activities.map(
                  (activityItem) => (
                    <div
                      key={activityItem.id}
                      className="rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <p className="text-zinc-700 dark:text-zinc-300">
                          <span className="font-semibold">
                            {activityItem.actor.name ||
                              activityItem.actor.email}
                          </span>{" "}
                          {activityItem.message}
                        </p>

                        <span className="shrink-0 text-xs text-zinc-500">
                          {formatDate(
                            activityItem.createdAt
                          )}
                        </span>

                      </div>

                    </div>
                  )
                )}
              </div>
            )}

          </section>

        </div>

        {/* Sidebar */}
        <aside className="space-y-6">

          {/* Ticket Meta */}
          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

            <h2 className="mb-5 text-lg font-semibold text-zinc-900 dark:text-white">
              Ticket Details
            </h2>

            <div className="space-y-5">

              <div className="flex items-start gap-3">

                <Clock3
                  size={18}
                  className="mt-0.5 text-zinc-500"
                />

                <div>

                  <p className="text-xs text-zinc-500">
                    Created
                  </p>

                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {formatDate(
                      ticket.createdAt
                    )}
                  </p>

                </div>

              </div>

              <div className="flex items-start gap-3">

                <AlertCircle
                  size={18}
                  className="mt-0.5 text-zinc-500"
                />

                <div>

                  <p className="text-xs text-zinc-500">
                    Priority
                  </p>

                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {ticket.priority}
                  </p>

                </div>

              </div>

              <div className="flex items-start gap-3">

                <CheckCircle2
                  size={18}
                  className="mt-0.5 text-zinc-500"
                />

                <div>

                  <p className="text-xs text-zinc-500">
                    Status
                  </p>

                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {ticket.status.replace(
                      "_",
                      " "
                    )}
                  </p>

                </div>

              </div>

              <div className="border-t border-zinc-200 pt-5 dark:border-zinc-800">

                <p className="text-xs text-zinc-500">
                  Created By
                </p>

                <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
                  {ticket.createdBy.name ||
                    ticket.createdBy.email}
                </p>

              </div>

              <div>

                <p className="text-xs text-zinc-500">
                  Assigned To
                </p>

                <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-white">
                  {ticket.assignedTo?.name ||
                    ticket.assignedTo?.email ||
                    "Unassigned"}
                </p>

              </div>

            </div>

          </section>

          {/* Attachments */}
          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

            <div className="mb-5 flex items-center gap-3">

              <Paperclip
                size={18}
                className="text-zinc-500"
              />

              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Attachments
              </h2>

            </div>

            <UploadAttachment
              ticketId={ticket.id}
            />

            <div className="mt-5 space-y-3">

              {ticket.attachments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
                  <p className="text-sm text-zinc-500">
                    No attachments uploaded.
                  </p>
                </div>
              ) : (
                ticket.attachments.map(
                  (attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800"
                    >

                      <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                        {attachment.name}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        Uploaded by{" "}
                        {attachment.uploader.name ||
                          attachment.uploader.email}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {(
                          attachment.size / 1024
                        ).toFixed(1)}{" "}
                        KB
                      </p>

                    </a>
                  )
                )
              )}

            </div>

          </section>

        </aside>

      </div>

    </div>
  );
}