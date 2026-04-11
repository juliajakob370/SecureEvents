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

    // Error state for simple frontend validation.
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Shared context functions and navigation.
    const { addEvent } = useContext(EventContext);
    const navigate = useNavigate();

    // Handle image upload validation.
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        const maxSizeInBytes = 2 * 1024 * 1024;

        if (!allowedTypes.includes(file.type)) {
            alert("Only JPG, PNG, and WEBP images are allowed.");
            e.target.value = "";
            return;
        }

        if (file.size > maxSizeInBytes) {
            alert("Image must be smaller than 2MB.");
            e.target.value = "";
            return;
        }

        setImage(URL.createObjectURL(file));
    };

    // Clear price if event is free.
    useEffect(() => {
        if (isFree) {
            setPrice("");
        }
    }, [isFree]);

    // Validate all fields before posting.
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        const trimmedTitle = title.trim();
        const trimmedLocation = location.trim();
        const trimmedDescription = description.trim();

        if (!trimmedTitle) {
            newErrors.title = "Title is required.";
        } else if (trimmedTitle.length > 100) {
            newErrors.title = "Title must be 100 characters or less.";
        }

        if (!date) {
            newErrors.date = "Date is required.";
        }

        if (!time) {
            newErrors.time = "Time is required.";
        }

        if (!trimmedLocation) {
            newErrors.location = "Location is required.";
        } else if (trimmedLocation.length > 100) {
            newErrors.location = "Location must be 100 characters or less.";
        }

        if (trimmedDescription.length > 500) {
            newErrors.description = "Description must be 500 characters or less.";
        }

        if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10000) {
            newErrors.capacity = "Capacity must be between 1 and 10000.";
        }

        if (!isFree) {
            const parsedPrice = Number(price);

            if (!price.trim()) {
                newErrors.price = "Price is required unless event is free.";
            } else if (Number.isNaN(parsedPrice) || parsedPrice < 0 || parsedPrice > 100000) {
                newErrors.price = "Price must be a valid amount.";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle event submission.
    const handleSubmit = () => {
        if (!validateForm()) {
            return;
        }

        const trimmedTitle = title.trim();
        const trimmedLocation = location.trim();
        const trimmedDescription = description.trim();

        const fullDateTime = new Date(`${date}T${time}`);

        // New event object matching shared event type.
        const newEvent = {
            title: trimmedTitle,
            date,
            time,
            organizer: "You",
            location: trimmedLocation,
            price: isFree ? "Free" : `$${Number(price).toFixed(2)}`,
            image: image || defaultImage,
            description: trimmedDescription,
            capacity,
            status: fullDateTime < new Date() ? "past" : "active"
        };

        addEvent(newEvent);

        // Reset form after successful post.
        setTitle("");
        setDate("");
        setTime("");
        setLocation("");
        setDescription("");
        setPrice("");
        setImage(null);
        setCapacity(50);
        setIsFree(false);
        setErrors({});

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
                                        accept=".jpg,.jpeg,.png,.webp"
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
                                        max="10000"
                                        value={capacity}
                                        onChange={(e) => setCapacity(Number(e.target.value))}
                                    />
                                </div>
                                {errors.capacity && <p className="form-error">{errors.capacity}</p>}

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
                                                    min="0"
                                                    step="0.01"
                                                    placeholder={isFree ? "0.00" : "Enter ticket price"}
                                                    disabled={isFree}
                                                    value={price}
                                                    onChange={(e) => setPrice(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {errors.price && <p className="form-error">{errors.price}</p>}
                            </div>
                        </div>

                        {/* Right side */}
                        <div className="post-right ticket-selection-card">
                            <div className="post-form-inner">
                                <div className="form-group">
                                    <input
                                        type="text"
                                        placeholder=" "
                                        maxLength={100}
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                    <label>Event Title</label>
                                </div>
                                {errors.title && <p className="form-error">{errors.title}</p>}

                                <div className="form-group">
                                    <input
                                        type="date"
                                        value={date}
                                        min={new Date().toISOString().split("T")[0]}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                    <label>Date</label>
                                </div>
                                {errors.date && <p className="form-error">{errors.date}</p>}

                                <div className="form-group">
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                    />
                                    <label>Time</label>
                                </div>
                                {errors.time && <p className="form-error">{errors.time}</p>}

                                <div className="form-group">
                                    <input
                                        type="text"
                                        placeholder=" "
                                        maxLength={100}
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    />
                                    <label>
                                        <i className="bi bi-geo-alt"></i> Location
                                    </label>
                                </div>
                                {errors.location && <p className="form-error">{errors.location}</p>}

                                <div className="description-group">
                                    <label>Description</label>
                                    <textarea
                                        placeholder="Tell people about your event..."
                                        maxLength={500}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                                {errors.description && <p className="form-error">{errors.description}</p>}
                            </div>

                            <button
                                className="post-event-btn"
                                onClick={handleSubmit}
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