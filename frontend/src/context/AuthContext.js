
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(localStorage.getItem('user_id') || null);

  const login = (id) => {
    localStorage.setItem('user_id', id);
    setUserId(id);
  };

  const logout = () => {
    localStorage.removeItem('user_id');
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
