import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/SecurEventsStyle.css";
import logo from "../../assets/SecureEventLogo.png";

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Auth API
    setTimeout(() => {
      setLoading(false);
      navigate("/login-code");
    }, 1500);
  };

  return (
    <div className="global-page">
      {" "}
      {/* Reusing global bg + center */}
      <div className="global-container auth-container">
        {" "}
        {/* Same glassmorphism */}
        <header className="global-header">
          <img
            src={logo}
            alt="SecureEvents"
            className="global-logo"
            style={{ width: "200px" }}
          />
          <Link to="/signup" className="signup-btn">
            Sign Up
          </Link>
        </header>
        <div
          className="global-content auth-form"
          style={{ gridTemplateColumns: "1fr" }}
        >
          <div className="global-description-box">
            <div className="white-form-card">
              <h2>Welcome Back</h2>
              <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full p-4 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 backdrop-blur-sm transition-all"
                  required
                />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full p-4 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:border-purple-400 backdrop-blur-sm transition-all"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="signup-btn w-full py-4" // Reuse signup-btn style
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </form>
            </div>
            <p className="mt-6 text-purple-200 text-center">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="login-btn font-bold hover:underline"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
