// Imports: React state, routing tools, shared styles, and logo.
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/SecurEventsStyle.css";
import "../../styles/Login&SignUp.css";
import logo from "../../assets/SecureEventLogo.png";

// Login page component.
const LoginPage: React.FC = () => {
    // Form state.
    const [formData, setFormData] = useState({ email: "" });
    const [loading, setLoading] = useState(false);

    // Validation error state.
    const [error, setError] = useState("");

    const navigate = useNavigate();

    // Update input state.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    // Validate email format.
    const validateForm = () => {
        const trimmedEmail = formData.email.trim();

        if (!trimmedEmail) {
            setError("Email is required.");
            return false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            setError("Enter a valid email address.");
            return false;
        }

        if (trimmedEmail.length > 100) {
            setError("Email is too long.");
            return false;
        }

        return true;
    };

    // Submit login request.
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            navigate("/login-code", { state: { email: formData.email.trim() } });
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

                            <h2 className="login-title">Welcome back! What's your email?</h2>

                            <form onSubmit={handleSubmit} className="login-form">
                                <div className="form-group">
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder=""
                                        maxLength={100}
                                        required
                                    />
                                    <label htmlFor="email">Email</label>
                                </div>

                                {error && <p className="form-error">{error}</p>}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="send-code-btn"
                                >
                                    {loading ? "Sending Code..." : "Send Code"}
                                </button>
                            </form>
                        </div>

                        <div className="auth-footer">
                            <p className="auth-footer-text">
                                Don't have an account?{" "}
                                <Link to="/signup" className="signup-link-button">
                                    Sign up here!
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;