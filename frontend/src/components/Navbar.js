import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const handleLogout = () => {
    localStorage.removeItem("userId");
    navigate("/");
  };

  return (
    <nav
      className="navbar navbar-expand-lg position-sticky top-0"
      style={{
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        zIndex: 1000,
      }}
    >
      <div className="container-fluid px-4">
        {/* Logo */}
        <Link
          className="navbar-brand fw-bold d-flex align-items-center fs-5"
          to="/"
          style={{ color: "#fff" }}
        >
          <i className="fas fa-wallet me-2" style={{ color: "#facc15" }}></i>
          Expense Tracker
        </Link>

        {/* Toggle */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Links */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            <li className="nav-item">
              <Link className="nav-link nav-hover" to="/">
                Home
              </Link>
            </li>

            {userId ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link nav-hover" to="/dashboard">
                    Dashboard
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link nav-hover" to="/add-expense">
                    Add Expense
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link nav-hover" to="/manage-expense">
                    Manage
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link nav-hover" to="/expense-report">
                    Reports
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link nav-hover" to="/ai-chat">
                    AI Chat
                  </Link>
                </li><li className="nav-item">
                  <Link className="nav-link nav-hover" to="/ai-suggestions">
                    AI Suggestions
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link nav-hover" to="/stock-update">
                    Stock Updates
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link nav-hover" to="/change_password">
                    Password
                  </Link>
                </li>

                <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
                  <button
                    className="btn fw-bold"
                    onClick={handleLogout}
                    style={{
                      background: "#facc15",
                      color: "#000",
                      borderRadius: "20px",
                      padding: "6px 16px",
                      transition: "0.3s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.transform = "scale(1.05)")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.transform = "scale(1)")
                    }
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link nav-hover" to="/login">
                    Sign In
                  </Link>
                </li>

                <li className="nav-item ms-lg-2">
                  <Link
                    to="/signup"
                    className="btn fw-bold"
                    style={{
                      background: "#facc15",
                      color: "#000",
                      borderRadius: "20px",
                      padding: "6px 16px",
                    }}
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* 🔥 Styles */}
      <style>
        {`
          .nav-link {
            color: #ccc !important;
            margin: 0 6px;
            transition: 0.3s;
            position: relative;
          }

          .nav-link:hover {
            color: #facc15 !important;
          }

          /* ✨ underline animation */
          .nav-hover::after {
            content: "";
            position: absolute;
            left: 0;
            bottom: -4px;
            width: 0%;
            height: 2px;
            background: #facc15;
            transition: 0.3s;
          }

          .nav-hover:hover::after {
            width: 100%;
          }
        `}
      </style>
    </nav>
  );
};

export default Navbar;
