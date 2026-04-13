// Imports: React state/effect, reusable header, shared styles, and profile images.
import React, { useContext, useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import "../../styles/MainPage.css";
import "../../styles/[4]AccountPage.css";
import { AuthContext } from "../../context/AuthContext";
import { requestEmailChangeCodes, updateCurrentUser, updateProfileImage } from "../../api/authApi";
import { addSavedCard, listSavedCards, removeSavedCard, SavedCard } from "../../api/cardApi";

import profile0 from "../../assets/profilePics/profile0.png";
import profile1 from "../../assets/profilePics/profile1.png";
import profile2 from "../../assets/profilePics/profile2.png";
import profile3 from "../../assets/profilePics/profile3.png";
import profile4 from "../../assets/profilePics/profile4.png";
import profile5 from "../../assets/profilePics/profile5.png";
import profile6 from "../../assets/profilePics/profile6.png";
import profile7 from "../../assets/profilePics/profile7.png";

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
    const { user, applyUser, loading } = useContext(AuthContext);

    // Cards are scoped per-user on the backend so one account's saved cards
    // never leak into another and survive logout.

    // User info state.
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [selectedProfileIndex, setSelectedProfileIndex] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    const [profileMessage, setProfileMessage] = useState("");
    const [cardMessage, setCardMessage] = useState("");
    const [oldEmailCode, setOldEmailCode] = useState("");
    const [newEmailCode, setNewEmailCode] = useState("");
    const [emailChangePending, setEmailChangePending] = useState(false);

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

    // Load the current user's saved cards from the backend. If there's no
    // logged-in user yet, clear local state so a previous account's cards
    // never flash on screen.
    useEffect(() => {
        let cancelled = false;
        if (!user?.id) {
            setSavedCards([]);
            return;
        }
        (async () => {
            try {
                const cards = await listSavedCards();
                if (!cancelled) setSavedCards(cards);
            } catch {
                if (!cancelled) setSavedCards([]);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName ?? "Current");
            setLastName(user.lastName ?? "Name");
            setEmail(user.email ?? "current@email.com");
            const idx = user.profileImageIndex ?? 0;
            setSelectedProfileIndex(idx >= 0 && idx <= 7 ? idx : 0);
            setEmailChangePending(false);
            setOldEmailCode("");
            setNewEmailCode("");
        }
    }, [user]);

    const rawDisplayIndex = user?.profileImageIndex ?? 0;
    const displayedProfile = profileOptions[rawDisplayIndex >= 0 && rawDisplayIndex <= 7 ? rawDisplayIndex : 0];

    const handleSaveProfile = async () => {
        if (loading || !user) {
            setProfileMessage("Please wait for account data to load.");
            return;
        }

        const cleanedEmail = email.trim().toLowerCase();
        const cleanedFirstName = firstName.trim();
        const cleanedLastName = lastName.trim();
        const currentEmail = user?.email?.trim().toLowerCase() ?? "";

        if (!cleanedFirstName || !cleanedLastName) {
            setProfileMessage("Please enter first and last name.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail)) {
            setProfileMessage("Enter a valid email address.");
            return;
        }

        try {
            if (currentEmail && cleanedEmail !== currentEmail && !emailChangePending) {
                await requestEmailChangeCodes(cleanedEmail);
                setEmailChangePending(true);
                setProfileMessage("Verification codes sent for old and new email. Enter both codes to confirm email change.");
                return;
            }

            const result = await updateCurrentUser(
                cleanedFirstName,
                cleanedLastName,
                cleanedEmail,
                emailChangePending ? oldEmailCode.trim() : undefined,
                emailChangePending ? newEmailCode.trim() : undefined
            );

            if (result?.user) {
                applyUser(result.user);
            }
            setProfileMessage("Account information updated.");
            setEmailChangePending(false);
            setOldEmailCode("");
            setNewEmailCode("");
        } catch (err) {
            setProfileMessage(err instanceof Error ? err.message : "Failed to update account information.");
        }
    };

    const handleChooseProfile = async () => {
        if (!user) {
            setProfileMessage("Please wait for account data to load.");
            return;
        }

        try {
            const result = await updateProfileImage(selectedProfileIndex);
            if (result?.user) {
                applyUser(result.user);
            }
            setShowPopup(false);
            setProfileMessage("Profile picture updated.");
        } catch (err) {
            setProfileMessage(err instanceof Error ? err.message : "Failed to update profile picture.");
        }
    };

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
        } else {
            // Reject cards that are already expired.
            const [mm, yy] = expiryDate.split("/").map(Number);
            const expiryMonth = mm;
            const expiryYear = 2000 + yy;
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();
            if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
                newErrors.expiryDate = "This card has expired.";
            }
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

    // Save a new card to the backend for the current user.
    const handleAddCard = async () => {
        if (!validateCardForm()) return;
        if (!user?.id) {
            setCardMessage("Please wait for account data to load before saving a card.");
            return;
        }

        try {
            const newCard = await addSavedCard({
                cardName: cardName.trim(),
                cardNumber: cardNumber.replace(/\D/g, ""),
                expiryDate,
                cvv,
                billingAddress: billingAddress.trim()
            });
            setSavedCards((prev) => [...prev, newCard]);

            setCardName("");
            setCardNumber("");
            setExpiryDate("");
            setCvv("");
            setBillingAddress("");
            setErrors({});
            setCardMessage("Card saved successfully.");
        } catch (err) {
            setCardMessage(err instanceof Error ? err.message : "Failed to save card.");
        }
    };

    // Remove a saved card for the current user.
    const handleRemoveCard = async (cardId: number) => {
        try {
            await removeSavedCard(cardId);
            setSavedCards((prev) => prev.filter((c) => c.id !== cardId));
            setCardMessage("Card removed.");
        } catch (err) {
            setCardMessage(err instanceof Error ? err.message : "Failed to remove card.");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            {/* Header */}
            <Header
                centerType="title"
                title="MY ACCOUNT"
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
                                    src={displayedProfile}
                                    alt="Profile"
                                    className="account-profile-image"
                                />

                                <h2 className="account-profile-name">{`${firstName} ${lastName}`}</h2>
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
                                        <label>First Name</label>
                                        <input
                                            type="text"
                                            maxLength={50}
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            name="given-name"
                                            autoComplete="given-name"
                                        />
                                    </div>

                                    <div className="account-field">
                                        <label>Last Name</label>
                                        <input
                                            type="text"
                                            maxLength={50}
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            name="family-name"
                                            autoComplete="family-name"
                                        />
                                    </div>

                                    <div className="account-field">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            maxLength={100}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            name="email"
                                            autoComplete="email"
                                        />
                                    </div>

                                    {emailChangePending && (
                                        <>
                                            <div className="account-field">
                                                <label>Old Email Code</label>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={6}
                                                    value={oldEmailCode}
                                                    onChange={(e) => setOldEmailCode(e.target.value.replace(/\D/g, ""))}
                                                />
                                            </div>

                                            <div className="account-field">
                                                <label>New Email Code</label>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={6}
                                                    value={newEmailCode}
                                                    onChange={(e) => setNewEmailCode(e.target.value.replace(/\D/g, ""))}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="account-actions-row">
                                    <button className="save-account-btn" onClick={handleSaveProfile}>
                                        Save Account Info
                                    </button>
                                </div>

                                {profileMessage && (
                                    <p className={profileMessage.toLowerCase().includes("updated") || profileMessage.toLowerCase().includes("sent") || profileMessage.toLowerCase().includes("change") ? "form-success" : "form-error"}>
                                        {profileMessage}
                                    </p>
                                )}
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
                                            name="cc-name"
                                            autoComplete="cc-name"
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
                                            name="cc-number"
                                            autoComplete="cc-number"
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
                                            name="cc-exp"
                                            autoComplete="cc-exp"
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
                                            name="cc-csc"
                                            autoComplete="cc-csc"
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
                                            name="billing-address"
                                            autoComplete="billing street-address"
                                        />
                                        {errors.billingAddress && <p className="form-error">{errors.billingAddress}</p>}
                                    </div>
                                </div>

                                <div className="account-actions-row">
                                    <button className="save-account-btn" onClick={handleAddCard}>
                                        Add Card
                                    </button>
                                </div>

                                {cardMessage && (
                                    <p className={cardMessage.toLowerCase().includes("saved") || cardMessage.toLowerCase().includes("removed") ? "form-success" : "form-error"}>
                                        {cardMessage}
                                    </p>
                                )}
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

                                                <button
                                                    className="remove-card-btn"
                                                    onClick={() => handleRemoveCard(card.id)}
                                                >
                                                    Remove
                                                </button>
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
                                    className={`profile-choice ${selectedProfileIndex === index ? "selected" : ""}`}
                                    onClick={() => setSelectedProfileIndex(index)}
                                >
                                    <img src={profile} alt={`Profile ${index}`} />
                                </div>
                            ))}
                        </div>

                        <button
                            className="choose-profile-btn"
                            onClick={handleChooseProfile}
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
