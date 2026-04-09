//[2.1]SignupCodePage.tsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/SecurEventsStyle.css";
import "../../styles/Login&SignUp.css";
import logo from "../../assets/SecureEventLogo.png";

const SignupCodePage: React.FC = () => {
  const [formData, setFormData] = useState({ code: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const firstName = location.state?.firstName || "";
  const email = location.state?.email || "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Verify code with backend
    setTimeout(() => {
      setLoading(false);
      console.log("Signup code submitted:", formData.code);
      navigate("/main");
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
              {/* Logo */}
              <div className="login-signup-logo-wrapper">
                <img src={logo} alt="SecureEvents" className="global-logo" />
              </div>

              {/* Title */}
              <h2 className="login-title">
                Welcome {firstName}, check your email!
              </h2>

              {/* Email text */}
              <p className="code-sent-text">Verification code sent to</p>
              <p className="email-text">
                <span>{email}</span>
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <input
                    id="signup-code"
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder=" "
                    required
                  />
                  <label htmlFor="signup-code">Enter Code</label>
                </div>

                {/* Buttons */}
                <div className="button-row">
                  <button
                    type="button"
                    className="resend-code-btn"
                    onClick={() => {
                      console.log("Resend signup code");
                    }}
                  >
                    Resend Code
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="submit-code-btn"
                  >
                    {loading ? "Verifying..." : "Submit"}
                  </button>
                </div>
              </form>

              {/* Back button */}
              <div className="back-button-container">
                <button
                  type="button"
                  className="back-btn"
                  onClick={() => navigate("/signup")}
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

export default SignupCodePage;
