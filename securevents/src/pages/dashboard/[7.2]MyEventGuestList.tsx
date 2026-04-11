import React from "react";
import Header from "../../components/Header/Header";
import GuestCard from "../../components/GuestCard/GuestCard";
import "../../styles/SecurEventsStyle.css";
import "../../styles/GuestListPage.css";

const GuestListPage: React.FC = () => {

  // TEMP DATA (later comes from backend / context)
  const event = {
    title: "Summer Music Festival",
    price: 25,
    capacity: 100
  };

const guests = [
  { name: "Julia Jakob", email: "julia@email.com", dateTime: "Aug 12 • 7:00 PM" },
  { name: "Bibi Murwared", email: "bibi@email.com", dateTime: "Aug 12 • 7:00 PM" },
  { name: "Alex Chen", email: "alex@email.com", dateTime: "Aug 12 • 7:00 PM" }
];

  //  calculate values
  const totalGuests = guests.length;
  const revenue = event.price * totalGuests;

  return (
    <div style={{ padding: "20px" }}>

      {/* MAIN HEADER */}
      <Header
        centerType="title"
        title="GUEST LIST"
        showHome={true}
      />

      {/* SECOND HEADER (EVENT SUMMARY) */}
      <div className="guest-summary">

        {/* LEFT: EVENT TITLE */}
        <div className="summary-title">
          {event.title}
        </div>

        {/* RIGHT SIDE */}
        <div className="summary-right">

          {/* REVENUE */}
          <div className="summary-item">
            <i className="bi bi-cash-stack"></i>
            ${revenue}
          </div>

          {/* CAPACITY */}
          <div className="summary-item">
            <i className="bi bi-people-fill"></i>
            {totalGuests} / {event.capacity}
          </div>

        </div>
      </div>

      {/* LIST */}
      <div className="tickets-content">
        <div className="events-container">
          <div className="events-scroll">

            {guests.map((guest, index) => (
              <GuestCard
                key={index}
                title={event.title}
                name={guest.name}
                email={guest.email}
                dateTime={guest.dateTime}
              />
            ))}

          </div>
        </div>
      </div>

    </div>
  );
};

export default GuestListPage;