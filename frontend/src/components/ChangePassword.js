import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link } from "react-router-dom";

const ChangePassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      navigate("/login");
    }
  }, [userId, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/change_password/${userId}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        toast.success(data.message);
        setFormData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setTimeout(() => navigate("/login"), 2000);
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
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #000000, #1a1a1a)",
      }}
    >
      <div className="container">
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
                transition: "0.3s",
              }}
            >
              {/* Header */}
              <div className="text-center mb-4">
                <h3 className="fw-bold text-white">
                  <i
                    className="fas fa-key me-2"
                    style={{ color: "#facc15" }}
                  ></i>
                  Change Password
                </h3>
                <small style={{ color: "#aaa" }}>Secure your account</small>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {/* Old Password */}
                <div className="mb-3">
                  <label className="text-light mb-1">Old Password</label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    className="form-control"
                    style={{
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "#fff",
                    }}
                    placeholder="Enter old password"
                    required
                  />
                </div>

                {/* New Password */}
                <div className="mb-3">
                  <label className="text-light mb-1">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="form-control"
                    style={{
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "#fff",
                    }}
                    placeholder="Enter new password"
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div className="mb-4">
                  <label className="text-light mb-1">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-control"
                    style={{
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "#fff",
                    }}
                    placeholder="Confirm new password"
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
                  Change Password
                </button>
              </form>

              {/* Footer */}
              <div className="text-center mt-3">
                <p className="mb-1 text-light">Changed your mind?</p>
                <Link
                  to="/dashboard"
                  className="text-decoration-none fw-bold"
                  style={{ color: "#facc15" }}
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="top-center" />
    </div>
  );
};

export default ChangePassword;
