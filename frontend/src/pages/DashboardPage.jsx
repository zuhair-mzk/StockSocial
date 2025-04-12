import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const API = "http://localhost:8000";

const DashboardPage = () => {
  const { username, userId } = useAuth();
  const [portfolios, setPortfolios] = useState([]);
  const [portfolioName, setPortfolioName] = useState("");
  const [cashBalance, setCashBalance] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const fetchMarketValue = async (portfolioId) => {
    try {
      const res = await fetch(`${API}/portfolio/${portfolioId}/value`);
      const data = await res.json();
      return data.market_value || 0;
    } catch (err) {
      console.error("Error fetching market value:", err);
      return 0;
    }
  };

  const fetchPortfolios = async () => {
    try {
      const res = await fetch(`${API}/portfolios?user_id=${userId}`);
      const data = await res.json();

      const enriched = await Promise.all(
        data.map(async (p) => {
          const marketValue = await fetchMarketValue(p.portfolio_id);
          return { ...p, market_value: marketValue };
        })
      );

      setPortfolios(enriched);
    } catch (err) {
      console.error("Error fetching portfolios:", err);
    }
  };

  useEffect(() => {
    if (userId) fetchPortfolios();
  }, [userId]);

  const handleCreatePortfolio = async () => {
    setError("");
    setSuccessMessage("");

    if (!portfolioName || !cashBalance) {
      setError("Please fill out both fields.");
      return;
    }

    try {
      const res = await fetch(`${API}/create-portfolio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          name: portfolioName,
          cash_balance: parseFloat(cashBalance),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Error creating portfolio");
      }

      setPortfolioName("");
      setCashBalance("");
      setSuccessMessage("Portfolio created successfully!");
      fetchPortfolios();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        {/* Welcome Header */}
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Welcome, {username || "Guest"} 👋
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Explore your portfolios and manage your stocks
        </p>

        {/* Create Portfolio */}
        <div className="bg-white p-6 rounded shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Portfolio</h2>
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Portfolio Name"
              value={portfolioName}
              onChange={(e) => setPortfolioName(e.target.value)}
              className="border px-4 py-2 rounded w-1/2"
            />
            <input
              type="number"
              placeholder="Initial Cash Balance"
              value={cashBalance}
              onChange={(e) => setCashBalance(e.target.value)}
              className="border px-4 py-2 rounded w-1/2"
            />
            <button
              onClick={handleCreatePortfolio}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Create
            </button>
          </div>
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          {successMessage && (
            <p className="text-green-500 mt-2 text-sm">{successMessage}</p>
          )}
        </div>

        {/* Portfolio List */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">My Portfolios</h2>
          {portfolios.length === 0 ? (
            <p className="text-gray-500">No portfolios yet.</p>
          ) : (
            <ul className="space-y-4">
              {portfolios.map((p) => (
                <li
                  key={p.portfolio_id}
                  className="border p-4 rounded flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold text-lg">{p.name}</h3>
                    <p className="text-gray-600">
                      Cash Balance: ${parseFloat(p.cash_balance).toFixed(2)}
                    </p>
                    <p className="text-gray-600">
                      Total Market Value: $
                      {parseFloat(p.market_value).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/portfolio/${p.portfolio_id}`)}
                    className="text-blue-600 text-sm border px-3 py-1 rounded"
                  >
                    View Holdings
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
