interface RenderMessageWithMentionsProps {
    message: string;
}

export function RenderMessageWithMentions({
    message,
}: RenderMessageWithMentionsProps) {

    const parts =
        message.split(
            /(@[a-zA-Z0-9._-]+)/g
        );

    return (
        <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-700 dark:text-zinc-300">

            {parts.map(
                (part, index) => {

                    const isMention =
                        part.startsWith("@");

                    if (!isMention) {
                        return (
                            <span key={index}>
                                {part}
                            </span>
                        );
                    }

                    return (
                        <span
                            key={index}
                            className="rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                        >
                            {part}
                        </span>
                    );
                }
            )}

        </p>
    );
}