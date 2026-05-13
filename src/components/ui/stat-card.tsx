import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
}

export function StatCard({
    title,
    value,
    description,
    icon: Icon,
}: StatCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-[28px] border border-white/50 bg-white/70 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:border-zinc-800/80 dark:bg-zinc-900/70">

            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] via-transparent to-violet-500/[0.03]" />

            <div className="relative flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        {title}
                    </p>

                    <h3 className="mt-4 text-5xl font-bold tracking-tight text-zinc-950 dark:text-white">
                        {value}
                    </h3>

                    {description && (
                        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                            {description}
                        </p>
                    )}
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 transition group-hover:scale-110 dark:bg-blue-500/15 dark:text-blue-400">
                    <Icon size={22} />
                </div>
            </div>
        </div>
    );
}