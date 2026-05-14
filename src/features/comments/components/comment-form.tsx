"use client";

import {
  useRef,
  useState,
} from "react";

import { Send } from "lucide-react";

import { MentionTextarea } from "@/components/ui/mention-textarea";

interface CommentFormProps {
  ticketId: string;
}

export function CommentForm({
  ticketId,
}: CommentFormProps) {

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    isInternal,
    setIsInternal,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  // =========================
  // TYPING DEBOUNCE
  // =========================
  const typingTimeoutRef =
    useRef<NodeJS.Timeout | null>(
      null
    );

  // =========================
  // EMIT TYPING EVENT
  // =========================
  async function emitTyping() {

    try {

      await fetch(
        `/api/tickets/${ticketId}/typing`,
        {
          method: "POST",
        }
      );

    } catch (error) {

      console.error(error);

    }
  }

  // =========================
  // HANDLE MESSAGE CHANGE
  // =========================
  function handleMessageChange(
    value: string
  ) {

    setMessage(value);

    // debounce typing events
    if (
      typingTimeoutRef.current
    ) {

      clearTimeout(
        typingTimeoutRef.current
      );
    }

    typingTimeoutRef.current =
      setTimeout(() => {

        emitTyping();

      }, 300);
  }

  // =========================
  // SUBMIT COMMENT
  // =========================
  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    try {

      setIsSubmitting(true);

      const response =
        await fetch(
          `/api/tickets/${ticketId}/comments`,
          {
            method: "POST",

            credentials:
              "include",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              message,

              isInternal,
            }),
          }
        );

      if (!response.ok) {

        const error =
          await response.json();

        console.error(error);

        return;
      }

      // clear form
      setMessage("");

      setIsInternal(false);

      // no reload needed anymore
      // realtime comments handle updates

    } catch (error) {

      console.error(error);

    } finally {

      setIsSubmitting(false);

    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >

      <MentionTextarea
        value={message}

        onChange={
          handleMessageChange
        }

        rows={6}

        placeholder="Write a reply... Use @ to mention teammates"
      />

      <div className="flex items-center justify-between">

        <label className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">

          <input
            type="checkbox"

            checked={isInternal}

            onChange={(e) =>
              setIsInternal(
                e.target.checked
              )
            }

            className="h-4 w-4 rounded border-zinc-300"
          />

          Internal note

        </label>

      </div>

      <div className="flex justify-end">

        <button
          type="submit"

          disabled={
            isSubmitting ||
            !message.trim()
          }

          className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:scale-[1.02] hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black"
        >

          <Send size={16} />

          {isSubmitting
            ? "Posting reply..."
            : "Send Reply"}

        </button>

      </div>

    </form>
  );
}