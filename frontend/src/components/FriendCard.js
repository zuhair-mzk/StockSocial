import React from "react";

const FriendCard = ({ username, onViewStockLists, onDelete }) => {
  return (
    <div className="flex justify-between items-center border-b py-2">
      <span>{username}</span>
      <div className="flex space-x-2">
        <button
          onClick={onViewStockLists}
          className="text-blue-600 border px-2 py-1 rounded text-sm"
        >
          View Stock Lists
        </button>
        <button
          onClick={onDelete}
          className="text-red-600 border px-2 py-1 rounded text-sm"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default FriendCard;
