import Link from "next/link";

import {
    Users,
    ChevronRight,
} from "lucide-react";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";

import { requireRole } from "@/lib/rbac";

interface CustomersPageProps {
    searchParams: Promise<{
        search?: string;
    }>;
}

export default async function CustomersPage({
    searchParams,
}: CustomersPageProps) {

    const user =
        await requireRole([
            "ADMIN",
            "AGENT",
        ]);

    if (!user) {
        redirect("/dashboard");
    }

    const params =
        await searchParams;

    const search =
        params.search || "";

    const customers =
        await db.user.findMany({
            where: {
                organizationId:
                   user.organizationId || undefined,

                role: "CUSTOMER",

                ...(search && {
                    OR: [
                        {
                            name: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },

                        {
                            email: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                    ],
                }),
            },

            include: {
                createdTickets: true,
            },

            orderBy: {
                createdAt: "desc",
            },
        });

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>

                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        Customers
                    </h1>

                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        Manage and view customer accounts.
                    </p>

                </div>

                {/* Search */}
                <form>

                    <input
                        type="text"

                        name="search"

                        defaultValue={search}

                        placeholder="Search customers..."

                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-black dark:border-zinc-700 dark:bg-zinc-900 md:w-[300px]"
                    />

                </form>

            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">

                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-zinc-500">
                                Total Customers
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
                                {customers.length}
                            </h2>

                        </div>

                        <Users className="text-zinc-400" />

                    </div>

                </div>

            </div>

            {/* Customers List */}
            <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">

                    {customers.length === 0 && (

                        <div className="px-6 py-16 text-center">

                            <p className="text-sm text-zinc-500">
                                No customers found.
                            </p>

                        </div>

                    )}

                    {customers.map((customer) => (

                        <Link
                            key={customer.id}
                            href={`/customers/${customer.id}`}
                            className="flex flex-col gap-5 px-6 py-5 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50 md:flex-row md:items-center md:justify-between"
                        >

                            <div className="flex items-center gap-4">

                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-sm font-bold text-white dark:bg-white dark:text-black">

                                    {customer.email
                                        .charAt(0)
                                        .toUpperCase()}

                                </div>

                                <div>

                                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                                        {customer.name ||
                                            "Unnamed Customer"}
                                    </h3>

                                    <p className="text-sm text-zinc-500">
                                        {customer.email}
                                    </p>

                                </div>

                            </div>

                            <div className="flex items-center gap-6">

                                <div className="text-right">

                                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                        {
                                            customer.createdTickets
                                                .length
                                        } tickets
                                    </p>

                                    <p className="text-xs text-zinc-500">
                                        Joined{" "}
                                        {
                                            new Date(
                                                customer.createdAt
                                            )
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                    </p>

                                </div>

                                <ChevronRight
                                    size={18}
                                    className="text-zinc-400"
                                />

                            </div>

                        </Link>

                    ))}

                </div>

            </section>

        </div>
    );
}