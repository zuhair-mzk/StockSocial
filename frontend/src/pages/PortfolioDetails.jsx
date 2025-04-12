import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:8000";

const PortfolioDetails = () => {
  const { portfolioId } = useParams();
  const { userId } = useAuth();
  const [holdings, setHoldings] = useState([]);
  const [portfolioName, setPortfolioName] = useState("");
  const [cashBalance, setCashBalance] = useState(0);
  const [symbol, setSymbol] = useState("");
  const [shares, setShares] = useState("");
  const [mode, setMode] = useState("Buy");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [amount, setAmount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [allPortfolios, setAllPortfolios] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchHoldings = async () => {
    try {
      const res = await fetch(`${API}/portfolio/${portfolioId}/holdings`);
      const data = await res.json();
      setHoldings(data);
      if (data.length > 0) setPortfolioName(data[0].portfolio_name);
    } catch (err) {
      console.error("Error fetching holdings:", err);
    }
  };

  const fetchCashBalance = async () => {
    try {
      const res = await fetch(`${API}/portfolio/${portfolioId}/cash`);
      const data = await res.json();
      setCashBalance(data.cash_balance);
    } catch (err) {
      console.error("Error fetching cash:", err);
    }
  };

  const fetchAllPortfolios = async () => {
    try {
      const res = await fetch(`${API}/portfolios?user_id=${userId}`);
      const data = await res.json();
      setAllPortfolios(data);
    } catch (err) {
      console.error("Error fetching portfolios", err);
    }
  };

  const handleTransaction = async () => {
    setError("");
    setSuccess("");

    if (!symbol || !shares) {
      setError("Please fill out all fields.");
      return;
    }

    try {
      const res = await fetch(
        `${API}/stock/${symbol.toUpperCase()}/latest-price`
      );
      const data = await res.json();
      const price = data.latest_price;

      const payload = {
        portfolio_id: parseInt(portfolioId),
        stock_symbol: symbol.toUpperCase(),
        shares: mode === "Buy" ? parseInt(shares) : -parseInt(shares),
        price_per_share: price,
      };

      const txRes = await fetch(`${API}/portfolio/transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!txRes.ok) throw new Error("Transaction failed");

      setSuccess(`Transaction successful at $${price.toFixed(2)} per share!`);
      setSymbol("");
      setShares("");
      setShowModal(false);
      fetchHoldings();
      fetchCashBalance();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeposit = async () => {
    try {
      await fetch(`${API}/portfolio/${portfolioId}/deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });
      fetchCashBalance();
      setAmount("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleWithdraw = async () => {
    try {
      await fetch(`${API}/portfolio/${portfolioId}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });
      fetchCashBalance();
      setAmount("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleTransfer = async () => {
    if (!recipientName || !amount) {
      setError("Please select a portfolio and enter amount.");
      return;
    }

    try {
      await fetch(`${API}/portfolio/${portfolioId}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          target_portfolio_name: recipientName,
        }),
      });

      fetchCashBalance();
      setAmount("");
      setRecipientName("");
    } catch (err) {
      console.error(err);
      setError("Transfer failed");
    }
  };

  useEffect(() => {
    fetchHoldings();
    fetchCashBalance();
    fetchAllPortfolios();
  }, [portfolioId]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Portfolio: {portfolioName}</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Buy / Sell Stock
          </button>
        </div>

        <p className="mb-4 text-gray-700">
          Cash Balance: ${cashBalance.toFixed(2)}
        </p>

        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">Cash Management</h2>
          <div className="flex space-x-2 mb-2">
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border px-3 py-2 rounded w-1/3"
            />
            <button
              onClick={handleDeposit}
              className="bg-green-600 text-white px-3 py-2 rounded"
            >
              Deposit
            </button>
            <button
              onClick={handleWithdraw}
              className="bg-red-600 text-white px-3 py-2 rounded"
            >
              Withdraw
            </button>
          </div>
          <div className="flex space-x-2">
            <select
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="border px-3 py-2 rounded w-1/2"
            >
              <option value="">Select Target Portfolio</option>
              {allPortfolios
                .filter((p) => p.portfolio_id !== parseInt(portfolioId))
                .map((p) => (
                  <option key={p.portfolio_id} value={p.name}>
                    {p.name}
                  </option>
                ))}
            </select>
            <button
              onClick={handleTransfer}
              className="bg-blue-600 text-white px-3 py-2 rounded"
            >
              Transfer
            </button>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-3">Holdings</h2>
        <table className="w-full border bg-white shadow rounded">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Symbol</th>
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-right">Shares</th>
              <th className="p-3 text-right">Stock Price</th>
              <th className="p-3 text-right">Market Value</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-3">{h.stock_symbol}</td>
                <td className="p-3">{h.company_name}</td>
                <td className="p-3 text-right">{h.shares}</td>
                <td className="p-3 text-right">${h.latest_price.toFixed(2)}</td>
                <td className="p-3 text-right">${h.market_value.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-md w-96">
              <h2 className="text-xl font-bold mb-4">Buy / Sell Stock</h2>
              <div className="space-y-3">
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="border px-3 py-2 rounded w-full"
                >
                  <option>Buy</option>
                  <option>Sell</option>
                </select>
                <input
                  type="text"
                  placeholder="Stock Symbol (e.g., AAPL)"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="border px-3 py-2 rounded w-full"
                />
                <input
                  type="number"
                  placeholder="Shares"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  className="border px-3 py-2 rounded w-full"
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-500 text-sm">{success}</p>}
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTransaction}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioDetails;
