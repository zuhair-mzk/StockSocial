import React, { useState } from "react";

const API = "http://localhost:8000";

const StockTransactionModal = ({ portfolioId, onClose, onSuccess }) => {
  const [stockSymbol, setStockSymbol] = useState("");
  const [shares, setShares] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("buy");

  const handleSubmit = async () => {
    setError("");

    const symbol = stockSymbol.trim().toUpperCase();
    const numericShares = parseInt(shares);
    const numericPrice = parseFloat(price);

    if (
      !symbol ||
      isNaN(numericShares) ||
      isNaN(numericPrice) ||
      numericShares <= 0 ||
      numericPrice <= 0
    ) {
      setError("Please fill all fields with valid values.");
      return;
    }

    const payload = {
      portfolio_id: portfolioId,
      stock_symbol: symbol,
      shares: mode === "buy" ? numericShares : -numericShares,
      price_per_share: numericPrice,
    };

    try {
      const res = await fetch(`${API}/portfolio/transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Transaction failed");
      }

      onSuccess(); // refresh holdings
      onClose(); // close modal
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg relative">
        <h2 className="text-xl font-bold mb-4 text-center">Buy / Sell Stock</h2>

        {/* Mode Selector */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="border w-full px-3 py-2 rounded"
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>

        {/* Stock Symbol Input */}
        <input
          type="text"
          placeholder="Stock Symbol (e.g., AAPL)"
          value={stockSymbol}
          onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
          className="border w-full px-3 py-2 mb-3 rounded"
        />

        {/* Shares Input */}
        <input
          type="number"
          placeholder="Shares"
          min="1"
          value={shares}
          onChange={(e) => setShares(e.target.value)}
          className="border w-full px-3 py-2 mb-3 rounded"
        />

        {/* Price Input */}
        <input
          type="number"
          placeholder="Price per Share"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border w-full px-3 py-2 mb-3 rounded"
        />

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 rounded border text-gray-700"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockTransactionModal;
