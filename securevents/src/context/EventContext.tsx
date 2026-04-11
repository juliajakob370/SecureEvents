import React, { createContext, useState, ReactNode } from "react";

export interface EventType {
  title: string;
  organizer: string;
  location: string;
  price: string;
  image: string;
  dateTime: string;
  description: string;
  capacity: number;
  status: string;
}

interface EventContextType {
  events: EventType[];
  addEvent: (event: EventType) => void;
  removeEvent: (index: number) => void;
}

export const EventContext = createContext<EventContextType>({
  events: [],
  addEvent: (event: EventType) => {},
  removeEvent: (index: number) => {},
});

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<EventType[]>([]);

  const addEvent = (event: EventType) => {
    setEvents((prev) => [event, ...prev]); // add to the top of the event page
  };

  const removeEvent = (index: number) => {
    setEvents((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <EventContext.Provider value={{ events, addEvent, removeEvent }}>
      {children}
    </EventContext.Provider>
  );
};
