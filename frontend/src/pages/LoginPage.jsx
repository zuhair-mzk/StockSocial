import React from "react";
import LoginForm from "../components/LoginForm";
import { loginUser } from "../services/auth";

const LoginPage = () => {
  const handleLogin = async (credentials) => {
    const res = await loginUser(credentials);
    if (res.success) {
      alert("Login successful!");
      // Redirect or update context
    } else {
      alert(res.message);
    }
  };

  return <LoginForm onSubmit={handleLogin} />;
};

export default LoginPage;
