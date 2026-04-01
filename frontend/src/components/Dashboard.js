import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const userId = localStorage.getItem("userId");

  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(15000);

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    const loadExpenses = async () => {
      try {
        const res = await fetch(`/manage_expense/${userId}/`);
        const data = await res.json();
        setExpenses(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadExpenses();
  }, [userId, navigate]);

  const totalSpent = useMemo(
    () =>
      expenses.reduce(
        (sum, item) => sum + (parseFloat(item.ExpenseCost) || 0),
        0,
      ),
    [expenses],
  );

  const remainingBudget = Math.max(0, budget - totalSpent);

  const stats = [
    { title: "Budget", value: `₹ ${budget}`, icon: "fa-wallet" },
    { title: "Spent", value: `₹ ${totalSpent}`, icon: "fa-money-bill-wave" },
    {
      title: "Remaining",
      value: `₹ ${remainingBudget}`,
      icon: "fa-chart-line",
    },
    { title: "Transactions", value: expenses.length, icon: "fa-receipt" },
  ];

  const chartData = expenses.map((e, i) => ({
    date: e.ExpenseDate || `Day ${i + 1}`,
    amount: parseFloat(e.ExpenseCost) || 0,
  }));

  return (
    <div
      className="min-vh-100 py-5 position-relative"
      style={{
        background: "linear-gradient(135deg, #000000, #1a1a1a)",
        overflow: "hidden",
      }}
    >
      {/* 🔥 Floating animated glow */}
      <div
        style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          background: "rgba(250, 204, 21, 0.2)",
          filter: "blur(120px)",
          top: "10%",
          left: "20%",
          animation: "float 6s ease-in-out infinite",
        }}
      ></div>

      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 text-white">
          <div>
            <h2 className="fw-bold">Welcome, {userName || "User"} 👋</h2>
            <small style={{ color: "#aaa" }}>Your financial overview</small>
          </div>

          <div className="d-flex gap-2">
            <button
              onClick={() => navigate("/add-expense")}
              className="btn fw-bold"
              style={{
                background: "#facc15",
                color: "#000",
                borderRadius: "12px",
                transition: "0.3s",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
            >
              + Add
            </button>

            <button
              onClick={() => navigate("/manage-expense")}
              className="btn text-white"
              style={{
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "12px",
              }}
            >
              Manage
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="row g-3 mb-4">
          {stats.map((s, i) => (
            <div className="col-md-3" key={i}>
              <div
                className="p-3 text-white"
                style={{
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(12px)",
                  transition: "0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <i
                  className={`fas ${s.icon} mb-2`}
                  style={{ color: "#facc15" }}
                ></i>
                <h6>{s.title}</h6>
                <h5 className="fw-bold">{s.value}</h5>
              </div>
            </div>
          ))}
        </div>

        {/* Budget */}
        <div
          className="p-4 mb-4 text-white"
          style={{
            borderRadius: "16px",
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(12px)",
          }}
        >
          <h5 className="fw-bold">Set Budget</h5>
          <input
            type="number"
            className="form-control mt-2"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            style={{
              borderRadius: "10px",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          />
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div
            className="p-4 mb-4"
            style={{
              borderRadius: "16px",
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(12px)",
            }}
          >
            <h5 className="text-white mb-3">Spending</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid stroke="#444" />
                <XAxis dataKey="date" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip />
                <Bar dataKey="amount" fill="#facc15" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Table */}
        <div
          className="p-4 text-white"
          style={{
            borderRadius: "16px",
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(12px)",
          }}
        >
          <h5 className="mb-3">Recent Expenses</h5>

          <table className="table  ">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Item</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses
                .slice(-5)
                .reverse()
                .map((e, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{e.ExpenseDate}</td>
                    <td>{e.ExpenseItem}</td>
                    <td style={{ color: "#343318" }}>₹ {e.ExpenseCost}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔥 Animation Keyframes */}
      <style>
        {`
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

export default Dashboard;
