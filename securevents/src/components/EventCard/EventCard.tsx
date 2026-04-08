import React from "react";
import { useNavigate } from "react-router-dom";
import "./EventCard.css";

type Props = {
  title: string;
  organizer: string;
  location: string;
  price: string;
  image: string;
  dateTime: string;
};

const EventCard: React.FC<Props> = ({
  title,
  organizer,
  location,
  price,
  image,
  dateTime
}) => {
  const navigate = useNavigate();

  return (
    <div
      className="event-card"
      onClick={() => navigate("/event-details")}
    >
      {/* LEFT: IMAGE */}
      <div className="event-image">
        <img src={image} alt={title} />
      </div>

      {/* RIGHT: CONTENT */}
      <div className="event-content">

        {/* ROW 1: TITLE */}
        <h3 className="event-title">{title}</h3>

        {/* ROW 2: ORGANIZER + DATE/TIME */}
        <div className="event-row">
            <span className="event-organizer">{organizer}</span>

            <span className="event-datetime">
                <i className="bi bi-calendar-event"></i>
                {dateTime}
            </span>
        </div>

        {/* ROW 3: LOCATION + PRICE */}
        <div className="event-row">
          
          {/* LEFT: LOCATION */}
          <div className="event-location">
            <i className="bi bi-geo-alt"></i>
            <span>{location}</span>
          </div>

          {/* RIGHT: PRICE BUTTON */}
          <button
            className="event-price-btn"
            onClick={(e) => {
              e.stopPropagation(); // prevents card click
              navigate("/get-tickets");
            }}
          >
            {price}
          </button>

        </div>
      </div>
    </div>
  );
};

export default EventCard;