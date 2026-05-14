import { TicketPriority } from "@prisma/client";

export function calculateSlaDueDate(
    priority: TicketPriority
) {

    const now = new Date();

    switch (priority) {

        case "LOW":
            return new Date(
                now.getTime() +
                72 * 60 * 60 * 1000
            );

        case "MEDIUM":
            return new Date(
                now.getTime() +
                24 * 60 * 60 * 1000
            );

        case "HIGH":
            return new Date(
                now.getTime() +
                8 * 60 * 60 * 1000
            );

        case "URGENT":
            return new Date(
                now.getTime() +
                2 * 60 * 60 * 1000
            );

        default:
            return new Date(
                now.getTime() +
                24 * 60 * 60 * 1000
            );
    }
}