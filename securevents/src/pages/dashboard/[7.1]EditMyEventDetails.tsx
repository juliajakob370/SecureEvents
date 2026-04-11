// Imports: React hooks, shared event context, navigation hooks, header, and styles.
import React, { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { EventContext } from "../../context/EventContext";
import Header from "../../components/Header/Header";
import "../../styles/MainPage.css";
import "../../styles/PostEventPage.css";

// Edit Event page component.
const EditMyEventDetails: React.FC = () => {
    // Get selected event from router state.
    const locationHook = useLocation();
    const navigate = useNavigate();
    const { removeEvent, addEvent } = useContext(EventContext);

    const event = locationHook.state?.event;

    // Form state pre-filled from selected event.
    const [title, setTitle] = useState(event?.title || "");
    const [date, setDate] = useState(event?.date || "");
    const [time, setTime] = useState(event?.time || "");
    const [location, setLocation] = useState(event?.location || "");
    const [description, setDescription] = useState(event?.description || "");
    const [capacity, setCapacity] = useState(event?.capacity || 50);
    const [price, setPrice] = useState(
        event?.price === "Free" ? "" : event?.price?.replace("$", "") || ""
    );
    const [image, setImage] = useState(event?.image || "");
    const [status, setStatus] = useState(event?.status || "active");
    const [isFree, setIsFree] = useState(event?.price === "Free");

    // Save edited event.
    const handleSave = () => {
        if (!title || !date || !time || !location) {
            alert("Please fill all required fields");
            return;
        }

        const updatedEvent = {
            title,
            date,
            time,
            organizer: event?.organizer || "You",
            location,
            price: isFree ? "Free" : price ? `$${price}` : "$0",
            image,
            description,
            capacity,
            status
        };

        removeEvent(event.index);
        addEvent(updatedEvent);

        navigate("/main");
    };

    return (
        <div style={{ padding: "20px" }}>
            {/* Header */}
            <Header centerType="title" title="EDIT EVENT" showHome={true} />

            {/* Main layout */}
            <div className="events-container">
                <div className="events-scroll tickets-scroll">
                    <div className="post-event-layout">
                        {/* Left side preview */}
                        <div className="post-left">
                            <div className="ticket-event-card image-upload-box">
                                <img
                                    src={image}
                                    alt="Event"
                                    className="image-preview"
                                />

                                <div className="capacity-row">
                                    <span className="capacity-label">
                                        <i className="bi bi-people-fill"></i> Capacity
                                    </span>

                                    <input
                                        type="number"
                                        min="1"
                                        value={capacity}
                                        onChange={(e) => setCapacity(Number(e.target.value))}
                                    />
                                </div>

                                <div className="price-section">
                                    <div className="price-label-row">
                                        <span className="price-label">
                                            <i className="bi bi-ticket-perforated"></i>
                                            Price Per Ticket
                                        </span>

                                        <div className={`price-right-col ${isFree ? "disabled" : ""}`}>
                                            <label className="checkbox-row light">
                                                <input
                                                    type="checkbox"
                                                    checked={isFree}
                                                    onChange={() => setIsFree(!isFree)}
                                                />
                                                Free Event?
                                            </label>

                                            <div className="price-input-clean">
                                                <span>$</span>
                                                <input
                                                    type="number"
                                                    placeholder={isFree ? "0.00" : "Enter ticket price"}
                                                    disabled={isFree}
                                                    value={price}
                                                    onChange={(e) => setPrice(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right side form */}
                        <div className="post-right ticket-selection-card">
                            <div className="post-form-inner">
                                <div className="form-group">
                                    <input
                                        type="text"
                                        placeholder=" "
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                    <label>Event Title</label>
                                </div>

                                <div className="form-group">
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                    <label>Date</label>
                                </div>

                                <div className="form-group">
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                    />
                                    <label>Time</label>
                                </div>

                                <div className="form-group">
                                    <input
                                        type="text"
                                        placeholder=" "
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    />
                                    <label>Location</label>
                                </div>

                                <div className="description-group">
                                    <label>Description</label>
                                    <textarea
                                        placeholder="Tell people about your event..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button className="post-event-btn" onClick={handleSave}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditMyEventDetails;