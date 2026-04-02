import React, { useEffect, useState } from "react";

const StockUpdates = () => {
  const [markets, setMarkets] = useState([]);
  const [market, setMarket] = useState("NIFTY50");

  const [stocks, setStocks] = useState([]);
  const [selectedTemp, setSelectedTemp] = useState([]);
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [stockData, setStockData] = useState({});

  // Load markets + stocks
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/stock-update/?market=${market}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.markets) setMarkets(data.markets);
        if (data.stocks) setStocks(data.stocks);
      })
      .catch(console.error);
  }, [market]);

  // Live updates
  useEffect(() => {
    if (selectedStocks.length === 0) return;

    const fetchStockData = async () => {
      const query = selectedStocks
        .map((s) => `stock_update=${s}`)
        .join("&");

      const res = await fetch(`${process.env.REACT_APP_API_URL}/stock-update/?market=${market}&${query}`);
      const data = await res.json();

      if (data.data) setStockData(data.data);
    };

    fetchStockData();
    const interval = setInterval(fetchStockData, 5000);

    return () => clearInterval(interval);
  }, [selectedStocks, market]);

  const handleCheckbox = (stock) => {
    setSelectedTemp((prev) =>
      prev.includes(stock)
        ? prev.filter((s) => s !== stock)
        : [...prev, stock]
    );
  };

  const handleShowStocks = () => {
    setSelectedStocks(selectedTemp);
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center position-relative"
      style={{
        background: "linear-gradient(270deg, #000000, #1a1a1a, #000000)",
        backgroundSize: "400% 400%",
        animation: "gradientMove 10s ease infinite",
        overflow: "hidden",
        padding: "20px",
      }}
    >
      {/* 🔥 Floating glow (Login style) */}
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
          <div className="col-lg-6 col-md-8">

            {/* 🔥 GLASS CARD (Login style) */}
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
              {/* HEADER */}
              <div className="text-center mb-4">
                <h3 className="fw-bold text-white">
                  <span style={{ color: "#facc15" }}>📈</span> Live Stock Tracker
                </h3>
                <small style={{ color: "#aaa" }}>
                  Select market & track live updates
                </small>
              </div>

              {/* MARKET SELECT */}
              <div className="mb-3">
                <label className="text-light mb-1">Select Market</label>

                <select
                  value={market}
                  onChange={(e) => {
                    setMarket(e.target.value);
                    setSelectedTemp([]);
                    setSelectedStocks([]);
                    setStockData({});
                  }}
                  className="form-control"
                  style={{
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color:"rgb(205, 165, 2)",
                  }}
                >
                  {markets.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* STOCK LIST */}
              <div
                style={{
                  maxHeight: "220px",
                  overflowY: "auto",
                  padding: "10px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {stocks.map((stock) => (
                  <div
                    key={stock}
                    className="d-flex align-items-center mb-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTemp.includes(stock)}
                      onChange={() => handleCheckbox(stock)}
                      style={{
                        accentColor: "rgb(250, 204, 21)",
                        transform: "scale(1.2)",
                      }}
                    />
                    <span className="ms-2 text-light">{stock}</span>
                  </div>
                ))}
              </div>

              {/* BUTTON */}
              <button
                onClick={handleShowStocks}
                className="btn w-100 fw-bold mt-3"
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
                onMouseLeave={(e) =>
                  (e.target.style.transform = "scale(1)")
                }
              >
                Show Selected Stocks
              </button>

              {/* STOCK DATA */}
              {Object.keys(stockData).length > 0 && (
                <div className="mt-4">
                  {Object.entries(stockData).map(([stock, details]) => (
                    <div
                      key={stock}
                      className="p-3 mb-3"
                      style={{
                        borderRadius: "15px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <h5 style={{ color: "#facc15" }}>{stock}</h5>

                      {details.error ? (
                        <p className="text-danger">{details.error}</p>
                      ) : (
                        <>
                          <p className="text-light">Open: {details.Open}</p>
                          <p className="text-light">Close: {details.Close}</p>
                          <p className="text-light">Volume: {details.Volume}</p>

                          <p
                            style={{
                              fontWeight: "bold",
                              color:
                                details.Close > details.Open
                                  ? "#4ade80"
                                  : "#ef4444",
                            }}
                          >
                            {details.Close > details.Open
                              ? "📈 Up"
                              : "📉 Down"}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ANIMATIONS */}
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
    </div>
  );
};

export default StockUpdates;