// Imports: reusable header, shared styles, dashboard styles, and profile image.
import React from "react";
import Header from "../../components/Header/Header";
import "../../styles/MainPage.css";
import "../../styles/[11]AboutPage.css";
import profile0 from "../../assets/profilePics/profile0.png";

// Dashboard About Page component (after login).
const AboutDashboardPage: React.FC = () => {

    return (
        // Page wrapper with spacing.
        <div style={{ padding: "20px" }}>

            {/* Dashboard header with title + profile icon */}
            <Header
                centerType="title"
                title="About"
                showProfile={true}
                profileImage={profile0}
            />

            {/* Scrollable dashboard container */}
            <div className="events-container">
                <div className="events-scroll about-dashboard-scroll">

                    {/* About content card */}
                    <div className="about-dashboard-card">
                        <h2>About SecurEvents</h2>

                        <p>
                            SecurEvents is a secure event booking application where users can
                            browse events, reserve tickets, and manage event activity through
                            one platform.
                        </p>

                        <p>
                            This project focuses on both functionality and security. It is
                            designed to support event guests and organizers while also
                            demonstrating application security concepts.
                        </p>

                        <p>
                            The front-end is being developed in React with reusable
                            components, a purple theme, and structured page navigation. The
                            backend is being developed separately and will later connect to
                            these pages.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutDashboardPage;