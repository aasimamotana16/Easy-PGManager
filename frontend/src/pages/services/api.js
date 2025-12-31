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
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const forgotPassword = (email) => API.post("/auth/forgot-password", { email });
export const resetPassword = (token, password) => API.post(`/auth/reset-password/${token}`, { password });

/* =========================
   CITY APIs
========================= */
export const getCities = () => API.get("/cities");

/* =========================
   FAQ APIs
========================= */
export const getFaqs = () => API.get("/faqs"); // fixed plural to match your route

/* =========================
   FEATURES / HOME APIs
========================= */
export const getHomeFeatures = () => API.get("/features");

/* =========================
   PG SEARCH APIs
========================= */
export const searchPGs = (params) => API.get("/pgs/search", { params });

/* =========================
   USER FLOW / DASHBOARD APIs
========================= */

// Dashboard
export const getDashboard = () => API.get("/user/dashboard");

// Bookings
export const getBookings = () => API.get("/bookings/my");
export const createBooking = (bookingData) => API.post("/bookings/create", bookingData);

// Rooms
export const getAllRooms = () => API.get("/rooms/all");
export const getRoom = (roomId) => API.get(`/rooms/${roomId}`);
export const createRoom = (roomData) => API.post("/rooms/create", roomData);

// Payments
export const payRent = (paymentData) => API.post("/payments/pay-rent", paymentData);
export const getAllPayments = () => API.get("/payments/all");

// Agreements
export const getAgreement = (bookingId) => API.get(`/agreements/${bookingId}`);
export const createAgreement = (agreementData) => API.post("/agreements/create", agreementData);

export default API;