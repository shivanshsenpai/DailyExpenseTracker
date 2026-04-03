import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// 📊 Chart imports
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  // 🔐 Auth check
  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");

    if (isAdmin !== "true") {
      navigate("/dashboard");
      return;
    }

    fetchAdminData();
  }, []);

  // 📡 Fetch admin data
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

  // ✏️ Edit user
 const handleEditUser = async (id) => {
  const newName = prompt("Enter new name:");
  if (!newName) return;

  try {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/update-user/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: id,
          fullName: newName,
        }),
      }
    );

    if (res.ok) {
      fetchAdminData(); // refresh data
    } else {
      alert("Update failed");
    }
  } catch (err) {
    console.error(err);
  }
};

  // ❌ Delete user
  const handleDeleteUser = async (id) => {
  if (!window.confirm("Delete this user?")) return;

  try {
    const res = await fetch(
      `${process.env.REACT_APP_API_URL}/delete-user/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: id,
        }),
      }
    );

    if (res.ok) {
      fetchAdminData();
    } else {
      alert("Delete failed");
    }
  } catch (err) {
    console.error(err);
  }
};

  // 📊 Stats
  const totalUsers = users.length;
  const totalExpenses = expenses.length;
  const totalAmount = expenses.reduce(
    (sum, e) => sum + Number(e.ExpenseCost || 0),
    0
  );

  // 📊 Chart Data
  const chartData = {
    labels: expenses.map((e) => e.ExpenseItem),
    datasets: [
      {
        label: "Expenses (₹)",
        data: expenses.map((e) => Number(e.ExpenseCost)),
        backgroundColor: "#facc15",
      },
    ],
  };

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
          {/* 📊 STATS */}
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

          {/* 📊 CHART */}
          <div className="mb-5">
            <h4 className="text-warning">📊 Expense Chart</h4>
            <div
              style={{
                background: "#111",
                padding: "15px",
                borderRadius: "10px",
              }}
            >
              <Bar data={chartData} />
            </div>
          </div>

          {/* 👤 USERS */}
          <div className="mb-4">
            <h4 className="text-warning">👤 Users</h4>

            <div
              style={{
                maxHeight: "250px",
                overflowY: "auto",
                background: "rgba(255,255,255,0.05)",
                padding: "10px",
                borderRadius: "10px",
              }}
            >
              {users.length === 0 ? (
                <p>No users found</p>
              ) : (
                users.map((u) => (
                  <div
                    key={u.id}
                    style={{
                      borderBottom: "1px solid #333",
                      padding: "8px 0",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>
                      {u.FullName} — {u.Email}
                    </span>

                    <span>
                      <button
                        onClick={() => handleEditUser(u.id)}
                        style={{ marginRight: "10px" }}
                      >
                        ✏️
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        style={{ color: "red" }}
                      >
                        ❌
                      </button>
                    </span>
                  </div>
                ))
              )}
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
              {expenses.length === 0 ? (
                <p>No expenses found</p>
              ) : (
                expenses.map((e) => (
                  <div
                    key={e.id}
                    style={{
                      borderBottom: "1px solid #333",
                      padding: "5px 0",
                    }}
                  >
                    {e.ExpenseItem} — ₹{e.ExpenseCost}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;