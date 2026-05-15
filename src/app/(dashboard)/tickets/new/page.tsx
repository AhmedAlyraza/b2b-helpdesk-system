export const dynamic = "force-dynamic";

import { CreateTicketForm } from "@/features/tickets/components/create-ticket-form";

export default function NewTicketPage() {

  return (
    <div className="mx-auto max-w-3xl">

      {/* Header */}
      <div className="mb-8">

        <h1 className="text-3xl font-bold tracking-tight">
          Create Ticket
        </h1>

        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Submit a new support request for your
          team.
        </p>

      </div>

      <CreateTicketForm />

    </div>
  );
}