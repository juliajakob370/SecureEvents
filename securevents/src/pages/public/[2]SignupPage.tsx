import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/SecurEventsStyle.css";
import "../../styles/Login&SignUp.css";
import logo from "../../assets/SecureEventLogo.png";

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Auth API - send code to email
    setTimeout(() => {
      setLoading(false);
      navigate("/signup-code", { state: { firstname: formData.firstName, email: formData.email } });
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
              <h2 className="login-title">Welcome! Events await you!</h2>

              {/* Form with Send Code button */}
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder=""
                    required
                  />
                  <label htmlFor="email">First Name</label>
                </div>
                <div className="form-group">
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder=""
                    required
                  />
                  <label htmlFor="email">Last Name</label>
                </div>
                <div className="form-group">
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder=""
                    required
                  />
                  <label htmlFor="email">Email</label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="send-code-btn"
                >
                  {loading ? "Sending Code..." : "Sign Up!"}
                </button>
              </form>

            </div>

            {/* Don't have account? Link */}
            <div className="auth-footer">
              <p className="auth-footer-text">
                Already have an account?{" "}
                <Link to="/login" className="login-link-button">
                  Log in!
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;