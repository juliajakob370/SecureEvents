// Imports: router hooks, reusable header, and styles.
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import "../../styles/MainPage.css";
import "../../styles/[9.2]TicketBookedConfirmation.css";

// Ticket booked confirmation page.
const TicketBookedConfirmation: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Booking info received from payment page.
    const event = location.state?.event;
    const total = location.state?.total || 0;
    const quantity = location.state?.quantity || 1;

    return (
        <div style={{ padding: "20px" }}>
            <Header centerType="title" title="Booking Confirmed" showHome={true} />

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
                            <p><strong>Tickets:</strong> {quantity}</p>
                            <p><strong>Total Paid:</strong> ${Number(total).toFixed(2)}</p>
                        </div>

                        <div className="confirmation-actions">
                            <button onClick={() => navigate("/tickets")} className="confirmation-btn">
                                View My Tickets
                            </button>

                            <button onClick={() => navigate("/main")} className="confirmation-btn secondary">
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