import React, { useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("userId");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const collapseRef = useRef(null);
  
  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("isAdmin");
    navigate("/");
  };

  // CLOSE NAVBAR ON MOBILE CLICK
  const closeNavbar = () => {
    if (collapseRef.current && collapseRef.current.classList.contains("show")) {
      collapseRef.current.classList.remove("show");
    }
  };

  // ACTIVE LINK STYLE
  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className="navbar navbar-expand-lg position-sticky top-0"
      style={{
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        zIndex: 1000,
        transition: "all 0.4s ease",
      }}
    >
      <div className="container-fluid px-4">
        {/* Logo */}
        <Link
          className="navbar-brand fw-bold d-flex align-items-center fs-5"
          to="/"
          onClick={closeNavbar}
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
          style={{ filter: "invert(1)" }}
        >
          ☰
        </button>

        {/* LINKS */}
        <div
          className="collapse navbar-collapse"
          id="navbarContent"
          ref={collapseRef}
        >
          <ul className="navbar-nav ms-auto align-items-lg-center">
            {/* HOME */}
            <li className="nav-item">
              <Link
                className={`nav-link nav-hover ${
                  isActive("/") ? "active-link" : ""
                }`}
                to="/"
                onClick={closeNavbar}
              >
                Home
              </Link>
            </li>

            {userId ? (
              <>
                {/* USER LINKS */}
                {[
                  { path: "/dashboard", name: "Dashboard" },
                  { path: "/add-expense", name: "Add Expense" },
                  { path: "/manage-expense", name: "Manage" },
                  { path: "/expense-report", name: "Reports" },
                  { path: "/ai-chat", name: "AI Chat" },
                  { path: "/ai-suggestions", name: "AI Suggestions" },
                  { path: "/stock-update", name: "Stock Updates" },
                  { path: "/change_password", name: "Password" },
                ].map((link, index) => (
                  <li className="nav-item" key={index}>
                    <Link
                      className={`nav-link nav-hover ${
                        isActive(link.path) ? "active-link" : ""
                      }`}
                      to={link.path}
                      onClick={closeNavbar}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}

                {/* 👑 ADMIN BUTTON (ONLY IF ADMIN) */}
                {isAdmin && (
                  <li className="nav-item ms-lg-2">
                    <button
                      className="btn fw-bold admin-btn"
                      onClick={() => {
                        closeNavbar();
                        navigate("/admin-dashboard");
                      }}
                    >
                      👑 Admin Panel
                    </button>
                  </li>
                )}

                {/* LOGOUT */}
                <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
                  <button
                    className="btn fw-bold logout-btn"
                    onClick={() => {
                      closeNavbar();
                      handleLogout();
                    }}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                {/* AUTH */}
                <li className="nav-item">
                  <Link
                    className="nav-link nav-hover"
                    to="/login"
                    onClick={closeNavbar}
                  >
                    Sign In
                  </Link>
                </li>

                <li className="nav-item ms-lg-2">
                  <Link
                    to="/signup"
                    onClick={closeNavbar}
                    className="btn fw-bold signup-btn"
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* STYLES */}
      <style>
        {`
          .nav-link {
            color: #ccc !important;
            margin: 0 8px;
            transition: all 0.3s ease;
            position: relative;
          }

          .nav-link:hover {
            color: #facc15 !important;
            transform: translateY(-2px);
          }

          .active-link {
            color: #facc15 !important;
            font-weight: 600;
          }

          .nav-hover::after {
            content: "";
            position: absolute;
            left: 0;
            bottom: -4px;
            width: 0%;
            height: 2px;
            background: linear-gradient(90deg, #facc15, #f59e0b);
            transition: 0.3s;
          }

          .nav-hover:hover::after {
            width: 100%;
          }

          .logout-btn {
            background: linear-gradient(135deg, #facc15, #f59e0b);
            color: #000;
            border-radius: 20px;
            padding: 6px 16px;
            transition: all 0.3s ease;
          }

          .logout-btn:hover {
            transform: scale(1.08);
            box-shadow: 0 0 15px rgba(250,204,21,0.5);
          }

          .signup-btn {
            background: linear-gradient(135deg, #facc15, #f59e0b);
            color: #000;
            border-radius: 20px;
            padding: 6px 16px;
            transition: all 0.3s ease;
          }

          .signup-btn:hover {
            transform: scale(1.08);
            box-shadow: 0 0 15px rgba(250,204,21,0.5);
          }

          .admin-btn {
            background: linear-gradient(135deg, #9333ea, #6366f1);
            color: #fff;
            border-radius: 20px;
            padding: 6px 16px;
            transition: all 0.3s ease;
          }

          .admin-btn:hover {
            transform: scale(1.08);
            box-shadow: 0 0 15px rgba(147, 51, 234, 0.5);
          }

          .navbar-collapse {
            transition: all 0.4s ease;
          }
        `}
      </style>
    </nav>
  );
};

export default Navbar;