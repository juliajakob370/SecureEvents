// Imports: React, router navigation, local styles, search bar, logo, default profile, and menu dropdown.
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import SearchBar from "../SearchBar/SearchBar";
import logo from "../../assets/SecureEventLogo.png";
import profile0 from "../../assets/profilePics/profile0.png";
import profile1 from "../../assets/profilePics/profile1.png";
import profile2 from "../../assets/profilePics/profile2.png";
import profile3 from "../../assets/profilePics/profile3.png";
import profile4 from "../../assets/profilePics/profile4.png";
import profile5 from "../../assets/profilePics/profile5.png";
import profile6 from "../../assets/profilePics/profile6.png";
import profile7 from "../../assets/profilePics/profile7.png";
import MenuDropdown from "../MenuDropdown/MenuDropdown";

// Profile picture lookup: the backend stores the index (0 is the default) and
// each user's picture is derived here so no per-browser state leaks across accounts.
const PROFILE_IMAGES = [profile0, profile1, profile2, profile3, profile4, profile5, profile6, profile7];
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

// Props for reusable header component.
type HeaderProps = {
  centerType?: "title" | "search";
  title?: string;
  showProfile?: boolean;
  showHome?: boolean;
  profileImage?: string;
  onSearch?: (value: string) => void;
};

// Reusable header for dashboard pages.
const Header: React.FC<HeaderProps> = ({
  centerType = "title",
  title = "",
  showProfile = false,
  showHome = false,
  profileImage,
  onSearch,
}) => {
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext);

  const menuItems = [
    { label: "My Events", icon: "bi-calendar-event", path: "/my-events" },
    { label: "My Tickets", icon: "bi-ticket-perforated", path: "/my-tickets" },
    { label: "Post Event", icon: "bi-plus-circle", path: "/post-event" },
    ...(user?.role === "Admin" ? [{ label: "Admin", icon: "bi-shield-lock", path: "/admin" }] : []),
    { label: "About", icon: "bi-info-circle", path: "/about-dashboard" },
    { label: "Log Out", icon: "bi-box-arrow-right", path: "/" },
  ];

  const profileIndex = user?.profileImageIndex ?? 0;
  const resolvedProfile = PROFILE_IMAGES[profileIndex] ?? PROFILE_IMAGES[0];

  const handleMenuClick = async (item: { label: string; path: string }) => {
    if (item.label === "Log Out") {
      await logout();
      navigate("/login");
      return;
    }

    navigate(item.path);
  };

  return (
    <div className="header">
      {/* Left: clickable logo */}
      <div className="header-left" onClick={() => navigate("/main")}>
        <img src={logo} alt="SecureEvents" className="header-logo" />
      </div>

      {/* Center: either title or search */}
      <div className="header-center">
        {centerType === "title" && <h2>{title}</h2>}
        {centerType === "search" && <SearchBar onSearch={onSearch} />}
      </div>

      {/* Right: menu and profile/home button */}
      <div className="header-right">
        <MenuDropdown items={menuItems} onItemClick={handleMenuClick} />

        {showProfile && (
          <img
            src={profileImage || resolvedProfile}
            alt="Profile"
            className="header-profile"
            onClick={() => navigate("/account")}
          />
        )}

        {showHome && (
          <div className="header-home" onClick={() => navigate("/main")}>
            <i className="bi bi-house"></i>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
