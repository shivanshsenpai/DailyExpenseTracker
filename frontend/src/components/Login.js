import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link } from "react-router-dom";
const BASE_URL = "https://dailyexpensetracker-production-1754.up.railway.app";
// const BASE_URL = "http://127.0.0.1:8000";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    Email: "",
    Password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(`${BASE_URL}/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      toast.success("Login successful!");

      localStorage.setItem("userId", data.userId);
      localStorage.setItem("userName", data.userName);

      setTimeout(() => navigate("/dashboard"), 1500);
    } else {
      toast.error(data.message || "Login failed");
    }
  } catch (error) {
    console.error("Login error:", error);
    toast.error("Server not reachable");
  }
};
console.log("BASE_URL =", BASE_URL);
  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center position-relative"
      style={{
        background: "linear-gradient(270deg, #000000, #1a1a1a, #000000)",
        backgroundSize: "400% 400%",
        animation: "gradientMove 10s ease infinite",
        overflow: "hidden",
      }}
    >
      {/* Glow effects */}
      <div
        style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          background: "rgba(250, 204, 21, 0.2)",
          filter: "blur(120px)",
          top: "10%",
          left: "10%",
          animation: "float 6s ease-in-out infinite",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "250px",
          height: "250px",
          background: "rgba(250, 204, 21, 0.15)",
          filter: "blur(100px)",
          bottom: "10%",
          right: "10%",
          animation: "float 8s ease-in-out infinite",
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
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}
            >
              <div className="text-center mb-4">
                <h3 className="fw-bold text-white">Welcome Back</h3>
                <small style={{ color: "#aaa" }}>Login to continue</small>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Email */}
                <input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  className="form-control mb-3"
                  placeholder="Enter your email"
                  style={{
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "#fff",
                  }}
                  required
                />

                {/* Password */}
                <input
                  type="password"
                  name="Password"
                  value={formData.Password}
                  onChange={handleChange}
                  className="form-control mb-4"
                  placeholder="Enter your password"
                  style={{
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "#fff",
                  }}
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
                  Sign In
                </button>
              </form>

              <div className="text-center mt-3">
                <Link to="/signup" style={{ color: "#facc15" }}>
                  Create One
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(30px); }
            100% { transform: translateY(0px); }
          }
        `}
      </style>

      <ToastContainer position="top-center" />
    </div>
  );
};

export default Login;