import React from "react";
import ReactDOM from "react-dom/client";
import App  from "./App";
import "./index.css";
// 1. Import your new Provider [cite: 2026-01-01]
import { BackendProvider } from "./context/backendContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* 2. Wrap the App component with your Provider [cite: 2026-01-06] */}
    <BackendProvider>
    <App />
    </BackendProvider>
  </React.StrictMode>
);