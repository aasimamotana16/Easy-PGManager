import React from "react";
import ReactDOM from "react-dom/client";
// 1. Import CSS FIRST so it loads globally before components
import "./index.css"; 
// 2. Import App SECOND
import App from "./App";
import { BackendProvider } from "./context/backendContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BackendProvider>
      <App />
    </BackendProvider>
  </React.StrictMode>
);