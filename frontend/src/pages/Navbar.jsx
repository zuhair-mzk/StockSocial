import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = ({ username }) => {
  const location = useLocation();
  const navItems = [
    { name: "Portfolio", path: "/dashboard" },
    { name: "Stocks", path: "/stocks" },
    { name: "Friends", path: "/friends" },
    { name: "Transactions", path: "/transactions" },
  ];

  return (
    <nav className="bg-white shadow-md p-4 flex items-center justify-between">
      <div className="text-2xl font-bold text-blue-700">StockNet</div>
      <ul className="flex space-x-6">
        {navItems.map((item) => (
          <li key={item.name}>
            <Link
              to={item.path}
              className={`text-gray-700 font-medium hover:text-blue-600 ${
                location.pathname === item.path ? "text-blue-700 underline" : ""
              }`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
      <div className="text-sm text-gray-600">Hi, {username} 👋</div>
    </nav>
  );
};

export default Navbar;
