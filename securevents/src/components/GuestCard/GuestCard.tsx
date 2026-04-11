import React, { useState } from "react";
import "./GuestCard.css";

type Props = {
  title: string;
  name: string;
  email: string; 
  dateTime: string;
};

const GuestCard: React.FC<Props> = ({ title, name, email, dateTime }) => {
  const [checkedIn, setCheckedIn] = useState(false);

  const handleCheckIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedIn(!checkedIn);
  };

  return (
    <div className={`guest-card ${checkedIn ? "checked-in" : ""}`}>
      
      {/* LEFT: CHECK BUTTON */}
      <button className="guest-check-btn" onClick={handleCheckIn}>
        <i className={`bi ${checkedIn ? "bi-check-circle-fill" : "bi-person"}`}></i>
      </button>

      {/* EVENT TITLE */}
      <span className="guest-title">{title}</span>

        <div className="guest-name-block">
            <span className="guest-name">{name}</span>
            <span className="guest-email">{email}</span>
        </div>

      {/* DATE TIME */}
      <span className="guest-datetime">
        <i className="bi bi-calendar-event"></i>
        {dateTime}
      </span>

    </div>
  );
};

export default GuestCard;