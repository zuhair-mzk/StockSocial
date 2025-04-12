import React from "react";
import RegisterForm from "../components/RegisterForm";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (username, password) => {
    try {
      const res = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      // ✅ Auto login
      login(data.user_id, data.username);
      navigate("/dashboard");
    } catch (err) {
      throw err;
    }
  };

  return <RegisterForm onRegister={handleRegister} />;
};

export default RegisterPage;
