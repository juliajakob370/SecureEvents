import '../../styles/SecurEventsStyle.css';
import logo from '../../assets/SecureEventLogo.png';
import eventImg from '../../assets/EventImg.jpg';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="global-page">
            <div className="global-container">

                <header className="global-header">
                    <button className="global-btn">About</button>

                    <div className="header-actions">
                        <button
                            className="signup-btn"
                            onClick={() => navigate('/signup')}
                        >
                            Sign Up
                        </button>

                        <button
                            className="login-btn"
                            onClick={() => navigate('/login')}
                        >
                            Log In
                        </button>
                    </div>
                </header>

                <main className="global-main">
                    <div className="global-logo-wrapper">
                        <img src={logo} alt="SecurEvents logo" className="global-logo" />
                    </div>

                    <div className="global-content">
                        <div className="global-image-box">
                            <img src={eventImg} alt="Event" className="global-event-image" />
                        </div>

                        <div className="global-description-box">
                            <h2>Welcome to SecurEvents</h2>
                            <p>
                                Securely browse events, book tickets, and manage your event experience.
                            </p>
                            <p>
                                A modern and secure platform for event organizers and guests.
                            </p>
                        </div>
                    </div>
                </main>

            </div>
        </div>
    );
}

export default LandingPage;