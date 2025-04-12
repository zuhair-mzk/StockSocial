import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/stock-lists">Stock Lists</Link>
      <Link to="/friends">Friends</Link>
      <Link to="/transactions">Transactions</Link>
    </nav>
  );
};

export default Navbar;
