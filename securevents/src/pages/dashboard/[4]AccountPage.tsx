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

// Profile picture options used in popup.
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

// Main account page inside dashboard.
const AccountPage: React.FC = () => {
    // State for account info and popup.
    const [fullName, setFullName] = useState("Current Name");
    const [email, setEmail] = useState("current@email.com");
    const [selectedProfile, setSelectedProfile] = useState(profile0);
    const [showPopup, setShowPopup] = useState(false);

    // State for payment info.
    const [cardName, setCardName] = useState("Current Name");
    const [cardLast4, setCardLast4] = useState("4242");
    const [billingAddress, setBillingAddress] = useState("123 Example Street, Waterloo, ON");

    return (
        <div style={{ padding: "20px" }}>
            {/* Header */}
            <Header centerType="title" title="My Account" showHome={true} />

            {/* Main scroll container */}
            <div className="events-container">
                <div className="events-scroll account-scroll">
                    <div className="account-page-layout">

                        {/* Left profile card */}
                        <div className="account-profile-card">
                            <div className="account-profile-top">
                                <img
                                    src={selectedProfile}
                                    alt="Profile"
                                    className="account-profile-image"
                                />

                                <h2 className="account-profile-name">{fullName}</h2>
                                <p className="account-profile-email">{email}</p>
                            </div>

                            <button
                                className="change-picture-btn"
                                onClick={() => setShowPopup(true)}
                            >
                                Change Picture
                            </button>
                        </div>

                        {/* Right content */}
                        <div className="account-details-area">

                            {/* Account info card */}
                            <div className="account-section-card">
                                <div className="account-section-header">
                                    <h3>Account Information</h3>
                                    <p>Edit your personal details</p>
                                </div>

                                <div className="account-form-grid">
                                    <div className="account-field">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                    </div>

                                    <div className="account-field">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment info card */}
                            <div className="account-section-card">
                                <div className="account-section-header">
                                    <h3>Payment Information</h3>
                                    <p>Manage your saved payment details</p>
                                </div>

                                <div className="payment-info-box">
                                    <div className="payment-card-preview">
                                        <div className="payment-card-top">
                                            <span className="payment-chip"></span>
                                            <span className="payment-brand">VISA</span>
                                        </div>

                                        <div className="payment-card-number">
                                            •••• •••• •••• {cardLast4}
                                        </div>

                                        <div className="payment-card-bottom">
                                            <div>
                                                <small>Card Holder</small>
                                                <p>{cardName}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="account-form-grid">
                                        <div className="account-field">
                                            <label>Name on Card</label>
                                            <input
                                                type="text"
                                                value={cardName}
                                                onChange={(e) => setCardName(e.target.value)}
                                            />
                                        </div>

                                        <div className="account-field">
                                            <label>Last 4 Digits</label>
                                            <input
                                                type="text"
                                                maxLength={4}
                                                value={cardLast4}
                                                onChange={(e) => setCardLast4(e.target.value)}
                                            />
                                        </div>

                                        <div className="account-field account-field-full">
                                            <label>Billing Address</label>
                                            <input
                                                type="text"
                                                value={billingAddress}
                                                onChange={(e) => setBillingAddress(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Save button row */}
                            <div className="account-actions-row">
                                <button className="save-account-btn">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile picture popup */}
            {showPopup && (
                <div className="profile-popup-overlay">
                    <div className="profile-popup">
                        <button
                            className="close-popup-btn"
                            onClick={() => setShowPopup(false)}
                        >
                            ×
                        </button>

                        <h3>Choose a Profile Picture</h3>
                        <p className="profile-popup-subtitle">
                            Pick the profile style you want for your account
                        </p>

                        <div className="profile-grid">
                            {profileOptions.map((profile, index) => (
                                <div
                                    key={index}
                                    className={`profile-choice ${selectedProfile === profile ? "selected" : ""
                                        }`}
                                    onClick={() => setSelectedProfile(profile)}
                                >
                                    <img src={profile} alt={`Profile ${index}`} />
                                </div>
                            ))}
                        </div>

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