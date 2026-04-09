import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import SearchBar from "../SearchBar/SearchBar";
import logo from "../../assets/SecureEventLogo.png";
import defaultProfile from "../../assets/profilePics/profile0.png";
import MenuDropdown from "../MenuDropdown/MenuDropdown";

const menuItems = [
  { label: "My Tickets", icon: "bi-ticket-perforated", path: "/tickets" },
  { label: "My Events", icon: "bi-calendar-event", path: "/events" },
  { label: "Post Event", icon: "bi-plus-circle", path: "/post-event" },
  { label: "Log Out", icon: "bi-box-arrow-right", path: "/" }
];

type HeaderProps = {
  centerType?: "title" | "search";
  title?: string;
  showProfile?: boolean;
  showHome?: boolean;
  profileImage?: string;
};

const Header: React.FC<HeaderProps> = ({
  centerType = "title",
  title = "",
  showProfile = false,
  showHome = false,
  profileImage,
}) => {
  const navigate = useNavigate();

  return (
    <div className="header">

      {/* LEFT: Logo */}
      <div className="header-left" onClick={() => navigate("/main")}>
          <img src={logo} alt="SecureEvents" className="header-logo" />
      </div>

      {/* CENTER: Title or Search */}
      <div className="header-center">
        {centerType === "title" && <h2>{title}</h2>}

        {centerType === "search" && <SearchBar />}
      </div>

      {/* RIGHT: Menu + Profile/Home */}
      <div className="header-right">

        {/* Menu icon */}
        <MenuDropdown items={menuItems} />

        {/* Profile picture */}
        {showProfile && (
          <img
            src={profileImage || defaultProfile}
            alt="Profile"
            className="header-profile"
            onClick={() => navigate("/account")}
          />
        )}

        

        {/* Home button */}
        {showHome && (
          <div
            className="header-home"
            onClick={() => navigate("/main")}
          >
            <i className="bi bi-house"></i>
          </div>
        )}

      </div>
    </div>
  );
};

export default Header;