import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const API = "http://localhost:8000";

const TransactionsPage = () => {
  const { userId } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");

  const fetchTransactions = async () => {
    try {
      const res = await fetch(
        `${API}/portfolio/user-transactions?user_id=${userId}`
      );

      if (!res.ok) throw new Error("Failed to fetch transactions");
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (userId) fetchTransactions();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Your Transaction History
        </h1>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {transactions.length === 0 ? (
          <p className="text-center text-gray-600">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded shadow p-4">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-200 text-left text-sm text-gray-600">
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Portfolio</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Symbol</th>
                  <th className="px-4 py-2">Shares</th>
                  <th className="px-4 py-2">Total Price ($)</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, i) => (
                  <tr key={i} className="border-t text-sm">
                    <td className="px-4 py-2">
                      {new Date(t.the_timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">{t.portfolio_name}</td>
                    <td className="px-4 py-2 capitalize">{t.trans_type}</td>
                    <td className="px-4 py-2">{t.stock_symbol}</td>
                    <td className="px-4 py-2">{t.shares}</td>
                    <td className="px-4 py-2">
                      ${parseFloat(t.total_price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
