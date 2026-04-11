// Imports: React router for navigation and local styles.
import React from "react";
import { useNavigate } from "react-router-dom";
import "./EventCard.css";

// Props: event information passed from MainPage.
type Props = {
    title: string;
    organizer: string;
    location: string;
    price: string;
    image: string;
    dateTime: string;
    description: string;
};

// Reusable event card component.
const EventCard: React.FC<Props> = ({
    title,
    organizer,
    location,
    price,
    image,
    dateTime,
    description
}) => {
    const navigate = useNavigate();

    // Selected event object sent to the next pages.
    const eventData = {
        title,
        organizer,
        location,
        price,
        image,
        dateTime,
        description
    };

    return (
        <div
            className="event-card"
            onClick={() => navigate("/get-tickets", { state: { event: eventData } })}
        >
            {/* Left: event image */}
            <div className="event-image">
                <img src={image} alt={title} />
            </div>

            {/* Right: event content */}
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
                            navigate("/get-tickets", { state: { event: eventData } });
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