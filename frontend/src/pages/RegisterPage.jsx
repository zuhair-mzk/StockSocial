import React from "react";
import RegisterForm from "../components/RegisterForm";
import { registerUser } from "../services/auth";

const RegisterPage = () => {
  const handleRegister = async (info) => {
    const res = await registerUser(info);
    if (res.success) {
      alert("Registration successful!");
      // Redirect or auto-login
    } else {
      alert(res.message);
    }
  };

  return <RegisterForm onSubmit={handleRegister} />;
};

export default RegisterPage;
