// Imports: React context, reusable header, styles, event card, and profile image.
import React, { useContext, useEffect } from "react";
import Header from "../../components/Header/Header";
import "../../styles/MainPage.css";
import EventCard from "../../components/EventCard/EventCard";
import profile0 from "../../assets/profilePics/profile0.png";
import { EventContext } from "../../context/EventContext";
import { AuthContext } from "../../context/AuthContext";
import { useMemo, useState } from "react";

// Main dashboard page.
const MainPage: React.FC = () => {
    // Read posted events from shared context.
    const { events, refreshEvents } = useContext(EventContext);
    const { user } = useContext(AuthContext);
    const [searchText, setSearchText] = useState("");

    const filteredEvents = useMemo(() => {
        const term = searchText.trim().toLowerCase();
        if (!term) {
            return events;
        }

        return events.filter((event) =>
            event.title.toLowerCase().includes(term) ||
            event.location.toLowerCase().includes(term) ||
            event.organizer.toLowerCase().includes(term) ||
            event.description.toLowerCase().includes(term)
        );
    }, [events, searchText]);

    useEffect(() => {
        // Keep public list fresh after admin approval/rejection actions.
        refreshEvents();
    }, [refreshEvents]);

    return (
        <div style={{ padding: "20px" }}>
            {/* Header */}
            <Header
                centerType="search"
                showProfile={true}
                profileImage={profile0}
                onSearch={setSearchText}
            />

            {/* Event list container */}
            <div className="events-container">
                <div className="events-scroll">
                    {filteredEvents.length === 0 ? (
                        <div className="no-events">
                            <p>No matching events found.</p>
                        </div>
                    ) : (
                        filteredEvents.map((event, index) => (
                            <EventCard
                                key={index}
                                id={event.id}
                                createdByUserId={event.createdByUserId}
                                title={event.title}
                                organizer={event.organizer === "You" && event.createdByUserId !== user?.id ? "Organizer" : event.organizer}
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