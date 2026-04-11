// Imports: React context, routing link, reusable header, styles, event card, profile image, and shared event context.
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import "../../styles/MainPage.css";
import "../../styles/MyEventsPage.css";
import "../../styles/SecurEventsStyle.css";
import MyEventCard from "../../components/MyEventCard/MyEventCard";
import profile0 from "../../assets/profilePics/profile0.png";
import { EventContext } from "../../context/EventContext";

// My Events page component.
const MyEventsPage: React.FC = () => {
    // Read shared events from context.
    const { events } = useContext(EventContext);

    return (
        <div style={{ padding: "20px" }}>
            {/* Header */}
            <Header
                centerType="title"
                title="MY EVENTS"
                showHome={true}
                profileImage={profile0}
            />

            {/* Event list */}
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