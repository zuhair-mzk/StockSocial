import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./index.css"; // Must come before App
import App from "./App";
import { AuthProvider } from "./context/AuthContext"; // ✅ import it

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      {" "}
      {/* ✅ wrap here */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
