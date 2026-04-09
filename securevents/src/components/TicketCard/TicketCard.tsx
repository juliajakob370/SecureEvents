import React from "react";
import { useNavigate } from "react-router-dom";
import "./TicketCard.css";

type Props = {
  title: string;
  name: string;
  dateTime: string;
  status: "active" | "used";
};

const TicketCard: React.FC<Props> = ({ title, name, dateTime, status }) => {
  const navigate = useNavigate();

  return (
    <div
      className={`ticket-card ${status === "used" ? "ticket-used" : ""}`}
      onClick={() => navigate("/view-ticket")}
    >
      {/* LEFT: ICON */}
      <div className="ticket-icon">
        <i
          className={`bi ${status === "used" ? "bi-archive" : "bi-ticket-perforated"}`}
        ></i>
      </div>

      {/* RIGHT: INFO */}
      <div className="ticket-content">
        <h3 className="ticket-title">{title}</h3>

        <div className="ticket-row">
          <span className="ticket-name">{name}</span>

          <span className="ticket-datetime">
            <i className="bi bi-calendar-event"></i>
            {dateTime}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
