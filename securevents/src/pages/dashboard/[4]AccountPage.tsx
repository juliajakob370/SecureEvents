// Imports: React state/effect, reusable header, shared styles, and profile images.
import React, { useEffect, useState } from "react";
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

// Card type for saved payment methods.
type SavedCard = {
    id: number;
    cardName: string;
    cardLast4: string;
    expiryDate: string;
    billingAddress: string;
};

// Selectable profile pictures.
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

// Account page component.
const AccountPage: React.FC = () => {
    // User info state.
    const [fullName, setFullName] = useState("Current Name");
    const [email, setEmail] = useState("current@email.com");
    const [selectedProfile, setSelectedProfile] = useState(profile0);
    const [showPopup, setShowPopup] = useState(false);

    // Card form state.
    const [cardName, setCardName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");
    const [billingAddress, setBillingAddress] = useState("");

    // Saved cards state.
    const [savedCards, setSavedCards] = useState<SavedCard[]>([]);

    // Validation errors.
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load saved cards on page open.
    useEffect(() => {
        const storedCards = localStorage.getItem("secureEventsCards");
        if (storedCards) {
            setSavedCards(JSON.parse(storedCards));
        }
    }, []);

    // Validate add card form.
    const validateCardForm = () => {
        const newErrors: Record<string, string> = {};

        const trimmedName = cardName.trim();
        const digitsOnly = cardNumber.replace(/\D/g, "");
        const trimmedAddress = billingAddress.trim();

        if (!/^[A-Za-z\s'-]{2,50}$/.test(trimmedName)) {
            newErrors.cardName = "Name must be 2 to 50 letters.";
        }

        if (!/^\d{16}$/.test(digitsOnly)) {
            newErrors.cardNumber = "Card number must be exactly 16 digits.";
        }

        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
            newErrors.expiryDate = "Expiry must be in MM/YY format.";
        }

        if (!/^\d{3,4}$/.test(cvv)) {
            newErrors.cvv = "CVV must be 3 or 4 digits.";
        }

        if (!trimmedAddress || trimmedAddress.length > 150) {
            newErrors.billingAddress = "Billing address is required.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Save a new card to localStorage.
    const handleAddCard = () => {
        if (!validateCardForm()) return;

        const digitsOnly = cardNumber.replace(/\D/g, "");

        const newCard: SavedCard = {
            id: Date.now(),
            cardName: cardName.trim(),
            cardLast4: digitsOnly.slice(-4),
            expiryDate,
            billingAddress: billingAddress.trim()
        };

        const updatedCards = [...savedCards, newCard];
        setSavedCards(updatedCards);
        localStorage.setItem("secureEventsCards", JSON.stringify(updatedCards));

        setCardName("");
        setCardNumber("");
        setExpiryDate("");
        setCvv("");
        setBillingAddress("");
        setErrors({});
    };

    return (
        <div style={{ padding: "20px" }}>
            {/* Header */}
            <Header
                centerType="title"
                title="My Account"
                showHome={true}
            />

            {/* Main content */}
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

                        {/* Right side sections */}
                        <div className="account-details-area">
                            {/* Account details card */}
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
                                            maxLength={50}
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                    </div>

                                    <div className="account-field">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            maxLength={100}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Add card form */}
                            <div className="account-section-card">
                                <div className="account-section-header">
                                    <h3>Add Payment Card</h3>
                                    <p>Add more cards for secure checkout</p>
                                </div>

                                <div className="account-form-grid">
                                    <div className="account-field">
                                        <label>Name on Card</label>
                                        <input
                                            type="text"
                                            maxLength={50}
                                            value={cardName}
                                            onChange={(e) => setCardName(e.target.value)}
                                        />
                                        {errors.cardName && <p className="form-error">{errors.cardName}</p>}
                                    </div>

                                    <div className="account-field">
                                        <label>Card Number</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={19}
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(e.target.value.replace(/[^\d\s]/g, ""))}
                                        />
                                        {errors.cardNumber && <p className="form-error">{errors.cardNumber}</p>}
                                    </div>

                                    <div className="account-field">
                                        <label>Expiry Date</label>
                                        <input
                                            type="text"
                                            maxLength={5}
                                            value={expiryDate}
                                            onChange={(e) => setExpiryDate(e.target.value)}
                                            placeholder="MM/YY"
                                        />
                                        {errors.expiryDate && <p className="form-error">{errors.expiryDate}</p>}
                                    </div>

                                    <div className="account-field">
                                        <label>CVV</label>
                                        <input
                                            type="password"
                                            inputMode="numeric"
                                            maxLength={4}
                                            value={cvv}
                                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                                        />
                                        {errors.cvv && <p className="form-error">{errors.cvv}</p>}
                                    </div>

                                    <div className="account-field account-field-full">
                                        <label>Billing Address</label>
                                        <input
                                            type="text"
                                            maxLength={150}
                                            value={billingAddress}
                                            onChange={(e) => setBillingAddress(e.target.value)}
                                        />
                                        {errors.billingAddress && <p className="form-error">{errors.billingAddress}</p>}
                                    </div>
                                </div>

                                <div className="account-actions-row">
                                    <button className="save-account-btn" onClick={handleAddCard}>
                                        Add Card
                                    </button>
                                </div>
                            </div>

                            {/* Saved cards section */}
                            <div className="account-section-card">
                                <div className="account-section-header">
                                    <h3>Saved Cards</h3>
                                    <p>Your available payment methods</p>
                                </div>

                                <div className="saved-account-card-list">
                                    {savedCards.length === 0 ? (
                                        <p className="empty-card-text">No saved cards yet.</p>
                                    ) : (
                                        savedCards.map((card) => (
                                            <div key={card.id} className="saved-payment-card">
                                                <div className="saved-payment-card-top">
                                                    <span className="payment-chip"></span>
                                                    <span className="payment-brand">VISA</span>
                                                </div>

                                                <div className="saved-payment-card-number">
                                                    •••• •••• •••• {card.cardLast4}
                                                </div>

                                                <div className="saved-payment-card-bottom">
                                                    <div>
                                                        <small>Card Holder</small>
                                                        <p>{card.cardName}</p>
                                                    </div>

                                                    <div>
                                                        <small>Expires</small>
                                                        <p>{card.expiryDate}</p>
                                                    </div>
                                                </div>

                                                <div className="saved-payment-card-address">
                                                    <small>Billing Address</small>
                                                    <p>{card.billingAddress}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile popup */}
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
                                    className={`profile-choice ${selectedProfile === profile ? "selected" : ""}`}
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