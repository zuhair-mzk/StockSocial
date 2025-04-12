import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

const API = "http://localhost:8000";

const PortfolioDetails = () => {
  const { portfolioId } = useParams();
  const [holdings, setHoldings] = useState([]);
  const [portfolioName, setPortfolioName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("Buy");
  const [symbol, setSymbol] = useState("");
  const [shares, setShares] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const fetchPrice = async () => {
    const res = await fetch(
      `${API}/stock/${symbol.toUpperCase()}/latest-price`
    );
    if (!res.ok) throw new Error("Stock not found or invalid");
    const data = await res.json();
    return data.latest_price; // ✅ MATCHES THE BACKEND RESPONSE
  };

  const handleTransaction = async () => {
    setError("");
    setSuccess("");

    if (!symbol || !shares) {
      setError("Please fill out all fields.");
      return;
    }

    try {
      const price = await fetchPrice();

      const payload = {
        portfolio_id: parseInt(portfolioId),
        stock_symbol: symbol.toUpperCase(),
        shares: mode === "Buy" ? parseInt(shares) : -parseInt(shares),
        price_per_share: parseFloat(price), // ✅ ADD THIS LINE
      };

      const res = await fetch(`${API}/portfolio/transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail) || "Transaction failed"
        );
      }

      setSuccess(`Transaction successful at $${price.toFixed(2)} per share!`);
      setShowModal(false);
      setSymbol("");
      setShares("");
      fetchHoldings();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchHoldings();
  }, [portfolioId]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">
            Portfolio: {portfolioName || `#${portfolioId}`}
          </h1>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={() => setShowModal(true)}
          >
            Buy / Sell Stock
          </button>
        </div>

        {holdings.length === 0 ? (
          <p className="text-gray-600">No holdings in this portfolio.</p>
        ) : (
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
                  <td className="p-3 text-right">
                    ${h.latest_price.toFixed(2)}
                  </td>
                  <td className="p-3 text-right">
                    ${h.market_value.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

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
