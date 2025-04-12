import React from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const DashboardPage = () => {
  const { username } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex justify-center items-center h-[80vh]">
        <div className="bg-white p-10 rounded-lg shadow-lg text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {username || "Guest"} 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Explore your portfolios and manage your stocks
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
