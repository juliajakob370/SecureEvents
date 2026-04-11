// Imports: React state, routing tools, shared styles, and logo.
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/SecurEventsStyle.css";
import "../../styles/Login&SignUp.css";
import logo from "../../assets/SecureEventLogo.png";

// Login code page component.
const LoginCodePage: React.FC = () => {
    // Form state.
    const [formData, setFormData] = useState({ code: "" });
    const [loading, setLoading] = useState(false);

    // Validation error state.
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";

    // Update code input.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value.replace(/\D/g, "")
        });
        setError("");
    };

    // Validate verification code.
    const validateForm = () => {
        if (!/^\d{6}$/.test(formData.code)) {
            setError("Code must be exactly 6 digits.");
            return false;
        }

        return true;
    };

    // Submit code form.
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            navigate("/main");
        }, 1500);
    };

    return (
        <div className="global-page">
            <div className="global-container auth-container">
                <header className="global-header"></header>

                <div
                    className="global-content auth-form"
                    style={{ gridTemplateColumns: "1fr" }}
                >
                    <div className="global-content-box">
                        <div className="login-signup-white-form-card">
                            <div className="login-signup-logo-wrapper">
                                <img src={logo} alt="SecureEvents" className="global-logo" />
                            </div>

                            <h2 className="login-title">Check your email!</h2>
                            <p className="code-sent-text">Verification code sent to</p>
                            <p className="email-text">
                                <span>{email}</span>
                            </p>

                            <form onSubmit={handleSubmit} className="login-form">
                                <div className="form-group">
                                    <input
                                        id="login-code"
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        placeholder=""
                                        inputMode="numeric"
                                        maxLength={6}
                                        required
                                    />
                                    <label htmlFor="login-code">Enter Code</label>
                                </div>

                                {error && <p className="form-error">{error}</p>}

                                <div className="button-row">
                                    <button
                                        type="button"
                                        className="resend-code-btn"
                                        onClick={() => {
                                            console.log("Resend clicked");
                                        }}
                                    >
                                        Resend Code
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="submit-code-btn"
                                    >
                                        {loading ? "Verifying..." : "Submit"}
                                    </button>
                                </div>
                            </form>

                            <div className="back-button-container">
                                <button
                                    type="button"
                                    className="back-btn"
                                    onClick={() => navigate("/login")}
                                >
                                    ← Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginCodePage;