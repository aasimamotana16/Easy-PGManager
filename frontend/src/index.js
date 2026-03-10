import React from "react";
import ReactDOM from "react-dom/client";
// 1. Import CSS FIRST so it loads globally before components
import "./index.css"; 
// 2. Import App SECOND
import App from "./App";
import { BackendProvider } from "./context/backendContext";
import Swal from "sweetalert2";

// Guard against a known runtime crash coming from third-party scripts
// (commonly Google reCAPTCHA failing to load due to network/adblock).
if (typeof window !== "undefined") {
  let lastCaptchaAlertAt = 0;

  const showCaptchaAlertOnce = () => {
    const now = Date.now();
    if (now - lastCaptchaAlertAt < 3000) return;
    lastCaptchaAlertAt = now;
    Swal.fire({
      icon: "error",
      title: "Captcha Timeout",
      text: "Captcha could not be loaded. Please check your internet or disable any ad-blocker and try again.",
      confirmButtonColor: "#D97706"
    });
  };

  const isCaptchaTimeout = (message, stackOrSource) => {
    if (String(message || "") !== "Timeout") return false;
    const haystack = String(stackOrSource || "");
    return /recaptcha|google\.com\/recaptcha|recaptcha\.net\/recaptcha/i.test(haystack);
  };

  window.addEventListener(
    "error",
    (event) => {
      const message = event?.error?.message || event?.message;
      const stackOrSource = event?.error?.stack || event?.filename || "";
      if (isCaptchaTimeout(message, stackOrSource)) {
        event.preventDefault();
        showCaptchaAlertOnce();
      }
    },
    true
  );

  window.addEventListener(
    "unhandledrejection",
    (event) => {
      const reason = event?.reason;
      const message = reason?.message || String(reason || "");
      const stackOrSource = reason?.stack || "";
      if (isCaptchaTimeout(message, stackOrSource)) {
        event.preventDefault();
        showCaptchaAlertOnce();
      }
    },
    true
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BackendProvider>
      <App />
    </BackendProvider>
  </React.StrictMode>
);