import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PortfolioDetails from "./pages/PortfolioDetails";
import StockListPage from "./pages/StockListPage";
import StockListDetails from "./pages/StockListDetails";
import FriendsPage from "./pages/FriendsPage";
import TransactionsPage from "./pages/TransactionsPage";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<PortfolioDetails />} />
          <Route path="/dashboard" element={<PortfolioDetails />} />
          <Route path="/stock-lists" element={<StockListPage />} />
          <Route path="/stock-lists/:id" element={<StockListDetails />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
