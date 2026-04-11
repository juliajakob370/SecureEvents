// Imports: React state, router hooks, reusable header, and styles.
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import "../../styles/MainPage.css";
import "../../styles/[9]GetTicketsPage.css";

// Ticket selection page.
const GetTicketsPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Event data received from EventCard.
    const event = location.state?.event;

    // Quantity state.
    const [quantity, setQuantity] = useState(1);

    // Convert price string into number safely.
    const priceNumber = useMemo(() => {
        if (!event?.price) return 0;
        if (event.price.toLowerCase() === "free") return 0;
        return Number(event.price.replace("$", ""));
    }, [event]);

    // Total price.
    const total = quantity * priceNumber;

    return (
        <div style={{ padding: "20px" }}>
            <Header centerType="title" title="Get Tickets" showHome={true} />

            <div className="events-container">
                <div className="events-scroll tickets-scroll">
                    {!event ? (
                        <div className="ticket-selection-card">
                            <h2>No event selected</h2>
                            <p>Please go back and choose an event first.</p>
                        </div>
                    ) : (
                        <div className="tickets-page-layout">
                            {/* Event info card */}
                            <div className="ticket-event-card">

                                <div className="ticket-event-content">
                                    <img
                                    src={event.image}
                                    alt={event.title}
                                    className="ticket-event-image"
                                    />

                                <div className="ticket-event-info">
                                    <h2>{event.title}</h2>
                                    <p><strong>Organizer:</strong> {event.organizer}</p>
                                    <p><strong>Location:</strong> {event.location}</p>
                                    <p><strong>Date:</strong> {event.dateTime}</p>
                                    <p><strong>Description:</strong> {event.description}</p>
                                    <p><strong>Price per Ticket:</strong> {event.price}</p>
                                </div>
                            </div>

                            {/* Ticket selection card */}
                            <div className="ticket-selection-card">
                                <h3>Select Tickets</h3>

                                <div className="ticket-quantity-row">
                                    <label>Number of Tickets</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                    />
                                </div>

                                <div className="ticket-total-box">
                                    <p>Ticket Price: {event.price}</p>
                                    <p>Quantity: {quantity}</p>
                                    <h3>Total: ${total.toFixed(2)}</h3>
                                </div>

                                <button
                                    className="proceed-payment-btn"
                                    onClick={() =>
                                        navigate("/payment", {
                                            state: {
                                                event,
                                                quantity,
                                                total
                                            }
                                        })
                                    }
                                >
                                    Proceed to Payment
                                </button>
                            </div>
                        </div>
                    </div>
                    )}
                </div>
                
            </div>
        </div>
    );
};

export default GetTicketsPage;