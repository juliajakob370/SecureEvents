import React from "react";
import Header from "../../components/Header/Header";

// import one of your profile images
import profile0 from "../../assets/profilePics/profile0.png";

const MainPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      
      {/* HEADER */}
      <Header
        centerType="title"
        title="Search"
        showProfile={true}
        profileImage={profile0}
      />

    </div>
  );
};

export default MainPage;