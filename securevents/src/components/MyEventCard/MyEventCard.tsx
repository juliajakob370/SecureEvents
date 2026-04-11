import React from "react";
import { useNavigate } from "react-router-dom";
import "./MyEventCard.css";
import { useContext } from "react";
import { EventContext } from "../../context/EventContext";

type Props = {
  title: string;
  organizer: string;
  location: string;
  price: string;
  image: string;
  dateTime: string;
  description: string; 
  capacity: number;    
  status: string;
  index: number;
};

const MyEventCard: React.FC<Props> = ({
  title,
  organizer,
  location,
  price,
  image,
  dateTime,
  description,
  capacity,
  status,
  index
}) => {
  const navigate = useNavigate();
  const { removeEvent } = useContext(EventContext);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    const isPast = status === "past";

    const confirmMessage = isPast
      ? "Are you sure you want to delete this event?"
      : "Refund all tickets and remove this event?";

    const confirmDelete = window.confirm(confirmMessage);

    if (confirmDelete) {
      removeEvent(index);
    }
  };

  return (
    <div
      className="my-event-card"
      onClick={() => navigate("/event-details")}
    >
      {/* LEFT: IMAGE */}
      <div className="event-image">
        <img src={image} alt={title} />
      </div>

      {/* MIDDLE: CONTENT  */}
      <div className="event-content">

        <div className="event-title-row">
            <h3 className="event-title">{title}</h3>

            <span className={`event-status ${status}`}>
                {status === "active" ? "Active" : "Past"}
            </span>
        </div>

        <div className="event-row">
          <span className="event-organizer">{organizer}</span>

          <span className="event-datetime">
            <i className="bi bi-calendar-event"></i>
            {dateTime}
          </span>
        </div>

        <div className="event-row">
          <div className="event-location">
            <i className="bi bi-geo-alt"></i>
            <span>{location}</span>
          </div>

          <button
            className="event-price-btn"
            onClick={(e) => {
              e.stopPropagation();
              navigate("/get-tickets");
            }}
          >
            {price}
          </button>
        </div>
      </div>

      {/* RIGHT: ACTION BUTTONS */}
      <div className="event-actions">

        <button
          className="btn view-btn"
          onClick={(e) => {
            e.stopPropagation();
            navigate("/guest-list");
          }}
        >
          <i className="bi bi-people-fill"></i>
          View Guests
        </button>

        <button
          className="btn edit-btn"
          onClick={(e) => {
          e.stopPropagation();
            navigate("/edit-event", { state: { event: { 
              title,
              organizer,
              location,
              price,
              image,
              dateTime,
              description, 
              capacity,    
              status,
              index
            } } });
        }}
        >
          <i className="bi bi-pencil-fill"></i>
          Edit Event
        </button>

        <button
          className="btn delete-btn"
          onClick={handleDelete}
        >
          <i className={`bi ${status === "past" ? "bi-trash-fill" : "bi-cash-coin"}`}></i>
          {status === "past" ? "Delete" : "Refund"}
        </button>

      </div>
    </div>
  );
};

export default MyEventCard;