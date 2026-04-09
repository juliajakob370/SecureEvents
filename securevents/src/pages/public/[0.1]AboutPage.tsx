// Imports: navigation hook, logo asset, and global + about styles.
import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/SecureEventLogo.png";
import "../../styles/SecurEventsStyle.css";
import "../../styles/[0.1]AboutPage.css";

// Public About Page component (before login).
const AboutPage: React.FC = () => {

    // Navigation hook for page redirects.
    const navigate = useNavigate();

    return (
        // Global page wrapper for consistent layout.
        <div className="global-page">
            <div className="global-container">

                {/* Header with back + auth buttons */}
                <header className="global-header">
                    <button className="global-btn" onClick={() => navigate("/")}>
                        Back
                    </button>

                    <div className="header-actions">
                        <button className="signup-btn" onClick={() => navigate("/signup")}>
                            Sign Up
                        </button>

                        <button className="login-btn" onClick={() => navigate("/login")}>
                            Log In
                        </button>
                    </div>
                </header>

                {/* Main content section */}
                <main className="global-main">

                    {/* Clickable logo returning to landing page */}
                    <div className="landing-logo-wrapper">
                        <img
                            src={logo}
                            alt="SecurEvents logo"
                            className="landing-logo about-logo-clickable"
                            onClick={() => navigate("/")}
                        />
                    </div>

                    {/* About content card */}
                    <div className="about-public-card">
                        <h2>About SecurEvents</h2>

                        <p>
                            SecurEvents is a secure event booking platform that allows users
                            to browse events, book tickets, and manage their event activity in
                            one place.
                        </p>

                        <p>
                            Our goal is to build a system that is both user friendly and
                            security focused, especially when handling guest details, event
                            information, and payment-related data.
                        </p>

                        <p>
                            The application is being designed with a purple visual theme,
                            reusable React components, and clear page navigation to create a
                            polished and professional experience.
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AboutPage;