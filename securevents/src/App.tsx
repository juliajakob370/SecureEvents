import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "bootstrap-icons/font/bootstrap-icons.css";
import LandingPage from './pages/public/[0]LandingPage';
import LoginPage from './pages/public/[1]LoginPage';
import LoginCodePage from './pages/public/[1.1]LoginCodePage';
import SignupPage from './pages/public/[2]SignupPage';
import SignupCodePage from "./pages/public/[2.1]SignupCodePage";
import MainPage from "./pages/dashboard/[3]MainPage";
import MyTicketsPage from "./pages/dashboard/[5]MyTicketsPage";
import AboutPage from "./pages/public/[0.1]AboutPage";
import AboutDashboardPage from "./pages/dashboard/[11]AboutPage";
import AccountPage from "./pages/dashboard/[4]AccountPage";
import MyEventsPage from "./pages/dashboard/[7]MyEventsPage";



function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/login-code" element={<LoginCodePage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/signup-code" element={<SignupCodePage />} />
                <Route path="/main" element={<MainPage />} />
                <Route path="/tickets" element={<MyTicketsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/about-dashboard" element={<AboutDashboardPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/my-events" element={<MyEventsPage />} />
            </Routes>
        </Router>
    );
}

export default App;