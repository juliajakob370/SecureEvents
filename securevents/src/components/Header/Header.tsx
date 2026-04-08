import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import logo from "../../assets/SecureEventLogo.png";
import defaultProfile from "../../assets/profilePics/profile1.png";

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
      <div className="header-left" onClick={() => navigate("/")}>
        <img src={logo} alt="SecureEvents" className="header-logo" />
      </div>

      {/* CENTER: Title or Search */}
      <div className="header-center">
        {centerType === "title" && <h2>{title}</h2>}

        {centerType === "search" && (
          <input
            type="text"
            className="header-search"
            placeholder="Search events..."
          />
        )}
      </div>

      {/* RIGHT: Menu + Profile/Home */}
      <div className="header-right">

        {/* Menu icon */}
        <div className="menu-icon">
          ☰
        </div>

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
            onClick={() => navigate("/")}
          >
            🏠
          </div>
        )}

      </div>
    </div>
  );
};

export default Header;