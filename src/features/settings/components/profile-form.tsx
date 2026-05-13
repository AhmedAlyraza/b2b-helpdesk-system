"use client";

import { useState } from "react";

interface ProfileFormProps {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;

        phone?: string | null;
        company?: string | null;
        location?: string | null;
        jobTitle?: string | null;
        bio?: string | null;
    };
}

export function ProfileForm({
    user,
}: ProfileFormProps) {

    const [formData, setFormData] =
        useState({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            company: user.company || "",
            location: user.location || "",
            jobTitle: user.jobTitle || "",
            bio: user.bio || "",
        });

    const [loading, setLoading] =
        useState(false);

    const [success, setSuccess] =
        useState("");

    async function handleSubmit(
        e: React.FormEvent
    ) {

        e.preventDefault();

        try {

            setLoading(true);

            setSuccess("");

            const response =
                await fetch(
                    "/api/user/update",
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify(
                            formData
                        ),
                    }
                );

            if (!response.ok) {
                throw new Error(
                    "Failed to update profile"
                );
            }

            setSuccess(
                "Profile updated successfully"
            );

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >

            {/* Grid */}
            <div className="grid gap-4 md:grid-cols-2">

                {/* Name */}
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Full Name
                    </label>

                    <input
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                name: e.target.value,
                            })
                        }
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Email Address
                    </label>

                    <input
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                email: e.target.value,
                            })
                        }
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Phone
                    </label>

                    <input
                        value={formData.phone}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                phone: e.target.value,
                            })
                        }
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
                    />
                </div>

                {/* Company */}
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Company
                    </label>

                    <input
                        value={formData.company}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                company: e.target.value,
                            })
                        }
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
                    />
                </div>

                {/* Location */}
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Location
                    </label>

                    <input
                        value={formData.location}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                location: e.target.value,
                            })
                        }
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
                    />
                </div>

                {/* Job */}
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Job Title
                    </label>

                    <input
                        value={formData.jobTitle}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                jobTitle: e.target.value,
                            })
                        }
                        className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
                    />
                </div>

            </div>

            {/* Bio */}
            <div>
                <label className="mb-2 block text-sm font-medium">
                    Bio
                </label>

                <textarea
                    rows={5}
                    value={formData.bio}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            bio: e.target.value,
                        })
                    }
                    className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
                />
            </div>

            {/* Role */}
            <div>

                <label className="mb-2 block text-sm font-medium">
                    Role
                </label>

                <div className="inline-flex rounded-full bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                    {user.role}
                </div>

            </div>

            {/* Success */}
            {success && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-300">
                    {success}
                </div>
            )}

            {/* Submit */}
            <button
                disabled={loading}
                className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
            >
                {loading
                    ? "Saving..."
                    : "Save Changes"}
            </button>

        </form>
    );
}