import { Ticket } from "@prisma/client";

export function isTicketOverdue(
    ticket: Pick<
        Ticket,
        "slaDueAt" | "status"
    >
) {

    // resolved/closed tickets
    // are never overdue
    if (
        ticket.status === "RESOLVED" ||
        ticket.status === "CLOSED"
    ) {
        return false;
    }

    if (!ticket.slaDueAt) {
        return false;
    }

    return (
        new Date(ticket.slaDueAt) <
        new Date()
    );
}

export function getRemainingSlaTime(
    slaDueAt: Date | null
) {

    if (!slaDueAt) {
        return null;
    }

    const now =
        new Date().getTime();

    const due =
        new Date(slaDueAt).getTime();

    const diff =
        due - now;

    if (diff <= 0) {
        return "Overdue";
    }

    const hours =
        Math.floor(
            diff /
            (1000 * 60 * 60)
        );

    if (hours < 1) {

        const minutes =
            Math.floor(
                diff /
                (1000 * 60)
            );

        return `${minutes}m left`;
    }

    if (hours < 24) {
        return `${hours}h left`;
    }

    const days =
        Math.floor(hours / 24);

    return `${days}d left`;
}