import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:8000";

const StockListDetails = () => {
  const { id: stocklistId } = useParams();
  const { userId, username } = useAuth();

  const [listInfo, setListInfo] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [symbol, setSymbol] = useState("");
  const [shares, setShares] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [message, setMessage] = useState("");

  const isOwner = listInfo?.creator_id === userId;
  const isPublic = listInfo?.is_public;
  const isShared = !isOwner && !isPublic;

  const fetchListInfo = async () => {
    const res = await fetch(`${API}/get-stocklists?user_id=${userId}`);
    const all = await res.json();
    const match = all.find((l) => l.stocklist_id === parseInt(stocklistId));
    setListInfo(match);
  };

  const fetchHoldings = async () => {
    const res = await fetch(`${API}/stocklists/${stocklistId}/value`);
    const data = await res.json();
    setHoldings(data?.items || []);
  };

  const fetchReviews = async () => {
    const res = await fetch(`${API}/stocklists/${stocklistId}/my-reviews`);
    const data = await res.json();
    setReviews(data);
  };

  const handleAddStock = async () => {
    try {
      await fetch(`${API}/stocklists/${stocklistId}/add-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stock_symbol: symbol,
          shares: parseInt(shares),
        }),
      });
      setSymbol("");
      setShares("");
      fetchHoldings();
    } catch (err) {
      console.error("Failed to add stock:", err);
    }
  };

  const handleRemoveStock = async (symbol) => {
    try {
      await fetch(`${API}/stocklists/${stocklistId}/remove-stock/${symbol}`, {
        method: "DELETE",
      });
      fetchHoldings();
    } catch (err) {
      console.error("Failed to remove stock:", err);
    }
  };

  const handleReviewSubmit = async () => {
    try {
      const res = await fetch(`${API}/create-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewer_id: userId,
          stocklist_id: parseInt(stocklistId),
          content: reviewContent,
        }),
      });
      if (res.ok) {
        setReviewContent("");
        fetchReviews();
        setMessage("Review added!");
      } else {
        const err = await res.json();
        setMessage(err.detail || "Error");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await fetch(`${API}/reviews/${reviewId}`, { method: "DELETE" });
      fetchReviews();
    } catch (err) {
      console.error("Failed to delete review:", err);
    }
  };

  useEffect(() => {
    fetchListInfo();
    fetchHoldings();
    fetchReviews();
  }, [stocklistId]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar username={username} />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">
          Stock List: {listInfo?.name}
        </h1>

        {isOwner && (
          <div className="bg-white p-4 mb-6 shadow rounded">
            <h2 className="text-lg font-semibold mb-2">Add Stock</h2>
            <div className="flex space-x-3 mb-2">
              <input
                type="text"
                placeholder="Stock Symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="border px-3 py-2 rounded w-1/2"
              />
              <input
                type="number"
                placeholder="Shares"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                className="border px-3 py-2 rounded w-1/2"
              />
              <button
                onClick={handleAddStock}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Holdings Table */}
        <div className="bg-white p-4 shadow rounded mb-6">
          <h2 className="text-xl font-semibold mb-3">Holdings</h2>
          {holdings.length === 0 ? (
            <p className="text-gray-500">No holdings yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 text-left">Symbol</th>
                  <th className="p-2 text-left">Shares</th>
                  <th className="p-2 text-left">Price</th>
                  <th className="p-2 text-left">Market Value</th>
                  {isOwner && <th className="p-2 text-left">Action</th>}
                </tr>
              </thead>
              <tbody>
                {holdings.map((h, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{h.stock_symbol}</td>
                    <td className="p-2">{h.shares}</td>
                    <td className="p-2">${h.latest_price.toFixed(2)}</td>
                    <td className="p-2">${h.market_value.toFixed(2)}</td>
                    {isOwner && (
                      <td className="p-2">
                        <button
                          className="text-red-600"
                          onClick={() => handleRemoveStock(h.stock_symbol)}
                        >
                          Remove
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Reviews Section */}
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-xl font-semibold mb-3">Reviews</h2>
          {message && <p className="text-green-600 text-sm mb-2">{message}</p>}

          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500">No reviews yet.</p>
          ) : (
            reviews
              .filter((r) => {
                if (isPublic) return true;
                return (
                  r.reviewer_id === userId || listInfo?.creator_id === userId
                );
              })
              .map((r) => (
                <div key={r.review_id} className="border-b py-2">
                  <p className="text-sm text-gray-700">
                    <strong>{r.username}</strong>: {r.content}
                  </p>
                  {(r.reviewer_id === userId ||
                    listInfo?.creator_id === userId) && (
                    <button
                      onClick={() => handleDeleteReview(r.review_id)}
                      className="text-red-600 text-xs mt-1"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))
          )}

          {/* Review Form Logic */}
          {!isOwner &&
            !reviews.some((r) => r.reviewer_id === userId) &&
            (isPublic || isShared) && (
              <div className="mt-4">
                <textarea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  className="w-full border px-3 py-2 rounded mb-2"
                  placeholder="Leave a review..."
                />
                <button
                  onClick={handleReviewSubmit}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Submit Review
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default StockListDetails;
