// Imports: React context, routing link, reusable header, styles, event card, profile image, and shared event context.
import React, { useContext } from "react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import "../../styles/MainPage.css";
import "../../styles/MyEventsPage.css";
import "../../styles/SecurEventsStyle.css";
import MyEventCard from "../../components/MyEventCard/MyEventCard";
import { EventContext } from "../../context/EventContext";
import { AuthContext } from "../../context/AuthContext";
import { EventItem, getMyEvents } from "../../api/eventApi";

// My Events page component.
const MyEventsPage: React.FC = () => {
    // Read shared events from context.
    const { events } = useContext(EventContext);
    const { user } = useContext(AuthContext);
    const [myEvents, setMyEvents] = useState<EventItem[]>([]);
    const eventsRef = useRef<EventItem[]>(events);

    useEffect(() => {
        eventsRef.current = events;
    }, [events]);

    useEffect(() => {
        let disposed = false;

        const load = async () => {
            try {
                const mine = await getMyEvents();
                if (!disposed) {
                    setMyEvents(mine);
                }
            } catch {
                // Fallback for legacy records that may not have owner mapping yet.
                const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim().toLowerCase();
                const email = (user?.email ?? "").toLowerCase();

                const fallback = eventsRef.current.filter((e) =>
                    (user?.id && e.createdByUserId === user.id) ||
                    (fullName && (e.organizer ?? "").toLowerCase() === fullName) ||
                    (email && (e.organizer ?? "").toLowerCase() === email)
                );

                if (!disposed) {
                    setMyEvents(fallback);
                }
            }
        };

        load();

        return () => {
            disposed = true;
        };
    }, [user?.id, user?.email, user?.firstName, user?.lastName]);

    return (
        <div style={{ padding: "20px" }}>
            {/* Header */}
            <Header
                centerType="title"
                title="MY EVENTS"
                showHome={true}
            />

            {/* Event list */}
            <div className="events-container">
                <div className="events-scroll">
                    {myEvents.length === 0 ? (
                        <div className="no-events">
                            <p>No Events Posted</p>

                            <Link to="/post-event" className="signup-link-button">
                                Post an Event!
                            </Link>
                        </div>
                    ) : (
                        myEvents.map((event, index) => (
                            <MyEventCard key={index} {...event} index={index} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyEventsPage;