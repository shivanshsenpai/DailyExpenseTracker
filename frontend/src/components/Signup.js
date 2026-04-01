import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
// const BASE_URL = "http://127.0.0.1:8000";
const BASE_URL = "https://dailyexpensetracker-production-1754.up.railway.app";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    FullName: "",
    Email: "",
    Password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${BASE_URL}/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.status === 201) {
        toast.success("Account created!");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        const data = await response.json();
        toast.error(data.message || "Signup failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center position-relative"
      style={{
        background: "linear-gradient(270deg, #000000, #1a1a1a, #000000)",
        backgroundSize: "400% 400%",
        animation: "gradientMove 12s ease infinite",
        overflow: "hidden",
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          width: "280px",
          height: "280px",
          background: "rgba(250,204,21,0.15)",
          filter: "blur(120px)",
          top: "10%",
          left: "10%",
          animation: "float 7s ease-in-out infinite",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "220px",
          height: "220px",
          background: "rgba(250,204,21,0.1)",
          filter: "blur(100px)",
          bottom: "10%",
          right: "10%",
          animation: "float 9s ease-in-out infinite",
        }}
      />

      <div className="container position-relative">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            <div
              className="p-4"
              style={{
                borderRadius: "20px",
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(15px)",
                WebkitBackdropFilter: "blur(15px)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
              }}
            >
              <div className="text-center mb-4">
                <h3 className="fw-bold text-white">Create Account</h3>
                <small style={{ color: "#aaa" }}>
                  Start managing your expenses
                </small>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Full Name */}
                <input
                  type="text"
                  name="FullName"
                  value={formData.FullName}
                  onChange={handleChange}
                  className="form-control mb-3 custom-input"
                  placeholder="Enter your name"
                  required
                />

                {/* Email */}
                <input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  className="form-control mb-3 custom-input"
                  placeholder="Enter your email"
                  required
                />

                {/* Password */}
                <input
                  type="password"
                  name="Password"
                  value={formData.Password}
                  onChange={handleChange}
                  className="form-control mb-4 custom-input"
                  placeholder="Create password"
                  required
                />

                <button
                  type="submit"
                  className="btn w-100 fw-bold"
                  style={{
                    borderRadius: "12px",
                    padding: "12px",
                    background: "#facc15",
                    color: "#000",
                  }}
                >
                  Create Account
                </button>
              </form>

              <div className="text-center mt-3">
                <p className="text-light mb-1">Already have an account?</p>
                <Link to="/login" style={{ color: "#facc15" }}>
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>
        {`
          .custom-input {
            border-radius: 12px;
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.2);
            color: #fff;
          }

          .custom-input::placeholder {
            color: rgba(255,255,255,0.6);
          }

          .custom-input:focus {
            background: rgba(255,255,255,0.12);
            color: #fff;
            border-color: #facc15;
            box-shadow: none;
          }

          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(25px); }
            100% { transform: translateY(0px); }
          }
        `}
      </style>

      <ToastContainer position="top-center" />
    </div>
  );
};

export default Signup;