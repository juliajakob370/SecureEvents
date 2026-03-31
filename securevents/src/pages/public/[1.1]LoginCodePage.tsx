import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/SecurEventsStyle.css";
import "../../styles/Login&SignUp.css";
import logo from "../../assets/SecureEventLogo.png";
import { useLocation } from "react-router-dom";


const LoginCodePage: React.FC = () => {
  const [formData, setFormData] = useState({code: ""});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Auth API - send code to email
    setTimeout(() => {
      setLoading(false);
      navigate("/login-code");
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
              
              {/* Logo - Top Left */}
              <div className="login-signup-logo-wrapper">
                <img src={logo} alt="SecureEvents" className="global-logo" />
              </div>

              {/* LOG IN Title - Centered */}
              <h2 className="login-title">Check your email!</h2>
              <p className="code-sent-text">
                Verification code sent to
              </p>
              <p className="email-text">
                <span>{email}</span>
              </p>

              {/* Form with Send Code button */}
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <input
                    id="login-code"
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder=""
                    required
                  />
                  <label htmlFor="code-input">Enter Code</label>
                </div>

                <div className="button-row">
                <button
                    type="button"
                    className="resend-code-btn"
                    onClick={() => {
                    console.log("Resend clicked");
                    // later: resend logic
                    }}
                >
                    Resend Code
                </button>

                <button
                    type="submit"
                    disabled={loading}
                    className="submit-code-btn"
                >
                    Submit
                </button>
                </div>
              </form>
            <div className="back-button-container">
                <button
                    type="button"
                    className="back-btn"
                    onClick={() => navigate("/login")}
                >
                    ← Back
                </button>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginCodePage;