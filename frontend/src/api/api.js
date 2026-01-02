import axios from "axios";

/**
 * Base axios instance
 * Backend running on port 5000
 */
const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * TOKEN INTERCEPTOR
 * This is the "magic" that grabs your login token from local storage
 * and sends it to the backend so the Dashboard doesn't give a 401 error.
 */
API.interceptors.request.use((req) => {
  const userToken = localStorage.getItem("token");
  if (userToken) {
    req.headers.Authorization = `Bearer ${userToken}`;
  }
  return req;
});

/* =========================
   AUTH & USER APIs 
   (Updated to match your new backend userRoutes)
========================= */
export const registerUser = (userData) => API.post("/users/register", userData);
export const loginUser = (userData) => API.post("/users/login", userData);
export const getUserProfile = () => API.get("/users/profile");
export const getDashboardStats = () => API.get("/users/dashboard-stats");

// Password Management
export const forgotPassword = (email) => API.post("/users/forgot-password", { email });
export const resetPassword = (token, password) => API.post(`/users/reset-password/${token}`, { password });

/* =========================
   CITY & HOME APIs
========================= */
export const getCities = () => API.get("/cities");
export const getFaqs = () => API.get("/faqs");
export const getHomeFeatures = () => API.get("/features");

/* =========================
   PG SEARCH & BOOKING APIs
========================= */
export const searchPGs = (params) => API.get("/pgs/search", { params });
export const getBookings = () => API.get("/bookings/my");
export const createBooking = (bookingData) => API.post("/bookings/create", bookingData);

/* =========================
   ROOMS & PAYMENTS APIs
========================= */
export const getAllRooms = () => API.get("/rooms/all");
export const getRoom = (roomId) => API.get(`/rooms/${roomId}`);
export const createRoom = (roomData) => API.post("/rooms/create", roomData);
export const payRent = (paymentData) => API.post("/payments/pay-rent", paymentData);
export const getAllPayments = () => API.get("/payments/all");

/* =========================
   AGREEMENT APIs
========================= */
export const getAgreement = (bookingId) => API.get(`/agreements/${bookingId}`);
export const createAgreement = (agreementData) => API.post("/agreements/create", agreementData);

export default API;