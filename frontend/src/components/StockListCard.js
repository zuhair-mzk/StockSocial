import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:8000";

const StockListCard = ({ list, type, onDelete }) => {
  const navigate = useNavigate();
  const { userId } = useAuth();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this stock list?"))
      return;

    try {
      const res = await fetch(`${API}/delete-stocklist`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stocklist_id: list.stocklist_id,
          user_id: userId,
        }),
      });

      if (res.ok && onDelete) {
        onDelete();
      } else {
        const data = await res.json();
        alert(data.detail || "Failed to delete stocklist");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="border rounded p-4 shadow flex justify-between items-center bg-white">
      <div>
        <h3 className="text-lg font-bold">{list.name}</h3>
        {list.owner_username && (
          <p className="text-sm text-gray-500">by {list.owner_username}</p>
        )}
        <span
          className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${
            type === "public"
              ? "bg-green-200 text-green-800"
              : type === "shared"
              ? "bg-yellow-200 text-yellow-800"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() =>
            navigate(`/stock-lists/${list.stocklist_id}`, {
              state: { listType: type, listData: list },
            })
          }
          className="text-blue-600 text-sm border px-3 py-1 rounded"
        >
          View
        </button>

        {type === "private" || type === "public" ? (
          <button
            onClick={handleDelete}
            className="text-red-600 text-sm border px-3 py-1 rounded"
          >
            Delete
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default StockListCard;
