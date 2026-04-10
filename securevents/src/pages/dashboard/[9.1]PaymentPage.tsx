// Imports: React state/effect, router hooks, reusable header, and styles.
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import "../../styles/MainPage.css";
import "../../styles/[9.1]PaymentPage.css";

// Card type used in payment page.
type SavedCard = {
    id: number;
    cardName: string;
    cardNumber: string;
    expiryDate: string;
    billingAddress: string;
};

// Payment page component.
const PaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Event and order info passed from Get Tickets page.
    const event = location.state?.event;
    const total = location.state?.total || 0;
    const quantity = location.state?.quantity || 1;

    // Saved cards loaded from localStorage.
    const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

    // Toggle for add-new-card form.
    const [showNewCardForm, setShowNewCardForm] = useState(false);

    // New card form state.
    const [cardName, setCardName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");
    const [billingAddress, setBillingAddress] = useState("");

    // Secure verification state.
    const [phoneNumber, setPhoneNumber] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [codeSent, setCodeSent] = useState(false);

    // Load cards from localStorage when page opens.
    useEffect(() => {
        const storedCards = localStorage.getItem("secureEventsCards");
        if (storedCards) {
            const parsedCards: SavedCard[] = JSON.parse(storedCards);
            setSavedCards(parsedCards);

            if (parsedCards.length > 0) {
                setSelectedCardId(parsedCards[0].id);
            }
        }
    }, []);

    // Save a new card locally.
    const handleAddNewCard = () => {
        if (!cardName || !cardNumber || !expiryDate || !billingAddress) return;

        const newCard: SavedCard = {
            id: Date.now(),
            cardName,
            cardNumber,
            expiryDate,
            billingAddress
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
    };

    // Simulate sending secure payment code.
    const handleSendCode = () => {
        if (!phoneNumber) return;
        setCodeSent(true);
    };

    // Final payment confirmation.
    const handleConfirmPayment = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCardId || !verificationCode) return;

        navigate("/ticket-booked", {
            state: {
                event,
                total,
                quantity
            }
        });
    };

    return (
        <div style={{ padding: "20px" }}>
            <Header centerType="title" title="Payment" showHome={true} />

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
                                    <p><strong>Tickets:</strong> {quantity}</p>
                                    <p><strong>Total Amount:</strong> ${Number(total).toFixed(2)}</p>
                                </>
                            ) : (
                                <p>No event selected.</p>
                            )}
                        </div>

                        {/* Payment form area */}
                        <div className="payment-form-card">
                            <h2>Choose Payment Method</h2>

                            {/* Saved cards list */}
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
                                                    <p>•••• •••• •••• {card.cardNumber.slice(-4)}</p>
                                                    <p>{card.expiryDate}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Toggle add new card */}
                            <div className="payment-action-row">
                                <button
                                    type="button"
                                    className="confirm-payment-btn secondary-btn"
                                    onClick={() => setShowNewCardForm(!showNewCardForm)}
                                >
                                    {showNewCardForm ? "Hide New Card Form" : "Add New Card"}
                                </button>
                            </div>

                            {/* Add new card form */}
                            {showNewCardForm && (
                                <div className="new-card-form-box">
                                    <div className="payment-form-grid">
                                        <div className="account-field">
                                            <label>Name on Card</label>
                                            <input
                                                type="text"
                                                value={cardName}
                                                onChange={(e) => setCardName(e.target.value)}
                                            />
                                        </div>

                                        <div className="account-field">
                                            <label>Card Number</label>
                                            <input
                                                type="text"
                                                value={cardNumber}
                                                onChange={(e) => setCardNumber(e.target.value)}
                                            />
                                        </div>

                                        <div className="account-field">
                                            <label>Expiry Date</label>
                                            <input
                                                type="text"
                                                value={expiryDate}
                                                onChange={(e) => setExpiryDate(e.target.value)}
                                                placeholder="MM/YY"
                                            />
                                        </div>

                                        <div className="account-field">
                                            <label>CVV</label>
                                            <input
                                                type="password"
                                                value={cvv}
                                                onChange={(e) => setCvv(e.target.value)}
                                            />
                                        </div>

                                        <div className="account-field payment-field-full">
                                            <label>Billing Address</label>
                                            <input
                                                type="text"
                                                value={billingAddress}
                                                onChange={(e) => setBillingAddress(e.target.value)}
                                            />
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

                            {/* Secure phone verification */}
                            <form onSubmit={handleConfirmPayment} className="payment-form">
                                <h3>Security Verification</h3>

                                <div className="account-field">
                                    <label>Phone Number</label>
                                    <input
                                        type="text"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="+1 123 456 7890"
                                        required
                                    />
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
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            placeholder="Enter code sent to your phone"
                                            required
                                        />
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