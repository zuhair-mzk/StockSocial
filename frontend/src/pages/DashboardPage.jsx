import React from "react";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { username } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <h1 className="text-3xl font-bold">Welcome, {username} 👋</h1>
      </div>
    </div>
  );
};

export default DashboardPage;
