import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import "../../styles/MainPage.css";
import "../../styles/MyEventsPage.css";
import "../../styles/SecurEventsStyle.css";
import MyEventCard from "../../components/MyEventCard/MyEventCard";
import profile0 from "../../assets/profilePics/profile0.png";
import { EventContext } from "../../context/EventContext";

const MyEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { events } = useContext(EventContext);

  return (
    <div style={{ padding: "20px" }}>
      {/* HEADER */}
      <Header
        centerType="title"
        title="MY EVENTS"
        showHome={true}
        profileImage={profile0}
      />

      <div className="events-container">
        <div className="events-scroll">
          {events.length === 0 ? (
            <div className="no-events">
              <p>No Events Posted</p>

              <Link to="/post-event" className="signup-link-button">
                Post an Event!
              </Link>
            </div>
          ) : (
            events.map((event, index) => (
              <MyEventCard key={index} {...event} index={index} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyEventsPage;
