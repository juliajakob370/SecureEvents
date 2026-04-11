import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { EventContext } from "../../context/EventContext";
import Header from "../../components/Header/Header";
import "../../styles/MainPage.css";
import "../../styles/[9]GetTicketsPage.css";
import "../../styles/PostEventPage.css";
import defaultImage from "../../assets/default-image.png";

const EditEventPage: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { events, removeEvent, addEvent } = useContext(EventContext);

  const event = state?.event;

  // FILL IN VALUES
  const [title, setTitle] = useState(event?.title || "");
  const [locationText, setLocationText] = useState(event?.location || "");
  const [description, setDescription] = useState(event?.description || "");
  const [capacity, setCapacity] = useState(event?.capacity || 50);

  const [image, setImage] = useState<string | null>(event?.image || null);

  // split date/time
  const [date, setDate] = useState(event?.dateTime?.split(" • ")[0] || "");
  const [time, setTime] = useState(event?.dateTime?.split(" • ")[1] || "");

  const [isFree, setIsFree] = useState(event?.price === "Free");
  const [price, setPrice] = useState(
    event?.price && event.price !== "Free" ? event.price.replace("$", "") : "",
  );

  // image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setImage(URL.createObjectURL(file));
  };

  useEffect(() => {
    if (isFree) setPrice("");
  }, [isFree]);

  const handleUpdate = () => {
    if (!title || !date || !time || !locationText) {
      alert("Please fill all required fields");
      return;
    }

    const fullDateTime = new Date(`${date}T${time}`);

    const updatedEvent = {
      title,
      organizer: "You",
      location: locationText,
      price: isFree ? "Free" : price ? `$${price}` : "$0",
      image: image || defaultImage,
      dateTime: `${date} • ${time}`,
      description,
      capacity,
      status: fullDateTime < new Date() ? "past" : "active",
    };

    // simple replace - delete and add new - later update idk??? im so tired
    removeEvent(event.index);
    addEvent(updatedEvent);

    navigate("/main");
  };

  return (
    <div style={{ padding: "20px" }}>
      <Header centerType="title" title="EDIT EVENT" showProfile={true} />

      <div className="events-container">
        <div className="events-scroll tickets-scroll">
          <div className="post-event-layout">
            {/* LEFT */}
            <div className="post-left">
              <div className="ticket-event-card image-upload-box">
                <img src={image || defaultImage} className="image-preview" />

                <label className="upload-btn">
                  Choose Image
                  <input type="file" hidden onChange={handleImageUpload} />
                </label>

                <div className="capacity-row">
                  <span className="capacity-label">Capacity</span>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                  />
                </div>

                <div className="price-label-row">
                  <span className="price-label">Price Per Ticket</span>

                  <div className="price-right-col">
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
                        disabled={isFree}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="post-right ticket-selection-card">
              <div className="post-form-inner">
                <div className="form-group">
                  <input
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
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                  />
                  <label>Location</label>
                </div>

                <div className="description-group">
                  <label>Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <button className="post-event-btn" onClick={handleUpdate}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEventPage;
