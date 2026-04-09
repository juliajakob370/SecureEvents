// Imports: React state, reusable Header, shared styles, and profile images.
import React, { useState } from "react";
import Header from "../../components/Header/Header";
import "../../styles/MainPage.css";
import "../../styles/[4]AccountPage.css";

import profile0 from "../../assets/profilePics/profile0.png";
import profile1 from "../../assets/profilePics/profile1.png";
import profile2 from "../../assets/profilePics/profile2.png";
import profile3 from "../../assets/profilePics/profile3.png";
import profile4 from "../../assets/profilePics/profile4.png";
import profile5 from "../../assets/profilePics/profile5.png";
import profile6 from "../../assets/profilePics/profile6.png";
import profile7 from "../../assets/profilePics/profile7.png";

// List of selectable profile pictures used in popup.
const profileOptions = [
    profile0,
    profile1,
    profile2,
    profile3,
    profile4,
    profile5,
    profile6,
    profile7,
];

// Main Account Page component for dashboard view.
const AccountPage: React.FC = () => {

    // State: stores user info, selected profile, and popup visibility.
    const [fullName, setFullName] = useState("Current Name");
    const [email, setEmail] = useState("current@email");
    const [selectedProfile, setSelectedProfile] = useState(profile0);
    const [showPopup, setShowPopup] = useState(false);

    return (
        // Page wrapper with spacing.
        <div style={{ padding: "20px" }}>

            {/* Header: title centered + home button */}
            <Header
                centerType="title"
                title="My Account"
                showHome={true}
            />

            {/* Main content container using dashboard scroll style */}
            <div className="events-container">
                <div className="events-scroll account-scroll">

                    {/* Main account card */}
                    <div className="account-card">

                        {/* Left side: profile image + change button */}
                        <div className="account-left">
                            <img
                                src={selectedProfile}
                                alt="Profile"
                                className="account-profile-image"
                            />

                            <button
                                className="change-picture-btn"
                                onClick={() => setShowPopup(true)}
                            >
                                Change Picture
                            </button>
                        </div>

                        {/* Right side: editable fields and save */}
                        <div className="account-right">

                            {/* Full name input */}
                            <div className="account-field">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>

                            {/* Email input */}
                            <div className="account-field">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            {/* Payment placeholder section */}
                            <div className="account-field">
                                <label>Payment Info?</label>
                                <div className="payment-placeholder">
                                    Payment information section coming soon
                                </div>
                            </div>

                            {/* Save button */}
                            <button className="save-account-btn">Save</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile picture selection popup */}
            {showPopup && (
                <div className="profile-popup-overlay">
                    <div className="profile-popup">

                        {/* Close popup button */}
                        <button
                            className="close-popup-btn"
                            onClick={() => setShowPopup(false)}
                        >
                            ×
                        </button>

                        {/* Popup title */}
                        <h3>Choose a Profile Picture</h3>

                        {/* Grid of profile options */}
                        <div className="profile-grid">
                            {profileOptions.map((profile, index) => (
                                <div
                                    key={index}
                                    className={`profile-choice ${selectedProfile === profile ? "selected" : ""}`}
                                    onClick={() => setSelectedProfile(profile)}
                                >
                                    <img src={profile} alt={`Profile ${index}`} />
                                </div>
                            ))}
                        </div>

                        {/* Confirm selection */}
                        <button
                            className="choose-profile-btn"
                            onClick={() => setShowPopup(false)}
                        >
                            Choose
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountPage;