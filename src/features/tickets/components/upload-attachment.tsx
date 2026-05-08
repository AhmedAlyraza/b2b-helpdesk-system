"use client";

import { useState } from "react";

import { Upload } from "lucide-react";

interface UploadAttachmentProps {
    ticketId: string;
}

export function UploadAttachment({
    ticketId,
}: UploadAttachmentProps) {
    const [loading, setLoading] =
        useState(false);

    async function handleUpload(
        file: File
    ) {
        try {
            setLoading(true);

            const formData =
                new FormData();

            formData.append(
                "file",
                file
            );

            const res = await fetch(
                `/api/tickets/${ticketId}/attachments`,
                {
                    method: "POST",

                    credentials: "include",

                    body: formData,
                }
            );

            if (!res.ok) {
                const error =
                    await res.json();

                console.error(error);

                return;
            }

            window.location.reload();

        } catch (error) {
            console.error(error);

        } finally {
            setLoading(false);
        }
    }

    return (
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
            <Upload size={16} />

            {loading
                ? "Uploading..."
                : "Upload Attachment"}

            <input
                type="file"
                hidden
                onChange={(e) => {
                    const file =
                        e.target.files?.[0];

                    if (file) {
                        handleUpload(file);
                    }
                }}
            />
        </label>
    );
}