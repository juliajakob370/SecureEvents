import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import "bootstrap-icons/font/bootstrap-icons.css";
import LandingPage from './pages/public/[0]LandingPage';
import LoginPage from './pages/public/[1]LoginPage';
import LoginCodePage from './pages/public/[1.1]LoginCodePage';
import SignupPage from './pages/public/[2]SignupPage';
import SignupCodePage from "./pages/public/[2.1]SignupCodePage";
import MainPage from "./pages/dashboard/[3]MainPage";
import MyTicketsPage from "./pages/dashboard/[5]MyTicketsPage";


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
            </Routes>
        </Router>
    );
}

export default App;