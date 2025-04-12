import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:8000";

const CreateStockListModal = ({ onClose, onSuccess }) => {
  const { userId } = useAuth();
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleCreate = async () => {
    setError("");
    setSuccessMsg("");

    if (!name) {
      setError("Stock list name is required.");
      return;
    }

    try {
      const res = await fetch(`${API}/create-stocklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          is_public: isPublic,
          creator_id: userId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to create stocklist");
      }

      setSuccessMsg("Stock list created!");
      onSuccess && onSuccess(); // Refresh list in parent
      onClose(); // Close modal
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">Create New Stock List</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="List Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={() => setIsPublic(!isPublic)}
            />
            <span>Make this stock list public</span>
          </label>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {successMsg && <p className="text-green-500 text-sm">{successMsg}</p>}

          <div className="flex justify-end space-x-2">
            <button onClick={onClose} className="px-4 py-2 border rounded">
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStockListModal;
