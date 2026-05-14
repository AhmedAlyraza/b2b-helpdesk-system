import { notFound } from "next/navigation";

import { db } from "@/lib/db";

import { AcceptInviteForm } from "@/features/team/components/accept-invite-form";

interface InvitePageProps {
    params: Promise<{
        token: string;
    }>;
}

export default async function InvitePage({
    params,
}: InvitePageProps) {

    const { token } =
        await params;

    const invite =
        await db.invite.findUnique({
            where: {
                token,
            },

            include: {
                organization: true,
            },
        });

    if (
        !invite ||
        invite.accepted
    ) {
        notFound();
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-6 dark:bg-zinc-950">

            <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

                <div className="mb-8 text-center">

                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        Accept Invite
                    </h1>

                    <p className="mt-3 text-sm text-zinc-500">
                        You were invited to join{" "}
                        <span className="font-semibold">
                            {invite.organization.name}
                        </span>
                    </p>

                </div>

                <AcceptInviteForm
                    token={invite.token}
                    email={invite.email}
                    role={invite.role}
                />

            </div>

        </div>
    );
}