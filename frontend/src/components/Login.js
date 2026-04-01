import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link } from "react-router-dom";

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
      const response = await fetch("/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.status === 200) {
        toast.success("Login successful!");
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("userName", data.userName);
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        toast.error(data.message);
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
        animation: "gradientMove 10s ease infinite",
        overflow: "hidden",
      }}
    >
      {/* 🔥 Floating yellow glow */}
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
      ></div>

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
      ></div>

      <div className="container position-relative">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            {/* Glass Card */}
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
              {/* Header */}
              <div className="text-center mb-4">
                <h3 className="fw-bold text-white">
                  <i
                    className="fas fa-sign-in-alt me-2"
                    style={{ color: "#facc15" }}
                  ></i>
                  Welcome Back
                </h3>
                <small style={{ color: "#aaa" }}>Login to continue</small>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="mb-3">
                  <label className="text-light mb-1">Email</label>
                  <input
                    type="email"
                    name="Email"
                    value={formData.Email}
                    onChange={handleChange}
                    className="form-control"
                    style={{
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "#fff",
                    }}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label className="text-light mb-1">Password</label>
                  <input
                    type="password"
                    name="Password"
                    value={formData.Password}
                    onChange={handleChange}
                    className="form-control"
                    style={{
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "#fff",
                    }}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {/* Button */}
                <button
                  type="submit"
                  className="btn w-100 fw-bold"
                  style={{
                    borderRadius: "12px",
                    padding: "12px",
                    background: "#facc15",
                    color: "#000",
                    transition: "0.3s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.transform = "scale(1.05)")
                  }
                  onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                >
                  Sign In
                </button>
              </form>

              {/* Footer */}
              <div className="text-center mt-3">
                <p className="mb-1 text-light">Don’t have an account?</p>
                <Link
                  to="/signup"
                  className="fw-bold text-decoration-none"
                  style={{ color: "#facc15" }}
                >
                  Create One
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 Animations */}
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
