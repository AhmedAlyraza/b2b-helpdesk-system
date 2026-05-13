interface StatusBadgeProps {
    status: string;
}

export function StatusBadge({
    status,
}: StatusBadgeProps) {
    const styles = {
        OPEN:
            "bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",

        IN_PROGRESS:
            "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",

        RESOLVED:
            "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",

        CLOSED:
            "bg-zinc-500/10 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300",
    };

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${styles[
                status as keyof typeof styles
                ] ??
                "bg-zinc-100 text-zinc-700"
                }`}
        >
            {status.replace("_", " ")}
        </span>
    );
}