import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const ExpenseReport = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [expenses, setExpenses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/manage_expense/${userId}/`);
      const data = await res.json();
      setExpenses(data);
    } catch {
      toast.error("Failed to load data");
    }
  };

  const generateReport = () => {
    let data = [...expenses];

    if (startDate) {
      data = data.filter((e) => e.ExpenseDate >= startDate);
    }
    if (endDate) {
      data = data.filter((e) => e.ExpenseDate <= endDate);
    }
    if (search) {
      data = data.filter((e) =>
        e.ExpenseItem.toLowerCase().includes(search.toLowerCase()),
      );
    }

    setFiltered(data);

    if (data.length === 0) {
      toast.warning("No data found");
    }
  };

  const total = useMemo(
    () => filtered.reduce((sum, e) => sum + parseFloat(e.ExpenseCost || 0), 0),
    [filtered],
  );

  const avg = filtered.length ? (total / filtered.length).toFixed(2) : 0;

  // Prepare chart data
  const chartData = useMemo(() => {
    const data = filtered.length ? filtered : expenses;
    const groupedByDate = data.reduce((acc, expense) => {
      const date = expense.ExpenseDate;
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += parseFloat(expense.ExpenseCost || 0);
      return acc;
    }, {});

    return Object.entries(groupedByDate)
      .map(([date, amount]) => ({
        date,
        amount: parseFloat(amount.toFixed(2)),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-10); // Show last 10 days to avoid overcrowding
  }, [filtered, expenses]);

  const pieData = useMemo(() => {
    const data = filtered.length ? filtered : expenses;
    const groupedByItem = data.reduce((acc, expense) => {
      const item = expense.ExpenseItem;
      if (!acc[item]) {
        acc[item] = 0;
      }
      acc[item] += parseFloat(expense.ExpenseCost || 0);
      return acc;
    }, {});

    const colors = [
      "#8884d8",
      "#82ca9d",
      "#ffc658",
      "#ff7c7c",
      "#8dd1e1",
      "#d084d0",
    ];
    return Object.entries(groupedByItem)
      .map(([item, amount], index) => ({
        name: item.length > 15 ? item.substring(0, 15) + "..." : item,
        value: parseFloat(amount.toFixed(2)),
        fill: colors[index % colors.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 items
  }, [filtered, expenses]);

  const downloadTXT = () => {
    const dataToDownload = filtered.length ? filtered : expenses;

    if (!dataToDownload.length) {
      toast.error(
        "No expense data available. Generate report or add expenses first.",
      );
      return;
    }

    try {
      let text = `Expense Report\n`;
      text += `=========================\n\n`;

      dataToDownload.forEach((e, i) => {
        const item = e.ExpenseItem || "Untitled";
        const amount = e.ExpenseCost || "0";
        const date = e.ExpenseDate || "Unknown";
        text += `${i + 1}. ${item} - ₹${amount} (${date})\n`;
      });

      const total = dataToDownload.reduce(
        (sum, e) => sum + parseFloat(e.ExpenseCost || 0),
        0,
      );

      text += `\n-------------------------\n`;
      text += `Total: ₹${total.toFixed(2)}\n`;

      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Expense_Report.txt");

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error("Download failed");
    }
  };
  const downloadCSV = () => {
    const dataToDownload = filtered.length ? filtered : expenses;

    if (!dataToDownload.length) {
      toast.error(
        "No expense data available. Generate report or add expenses first.",
      );
      return;
    }

    let csv = "Item,Amount,Date\n";

    dataToDownload.forEach((e) => {
      const item = (e.ExpenseItem || "").replace(/"/g, '""');
      const cost = e.ExpenseCost || "0";
      const date = e.ExpenseDate || "";
      csv += `"${item}",${cost},${date}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Expense_Report.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const quickToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    setEndDate(today);
  };

  const quickMonth = () => {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];
    setStartDate(first);
    setEndDate(last);
  };

  return (
    <div
      className="min-vh-100 py-5 position-relative"
      style={{
        background: "linear-gradient(135deg, #000, #1a1a1a)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          background: "rgba(250,204,21,0.08)",
          filter: "blur(120px)",
          top: "20%",
          left: "10%",
          animation: "float 10s infinite",
        }}
      />

      <div className="container text-white">
        <h2 className="fw-bold mb-3 text-warning">📊 Expense Report</h2>
        <div className="row g-2 mb-3">
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

          <div className="col-md-3">
            <input
              type="text"
              placeholder="Search item..."
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="col-md-3 d-flex gap-2">
            <button className="btn btn-warning w-100" onClick={generateReport}>
              Generate
            </button>
          </div>
        </div>

        <div className="mb-3 d-flex gap-2">
          <button
            className="btn btn-outline-warning btn-sm"
            onClick={quickToday}
          >
            Today
          </button>
          <button
            className="btn btn-outline-warning btn-sm"
            onClick={quickMonth}
          >
            This Month
          </button>
        </div>
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="p-3 bg-dark rounded">
              <small>Total</small>
              <h5>₹ {total}</h5>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-3 bg-dark rounded">
              <small>Transactions</small>
              <h5>{filtered.length}</h5>
            </div>
          </div>
          <div className="col-md-4">
            <div className="p-3 bg-dark rounded">
              <small>Average</small>
              <h5>₹ {avg}</h5>
            </div>
          </div>
        </div>

        {/* Charts */}
        {chartData.length > 0 && (
          <div className="row g-3 mb-4">
            <div className="col-md-8">
              <div className="p-3 bg-dark rounded">
                <h6 className="text-warning mb-3">📈 Expenses Over Time</h6>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="date" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#333",
                        border: "1px solid #facc15",
                      }}
                      labelStyle={{ color: "#fff" }}
                    />
                    <Bar dataKey="amount" fill="#facc15" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 bg-dark rounded">
                <h6 className="text-warning mb-3">🥧 Expense Breakdown</h6>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#333",
                        border: "1px solid #facc15",
                      }}
                      labelStyle={{ color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="d-flex gap-2 mb-3">
          <button className="btn btn-warning" onClick={downloadTXT}>
            Download TXT
          </button>
          <button className="btn btn-outline-warning" onClick={downloadCSV}>
            Download CSV
          </button>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-dark table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Item</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((e, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{e.ExpenseItem}</td>
                    <td className="text-warning">₹ {e.ExpenseCost}</td>
                    <td>{e.ExpenseDate}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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

export default ExpenseReport;
