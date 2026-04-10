import React from "react";
import { useNavigate } from "react-router-dom";
import "./MyEventCard.css";

type Props = {
  title: string;
  organizer: string;
  location: string;
  price: string;
  image: string;
  dateTime: string;
};

const MyEventCard: React.FC<Props> = ({
  title,
  organizer,
  location,
  price,
  image,
  dateTime
}) => {
  const navigate = useNavigate();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?\nAll tickets will be refunded."
    );

    if (confirmDelete) {
      console.log("Delete event logic here");
      // call API here later
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

      {/* MIDDLE: CONTENT (same as before) */}
      <div className="event-content">

        <h3 className="event-title">{title}</h3>

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
            navigate("/edit-event");
          }}
        >
          <i className="bi bi-pencil-fill"></i>
          Edit Event
        </button>

        <button
          className="btn delete-btn"
          onClick={handleDelete}
        >
          <i className="bi bi-trash-fill"></i>
          Delete
        </button>

      </div>
    </div>
  );
};

export default MyEventCard;