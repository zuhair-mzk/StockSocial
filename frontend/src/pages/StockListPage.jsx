import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import StockListCard from "../components/StockListCard";
import CreateStockListModal from "../components/CreateStockListModal";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:8000";

const StockListsPage = () => {
  const { userId, username } = useAuth();
  const [myLists, setMyLists] = useState([]);
  const [sharedLists, setSharedLists] = useState([]);
  const [publicLists, setPublicLists] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchMyLists = async () => {
    try {
      const res = await fetch(`${API}/get-stocklists?user_id=${userId}`);
      const data = await res.json();
      setMyLists(data);
    } catch (err) {
      console.error("Failed to fetch my stock lists:", err);
    }
  };

  const fetchSharedLists = async () => {
    try {
      const res = await fetch(
        `${API}/stocklists/stocklists-shared-with-me?user_id=${userId}`
      );
      const data = await res.json();
      setSharedLists(data);
    } catch (err) {
      console.error("Failed to fetch shared stock lists:", err);
    }
  };

  const fetchPublicLists = async () => {
    try {
      const res = await fetch(`${API}/stocklists/get-public-stocklists`);
      const data = await res.json();
      setPublicLists(data);
    } catch (err) {
      console.error("Failed to fetch public stock lists:", err);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMyLists();
      fetchSharedLists();
      fetchPublicLists();
    }
  }, [userId]);

  const myPrivateLists = myLists.filter((l) => !l.is_public);
  const myPublicLists = myLists.filter((l) => l.is_public);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar username={username} />
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Lists</h1>
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

        {/* All My Lists */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">All My Lists</h2>

          {/* Private Subsection */}
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Private Lists
          </h3>
          <div className="space-y-4 mb-6">
            {myPrivateLists.length === 0 ? (
              <p className="text-gray-500">You have no private lists yet.</p>
            ) : (
              myPrivateLists.map((list) => (
                <StockListCard
                  key={list.stocklist_id}
                  list={list}
                  type="private"
                  onDelete={fetchMyLists}
                />
              ))
            )}
          </div>

          {/* Public Subsection */}
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Public Lists
          </h3>
          <div className="space-y-4">
            {myPublicLists.length === 0 ? (
              <p className="text-gray-500">You have no public lists yet.</p>
            ) : (
              myPublicLists.map((list) => (
                <StockListCard
                  key={list.stocklist_id}
                  list={list}
                  type="public"
                  onDelete={fetchMyLists}
                />
              ))
            )}
          </div>
        </section>

        {/* Shared Lists */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-2">Shared Lists</h2>
          <div className="space-y-4">
            {sharedLists.length === 0 ? (
              <p className="text-gray-500">
                No lists have been shared with you yet.
              </p>
            ) : (
              sharedLists.map((list) => (
                <StockListCard
                  key={list.stocklist_id}
                  list={list}
                  type="shared"
                  onDelete={fetchSharedLists}
                />
              ))
            )}
          </div>
        </section>

        {/* Public Lists (Everyone’s) */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Public Lists</h2>
          <div className="space-y-4">
            {publicLists.length === 0 ? (
              <p className="text-gray-500">
                No public lists are available yet.
              </p>
            ) : (
              publicLists.map((list) => (
                <StockListCard
                  key={list.stocklist_id}
                  list={list}
                  type="public"
                />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StockListsPage;
