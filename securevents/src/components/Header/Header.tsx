// Imports: React, router navigation, local styles, search bar, logo, default profile, and menu dropdown.
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import SearchBar from "../SearchBar/SearchBar";
import logo from "../../assets/SecureEventLogo.png";
import defaultProfile from "../../assets/profilePics/profile0.png";
import MenuDropdown from "../MenuDropdown/MenuDropdown";

// Dashboard menu items shown in dropdown.
const menuItems = [
    { label: "My Tickets", icon: "bi-ticket-perforated", path: "/tickets" },
    { label: "My Events", icon: "bi-calendar-event", path: "/my-events" },
    { label: "Post Event", icon: "bi-plus-circle", path: "/post-event" },
    { label: "About", icon: "bi-info-circle", path: "/about-dashboard" },
    { label: "Log Out", icon: "bi-box-arrow-right", path: "/" },
];

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
    onSearch
}) => {
    const navigate = useNavigate();

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
                <MenuDropdown items={menuItems} />

                {showProfile && (
                    <img
                        src={profileImage || defaultProfile}
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