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
 * Automatically attaches the JWT token to every request
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
    (Updated to match authRoutes.js)
========================= */
// Points to router.post('/signup') in authRoutes.js
export const registerUser = (userData) => API.post("/auth/signup", userData);

// Points to router.post('/login') in authRoutes.js
export const loginUser = (userData) => API.post("/auth/login", userData);

// Password Management (Updated paths to /auth)
export const forgotPassword = (email) => API.post("/auth/forgot-password", { email });
export const resetPassword = (token, password) => API.post(`/auth/reset-password/${token}`, { password });

// Profile & Stats (Keep /users if they are in userRoutes.js)
export const getUserProfile = () => API.get("/users/profile");
export const getDashboardStats = () => API.get("/users/dashboard-stats");


/* =========================
    OWNER & PROPERTY APIs 
========================= */
export const getOwnerDashboardStats = () => API.get("/owner/dashboard-summary");
export const addPgProperty = (pgData) => API.post("/owner/add-pg", pgData);


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

// src/utils/api.js (or wherever your axios instance is)

// 1. Get all PGs for the owner (to display existing prices)
export const getMyPgs = () => API.get('/owner/my-pgs');

// 2. Update room prices for the latest PG
export const updateRoomPrices = (roomPrices) => API.post('/owner/update-room-prices', { roomPrices });

// 3. Delete a booking (the one you asked about earlier)
export const deleteBooking = (id) => API.delete(`/owner/delete-booking/${id}`);

export default API;