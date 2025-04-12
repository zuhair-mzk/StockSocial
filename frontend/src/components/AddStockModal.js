import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API = "http://localhost:8000";

const AddStockModal = ({ onClose, onAdd }) => {
  const { id: stocklistId } = useParams();
  const [symbol, setSymbol] = useState("");
  const [shares, setShares] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const res = await fetch(`${API}/all-stocks`);
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Failed to fetch stock symbols", err);
      }
    };

    fetchSymbols();
  }, []);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!symbol || !shares || parseInt(shares) <= 0) {
      setError(
        "Please enter a valid stock symbol and positive number of shares."
      );
      return;
    }

    try {
      const res = await fetch(`${API}/stocklists/${stocklistId}/add-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stock_symbol: symbol,
          shares: parseInt(shares),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to add stock");
      }

      setSuccess("Stock added successfully!");
      setSymbol("");
      setShares("");
      onAdd();
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Add Stock</h2>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Stock Symbol"
          list="symbol-suggestions"
          className="w-full mb-3 border px-3 py-2 rounded"
        />
        <datalist id="symbol-suggestions">
          {suggestions.map((s, i) => (
            <option key={i} value={s.stock_symbol} />
          ))}
        </datalist>

        <input
          type="number"
          value={shares}
          onChange={(e) => setShares(e.target.value)}
          placeholder="Number of Shares"
          className="w-full mb-3 border px-3 py-2 rounded"
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-2">{success}</p>}

        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStockModal;
