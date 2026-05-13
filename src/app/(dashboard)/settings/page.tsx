import { ProfileForm } from "@/features/settings/components/profile-form";
import {
    User,
    Shield,
    Trash2,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default async function SettingsPage() {

    const user =
        await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="space-y-8">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Settings
                </h1>

                <p className="mt-2 text-sm text-zinc-500">
                    Manage your account preferences and security.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">

                {/* Sidebar */}
                <Card className="h-fit dark:border-zinc-800 dark:bg-zinc-900">

                    <CardContent className="p-4">

                        <nav className="space-y-2">

                            <button className="flex w-full items-center gap-3 rounded-2xl bg-zinc-100 px-4 py-3 text-sm font-medium dark:bg-zinc-800">
                                <User size={18} />
                                Account
                            </button>

                            <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
                                <Shield size={18} />
                                Security
                            </button>

                            <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-red-600 transition hover:bg-red-50 dark:hover:bg-red-500/10">
                                <Trash2 size={18} />
                                Danger Zone
                            </button>

                        </nav>

                    </CardContent>

                </Card>

                {/* Main Content */}
                <div className="space-y-6 lg:col-span-2">

                    {/* Profile Card */}
                    <Card className="dark:border-zinc-800 dark:bg-zinc-900">

                        <CardHeader>
                            <CardTitle>
                                Profile Information
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-6">

                            {/* Avatar */}
                            <div className="flex items-center gap-4">

                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-xl font-bold text-white dark:bg-white dark:text-black">
                                    {user?.name?.[0] ?? "U"}
                                </div>

                                <div>
                                    <h3 className="font-semibold">
                                        {user?.name}
                                    </h3>

                                    <p className="text-sm text-zinc-500">
                                        {user?.email}
                                    </p>
                                </div>

                            </div>

                            <ProfileForm
                                user={{
                                    id: user.id,
                                    name: user.name ?? "",
                                    email: user.email,
                                    role: user.role,

                                    phone: user.phone,
                                    company: user.company,
                                    location: user.location,
                                    jobTitle: user.jobTitle,
                                    bio: user.bio,
                                }}
                            />
                        </CardContent>

                    </Card>

                </div>

            </div>
        </div>
    );
}