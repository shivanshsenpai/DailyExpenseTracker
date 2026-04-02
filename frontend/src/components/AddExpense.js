import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const getLocalDate = () => {
  const d = new Date();
  const tzOffset = d.getTimezoneOffset() * 60000;
  const localDate = new Date(d.getTime() - tzOffset);
  return localDate.toISOString().slice(0, 10);
};

const normalizeItem = (value) => {
  if (!value) return "";
  return String(value).trim().replace(/^"|"$/g, "").replace(/^'|'$/g, "");
};

const normalizeCost = (value) => {
  if (value === null || value === undefined) return "0";

  const cleaned = String(value).match(/[0-9]+(\.[0-9]+)?/g);

  if (!cleaned) return "0";

  return cleaned[0]; // ALWAYS STRING
};
const normalizeDate = (value) => {
  const dateStr = value ? String(value).trim() : "";
  if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(dateStr)) {
    return dateStr;
  }
  return getLocalDate();
};

const expenseSuggestions = [
  // 🍽️ Food & Daily Needs
  "Food",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snacks",
  "Tea",
  "Coffee",
  "Restaurant",
  "Street Food",
  "Groceries",
  "Milk",
  "Bread",
  "Fruits",
  "Vegetables",

  // 🚗 Transport
  "Petrol",
  "Diesel",
  "CNG",
  "Uber",
  "Ola",
  "Bus",
  "Train",
  "Metro",
  "Auto Rickshaw",
  "Taxi",

  // 🏠 Bills & Utilities
  "Rent",
  "Electricity Bill",
  "Water Bill",
  "Gas Cylinder",
  "Internet Bill",
  "Mobile Recharge",
  "DTH Recharge",

  // 🛍️ Shopping
  "Clothes",
  "Shoes",
  "Electronics",
  "Mobile Phone",
  "Accessories",
  "Amazon Order",
  "Flipkart Order",

  // 💊 Health
  "Medicine",
  "Doctor Fee",
  "Hospital",
  "Pharmacy",

  // 🎓 Education / Work
  "School Fees",
  "College Fees",
  "Books",
  "Stationery",
  "Course Fee",
  "Exam Fee",

  // 🎉 Lifestyle
  "Movies",
  "Subscription (Netflix)",
  "Subscription (Spotify)",
  "Gym",
  "Gaming",
  "Entertainment",

  // 💼 Misc
  "Donation",
  "Gift",
  "Repair",
  "Maintenance",
  "Bank Charges",
  "Interest Payment",
];
const AddExpense = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ExpenseItem: "",
    ExpenseCost: "",
    NoteDate: "",
  });
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const userId = localStorage.getItem("userId");
  const [isListening, setIsListening] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);
  const [parsedExpenses, setParsedExpenses] = useState([]);
  const [showBulkPreview, setShowBulkPreview] = useState(false);


  const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData({ ...formData, [name]: value });

  // ✅ ADD THIS LOGIC ONLY FOR ExpenseItem
  if (name === "ExpenseItem") {
    if (!value.trim()) {
      setShowSuggestions(false);
      return;
    }

    const filtered = expenseSuggestions.filter((item) =>
      item.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredSuggestions(filtered);
    setShowSuggestions(true);
  }
};

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      toast.error("Voice recognition not supported in this browser.");
    }
  };
  const extractCleanItem = (text, fallback) => {
  if (!text) return fallback;

  let item = String(text)
    .toLowerCase()
    .trim()
    // remove common AI phrases
    .replace(/from the sentence|from sentence|the sentence|it is|it's|i think|maybe/gi, "")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .trim();

  // take ONLY first meaningful word group
  const words = item.split(" ").filter(Boolean);

  if (words.length === 0) return fallback;

  // remove trailing junk like "keyboard sentence"
  const stopWords = ["sentence", "text", "input", "mentioned"];

  const filtered = words.filter(w => !stopWords.includes(w));

  return filtered.length ? filtered.join(" ") : fallback;
};

  const parseExpense = useCallback(
    async (transcript) => {
      try {
        const prompt = `Parse the following expense description into JSON format: "${transcript}". Extract: item (string), cost (number), date (YYYY-MM-DD). If date is not mentioned, use today's date. If cost is not mentioned, set to 0. Return only valid JSON.`;
        const res = await fetch(`${process.env.REACT_APP_API_URL}/ai_chat/${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: prompt }),
        });

        const data = await res.json();
        if (res.ok && data.response) {
          const aiText = data.response;
          let parsed = null;

          // Try exact JSON parse first
          try {
            parsed = JSON.parse(aiText);
          } catch (_) {
            // Fallback: attempt to extract with regex patterns
            const itemMatch = aiText.match(/item\s*[:-]?\s*([^,\n]+)/i);
            const costMatch = aiText.match(
              /cost\s*[:-]?\s*([0-9]+(?:\.[0-9]+)?)/i,
            );
            const dateMatch = aiText.match(
              /date\s*[:-]?\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/i,
            );

            parsed = {
              item: itemMatch ? itemMatch[1].trim() : transcript.split(" ").slice(0, 3).join(" "),
              cost: costMatch ? costMatch[1] : "0",
              date: dateMatch
                ? dateMatch[1]
                : new Date().toISOString().split("T")[0],
            };
          }

          if (parsed && parsed.item) {
            const cleanItem = extractCleanItem(parsed?.item, transcript);
            const cleanCost = normalizeCost(parsed.cost);
            const cleanDate = normalizeDate(parsed.date);

            setFormData({
              ExpenseItem: cleanItem,
              ExpenseCost: String(cleanCost || "0"),
              NoteDate: cleanDate,
            });
            setParsedData({
              item: cleanItem,
              cost: cleanCost,
              date: cleanDate,
            });
            setShowConfirmation(true);
            console.log("AI parsed result:", parsed, "clean:", {
              item: cleanItem,
              cost: cleanCost,
              date: cleanDate,
            });
            toast.success(
              "Expense parsed and filled automatically. Confirm below.",
            );
          } else {
            console.warn("AI output could not be parsed to item", aiText);
            toast.error("Parsed expense missing item. Please enter manually.");
          }
        } else {
          toast.error("Failed to parse expense. Please try again.");
        }
      } catch (err) {
        toast.error("Network error: " + err.message);
      }
    },
    [userId],
  );

  const confirmExpense = () => {
    if (parsedData) {
      setFormData({
        ExpenseItem: normalizeItem(parsedData.item),
        ExpenseCost: normalizeCost(parsedData.cost),
        NoteDate: normalizeDate(parsedData.date),
      });
      setShowConfirmation(false);
      setParsedData(null);
      toast.success("Expense parsed successfully. Please review and submit.");
    }
  };

  const rejectExpense = () => {
    setShowConfirmation(false);
    setParsedData(null);
    toast.info("Parsing rejected. Please enter manually.");
  };

  useEffect(() => {
    if (!userId) {
      navigate("/login");
    
    }

    // Initialize speech recognition
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = async (event) => {
        const transcriptText = event.results[0][0].transcript;
        setTranscript(transcriptText);
        setIsListening(false);
        await parseExpense(transcriptText);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        toast.error("Voice recognition failed. Please try again.");
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [userId, navigate, parseExpense]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/add_expense/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          UserId: userId,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        toast.success(data.message);
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };
  const saveAllExpenses = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/add_multiple_expenses/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        parsedExpenses.map((exp) => ({
          ExpenseItem: exp.description,
          ExpenseCost: String(exp.amount),
          NoteDate: exp.date,   // will map to ExpenseDate
          UserId: userId
        }))
      ),
    });

    const text = await response.text();
  console.log("RAW RESPONSE:", text);

  let data;
  try {
  data = JSON.parse(text);
  } catch (e) {
    console.error("❌ Not JSON:", text);
    toast.error("Server returned invalid response");
    return;
  }

    console.log("SAVE RESPONSE:", data);

    if (response.ok) {
      toast.success("All expenses added!");
      setParsedExpenses([]);
      setShowBulkPreview(false);
    } else {
      toast.error(data.error || "Failed to save");
    }
  } catch (err) {
    console.error("SAVE ERROR:", err);
    toast.error("Error saving expenses");
  }
};
  const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/upload-statement/`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.transactions && data.transactions.length > 0) {
      setParsedExpenses(data.transactions);
      setShowBulkPreview(true);
      toast.success("File parsed successfully!");
    } else {
      toast.error("No transactions found.");
    }
  } catch (err) {
    console.error(err);
    toast.error("Upload failed");
  }
};
  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #000000, #1a1a1a)",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            {/* Glass Card */}
            <div
              className="p-4"
              style={{
                borderRadius: "20px",
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(15px)",
                WebkitBackdropFilter: "blur(15px)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                transition: "0.3s",
              }}
            >
              {/* Header */}
              <div className="text-center mb-4">
                <h3 className="fw-bold text-white">
                  <i
                    className="fas fa-wallet me-2"
                    style={{ color: "#facc15" }}
                  ></i>
                  Add Expense
                </h3>
                <small style={{ color: "#aaa" }}>
                  Track every rupee smartly
                </small>
                <div className="mt-3">
                  <button
                    onClick={startListening}
                    disabled={isListening}
                    className="btn"
                    style={{
                      borderRadius: "12px",
                      padding: "10px 20px",
                      background: isListening ? "#ef4444" : "#10b981",
                      color: "#fff",
                      border: "none",
                      transition: "0.3s",
                    }}
                    title="Speak your expense details"
                  >
                    {isListening ? "🎙️ Listening..." : "🎤 Voice Input"}
                  </button>
                </div>
              </div>

              {/* Confirmation */}
              {showConfirmation && parsedData && (
                <div
                  className="mb-4 p-3"
                  style={{
                    borderRadius: "12px",
                    background: "rgba(250,204,21,0.1)",
                    border: "1px solid rgba(250,204,21,0.3)",
                  }}
                >
                  <h5 className="text-warning">Confirm Parsed Expense</h5>
                  <p>
                    <strong>Item:</strong> {parsedData.item}
                  </p>
                  <p>
                    <strong>Cost:</strong> ₹{parsedData.cost}
                  </p>
                  <p>
                    <strong>Date:</strong> {parsedData.date}
                  </p>
                  <div className="d-flex gap-2">
                    <button
                      onClick={confirmExpense}
                      className="btn btn-success"
                    >
                      Yes, Add It
                    </button>
                    <button
                      onClick={rejectExpense}
                      className="btn btn-secondary"
                    >
                      No, Enter Manually
                    </button>
                  </div>
                </div>
              )}

              {/* Transcript Display */}
              {transcript && (
                <div
                  className="mb-4 p-3"
                  style={{
                    borderRadius: "12px",
                    background: "rgba(16,185,129,0.1)",
                    border: "1px solid rgba(16,185,129,0.3)",
                  }}
                >
                  <h5 className="text-success">Voice Recognized:</h5>
                  <p className="text-light">"{transcript}"</p>
                </div>
              )}
              {showBulkPreview && parsedExpenses.length > 0 && (
  <div
    className="mb-4 p-3"
    style={{
      borderRadius: "12px",
      background: "rgba(59,130,246,0.1)",
      border: "1px solid rgba(59,130,246,0.3)",
      maxHeight: "250px",
      overflowY: "auto",
    }}
  >
    <h5 className="text-info">📄 Parsed Transactions</h5>

    {parsedExpenses.map((exp, index) => (
      <div key={index} style={{ borderBottom: "1px solid #333", padding: "6px 0" }}>
        <small className="text-light">
          {exp.date} | {exp.description} | ₹{exp.amount}
        </small>
      </div>
    ))}

   <div className="d-flex gap-2 mt-3">
  <button
    className="btn"
    onClick={saveAllExpenses}
    style={{
      flex: 1,
      background: "linear-gradient(135deg, #22c55e, #16a34a)",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      fontWeight: "600",
      padding: "10px",
      transition: "0.3s",
    }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.transform = "scale(1.05)")
    }
    onMouseLeave={(e) =>
      (e.currentTarget.style.transform = "scale(1)")
    }
  >
    ✅ Add All
  </button>

  <button
    className="btn"
    onClick={() => {
      setParsedExpenses([]);
      setShowBulkPreview(false);
    }}
    style={{
      flex: 1,
      background: "rgba(255,255,255,0.08)",
      color: "#fff",
      borderRadius: "10px",
      border: "1px solid rgba(255,255,255,0.2)",
      fontWeight: "500",
      padding: "10px",
      transition: "0.3s",
    }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
    }
    onMouseLeave={(e) =>
      (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
    }
  >
    ❌ Cancel
  </button>
</div>
</div>
)}

{/* 🔥 UPDATED FILE UPLOAD */}
<div className="mb-4">
  <label className="text-light mb-2">Upload Bank Statement</label>

  <div
    onClick={() => document.getElementById("fileUpload").click()}
    style={{
      borderRadius: "12px",
      padding: "15px",
      background: "rgba(255,255,255,0.05)",
      border: "1px dashed rgba(255,255,255,0.25)",
      textAlign: "center",
      cursor: "pointer",
      transition: "0.3s",
    }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
    }
    onMouseLeave={(e) =>
      (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
    }
  >
    <span className="text-light">📂 Click to upload file</span>
    <br />
    <small style={{ color: "#aaa" }}>
      CSV, PDF or Image supported
    </small>
  </div>

  {/* hidden input */}
  <input
    id="fileUpload"
    type="file"
    onChange={handleFileUpload}
    style={{ display: "none" }}
  />
</div>
{/* Form */}
<form onSubmit={handleSubmit}>
  {/* Item */}
  <div style={{ position: "relative" }}>
  <input
    type="text"
    name="ExpenseItem"
    value={formData.ExpenseItem}
    onChange={handleChange}
    className="form-control"
    style={{
      borderRadius: "12px",
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.2)",
      color: "#fff",
    }}
    placeholder="Groceries, Petrol..."
    required
    autoComplete="off"
  />

  {/* 🔥 SUGGESTION DROPDOWN */}
  {showSuggestions && filteredSuggestions.length > 0 && (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        background: "rgba(0,0,0,0.95)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "10px",
        zIndex: 999,
        maxHeight: "180px",
        overflowY: "auto",
      }}
    >
      {filteredSuggestions.map((item, index) => (
        <div
          key={index}
          onClick={() => {
            setFormData({
              ...formData,
              ExpenseItem: item,
            });
            setShowSuggestions(false);
          }}
          style={{
            padding: "10px",
            cursor: "pointer",
            color: "#fff",
            borderBottom:
              index !== filteredSuggestions.length - 1
                ? "1px solid rgba(255,255,255,0.1)"
                : "none",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          {item}
        </div>
      ))}
    </div>
  )}
</div>

                {/* Cost */}
                <div className="mb-3">
                  <label className="text-light mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    name="ExpenseCost"
                    value={formData.ExpenseCost ?? "0"}
                    onChange={handleChange}
                    className="form-control"
                    style={{
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "#fff",
                    }}
                    placeholder="Enter amount"
                    required
                  />
                </div>

                {/* Date */}
                <div className="mb-4">
                  <label className="text-light mb-1">Date</label>
                  <input
                    type="date"
                    name="NoteDate"
                    value={formData.NoteDate}
                    onChange={handleChange}
                    className="form-control"
                    style={{
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "#fff",
                    }}
                    required
                  />
                </div>

                {/* Button */}
                <button
                  type="submit"
                  className="btn w-100 fw-bold"
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
                  onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                >
                  + Add Expense
                </button>
              </form>

              {/* Back */}
              <div className="text-center mt-3">
                <button
                  className="btn btn-link text-decoration-none"
                  style={{ color: "#facc15" }}
                  onClick={() => navigate("/dashboard")}
                >
                  ← Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="top-center" />
    </div>
  );
};

export default AddExpense;
