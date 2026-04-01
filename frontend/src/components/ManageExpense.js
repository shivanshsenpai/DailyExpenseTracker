import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ManageExpense = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const userId = localStorage.getItem("userId");

  const [editExpense, setEditExpense] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }
    fetchExpenses(userId);
  }, [userId, navigate]);

  const fetchExpenses = async (uid) => {
    try {
      const res = await fetch(`/manage_expense/${uid}/`);
      const data = await res.json();
      setExpenses(data);
    } catch {
      toast.error("Failed to load expenses");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await fetch(`/delete_expense/${id}/`, {
        method: "DELETE",
      });
      toast.success("Deleted");
      fetchExpenses(userId);
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleEdit = (exp) => setEditExpense({ ...exp });

  const handleChange = (e) =>
    setEditExpense({ ...editExpense, [e.target.name]: e.target.value });

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/update_expense/${editExpense.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editExpense),
      });
      if (res.ok) {
        toast.success("Updated");
        setEditExpense(null);
        fetchExpenses(userId);
      }
    } catch {
      toast.error("Update failed");
    }
  };

  const filteredExpenses = expenses.filter((exp) => {
    if (startDate && exp.ExpenseDate < startDate) return false;
    if (endDate && exp.ExpenseDate > endDate) return false;
    return true;
  });

  return (
    <div
      className="min-vh-100 py-5 position-relative"
      style={{
        background: "linear-gradient(135deg, #000000, #1a1a1a)",
        overflow: "hidden",
      }}
    >
      {/* 🔥 Subtle moving glow */}
      <div
        style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          background: "rgba(250,204,21,0.08)",
          filter: "blur(120px)",
          top: "20%",
          left: "10%",
          animation: "float 8s ease-in-out infinite",
        }}
      ></div>

      <div className="container">
        {/* Header */}
        <div className="text-white mb-4 d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h2 className="fw-bold">Manage Expenses</h2>
            <p style={{ color: "#aaa" }}>Control your spending</p>
          </div>

          <button
            onClick={() => navigate("/add-expense")}
            className="btn fw-bold"
            style={{
              background: "#facc15",
              color: "#000",
              borderRadius: "12px",
              transition: "0.3s",
            }}
          >
            + Add
          </button>
        </div>

        {/* Filters (Glass) */}
        <div
          className="p-4 mb-4 text-white"
          style={{
            borderRadius: "16px",
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="row g-3">
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <button
                className="btn btn-light w-100"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div
          className="p-4 text-white"
          style={{
            borderRadius: "16px",
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(12px)",
          }}
        >
          <h5 className="mb-3">All Expenses</h5>

          <table className="table text-white">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Item</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((exp, i) => (
                  <tr
                    key={exp.id}
                    style={{ transition: "0.2s" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.05)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td>{i + 1}</td>
                    <td>{exp.ExpenseDate}</td>
                    <td>{exp.ExpenseItem}</td>
                    <td style={{ color: "#4f441a" }}>₹ {exp.ExpenseCost}</td>
                    <td>
                      <button onClick={() => handleEdit(exp)}>✏️</button>
                      <button onClick={() => handleDelete(exp.id)}>🗑️</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    No expenses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {editExpense && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
            style={{
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(5px)",
            }}
          >
            <div
              className="p-4"
              style={{
                borderRadius: "16px",
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(15px)",
                color: "#fff",
                width: "350px",
              }}
            >
              <h5>Edit Expense</h5>

              <input
                className="form-control mb-2"
                name="ExpenseItem"
                value={editExpense.ExpenseItem}
                onChange={handleChange}
              />

              <input
                className="form-control mb-2"
                name="ExpenseCost"
                value={editExpense.ExpenseCost}
                onChange={handleChange}
              />

              <input
                type="date"
                className="form-control mb-3"
                name="ExpenseDate"
                value={editExpense.ExpenseDate}
                onChange={handleChange}
              />

              <button
                className="btn w-100 mb-2"
                style={{ background: "#8d792b", color: "#000" }}
                onClick={handleUpdate}
              >
                Save
              </button>

              <button
                className="btn btn-light w-100"
                onClick={() => setEditExpense(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ✨ Light shimmer animation */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(20px); }
            100% { transform: translateY(0px); }
          }
        `}
      </style>

      <ToastContainer position="top-center" />
    </div>
  );
};

export default ManageExpense;
