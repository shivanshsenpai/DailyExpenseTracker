import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  const userId = localStorage.getItem('userId');

  return (
    <div className="min-vh-100 d-flex flex-column">

      {/* Animation Styles */}
      <style>
        {`
        @keyframes gradientMove {
          0% {background-position: 0% 50%;}
          50% {background-position: 100% 50%;}
          100% {background-position: 0% 50%;}
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }

        @keyframes glow {
          0% { text-shadow: 0 0 3px #facc15; }
          50% { text-shadow: 0 0 8px #facc15; }
          100% { text-shadow: 0 0 3px #facc15; }
        }

        .animated-bg {
          background: linear-gradient(270deg, #000000, #1a1a1a, #000000);
          background-size: 400% 400%;
          animation: gradientMove 12s ease infinite;
        }

        .floating {
          animation: float 5s ease-in-out infinite;
        }

        .glow-text {
          animation: glow 4s infinite;
        }

        .card-float {
          animation: float 6s ease-in-out infinite;
        }
        `}
      </style>

      {/* Hero Section */}
      <div className="text-white py-5 animated-bg">
        <div className="container text-center">
          <div className="row justify-content-center">
            <div className="col-lg-8">

              <h1 className="display-4 fw-bold mb-4 glow-text">
                <i className="fas fa-wallet me-3 floating" style={{ color: "#facc15" }}></i>
                Welcome to <span style={{ color: "#facc15" }}>Expense Tracker</span>
              </h1>

              <p className="lead fs-5 mb-4 text-light">
                Track, manage and optimize your daily spending with a clean and powerful interface.
              </p>

              <div className="mt-4">
                {userId ? (
                  <Link to='/dashboard' className='btn btn-lg px-4 py-3 shadow' style={{ background: "#facc15", borderRadius: "12px", color: "#000" }}>
                    Go to Dashboard
                  </Link>
                ) : (
                  <div>
                    <Link to='/signup' className='btn btn-lg px-4 py-3 me-3 shadow' style={{ background: "#facc15", borderRadius: "12px", color: "#000" }}>
                      Get Started
                    </Link>

                    <Link to='/login' className='btn btn-lg px-4 py-3 text-white' style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.3)" }}>
                      Sign In
                    </Link>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div className="py-5" style={{ background: "#f8fafc" }}>
        <div className="container text-center">

          <h2 className="mb-5 fw-bold">Core Features</h2>

          <div className="row g-4">
            {[{
              icon: "fa-chart-line",
              title: "Track Expenses",
              desc: "Easily log and monitor all your daily spending."
            },
            {
              icon: "fa-piggy-bank",
              title: "Set Budget",
              desc: "Plan your finances and never overspend."
            },
            {
              icon: "fa-chart-pie",
              title: "Visual Reports",
              desc: "Get insights with charts and summaries."
            }].map((item, index) => (
              <div className="col-md-4" key={index}>
                <div className="card p-4 shadow card-float" style={{ borderRadius: "16px" }}>
                  <i className={`fas ${item.icon} fs-1 mb-3 floating`} style={{ color: "#facc15" }}></i>
                  <h5 className="fw-bold">{item.title}</h5>
                  <p className="text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* DOWNLOAD REPORT SECTION */}
      <div className="py-5 animated-bg text-white">
        <div className="container text-center">

          <h2 className="fw-bold mb-4">Download Your Expense Reports</h2>

          <p className="mb-5">
            You can easily download and manage your expense reports in both
            <strong> TXT </strong> and <strong> CSV </strong> formats anytime.
          </p>

          <div className="row g-4">
            <div className="col-md-6">
              <div className="card p-4 card-float" style={{ borderRadius: "16px" }}>
                <h5 className="fw-bold">TXT Reports</h5>
                <p>Simple text format for quick viewing and sharing.</p>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card p-4 card-float" style={{ borderRadius: "16px" }}>
                <h5 className="fw-bold">CSV Reports</h5>
                <p>Structured data format for Excel and analysis.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* CTA */}
      <div className="text-white py-5 animated-bg">
        <div className="container text-center">
          <h3 className="fw-bold mb-3 glow-text">Ready to Take Control?</h3>
          <p className="mb-4 text-light">Start managing your money smarter today.</p>

          {!userId && (
            <Link to='/signup' className='btn btn-lg px-4 py-3 shadow' style={{ background: "#facc15", color: "#000", borderRadius: "12px" }}>
              Start Now
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 mt-auto" style={{ background: "#0a0a0a", color: "#aaa" }}>
        <div className="container text-center">
          <h6 className="fw-bold mb-2">Expense Tracker</h6>
          <p className="mb-1">© 2026 All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}

export default Home