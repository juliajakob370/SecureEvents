// Imports: React hooks, event context, navigation, reusable header, styles, and default image.
import React, { useState, useEffect, useContext } from "react";
import { EventContext } from "../../context/EventContext";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import "../../styles/MainPage.css";
import "../../styles/[9]GetTicketsPage.css";
import "../../styles/PostEventPage.css";
import defaultImage from "../../assets/default-image.png";

// Post Event page component.
const PostEventPage: React.FC = () => {
    // Form state for event fields.
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");

    // Form state for image, capacity, and pricing.
    const [image, setImage] = useState<string | null>(null);
    const [capacity, setCapacity] = useState(50);
    const [price, setPrice] = useState("");
    const [isFree, setIsFree] = useState(false);

    // Shared context functions and navigation.
    const { addEvent } = useContext(EventContext);
    const navigate = useNavigate();

    // Handle secure image upload validation on frontend.
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please upload an image file");
            e.target.value = "";
            return;
        }

        setImage(URL.createObjectURL(file));
    };

    // Clear price when event is marked as free.
    useEffect(() => {
        if (isFree) {
            setPrice("");
        }
    }, [isFree]);

    // Handle event submission.
    const handleSubmit = () => {
        if (!title || !date || !time || !location) {
            alert("Please fill all required fields");
            return;
        }

        const fullDateTime = new Date(`${date}T${time}`);

        // New event object matching EventItem type.
        const newEvent = {
            title,
            date,
            time,
            organizer: "You",
            location,
            price: isFree ? "Free" : price ? `$${price}` : "$0",
            image: image || defaultImage,
            description,
            capacity,
            status: fullDateTime < new Date() ? "past" : "active"
        };
        // Debug: check what is being sent into context.
        console.log("NEW EVENT:", newEvent);

        addEvent(newEvent);

        // Reset form after posting.
        setTitle("");
        setDate("");
        setTime("");
        setLocation("");
        setDescription("");
        setPrice("");
        setImage(null);
        setCapacity(50);
        setIsFree(false);

        navigate("/main");
    };

    return (
        <div style={{ padding: "20px" }}>
            {/* Header */}
            <Header centerType="title" title="POST EVENT" showProfile={true} />

            {/* Main layout */}
            <div className="events-container">
                <div className="events-scroll tickets-scroll">
                    <div className="post-event-layout">
                        {/* Left side */}
                        <div className="post-left">
                            <div className="ticket-event-card image-upload-box">
                                <img
                                    src={image || defaultImage}
                                    alt="Event"
                                    className="image-preview"
                                />

                                <label className="upload-btn">
                                    <i className="bi bi-upload"></i>
                                    Choose Image
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        hidden
                                    />
                                </label>

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

                        {/* Right side */}
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
                                        min={new Date().toISOString().split("T")[0]}
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
                                    <label>
                                        <i className="bi bi-geo-alt"></i> Location
                                    </label>
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

                            <button
                                className="post-event-btn"
                                onClick={handleSubmit}
                                disabled={!title || !date || !time || !location}
                            >
                                Post Event!
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostEventPage;