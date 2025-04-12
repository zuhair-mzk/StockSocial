import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const TABS = ["Friends", "Incoming", "Outgoing"];
const API = "http://localhost:8000";

const FriendsPage = () => {
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState("Friends");
  const [friends, setFriends] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [newFriendUsername, setNewFriendUsername] = useState("");
  const [error, setError] = useState("");

  const fetchAll = async () => {
    try {
      const [f, i, o] = await Promise.all([
        fetch(`${API}/friends?user_id=${userId}`).then((res) => res.json()),
        fetch(`${API}/friend-requests?user_id=${userId}`).then((res) =>
          res.json()
        ),
        fetch(`${API}/friend-outgoings?user_id=${userId}`).then((res) =>
          res.json()
        ),
      ]);
      setFriends(f);
      setIncoming(i);
      setOutgoing(o);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSendRequest = async () => {
    setError("");
    try {
      const res1 = await fetch(`${API}/user-id?username=${newFriendUsername}`);
      if (!res1.ok) {
        const text = await res1.text();
        throw new Error(`User lookup failed: ${text}`);
      }
      const { user_id } = await res1.json();

      const res2 = await fetch(`${API}/send-friend-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id: userId,
          receiver_id: user_id,
        }),
      });
      const data = await res2.json();
      if (!res2.ok) throw new Error(data.detail);
      setNewFriendUsername("");
      fetchAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAccept = async (from_id) => {
    await fetch(`${API}/accept-friend-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender_id: from_id, receiver_id: userId }),
    });
    fetchAll();
  };

  const handleReject = async (from_id) => {
    await fetch(`${API}/reject-friend-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender_id: from_id, receiver_id: userId }),
    });
    fetchAll();
  };

  const handleDelete = async (friend_id) => {
    await fetch(`${API}/delete-friend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, friend_id }),
    });
    fetchAll();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-3xl mx-auto mt-12 p-6 bg-white rounded shadow text-center">
        <div className="flex justify-center space-x-4 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded font-semibold transition ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Friends" && (
          <>
            <h2 className="text-2xl font-bold mb-4">Your Friends</h2>
            {friends.length === 0 ? (
              <p className="text-gray-500">No friends yet.</p>
            ) : (
              friends.map((f) => (
                <div
                  key={f.user_id}
                  className="flex justify-between items-center border-b py-2"
                >
                  <span className="font-medium">{f.username}</span>
                  <div className="space-x-2">
                    <button className="text-blue-600 border px-2 py-1 rounded text-sm">
                      View Stock Lists
                    </button>
                    <button
                      onClick={() => handleDelete(f.user_id)}
                      className="text-red-600 border px-2 py-1 rounded text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
            <div className="mt-6 flex flex-col items-center">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter friend's username"
                  value={newFriendUsername}
                  onChange={(e) => setNewFriendUsername(e.target.value)}
                  className="border px-3 py-2 rounded w-64"
                />
                <button
                  onClick={handleSendRequest}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Add Friend
                </button>
              </div>
              {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
            </div>
          </>
        )}

        {activeTab === "Incoming" && (
          <>
            <h2 className="text-2xl font-bold mb-4">Incoming Requests</h2>
            {incoming.length === 0 ? (
              <p className="text-gray-500">No incoming requests.</p>
            ) : (
              incoming.map((req) => (
                <div
                  key={req.from_id}
                  className="flex justify-between items-center border-b py-2"
                >
                  <span>{req.from_username}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleAccept(req.from_id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(req.from_id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === "Outgoing" && (
          <>
            <h2 className="text-2xl font-bold mb-4">Outgoing Requests</h2>
            {outgoing.length === 0 ? (
              <p className="text-gray-500">No outgoing requests.</p>
            ) : (
              outgoing.map((req) => (
                <div key={req.to_id} className="py-2 border-b">
                  Sent to: <strong>{req.to_username}</strong> at{" "}
                  {new Date(req.timestamp).toLocaleString()}
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;
