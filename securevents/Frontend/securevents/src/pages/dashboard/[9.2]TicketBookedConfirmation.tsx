// Imports: router hooks, reusable header, and styles.
import React from "react";
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

// Ticket confirmation page.
const TicketBookedConfirmation: React.FC = () => {
  // Router tools.
  const navigate = useNavigate();
  const location = useLocation();

  // Booking data received from payment page.
  const event = location.state?.event as SelectedEvent | undefined;
  const quantity = location.state?.quantity || 1;
  const total = location.state?.total || 0;
  const transactionId = location.state?.transactionId as number | undefined;

  return (
    <div style={{ padding: "20px" }}>
      {/* Header */}
      <Header centerType="title" title="Booking Confirmed" showHome={true} />

      {/* Main container */}
      <div className="events-container">
        <div className="events-scroll confirmation-scroll">
          <div className="confirmation-card">
            <div className="confirmation-check">&#10003;</div>

            <h2>Your Ticket Has Been Booked!</h2>

            <p>
              Thank you for your purchase. Your booking has been successfully
              confirmed.
            </p>

            <div className="confirmation-details">
              <p>
                <strong>Event:</strong> {event?.title || "Selected Event"}
              </p>
              <p>
                <strong>Organizer:</strong> {event?.organizer || "Organizer"}
              </p>
              <p>
                <strong>Date:</strong> {event?.date || "N/A"}
              </p>
              <p>
                <strong>Time:</strong> {event?.time || "N/A"}
              </p>
              <p>
                <strong>Tickets:</strong> {quantity}
              </p>
              <p>
                <strong>Total Paid:</strong> ${Number(total).toFixed(2)}
              </p>
              {transactionId && (
                <p>
                  <strong>Transaction ID:</strong> #{transactionId}
                </p>
              )}
            </div>

            <div className="confirmation-actions">
              <button
                onClick={() => navigate("/main")}
                className="confirmation-btn"
              >
                Back to Dashboard
              </button>

              <button
                onClick={() => navigate("/my-tickets")}
                className="confirmation-btn secondary"
              >
                View My Tickets
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketBookedConfirmation;
