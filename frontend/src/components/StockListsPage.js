import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import StockListCard from "./StockListCard";
import CreateStockListModal from "./CreateStockListModal";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:8000";

const StockListsPage = () => {
  const { userId } = useAuth();
  const [myLists, setMyLists] = useState([]);
  const [sharedLists, setSharedLists] = useState([]);
  const [publicLists, setPublicLists] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchMyLists = async () => {
    const res = await fetch(`${API}/get-stocklists?user_id=${userId}`);
    const data = await res.json();
    setMyLists(data);
  };

  const fetchSharedLists = async () => {
    const res = await fetch(
      `${API}/stocklists/stocklists-shared-with-me?user_id=${userId}`
    );
    const data = await res.json();
    setSharedLists(data);
  };

  const fetchPublicLists = async () => {
    const res = await fetch(`${API}/stocklists/get-public-stocklists`);
    const data = await res.json();
    setPublicLists(data);
  };

  useEffect(() => {
    fetchMyLists();
    fetchSharedLists();
    fetchPublicLists();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Stock Lists</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            + New List
          </button>
        </div>

        {showModal && (
          <CreateStockListModal
            onClose={() => setShowModal(false)}
            onSuccess={fetchMyLists}
          />
        )}

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Private Lists</h2>
          <div className="space-y-4">
            {myLists.map((list) => (
              <StockListCard
                key={list.stocklist_id}
                list={list}
                type="private"
              />
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Shared With Me</h2>
          <div className="space-y-4">
            {sharedLists.map((list) => (
              <StockListCard
                key={list.stocklist_id}
                list={list}
                type="shared"
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Public Lists</h2>
          <div className="space-y-4">
            {publicLists.map((list) => (
              <StockListCard
                key={list.stocklist_id}
                list={list}
                type="public"
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StockListsPage;
