


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
import { ApplyMacroSelect } from "@/features/tickets/components/apply-macro-select";
import { RealtimeComments } from "@/features/tickets/components/realtime-comments";
import { TypingIndicator } from "@/features/tickets/components/typing-indicator";
import { ActiveViewers } from "@/features/tickets/components/active-viewers";
import { RealtimeTicketState } from "@/features/tickets/components/realtime-ticket-state";
import { RealtimeActivityFeed } from "@/features/tickets/components/realtime-activity-feed";

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
          in: [
            "ADMIN",
            "AGENT",
          ],
        },
      },

      orderBy: {
        createdAt: "asc",
      },
    });

  const macros =
    await db.ticketMacro.findMany({
      where: {
        userId: user.id,
      },

      orderBy: {
        createdAt: "desc",
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
                className={`rounded-full px-3 py-1 text-xs font-medium ${ticket.status === "OPEN"
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
                className={`rounded-full px-3 py-1 text-xs font-medium ${ticket.priority === "URGENT"
                  ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                  : ticket.priority === "HIGH"
                    ? "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400"
                    : ticket.priority === "MEDIUM"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400"
                      : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
              >
                {ticket.priority}
              </span>

            </div>

            <p className="whitespace-pre-wrap text-base leading-7 text-zinc-600 dark:text-zinc-400">
              {ticket.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500">

              <div className="flex items-center gap-2">
                <Clock3 size={16} />
                Created {formatDate(ticket.createdAt)}
              </div>

              <div className="flex items-center gap-2">
                <AlertCircle size={16} />
                Created by {ticket.createdBy.name || ticket.createdBy.email}
              </div>

              {ticket.slaDueAt && (
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <Clock3 size={16} />
                  SLA Due {formatDate(ticket.slaDueAt)}
                </div>
              )}

            </div>

          </div>

          {canManageTicket && (

            <div className="flex w-full flex-col gap-4 lg:w-[320px]">

              <TicketStatusSelect
                ticketId={ticket.id}
                currentStatus={ticket.status}
              />

              <AssignTicketSelect
                ticketId={ticket.id}
                currentAssigneeId={ticket.assignedToId}
                agents={agents}
              />

            </div>

          )}

        </div>

      </section>

      <RealtimeTicketState
        ticketId={ticket.id}

        initialStatus={
          ticket.status
        }

        initialAssignedTo={
          ticket.assignedTo
            ? {
              id:
                ticket.assignedTo.id,

              name:
                ticket.assignedTo.name ||
                ticket.assignedTo.email,
            }
            : null
        }
      />

      {/* Macros */}
      {canManageTicket && (

        <ApplyMacroSelect
          ticketId={ticket.id}
          macros={macros}
        />

      )}

      {/* Attachments */}
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

        <div className="mb-6 flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <Paperclip className="text-zinc-500" size={20} />

            <div>

              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Attachments
              </h2>

              <p className="text-sm text-zinc-500">
                Upload and manage ticket files.
              </p>

            </div>

          </div>

          <UploadAttachment
            ticketId={ticket.id}
          />

        </div>

        <div className="space-y-3">

          {ticket.attachments.length === 0 && (

            <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
              No attachments uploaded.
            </div>

          )}

          {ticket.attachments.map((attachment) => (

            <a
              key={attachment.id}
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-2xl border border-zinc-200 p-4 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
            >

              <div>

                <p className="font-medium text-zinc-900 dark:text-white">
                  {attachment.name}
                </p>

                <p className="text-xs text-zinc-500">
                  Uploaded by {attachment.uploader.name || attachment.uploader.email}
                </p>

              </div>

              <span className="text-xs text-zinc-500">
                {(attachment.size / 1024).toFixed(1)} KB
              </span>

            </a>

          ))}

        </div>

      </section>

      {/* Comments */}
      <section className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

        <div className="flex items-center gap-3">

          <MessageSquare className="text-zinc-500" size={22} />

          <div>

            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              Discussion
            </h2>

            <p className="text-sm text-zinc-500">
              Realtime collaborative ticket discussion.
            </p>

          </div>

        </div>

        <ActiveViewers
          ticketId={ticket.id}
          currentUserId={user.id}
        />

        <CommentForm
          ticketId={ticket.id}
        />

        <TypingIndicator
          ticketId={ticket.id}
          currentUserId={user.id}
        />

        <RealtimeComments
          ticketId={ticket.id}
          initialComments={ticket.comments}
        />

      </section>

      {/* Activity */}
      <RealtimeActivityFeed
        ticketId={ticket.id}
        initialActivities={
          ticket.activities
        }
      />

    </div>
  );
}

