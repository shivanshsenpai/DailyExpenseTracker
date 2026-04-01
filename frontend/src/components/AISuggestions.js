import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

const AISuggestions = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/ai_suggestions/${userId}/`);
      const data = await res.json();

      if (res.ok) {
        setSuggestions(
          data.suggestions || {
            rawSuggestion:
              "Unable to generate suggestions at this time. Please try again.",
          },
        );
      } else {
        toast.error(data.error || "Failed to fetch suggestions");
        setSuggestions({
          rawSuggestion:
            "AI suggestions are currently unavailable. Please check your Ollama setup and try again.",
        });
      }
    } catch (err) {
      toast.error("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }
    fetchSuggestions();
  }, [fetchSuggestions, navigate, userId]);

  return (
    <div
      className="min-vh-100 py-5 position-relative"
      style={{
        background: "linear-gradient(135deg, #000 0%, #0a0a0a 50%, #111 100%)",
        overflow: "hidden",
      }}
    >
      {/* 🌊 GOLDEN WAVE ANIMATIONS */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "180px",
          background:
            'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120"><path d="M0,50 Q300,10 600,50 T1200,50 L1200,120 L0,120 Z" fill="rgba(250,204,21,0.08)" opacity="0.6"/></svg>\')',
          backgroundSize: "cover",
          backgroundRepeat: "repeat-x",
          top: "15%",
          left: 0,
          animation: "waveSway 18s ease-in-out infinite",
          opacity: 0.6,
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "150px",
          background:
            'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120"><path d="M0,50 Q300,10 600,50 T1200,50 L1200,120 L0,120 Z" fill="rgba(250,204,21,0.05)" opacity="0.8"/></svg>\')',
          backgroundSize: "cover",
          backgroundRepeat: "repeat-x",
          top: "50%",
          left: 0,
          animation: "waveSway 24s ease-in-out infinite reverse",
          opacity: 0.5,
        }}
      />

      {/* 🌟 SOFT FLOATING GLOW */}
      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          background:
            "radial-gradient(circle, rgba(250,204,21,0.08) 0%, transparent 70%)",
          filter: "blur(80px)",
          top: "10%",
          left: "-5%",
          animation: "floatSlow 12s ease-in-out infinite",
        }}
      />

      <div
        className="container text-white"
        style={{ position: "relative", zIndex: 2 }}
      >
        <h2
          className="fw-bold mb-3 text-warning"
          style={{
            textShadow:
              "0 0 20px rgba(250,204,21,0.4), 0 0 40px rgba(250,204,21,0.2)",
            letterSpacing: "0.5px",
            fontWeight: 600,
          }}
        >
          🤖 AI Expense Suggestions
        </h2>

        {loading ? (
          <p style={{ color: "rgba(250,204,21,0.7)" }}>
            ⏳ Loading AI suggestions...
          </p>
        ) : (
          <div
            className="p-4 rounded"
            style={{
              minHeight: "220px",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(250,204,21,0.02) 100%)",
              border: "1px solid rgba(250,204,21,0.15)",
              backdropFilter: "blur(20px)",
              boxShadow:
                "0 0 30px rgba(250,204,21,0.08), inset 0 0 30px rgba(250,204,21,0.05)",
              animation: "softGlowAlt 4s ease-in-out infinite",
            }}
          >
            {suggestions && typeof suggestions === "object" ? (
              suggestions.rawSuggestion ? (
                <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
                  {suggestions.rawSuggestion}
                </pre>
              ) : (
                <div>
                  <h4>📊 Spending Summary</h4>
                  <p>
                    {suggestions.spendingSummary || "No summary available."}
                  </p>

                  <h4>⚠️ Areas of Concern</h4>
                  <ul>
                    {(suggestions.areasOfConcern || []).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>

                  <h4>💰 Savings Opportunities</h4>
                  <ul>
                    {(suggestions.savingsOpportunities || []).map(
                      (item, idx) => (
                        <li key={idx}>{item}</li>
                      ),
                    )}
                  </ul>

                  <h4>📈 Budget Recommendation</h4>
                  <ul>
                    <li>
                      Needs: {suggestions.budgetRecommendation?.needs || "N/A"}
                    </li>
                    <li>
                      Wants: {suggestions.budgetRecommendation?.wants || "N/A"}
                    </li>
                    <li>
                      Savings:{" "}
                      {suggestions.budgetRecommendation?.savings || "N/A"}
                    </li>
                  </ul>

                  <h4>✅ Action Items</h4>
                  <ol>
                    {(suggestions.actionItems || []).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ol>
                </div>
              )
            ) : (
              <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
                {suggestions || "No suggestions available."}
              </pre>
            )}
          </div>
        )}

        <button
          className="btn mt-3"
          onClick={fetchSuggestions}
          disabled={loading}
          style={{
            background: "linear-gradient(135deg, #facc15 0%, #f59e0b 100%)",
            color: "#000",
            fontWeight: "600",
            border: "none",
            padding: "10px 24px",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(250,204,21,0.2)",
            cursor: "pointer",
            transition: "all 0.4s ease",
            opacity: loading ? 0.7 : 1,
          }}
          onMouseOver={(e) => {
            e.target.style.boxShadow = "0 6px 25px rgba(250,204,21,0.35)";
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseOut={(e) => {
            e.target.style.boxShadow = "0 4px 15px rgba(250,204,21,0.2)";
            e.target.style.transform = "translateY(0)";
          }}
        >
          {loading ? "Loading..." : "✨ Refresh Suggestions"}
        </button>
      </div>

      <style>
        {`
          @keyframes floatSlow {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            50% { transform: translateY(30px) translateX(20px); }
          }

          @keyframes waveSway {
            0%, 100% { transform: translateX(0) translateY(0); }
            25% { transform: translateX(-40px) translateY(10px); }
            50% { transform: translateX(-80px) translateY(0); }
            75% { transform: translateX(-40px) translateY(-10px); }
          }

          @keyframes softGlowAlt {
            0%, 100% { 
              box-shadow: 0 0 20px rgba(250,204,21,0.08), inset 0 0 20px rgba(250,204,21,0.03);
            }
            50% { 
              box-shadow: 0 0 35px rgba(250,204,21,0.12), inset 0 0 30px rgba(250,204,21,0.05);
            }
          }

          h4 {
            color: #facc15;
            margin-top: 20px;
            margin-bottom: 10px;
            font-weight: 600;
            text-shadow: 0 0 10px rgba(250,204,21,0.3);
          }

          ul, ol {
            line-height: 2;
            color: rgba(255,255,255,0.85);
          }

          li {
            margin-bottom: 8px;
          }

          pre {
            color: rgba(255,255,255,0.85);
            line-height: 1.6;
          }
        `}
      </style>

      <ToastContainer position="top-center" />
    </div>
  );
};

export default AISuggestions;
