import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import "../../styles/MainPage.css";
import "../../styles/MyEventsPage.css"
import "../../styles/SecurEventsStyle.css";
import MyEventCard from "../../components/MyEventCard/MyEventCard";
import profile0 from "../../assets/profilePics/profile0.png";

// const events: any[] = []; // test the no events stuff

const events = [
  {
    title: "Summer Music Festival",
    organizer: "Mr. Music",
    location: "Toronto, ON",
    price: "$25",
    image: "https://tse4.mm.bing.net/th/id/OIP.KZ2a11mYjDyMMZyi5kbvwQHaHa?w=1200&h=1200&rs=1&pid=ImgDetMain&o=7&rm=3",
    dateTime: "Aug 12 • 7:00 PM",
    status: "active"
  },
 {
    title: "Super Cool Event",
    organizer: "Bibi",
    location: "Waterloo, ON",
    price:"$100",
    image:"https://koreajoongangdaily.joins.com/data/photo/2022/11/21/159f5073-0127-4463-ba60-f15c4292d62c.jpg",
    dateTime:"Aug 12 • 7:00 PM",
    status: "past"
 }
];
const MyEventsPage: React.FC = () => {
    const navigate = useNavigate();
  return (
    <div style={{ padding: "20px" }}>
      
      {/* HEADER */}
      <Header
        centerType="title"
        title="MY EVENTS"
        showHome={true}
        profileImage={profile0}
      />
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
                <MyEventCard key={index} {...event} />
                ))
            )}
        </div>
      </div>

    </div>
  );
};

export default MyEventsPage;