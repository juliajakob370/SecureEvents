// Imports: header, event card, styles, and profile image.
import { useContext } from "react";
import Header from "../../components/Header/Header";
import "../../styles/MainPage.css";
import EventCard from "../../components/EventCard/EventCard";
import profile0 from "../../assets/profilePics/profile0.png";
import { EventContext } from "../../context/EventContext";



// Main dashboard page.
const MainPage: React.FC = () => {
    const { events } = useContext(EventContext);
    return (
        <div style={{ padding: "20px" }}>
            {/* Header */}
            <Header
                centerType="search"
                showProfile={true}
                profileImage={profile0}
            />

            {/* Event list container */}
            <div className="events-container">
                <div className="events-scroll">
                    {events.map((event, index) => (
                        <EventCard
                            key={index}
                            title={event.title}
                            organizer={event.organizer}
                            location={event.location}
                            price={event.price}
                            image={event.image}
                            dateTime={event.dateTime}
                            description={event.description}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MainPage;