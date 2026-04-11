// Imports: React tools for context, state, and lifecycle.
import React, { createContext, useEffect, useState } from "react";

// Event type that matches the JSON fields Mohammad said the backend will send.
export type EventItem = {
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
    organizer: string;
    image: string;
    status: string;
    capacity: number;
    price: string;
};

// Context type: what values/functions will be shared across the app.
type EventContextType = {
    events: EventItem[];
    setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>;
    addEvent: (newEvent: EventItem) => void;
    removeEvent: (index: number) => void;
    updateEvent: (index: number, updatedEvent: EventItem) => void;
};

// Default empty context value.
export const EventContext = createContext<EventContextType>({
    events: [],
    setEvents: () => { },
    addEvent: () => { },
    removeEvent: () => { },
    updateEvent: () => { }
});

// Props type for provider wrapper.
type Props = {
    children: React.ReactNode;
};

// Context provider used in App.tsx.
export const EventProvider: React.FC<Props> = ({ children }) => {
    // Main event list state shared across the app.
    const [events, setEvents] = useState<EventItem[]>([]);

    // Temporary starter data.
    // Later, this can be replaced with the real backend API response.
    useEffect(() => {
        const starterEvents: EventItem[] = [
            {
                title: "Summer Music Festival",
                date: "Aug 12",
                time: "7:00 PM",
                location: "Toronto, ON",
                description: "A live outdoor music festival with multiple artists.",
                organizer: "Mr. Music",
                image: "https://tse4.mm.bing.net/th/id/OIP.KZ2a11mYjDyMMZyi5kbvwQHaHa?w=1200&h=1200&rs=1&pid=ImgDetMain&o=7&rm=3",
                status: "active",
                capacity: 300,
                price: "$25"
            },
            {
                title: "Tech Networking Night",
                date: "Aug 13",
                time: "6:00 PM",
                location: "Waterloo, ON",
                description: "Meet students, developers, and industry professionals.",
                organizer: "Google Developer's Group @ Conestoga College",
                image: "https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,h_1080,q_100,w_1080/v1/gcs/platform-data-goog/events/DF25-Event-thumbnail-year-square_wjZLNYl.png",
                status: "active",
                capacity: 120,
                price: "Free"
            },
            {
                title: "Art Expo 2026",
                date: "Aug 15",
                time: "3:00 PM",
                location: "Brampton, ON",
                description: "An art exhibition with modern and classic collections.",
                organizer: "Creative Co.",
                image: "https://luxury.am/wp-content/uploads/2023/04/52781012862_ed864c9219_c.jpg",
                status: "active",
                capacity: 200,
                price: "$10"
            }
        ];

        setEvents(starterEvents);
    }, []);

    // Add a new event to the shared list.
    const addEvent = (newEvent: EventItem) => {
        setEvents((prev) => [...prev, newEvent]);
    };

    // Remove an event by index.
    const removeEvent = (index: number) => {
        setEvents((prev) => prev.filter((_, i) => i !== index));
    };

    // Update an event by index.
    const updateEvent = (index: number, updatedEvent: EventItem) => {
        setEvents((prev) =>
            prev.map((event, i) => (i === index ? updatedEvent : event))
        );
    };

    return (
        <EventContext.Provider
            value={{
                events,
                setEvents,
                addEvent,
                removeEvent,
                updateEvent
            }}
        >
            {children}
        </EventContext.Provider>
    );
};