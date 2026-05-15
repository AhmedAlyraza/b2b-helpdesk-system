import { db } from "@/lib/db";

interface ProcessMentionsProps {
  commentId: string;

  message: string;

  organizationId: string;

  authorId: string;

  ticketId: string;
}

type MentionUser = {
  id: string;
  email: string;
};

export async function processMentions({
  commentId,
  message,
  organizationId,
  authorId,
  ticketId,
}: ProcessMentionsProps) {


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
      (mention: string) =>
        mention
          .replace("@", "")
          .toLowerCase()
    );


  const users =
    await db.user.findMany({
      where: {
        organizationId,

        id: {
          not: authorId,
        },

        OR: usernames.map(
          (
            username: string
          ) => ({
            email: {
              startsWith:
                username,

              mode:
                "insensitive",
            },
          })
        ),
      },
    }) as MentionUser[];

  if (users.length === 0) {
    return;
  }


  await db.mention.createMany({
    data: users.map(
      (
        user: MentionUser
      ) => ({
        commentId,

        mentionedUserId:
          user.id,
      })
    ),

    skipDuplicates: true,
  });


  await db.notification.createMany({
    data: users.map(
      (
        user: MentionUser
      ) => ({
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