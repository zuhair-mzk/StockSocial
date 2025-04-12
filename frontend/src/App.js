import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import PortfolioDetails from "./pages/PortfolioDetails";
import StockListPage from "./pages/StockListPage";
import StockListDetails from "./pages/StockListDetails";
import FriendsPage from "./pages/FriendsPage";
import TransactionsPage from "./pages/TransactionsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import DashboardPage from "./pages/DashboardPage"; // Optional custom dashboard

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/portfolio" element={<PortfolioDetails />} />
            <Route path="/stock-lists" element={<StockListPage />} />
            <Route path="/stock-lists/:id" element={<StockListDetails />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route
              path="/portfolio/:portfolioId"
              element={<PortfolioDetails />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
