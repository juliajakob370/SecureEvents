// Imports: React tools for context, state, and lifecycle.
import React, { createContext, useEffect, useState } from "react";

// Event type that matches the event structure used across the frontend.
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

// Context type: shared event data and helper functions.
type EventContextType = {
    events: EventItem[];
    setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>;
    addEvent: (newEvent: EventItem) => void;
    removeEvent: (index: number) => void;
    updateEvent: (index: number, updatedEvent: EventItem) => void;
};

// Default empty context values.
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
    // Main shared event list state.
    const [events, setEvents] = useState<EventItem[]>([]);

    // Load saved user-created events from localStorage when app starts.
    useEffect(() => {
        const savedEvents = localStorage.getItem("secureEventsPostedEvents");

        if (savedEvents) {
            try {
                const parsedEvents = JSON.parse(savedEvents);

                if (Array.isArray(parsedEvents)) {
                    setEvents(parsedEvents);
                }
            } catch (error) {
                console.error("Failed to load saved events:", error);
                setEvents([]);
            }
        }
    }, []);

    // Save current event list to localStorage whenever it changes.
    useEffect(() => {
        localStorage.setItem("secureEventsPostedEvents", JSON.stringify(events));
    }, [events]);

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