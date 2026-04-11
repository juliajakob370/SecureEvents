// Imports: React hooks, router hooks, reusable header, and styles.
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import "../../styles/MainPage.css";
import "../../styles/[9.1]PaymentPage.css";

// Type for selected event.
type SelectedEvent = {
    title: string;
    organizer: string;
    location: string;
    price: string;
    image: string;
    date: string;
    time: string;
    description: string;
    status: string;
    capacity: number;
};

// Type for locally saved card.
type SavedCard = {
    id: number;
    cardName: string;
    cardLast4: string;
    expiryDate: string;
    billingAddress: string;
};

// Payment page.
const PaymentPage: React.FC = () => {
    // Router tools.
    const navigate = useNavigate();
    const location = useLocation();

    // Booking data from Get Tickets page.
    const event = location.state?.event as SelectedEvent | undefined;
    const quantity = location.state?.quantity || 1;
    const total = location.state?.total || 0;

    // Saved cards state.
    const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

    // New card form state.
    const [showNewCardForm, setShowNewCardForm] = useState(false);
    const [cardName, setCardName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");
    const [billingAddress, setBillingAddress] = useState("");

    // Phone verification state.
    const [phoneNumber, setPhoneNumber] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [codeSent, setCodeSent] = useState(false);

    // Validation errors.
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load saved cards from localStorage.
    useEffect(() => {
        const storedCards = localStorage.getItem("secureEventsCards");

        if (storedCards) {
            try {
                const parsedCards: SavedCard[] = JSON.parse(storedCards);
                setSavedCards(parsedCards);

                if (parsedCards.length > 0) {
                    setSelectedCardId(parsedCards[0].id);
                }
            } catch (error) {
                console.error("Failed to load saved cards:", error);
            }
        }
    }, []);

    // Selected card details.
    const selectedCard = useMemo(() => {
        return savedCards.find((card) => card.id === selectedCardId) || null;
    }, [savedCards, selectedCardId]);

    // Validate new card form.
    const validateNewCard = () => {
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

        setErrors((prev) => ({ ...prev, ...newErrors }));
        return Object.keys(newErrors).length === 0;
    };

    // Save a new card without storing CVV.
    const handleAddNewCard = () => {
        if (!validateNewCard()) {
            return;
        }

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
        setSelectedCardId(newCard.id);

        setCardName("");
        setCardNumber("");
        setExpiryDate("");
        setCvv("");
        setBillingAddress("");
        setShowNewCardForm(false);
        setErrors({});
    };

    // Validate phone before sending code.
    const handleSendCode = () => {
        const cleanedPhone = phoneNumber.replace(/[^\d]/g, "");

        if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {
            setErrors((prev) => ({
                ...prev,
                phoneNumber: "Enter a valid phone number."
            }));
            return;
        }

        setErrors((prev) => {
            const updated = { ...prev };
            delete updated.phoneNumber;
            return updated;
        });

        setCodeSent(true);
    };

    // Final secure payment confirmation.
    const handleConfirmPayment = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};

        if (!event) {
            alert("No event selected.");
            return;
        }

        if (!selectedCardId) {
            newErrors.selectedCard = "Please select a saved card.";
        }

        if (!codeSent) {
            newErrors.verificationCode = "Please send the verification code first.";
        } else if (!/^\d{6}$/.test(verificationCode)) {
            newErrors.verificationCode = "Verification code must be 6 digits.";
        }

        setErrors((prev) => ({ ...prev, ...newErrors }));

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        navigate("/ticket-booked", {
            state: {
                event,
                quantity,
                total,
                selectedCard
            }
        });
    };

    return (
        <div style={{ padding: "20px" }}>
            {/* Header */}
            <Header centerType="title" title="Payment" showHome={true} />

            {/* Main container */}
            <div className="events-container">
                <div className="events-scroll payment-scroll">
                    <div className="payment-page-layout">
                        {/* Order summary */}
                        <div className="payment-summary-card">
                            <h2>Order Summary</h2>

                            {event ? (
                                <>
                                    <p><strong>Event:</strong> {event.title}</p>
                                    <p><strong>Organizer:</strong> {event.organizer}</p>
                                    <p><strong>Date:</strong> {event.date}</p>
                                    <p><strong>Time:</strong> {event.time}</p>
                                    <p><strong>Tickets:</strong> {quantity}</p>
                                    <p><strong>Total Amount:</strong> ${Number(total).toFixed(2)}</p>
                                </>
                            ) : (
                                <p>No event selected.</p>
                            )}
                        </div>

                        {/* Payment form card */}
                        <div className="payment-form-card">
                            <h2>Choose Payment Method</h2>

                            {/* Saved cards section */}
                            {savedCards.length > 0 && (
                                <div className="saved-cards-section">
                                    <h3>Saved Cards</h3>

                                    <div className="saved-card-list">
                                        {savedCards.map((card) => (
                                            <label key={card.id} className="saved-card-option">
                                                <input
                                                    type="radio"
                                                    name="selectedCard"
                                                    checked={selectedCardId === card.id}
                                                    onChange={() => setSelectedCardId(card.id)}
                                                />

                                                <div className="saved-card-box">
                                                    <p><strong>{card.cardName}</strong></p>
                                                    <p>•••• •••• •••• {card.cardLast4}</p>
                                                    <p>{card.expiryDate}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.selectedCard && <p className="form-error">{errors.selectedCard}</p>}
                                </div>
                            )}

                            {/* Add new card toggle */}
                            <div className="payment-action-row">
                                <button
                                    type="button"
                                    className="confirm-payment-btn secondary-btn"
                                    onClick={() => setShowNewCardForm(!showNewCardForm)}
                                >
                                    {showNewCardForm ? "Hide New Card Form" : "Add New Card"}
                                </button>
                            </div>

                            {/* New card form */}
                            {showNewCardForm && (
                                <div className="new-card-form-box">
                                    <div className="payment-form-grid">
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
                                                placeholder="1234 5678 9012 3456"
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
                                                placeholder="123"
                                            />
                                            {errors.cvv && <p className="form-error">{errors.cvv}</p>}
                                        </div>

                                        <div className="account-field payment-field-full">
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

                                    <div className="payment-action-row">
                                        <button
                                            type="button"
                                            className="confirm-payment-btn"
                                            onClick={handleAddNewCard}
                                        >
                                            Save Card
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Security verification form */}
                            <form onSubmit={handleConfirmPayment} className="payment-form">
                                <h3>Security Verification</h3>

                                <div className="account-field">
                                    <label>Phone Number</label>
                                    <input
                                        type="text"
                                        inputMode="tel"
                                        maxLength={20}
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="+1 123 456 7890"
                                        required
                                    />
                                    {errors.phoneNumber && <p className="form-error">{errors.phoneNumber}</p>}
                                </div>

                                <div className="payment-action-row">
                                    <button
                                        type="button"
                                        className="confirm-payment-btn secondary-btn"
                                        onClick={handleSendCode}
                                    >
                                        Send Verification Code
                                    </button>
                                </div>

                                {codeSent && (
                                    <div className="account-field">
                                        <label>Enter Verification Code</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={6}
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                                            placeholder="Enter 6-digit code"
                                            required
                                        />
                                        {errors.verificationCode && <p className="form-error">{errors.verificationCode}</p>}
                                    </div>
                                )}

                                <button type="submit" className="confirm-payment-btn">
                                    Confirm Secure Payment
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;