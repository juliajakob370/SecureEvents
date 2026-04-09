import React from "react";
import Header from "../../components/Header/Header";
import "../../styles/MainPage.css";
import EventCard from "../../components/EventCard/EventCard";
import profile0 from "../../assets/profilePics/profile0.png";

const MainPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      
      {/* HEADER */}
      <Header
        centerType="search"
        showProfile={true}
        profileImage={profile0}
      />
      <div className="events-container">
        <div className="events-scroll">

          <div className="events-scroll">

            <EventCard
              title="Summer Music Festival"
              organizer="Mr. Music"
              location="Toronto, ON"
              price="$25"
              image="https://tse4.mm.bing.net/th/id/OIP.KZ2a11mYjDyMMZyi5kbvwQHaHa?w=1200&h=1200&rs=1&pid=ImgDetMain&o=7&rm=3"
              dateTime="Aug 12 • 7:00 PM"
            />

            <EventCard
              title="Tech Networking Night"
              organizer="Google Developer's Group @ Conestoga College"
              location="Waterloo, ON"
              price="Free"
              image="https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,h_1080,q_100,w_1080/v1/gcs/platform-data-goog/events/DF25-Event-thumbnail-year-square_wjZLNYl.png"
              dateTime="Aug 12 • 7:00 PM"
            />

            <EventCard
              title="Art Expo 2026"
              organizer="Creative Co."
              location="Brampton, ON"
              price="$10"
              image="https://luxury.am/wp-content/uploads/2023/04/52781012862_ed864c9219_c.jpg"
              dateTime="Aug 12 • 7:00 PM"
            />

            <EventCard
              title="Sleep Under The Sea"
              organizer="Georgia Aquarium"
              location="Atlanta, GA"
              price="$139.99"
              image="https://www.georgiaaquarium.org/wp-content/uploads/2018/10/sleep-under-the-sea-4-1600x1065.jpg"
              dateTime="Aug 12 • 7:00 PM"
            />

            <EventCard
              title="Super Cool Event"
              organizer="Bibi"
              location="Waterloo, ON"
              price="$100"
              image="https://koreajoongangdaily.joins.com/data/photo/2022/11/21/159f5073-0127-4463-ba60-f15c4292d62c.jpg"
              dateTime="Aug 12 • 7:00 PM"
            />


          </div>

        </div>
      </div>

    </div>
  );
};

export default MainPage;