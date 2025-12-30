import axios from "axios";

/**
 * Base Axios instance
 * Backend running on port 5000
 */
const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================
   AUTH APIs
========================= */

// Register
export const registerUser = (data) => {
  return API.post("/auth/register", data);
};

// Login
export const loginUser = (data) => {
  return API.post("/auth/login", data);
};

// Forgot Password
export const forgotPassword = (email) => {
  return API.post("/auth/forgot-password", { email });
};

// Reset Password
export const resetPassword = (token, password) => {
  return API.post(`/auth/reset-password/${token}`, { password });
};

/* =========================
   CITY APIs
========================= */

// Get all cities
export const getCities = () => {
  return API.get("/cities");
};

/* =========================
   FAQ APIs
========================= */

// Get FAQs
export const getFaqs = () => {
  return API.get("/faq");
};

/* =========================
   FEATURES / HOME APIs
========================= */

// Get home features
export const getHomeFeatures = () => {
  return API.get("/home/features");
};

/* =========================
   PG SEARCH APIs
========================= */

// Search PGs with filters
export const searchPGs = (params) => {
  return API.get("/pgs/search", { params });
};

export default API;