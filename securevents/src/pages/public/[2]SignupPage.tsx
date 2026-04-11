// Imports: React state, routing tools, shared styles, and logo.
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/SecurEventsStyle.css";
import "../../styles/Login&SignUp.css";
import logo from "../../assets/SecureEventLogo.png";

// Signup page component.
const SignupPage: React.FC = () => {
    // Form state.
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: ""
    });

    const [loading, setLoading] = useState(false);

    // Validation error state.
    const [errors, setErrors] = useState<Record<string, string>>({});

    const navigate = useNavigate();

    // Update input values.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({});
    };

    // Validate signup form.
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        const firstName = formData.firstName.trim();
        const lastName = formData.lastName.trim();
        const email = formData.email.trim();

        if (!/^[A-Za-z\s'-]{2,50}$/.test(firstName)) {
            newErrors.firstName = "First name must be 2 to 50 letters.";
        }

        if (!/^[A-Za-z\s'-]{2,50}$/.test(lastName)) {
            newErrors.lastName = "Last name must be 2 to 50 letters.";
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Enter a valid email address.";
        } else if (email.length > 100) {
            newErrors.email = "Email is too long.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit signup form.
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            navigate("/signup-code", {
                state: {
                    firstName: formData.firstName.trim(),
                    email: formData.email.trim()
                }
            });
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

                            <h2 className="login-title">Events await you!</h2>

                            <form onSubmit={handleSubmit} className="login-form">
                                <div className="form-group">
                                    <input
                                        id="firstName"
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder=""
                                        maxLength={50}
                                        required
                                    />
                                    <label htmlFor="firstName">First Name</label>
                                </div>
                                {errors.firstName && <p className="form-error">{errors.firstName}</p>}

                                <div className="form-group">
                                    <input
                                        id="lastName"
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder=""
                                        maxLength={50}
                                        required
                                    />
                                    <label htmlFor="lastName">Last Name</label>
                                </div>
                                {errors.lastName && <p className="form-error">{errors.lastName}</p>}

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
                                {errors.email && <p className="form-error">{errors.email}</p>}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="send-code-btn"
                                >
                                    {loading ? "Sending Code..." : "Sign Up!"}
                                </button>
                            </form>
                        </div>

                        <div className="auth-footer">
                            <p className="auth-footer-text">
                                Already have an account?{" "}
                                <Link to="/login" className="login-link-button">
                                    Log in!
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;