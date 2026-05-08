export default function TicketsLoading() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Header */}
            <div className="space-y-3">
                <div className="h-10 w-56 rounded-xl bg-zinc-200 dark:bg-zinc-800" />

                <div className="h-4 w-80 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            </div>

            {/* Filters */}
            <div className="grid gap-4 rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-3">
                <div className="h-12 rounded-xl bg-zinc-200 dark:bg-zinc-800" />

                <div className="h-12 rounded-xl bg-zinc-200 dark:bg-zinc-800" />

                <div className="h-12 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            </div>

            {/* Ticket Cards */}
            <div className="space-y-4">
                {Array.from({
                    length: 6,
                }).map((_, index) => (
                    <div
                        key={index}
                        className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                        <div className="space-y-4">
                            <div className="h-6 w-1/3 rounded-lg bg-zinc-200 dark:bg-zinc-800" />

                            <div className="h-4 w-2/3 rounded-lg bg-zinc-200 dark:bg-zinc-800" />

                            <div className="flex gap-3">
                                <div className="h-8 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800" />

                                <div className="h-8 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}