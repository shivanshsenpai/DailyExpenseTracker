import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

const AIChat = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your AI expense advisor. Ask me anything about saving money, budgeting, or managing your expenses.",
      sender: "ai",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [showExpenseConfirm, setShowExpenseConfirm] = useState(false);
  const [extractedExpense, setExtractedExpense] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }
    scrollToBottom();

    // Initialize speech recognition
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
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

    // Load voices for speech synthesis
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Prefer a female-sounding voice
        const femaleVoice = voices.find(
          (voice) =>
            voice.name.toLowerCase().includes("female") ||
            voice.name.toLowerCase().includes("woman") ||
            voice.name.toLowerCase().includes("zira") ||
            voice.name.toLowerCase().includes("hazel") ||
            voice.name.toLowerCase().includes("samantha") ||
            (voice.name.toLowerCase().includes("english") &&
              voice.name.toLowerCase().includes("us")),
        );
        if (femaleVoice) {
          setSelectedVoice(femaleVoice);
        } else {
          // Fallback to first English voice
          const englishVoice = voices.find((voice) =>
            voice.lang.startsWith("en"),
          );
          setSelectedVoice(englishVoice || voices[0]);
        }
      }
    };

    if ("speechSynthesis" in window) {
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const extractExpense = (text) => {
    // Simple extraction for amount, item, date
    const amountMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:rupees?|rs|dollars?|usd|\$)/i);
    const itemMatch = text.match(/(?:bought|spent|paid for|expense of)\s+(.+?)(?:\s+(?:for|on|at|in)\s+|for\s+\d|$)/i);
    const dateMatch = text.match(/(?:on\s+|at\s+|date\s+|in\s+)(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4})/i);

    if (amountMatch && itemMatch) {
      const today = new Date();
      let date = today.toISOString().split('T')[0]; // Default to today
      if (dateMatch) {
        // Parse the date, for simplicity, assume DD MMM YYYY or similar
        const dateStr = dateMatch[1];
        // Basic parsing, can improve
        const parsed = new Date(dateStr);
        if (!isNaN(parsed)) {
          date = parsed.toISOString().split('T')[0];
        }
      }
      return {
        cost: amountMatch[1],
        item: itemMatch[1].trim(),
        date: date
      };
    }
    return null;
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      toast.error("Voice recognition not supported in this browser.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const speakMessage = (text) => {
    if ("speechSynthesis" in window && voiceEnabled) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.rate = 0.9; // Slightly slower for less robotic
      utterance.pitch = 1.1; // Slightly higher pitch for more natural female sound
      utterance.volume = 1;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };
  const addExpense = async (expense) => {
    try {
      const res = await fetch('/add_expense/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          UserId: userId,
          ExpenseCost: expense.cost,
          ExpenseItem: expense.item,
          NoteDate: expense.date
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Expense added successfully!');
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          text: `✅ Expense added: ${expense.item} for ₹${expense.cost} on ${expense.date}`,
          sender: 'ai'
        }]);
      } else {
        toast.error(data.message || 'Failed to add expense');
      }
    } catch (err) {
      toast.error('Error adding expense: ' + err.message);
    }
  };
  const sendMessage = async () => {
    if (!input.trim()) return;

    // Check if input contains expense details
    const expense = extractExpense(input);
    if (expense) {
      setExtractedExpense(expense);
      setShowExpenseConfirm(true);
      return; // Don't send to AI yet
    }

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: "user",
    };

    setMessages([...messages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`/ai_chat/${userId}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      if (res.ok) {
        const aiMessage = {
          id: messages.length + 2,
          text:
            data.response ||
            "I apologize, but I'm unable to respond right now. Please try again.",
          sender: "ai",
        };
        setMessages((prev) => [...prev, aiMessage]);
        speakMessage(aiMessage.text);
      } else {
        toast.error(data.error || "Failed to get response");
        const errorMessage = {
          id: messages.length + 2,
          text: "Sorry, I'm having trouble connecting to the AI service. Please check your Ollama setup.",
          sender: "ai",
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (err) {
      toast.error("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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
        style={{ maxWidth: "800px", position: "relative", zIndex: 2 }}
      >
        <h2
          className="fw-bold mb-4 text-warning"
          style={{
            textShadow:
              "0 0 20px rgba(250,204,21,0.4), 0 0 40px rgba(250,204,21,0.2)",
            letterSpacing: "0.5px",
            fontWeight: 600,
          }}
        >
          💬 AI Finance Advisor Chat
        </h2>

        <div
          style={{
            height: "500px",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(250,204,21,0.02) 100%)",
            border: "1px solid rgba(250,204,21,0.15)",
            borderRadius: "20px",
            padding: "20px",
            overflowY: "auto",
            marginBottom: "20px",
            backdropFilter: "blur(20px)",
            boxShadow:
              "0 0 30px rgba(250,204,21,0.08), inset 0 0 30px rgba(250,204,21,0.05)",
            animation: "softGlowPulse 4s ease-in-out infinite",
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                marginBottom: "12px",
                display: "flex",
                justifyContent:
                  msg.sender === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "70%",
                  padding: "12px 16px",
                  borderRadius:
                    msg.sender === "user"
                      ? "16px 4px 16px 16px"
                      : "4px 16px 16px 16px",
                  background:
                    msg.sender === "user"
                      ? "linear-gradient(135deg, rgba(250,204,21,0.15) 0%, rgba(250,204,21,0.05) 100%)"
                      : "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                  boxShadow:
                    msg.sender === "user"
                      ? "0 0 15px rgba(250,204,21,0.12)"
                      : "none",
                  borderLeft:
                    msg.sender === "user"
                      ? "none"
                      : "3px solid rgba(250,204,21,0.4)",
                  wordWrap: "break-word",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.5",
                  animation: "fadeInSlide 0.5s ease",
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div
              style={{
                textAlign: "left",
                color: "rgba(250,204,21,0.6)",
                fontSize: "14px",
                animation: "typingBlink 1.4s infinite",
              }}
            >
              🤖 Thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
         <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>

  {/* 🎤 Voice Input Button */}
  <button
    onClick={isListening ? stopListening : startListening}
    title={isListening ? "Stop listening" : "Start voice input"}
    style={{
      padding: "14px",
      width: "52px",
      height: "52px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "20px",
      border: "none",
      borderRadius: "16px",
      cursor: "pointer",

      background: isListening
        ? "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)"
        : "linear-gradient(135deg, #10b981 0%, #059669 100%)",

      color: "#fff",
      boxShadow: isListening
        ? "0 0 20px rgba(239,68,68,0.6)"
        : "0 6px 18px rgba(16,185,129,0.35)",

      transform: isListening ? "scale(1.05)" : "scale(1)",
      transition: "all 0.25s ease",
      animation: isListening ? "pulse 1.5s infinite" : "none",
    }}
    onMouseEnter={(e) => {
      e.target.style.transform = "translateY(-3px) scale(1.08)";
      e.target.style.boxShadow = isListening
        ? "0 0 25px rgba(239,68,68,0.7)"
        : "0 10px 25px rgba(16,185,129,0.4)";
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = isListening
        ? "scale(1.05)"
        : "scale(1)";
      e.target.style.boxShadow = isListening
        ? "0 0 20px rgba(239,68,68,0.6)"
        : "0 6px 18px rgba(16,185,129,0.35)";
    }}
  >
    {isListening ? "🎙️" : "🎤"}
  </button>

  {/* 🔊 Voice Output Button */}
  <button
    onClick={() => {
      if (voiceEnabled) {
        window.speechSynthesis.cancel();
      }
      setVoiceEnabled(!voiceEnabled);
    }}
    title={voiceEnabled ? "Disable voice output" : "Enable voice output"}
    style={{
      padding: "14px",
      width: "52px",
      height: "52px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "20px",
      border: "none",
      borderRadius: "16px",
      cursor: "pointer",

      background: voiceEnabled
        ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
        : "linear-gradient(135deg, #6b7280 0%, #374151 100%)",

      color: "#fff",
      boxShadow: voiceEnabled
        ? "0 0 18px rgba(59,130,246,0.5)"
        : "0 6px 18px rgba(107,114,128,0.25)",

      transition: "all 0.25s ease",
    }}
    onMouseEnter={(e) => {
      e.target.style.transform = "translateY(-3px) scale(1.08)";
      e.target.style.boxShadow = voiceEnabled
        ? "0 0 22px rgba(59,130,246,0.6)"
        : "0 10px 25px rgba(107,114,128,0.35)";
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = "scale(1)";
      e.target.style.boxShadow = voiceEnabled
        ? "0 0 18px rgba(59,130,246,0.5)"
        : "0 6px 18px rgba(107,114,128,0.25)";
    }}
  >
    {voiceEnabled ? "🔊" : "🔇"}
  </button>

  {/* ✨ Pulse animation */}
  <style>
    {`
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.6); }
        70% { box-shadow: 0 0 0 12px rgba(239,68,68,0); }
        100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
      }
    `}
  </style>

</div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about budgeting, saving, or expenses... (Press Enter to send)"
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid rgba(250,204,21,0.2)",
              background: "rgba(255,255,255,0.05)",
              color: "#fff",
              minHeight: "50px",
              resize: "none",
              outline: "none",
              transition: "all 0.3s ease",
              fontSize: "14px",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(250,204,21,0.4)";
              e.target.style.background = "rgba(255,255,255,0.08)";
              e.target.style.boxShadow = "0 0 20px rgba(250,204,21,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(250,204,21,0.2)";
              e.target.style.background = "rgba(255,255,255,0.05)";
              e.target.style.boxShadow = "none";
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              padding: "12px 28px",
              background: "linear-gradient(135deg, #facc15 0%, #f59e0b 100%)",
              color: "#000",
              border: "none",
              borderRadius: "12px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.4s ease",
              boxShadow: "0 4px 15px rgba(250,204,21,0.2)",
              opacity: loading || !input.trim() ? 0.7 : 1,
            }}
            onMouseOver={(e) => {
              if (!loading && input.trim()) {
                e.target.style.boxShadow = "0 6px 25px rgba(250,204,21,0.35)";
                e.target.style.transform = "translateY(-2px)";
              }
            }}
            onMouseOut={(e) => {
              e.target.style.boxShadow = "0 4px 15px rgba(250,204,21,0.2)";
              e.target.style.transform = "translateY(0)";
            }}
          >
            Send
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes waveSway {
            0%, 100% { transform: translateX(0) translateY(0); }
            25% { transform: translateX(-40px) translateY(10px); }
            50% { transform: translateX(-80px) translateY(0); }
            75% { transform: translateX(-40px) translateY(-10px); }
          }

          @keyframes floatSlow {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            50% { transform: translateY(30px) translateX(20px); }
          }

          @keyframes softGlowPulse {
            0%, 100% { 
              box-shadow: 0 0 20px rgba(250,204,21,0.08), inset 0 0 20px rgba(250,204,21,0.03);
            }
            50% { 
              box-shadow: 0 0 35px rgba(250,204,21,0.12), inset 0 0 30px rgba(250,204,21,0.05);
            }
          }

          @keyframes fadeInSlide {
            from { 
              opacity: 0; 
              transform: translateY(15px) scale(0.95);
            }
            to { 
              opacity: 1; 
              transform: translateY(0) scale(1);
            }
          }

          @keyframes typingBlink {
            0%, 60%, 100% { opacity: 1; }
            30% { opacity: 0.5; }
          }
        `}
      </style>

      <ToastContainer position="top-center" />
    </div>
  );
};

export default AIChat;
