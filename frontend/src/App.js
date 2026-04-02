import AddExpense from "./components/AddExpense";
import Dashboard from "./components/Dashboard";
import Home from "./components/Home";
import Login from "./components/Login";
import ManageExpense from "./components/ManageExpense";
import Navbar from "./components/Navbar";
import Signup from "./components/Signup";
import ExpenseReport from "./components/ExpenseReport";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChangePassword from "./components/ChangePassword";
import AIChat from "./components/AIChat";
import AISuggestions from "./components/AISuggestions";
import StockUpdates from "./components/StockUpdates";
import AdminDashboard from "./components/AdminDashboard";


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar></Navbar>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/signup" element={<Signup />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/dashboard" element={<Dashboard />}></Route>
          <Route path="/add-expense" element={<AddExpense />}></Route>
          <Route path="/manage-expense" element={<ManageExpense />}></Route>
          <Route path="/expense-report" element={<ExpenseReport />}></Route>
          <Route path="/change_password" element={<ChangePassword />}></Route>
          <Route path="/ai-chat" element={<AIChat />}></Route>
          <Route path="/ai-suggestions" element={<AISuggestions />}></Route>
          <Route path="/stock-update" element={<StockUpdates/>}></Route>
          <Route path="/admin-dashboard" element={<AdminDashboard />}></Route>
          
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
