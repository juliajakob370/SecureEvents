import React from "react";
import Header from "../../components/Header/Header";
import "../../styles/MainPage.css";
// import one of your profile images
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

          {/* TEMP: fake cards so you can SEE scrolling */}
          {Array.from({ length: 10 }).map((_, index) => (
            <div className="event-card-placeholder" key={index}>
              Event #{index + 1}
            </div>
          ))}

        </div>
      </div>

    </div>
  );
};

export default MainPage;