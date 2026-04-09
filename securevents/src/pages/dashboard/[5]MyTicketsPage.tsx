import React from "react";
import Header from "../../components/Header/Header";
import TicketCard from "../../components/TicketCard/TicketCard";
import "../../styles/SecurEventsStyle.css";

const MyTicketsPage: React.FC = () => {

  const activeTickets = [
    {
      title: "Summer Music Festival",
      name: "Julia Jakob",
      dateTime: "Aug 12 • 7:00 PM"
    },
    {
      title: "Tech Night",
      name: "Julia Jakob",
      dateTime: "Sep 3 • 6:00 PM"
    },
    {
      title: "Summer Music Festival",
      name: "Julia Jakob",
      dateTime: "Aug 12 • 7:00 PM"
    },
    {
      title: "Tech Night",
      name: "Julia Jakob",
      dateTime: "Sep 3 • 6:00 PM"
    },
    {
      title: "Summer Music Festival",
      name: "Julia Jakob",
      dateTime: "Aug 12 • 7:00 PM"
    },
    {
      title: "Tech Night",
      name: "Julia Jakob",
      dateTime: "Sep 3 • 6:00 PM"
    }
  ];

  const usedTickets = [
    {
      title: "Art Expo 2025",
      name: "Julia Jakob",
      dateTime: "Jan 10 • 2:00 PM"
    },
    {
      title: "Art Expo 2025",
      name: "Julia Jakob",
      dateTime: "Jan 10 • 2:00 PM"
    }
  ];

    return (
    <div style={{ padding: "20px" }}>
        

        {/* HEADER */}
        <Header
            centerType="title"
            title="MY TICKETS"
            showHome={true}
        />

        {/* CONTENT UNDER HEADER */}
        <div className="tickets-content">
            <div className="events-container">
            <div className="events-scroll">

                {activeTickets.map((ticket, index) => (
                <TicketCard key={index} {...ticket} status="active" />
                ))}

                {usedTickets.map((ticket, index) => (
                <TicketCard key={`used-${index}`} {...ticket} status="used" />
                ))}

            </div>
        </div>

        </div>
    </div>
    );
    };

export default MyTicketsPage;