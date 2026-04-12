import React, { useState, useEffect, useContext } from "react";
import { EventContext } from "../../context/EventContext";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import "../../styles/MainPage.css";
import "../../styles/PostEventPage.css";
import defaultImage from "../../assets/default-image.png";
import { AuthContext } from "../../context/AuthContext";
import { uploadEventImage } from "../../api/eventApi";

const PostEventPage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [image, setImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [capacity, setCapacity] = useState(50);
  const [price, setPrice] = useState("");
  const [isFree, setIsFree] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { addEvent } = useContext(EventContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, and WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > maxSize) {
      alert("Image must be smaller than 2MB.");
      e.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview((prev) => {
      if (prev && prev.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
      }
      return previewUrl;
    });
    setUploadingImage(true);
    try {
      const uploaded = await uploadEventImage(file);
      if (!uploaded.imageUrl) {
        throw new Error("Upload did not return image url.");
      }

      setImage(uploaded.imageUrl);
      setErrors((prev) => ({ ...prev, image: "" }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, image: err instanceof Error ? err.message : "Failed to upload image." }));
      setImage(null);
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    if (isFree) setPrice("");
  }, [isFree]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const trimmedTitle = title.trim();
    const trimmedLocation = location.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) newErrors.title = "Title is required.";
    else if (trimmedTitle.length > 100)
      newErrors.title = "Max 100 characters.";

    if (!date) newErrors.date = "Date is required.";
    if (!time) newErrors.time = "Time is required.";

    if (!trimmedLocation) newErrors.location = "Location is required.";
    else if (trimmedLocation.length > 100)
      newErrors.location = "Max 100 characters.";

    if (trimmedDescription.length > 500)
      newErrors.description = "Max 500 characters.";

    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10000)
      newErrors.capacity = "1–10000 only.";

    if (!isFree) {
      const parsed = Number(price);
      if (!price.trim()) newErrors.price = "Required unless free.";
      else if (isNaN(parsed) || parsed < 0 || parsed > 100000)
        newErrors.price = "Invalid price.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const fullDateTime = new Date(`${date}T${time}`);

    if (uploadingImage) {
      setErrors((prev) => ({ ...prev, image: "Image is still uploading. Please wait." }));
      return;
    }

    const newEvent = {
      title: title.trim(),
      organizer: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || user?.email || "Organizer",
      location: location.trim(),
      price: isFree ? "Free" : `$${Number(price).toFixed(2)}`,
      image: image || defaultImage,
      date,
      time,
      description: description.trim(),
      capacity,
      status: fullDateTime < new Date() ? "past" : "active",
    };

    try {
      await addEvent(newEvent);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: err instanceof Error ? err.message : "Failed to create event."
      }));
      return;
    }

    setTitle("");
    setDate("");
    setTime("");
    setLocation("");
    setDescription("");
    setPrice("");
    setImage(null);
    setImagePreview(null);
    setCapacity(50);
    setIsFree(false);
    setErrors({});

    navigate("/main");
  };

  const isFormValid =
    title.trim() &&
    date &&
    time &&
    location.trim() &&
    description.trim() &&
    capacity > 0 &&
    (isFree || price.trim()) &&
    !uploadingImage;

  return (
    <div style={{ padding: "20px" }}>
      <Header centerType="title" title="POST EVENT" showProfile={true} />

      <div className="events-container">
        <div className="events-scroll tickets-scroll">
          <div className="post-event-layout">

            {/* LEFT */}
            <div className="post-left-card">
              <div className="image-container">
                <img src={imagePreview || image || defaultImage} alt="Event" />
              </div>

              <label className="upload-btn">
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  hidden
                />
              </label>

              <div className="capacity-row">
                <span className="capacity-label">Capacity</span>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                />
              </div>
              {errors.capacity && <p className="form-error">{errors.capacity}</p>}
              {errors.image && <p className="form-error">{errors.image}</p>}

              <div className="price-section">
                <span className="price-label">Price Per Ticket</span>

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
                      disabled={isFree}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              {errors.price && <p className="form-error">{errors.price}</p>}
            </div>

            {/* RIGHT */}
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
                  <label>Location</label>
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
                disabled={!isFormValid}
              >
                {uploadingImage ? "Uploading image..." : "Post Event!"}
              </button>
              {errors.submit && <p className="form-error">{errors.submit}</p>}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PostEventPage;