// Imports: React effect, router hooks, reusable header, and styles.
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import "../../styles/MainPage.css";
import "../../styles/[9.2]TicketBookedConfirmation.css";

// Type for selected event.
type SelectedEvent = {
    title: string;
    organizer: string;
    location: string;
    price: string;
    image: string;
    date: string;
    time: string;
    description: string;
    status: string;
    capacity: number;
};

// Type for stored booking.
type TicketRecord = {
    id: number;
    event: SelectedEvent;
    quantity: number;
    total: number;
    bookedAt: string;
};

// Ticket confirmation page.
const TicketBookedConfirmation: React.FC = () => {
    // Router tools.
    const navigate = useNavigate();
    const location = useLocation();

    // Booking data received from payment page.
    const event = location.state?.event as SelectedEvent | undefined;
    const quantity = location.state?.quantity || 1;
    const total = location.state?.total || 0;

    // Save confirmed booking to localStorage.
    useEffect(() => {
        if (!event) return;

        const existingTickets = localStorage.getItem("secureEventsTickets");
        const parsedTickets: TicketRecord[] = existingTickets ? JSON.parse(existingTickets) : [];

        const newTicket: TicketRecord = {
            id: Date.now(),
            event,
            quantity,
            total,
            bookedAt: new Date().toISOString()
        };

        localStorage.setItem(
            "secureEventsTickets",
            JSON.stringify([...parsedTickets, newTicket])
        );
    }, [event, quantity, total]);

    return (
        <div style={{ padding: "20px" }}>
            {/* Header */}
            <Header centerType="title" title="Booking Confirmed" showHome={true} />

            {/* Main container */}
            <div className="events-container">
                <div className="events-scroll confirmation-scroll">
                    <div className="confirmation-card">
                        <div className="confirmation-check">✓</div>

                        <h2>Your Ticket Has Been Booked!</h2>

                        <p>
                            Thank you for your purchase. Your booking has been successfully confirmed.
                        </p>

                        <div className="confirmation-details">
                            <p><strong>Event:</strong> {event?.title || "Selected Event"}</p>
                            <p><strong>Organizer:</strong> {event?.organizer || "Organizer"}</p>
                            <p><strong>Date:</strong> {event?.date || "N/A"}</p>
                            <p><strong>Time:</strong> {event?.time || "N/A"}</p>
                            <p><strong>Tickets:</strong> {quantity}</p>
                            <p><strong>Total Paid:</strong> ${Number(total).toFixed(2)}</p>
                        </div>

                        <div className="confirmation-actions">
                            <button
                                onClick={() => navigate("/tickets")}
                                className="confirmation-btn"
                            >
                                View My Tickets
                            </button>

                            <button
                                onClick={() => navigate("/main")}
                                className="confirmation-btn secondary"
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketBookedConfirmation;