import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/public/[0]LandingPage';
import LoginPage from './pages/public/[1]LoginPage';
import LoginCodePage from './pages/public/[1.1]LoginCodePage';
import SignupPage from './pages/public/[2]SignupPage';
import SignupCodePage from "./pages/public/[2.1]SignupCodePage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/login-code" element={<LoginCodePage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/signup-code" element={<SignupCodePage />} />
            </Routes>
        </Router>
    );
}

export default App;