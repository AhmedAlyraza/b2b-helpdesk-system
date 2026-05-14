import { db } from "@/lib/db";

interface ProcessMentionsProps {
    commentId: string;

    message: string;

    organizationId: string;

    authorId: string;

    ticketId: string;
}

export async function processMentions({
    commentId,
    message,
    organizationId,
    authorId,
    ticketId,
}: ProcessMentionsProps) {

    // =========================
    // FIND @mentions
    // =========================
    const mentionMatches =
        message.match(
            /@([a-zA-Z0-9._-]+)/g
        ) || [];

    if (
        mentionMatches.length === 0
    ) {
        return;
    }

    const usernames =
        mentionMatches.map(
            (mention) =>
                mention
                    .replace("@", "")
                    .toLowerCase()
        );

    // =========================
    // FIND USERS
    // =========================
    const users =
        await db.user.findMany({
            where: {
                organizationId,

                id: {
                    not: authorId,
                },

                OR: usernames.map(
                    (username) => ({
                        email: {
                            startsWith:
                                username,
                            mode:
                                "insensitive",
                        },
                    })
                ),
            },
        });

    if (users.length === 0) {
        return;
    }

    // =========================
    // CREATE MENTIONS
    // =========================
    await db.mention.createMany({
        data: users.map(
            (user) => ({
                commentId,

                mentionedUserId:
                    user.id,
            })
        ),

        skipDuplicates: true,
    });

    // =========================
    // CREATE NOTIFICATIONS
    // =========================
    await db.notification.createMany({
        data: users.map(
            (user) => ({
                userId: user.id,

                title:
                    "You were mentioned",

                message:
                    "You were mentioned in a ticket comment",

                ticketId,
            })
        ),
    });
}