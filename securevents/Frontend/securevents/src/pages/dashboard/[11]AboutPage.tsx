// Imports: reusable header, shared styles, dashboard styles, and profile image.
import React, { useState } from "react";
import Header from "../../components/Header/Header";
import "../../styles/MainPage.css";
import "../../styles/[11]AboutPage.css";
import profilem from "../../assets/profilePics/profile4.png";
import profilej from "../../assets/profilePics/profile5.png";
import profileb from "../../assets/profilePics/profile6.png";


// Dashboard About Page component (after login).
const AboutDashboardPage: React.FC = () => {
    const [flippedCard, setFlippedCard] = useState<number | null>(null);
    

    return (
        // Page wrapper with spacing.
        <div style={{ padding: "20px" }}>

            {/* Dashboard header with title + profile icon */}
            <Header
                centerType="title"
                title="About"
                showProfile={true}
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
                            The SecurEvents application is designed to solve security issues commonly 
                            found in event management systems. Many existing systems allow users to register, 
                            book tickets, and manage events, but they often contain vulnerabilities such as weak authentication, 
                            broken access control, and insecure data handling.
                        </p>

                    </div>

                    {/* About content card */}
                    <div className="about-dashboard-card">
                        <h2>"Meet" Our Team</h2>

                        <p>
                            We are a team of three passionate developers dedicated to creating secure and user-friendly applications.
                        </p>
                        <p>
                            For this secure application we've considered that social engineering could be used to infiltrate our system, 
                            so we are choosing to keeping our team's about page somewhat anonymous to prevent any potential social engineering attacks against our team members.
                        </p>
                        {/* Team Profiles */}
                        <div className="team-grid">

                            <div
                                className="team-card"
                                onClick={() => setFlippedCard(flippedCard === 0 ? null : 0)} 
                            >
                                <div
                                    className={`team-card-inner ${flippedCard === 0 ? "flipped" : ""}`} 
                                >

                                    {/* FRONT */}
                                    <div className="team-card-front">
                                        <img src={profilej} alt="Team member" className="team-avatar" />
                                        <h3 className="team-initials">JJ</h3>
                                        <p className="team-role">Frontend Developer</p>
                                    </div>

                                    {/* BACK */}
                                    <div className="team-card-back">
                                        <p>
                                            Designing the pages, logos, and overall visual identity of the application, ensuring a cohesive and appealing user 
                                            experience. Focused on creating a visually engaging and intuitive interface that enhances user interaction and satisfaction.
                                        </p>
                                    </div>

                                </div>
                            </div>
                            <div className="team-card" onClick={() => setFlippedCard(flippedCard === 1 ? null : 1)}>
                                <div className={`team-card-inner ${flippedCard === 1 ? "flipped" : ""}`}>

                                    {/* FRONT */}
                                    <div className="team-card-front">
                                        <img src={profileb} alt="Team member" className="team-avatar" />
                                        <h3 className="team-initials">BMEZ</h3>
                                        <p className="team-role">Full Stack Developer</p>
                                    </div>

                                    {/* BACK */}
                                    <div className="team-card-back">
                                        <p>
                                            Filling in the gaps between frontend and backend, ensuring that the application functions smoothly and securely. 
                                            Responsible for implementing core features, integrating APIs, and maintaining the overall architecture of the application.
                                        </p>
                                    </div>

                                </div>
                            </div>

                            <div className="team-card" onClick={() => setFlippedCard(flippedCard === 2 ? null : 2)}>
                                <div className={`team-card-inner ${flippedCard === 2 ? "flipped" : ""}`}>

                                    {/* FRONT */}
                                    <div className="team-card-front">
                                        <img src={profilem} alt="Team member" className="team-avatar" />
                                        <h3 className="team-initials">MME</h3>
                                        <p className="team-role">Backend Developer</p>
                                    </div>

                                    {/* BACK */}
                                    <div className="team-card-back">
                                        <p>
                                            Ensuring the application is secure and functions as intended. 
                                            Implementing security measures, conducting risk assessments, and maintaining compliance with security standards to 
                                            safeguard user data and maintain the integrity of the application.
                                        </p>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                
            </div>
        </div>
    );
};

export default AboutDashboardPage;