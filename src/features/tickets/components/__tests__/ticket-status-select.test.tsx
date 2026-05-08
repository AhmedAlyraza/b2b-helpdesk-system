import { render, screen } from "@testing-library/react";

import { TicketStatusSelect } from "../ticket-status-select";

describe(
    "TicketStatusSelect",
    () => {
        it(
            "renders current status",
            () => {
                render(
                    <TicketStatusSelect
                        ticketId="123"
                        currentStatus="OPEN"
                    />
                );

                expect(
                    screen.getByDisplayValue(
                        "OPEN"
                    )
                ).toBeInTheDocument();
            }
        );
    }
);