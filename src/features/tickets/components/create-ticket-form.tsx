"use client";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  AlertCircle,
  Flag,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { FormField } from "@/components/forms/form-field";

import {
  createTicketSchema,
  CreateTicketSchema,
} from "@/features/tickets/validation/create-ticket-schema";

export function CreateTicketForm() {

  const {
    register,
    handleSubmit,

    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<CreateTicketSchema>({
    resolver:
      zodResolver(
        createTicketSchema
      ),
  });

  const onSubmit = async (
    data: CreateTicketSchema
  ) => {

    const res =
      await fetch(
        "/api/tickets",
        {
          method: "POST",

          credentials:
            "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(data),
        }
      );

    const result =
      await res.json();

    console.log(result);
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

      {/* Top Accent */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-violet-600" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 p-8"
      >

        {/* Title */}
        <FormField
          label="Title"
          error={
            errors.title?.message
          }
        >

          <div className="relative">

            <FileText
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <Input
              {...register("title")}
              placeholder="Payment issue with invoice"
              className="h-12 rounded-xl border-zinc-200 pl-11 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950"
            />

          </div>

        </FormField>

        {/* Description */}
        <FormField
          label="Description"
          error={
            errors.description
              ?.message
          }
        >

          <textarea
            {...register(
              "description"
            )}
            rows={7}
            placeholder="Describe the issue in detail..."
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-700 dark:bg-zinc-950"
          />

        </FormField>

        {/* Priority */}
        <FormField
          label="Priority"
          error={
            errors.priority?.message
          }
        >

          <div className="relative">

            <Flag
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <select
              {...register(
                "priority"
              )}
              className="h-12 w-full appearance-none rounded-xl border border-zinc-200 bg-white pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-700 dark:bg-zinc-950"
            >

              <option value="MEDIUM">
                Medium Priority
              </option>

              <option value="LOW">
                Low Priority
              </option>

              <option value="HIGH">
                High Priority
              </option>

              <option value="URGENT">
                Urgent Priority
              </option>

            </select>

          </div>

        </FormField>

        {/* Notice */}
        <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">

          <AlertCircle
            size={18}
            className="mt-0.5 text-blue-600 dark:text-blue-400"
          />

          <div>

            <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
              Support Notice
            </p>

            <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
              High and urgent tickets are
              prioritized automatically by the
              support team.
            </p>

          </div>

        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">

          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
          >
            Cancel
          </Button>

          <Button
            disabled={
              isSubmitting
            }
            className="h-11 rounded-xl bg-black px-6 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >

            {isSubmitting
              ? "Creating Ticket..."
              : "Create Ticket"}

          </Button>

        </div>

      </form>

    </div>
  );
}