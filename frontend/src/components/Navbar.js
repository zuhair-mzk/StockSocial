import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { username, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Stock Lists", path: "/stock-lists" },
    { name: "Friends", path: "/friends" },
    { name: "Transactions", path: "/transactions" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md p-4 px-8 flex items-center justify-between">
      <div className="text-2xl font-bold text-blue-700 tracking-tight">
        📈 StockNet
      </div>

      <ul className="flex space-x-6">
        {navItems.map((item) => (
          <li key={item.name}>
            <Link
              to={item.path}
              className={`font-medium ${
                location.pathname === item.path
                  ? "text-blue-700 underline"
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          Hi, <span className="font-semibold">{username}</span> 👋
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-red-500 hover:underline"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
