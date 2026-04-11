// Imports: React context, reusable header, styles, event card, and profile image.
import React, { useContext } from "react";
import Header from "../../components/Header/Header";
import "../../styles/MainPage.css";
import EventCard from "../../components/EventCard/EventCard";
import profile0 from "../../assets/profilePics/profile0.png";
import { EventContext } from "../../context/EventContext";

// Main dashboard page.
const MainPage: React.FC = () => {
    // Read posted events from shared context.
    const { events } = useContext(EventContext);

    return (
        <div style={{ padding: "20px" }}>
            {/* Header */}
            <Header
                centerType="search"
                showProfile={true}
                profileImage={profile0}
            />

            {/* Event list container */}
            <div className="events-container">
                <div className="events-scroll">
                    {events.length === 0 ? (
                        <p>No events available right now.</p>
                    ) : (
                        events.map((event, index) => (
                            <EventCard
                                key={index}
                                title={event.title}
                                organizer={event.organizer}
                                location={event.location}
                                price={event.price}
                                image={event.image}
                                date={event.date}
                                time={event.time}
                                description={event.description}
                                status={event.status}
                                capacity={event.capacity}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MainPage;