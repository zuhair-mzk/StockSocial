import React from "react";
import LoginForm from "../components/LoginForm";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth(); // grabs setUserId or login from context
  const navigate = useNavigate();

  const handleLogin = async (username, password) => {
    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // Save user ID in context
      login(data.user_id, data.username);
      navigate("/dashboard");
    } catch (err) {
      throw err; // This will be caught in LoginForm and show an error message
    }
  };

  return <LoginForm onLogin={handleLogin} />;
};

export default LoginPage;
