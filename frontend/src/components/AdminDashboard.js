import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");

    if (isAdmin !== "true") {
      navigate("/dashboard");
      return;
    }

    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/admin-data/?userId=${userId}`
      );

      const data = await res.json();

      if (res.ok) {
        setUsers(data.users || []);
        setExpenses(data.expenses || []);
      } else {
        alert("Unauthorized or error");
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching admin data");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 STATS
  const totalUsers = users.length;
  const totalExpenses = expenses.length;
  const totalAmount = expenses.reduce(
    (sum, e) => sum + Number(e.ExpenseCost || 0),
    0
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #000, #111)",
        color: "#fff",
        padding: "20px",
      }}
    >
      <h2 className="text-warning mb-4">👑 Admin Dashboard</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* 🔥 STATS CARDS */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card bg-dark text-white p-3">
                <h5>Total Users</h5>
                <h3>{totalUsers}</h3>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card bg-dark text-white p-3">
                <h5>Total Expenses</h5>
                <h3>{totalExpenses}</h3>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card bg-dark text-white p-3">
                <h5>Total Amount</h5>
                <h3>₹{totalAmount}</h3>
              </div>
            </div>
          </div>

          {/* 👤 USERS */}
          <div className="mb-4">
            <h4 className="text-warning">👤 Users</h4>

            <div
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                background: "rgba(255,255,255,0.05)",
                padding: "10px",
                borderRadius: "10px",
              }}
            >
              {users.map((u) => (
                <div
                  key={u.id}
                  style={{
                    borderBottom: "1px solid #333",
                    padding: "5px 0",
                  }}
                >
                  {u.FullName} — {u.Email}
                </div>
              ))}
            </div>
          </div>

          {/* 💰 EXPENSES */}
          <div>
            <h4 className="text-warning">💰 Expenses</h4>

            <div
              style={{
                maxHeight: "250px",
                overflowY: "auto",
                background: "rgba(255,255,255,0.05)",
                padding: "10px",
                borderRadius: "10px",
              }}
            >
              {expenses.map((e) => (
                <div
                  key={e.id}
                  style={{
                    borderBottom: "1px solid #333",
                    padding: "5px 0",
                  }}
                >
                  {e.ExpenseItem} — ₹{e.ExpenseCost}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;