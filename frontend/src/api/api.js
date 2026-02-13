import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((req) => {
  const userToken = localStorage.getItem("userToken");
  if (userToken) {
    req.headers.Authorization = `Bearer ${userToken}`;
  }
  return req;
});

/* =========================
    AUTH & USER APIs 
========================= */
export const registerUser = (userData) => API.post("/auth/signup", userData);
export const loginUser = (userData) => API.post("/auth/login", userData);
export const sendOtp = (data) => API.post("/auth/send-otp", data);
export const forgotPassword = (email) => API.post("/auth/forgot-password", { email });
export const verifyOtpAndResetPassword = (data) => API.post("/auth/verify-otp-reset", data);
export const resetPassword = (token, password) => API.post(`/auth/reset-password/${token}`, { password });
export const verifySecurityAction = (data) => API.post("/auth/verify-action", data);

// Profile & Dashboard
export const getUserProfile = () => API.get("/users/me"); 
// Profile sections stored in Profile model (personal / academic / emergency / payment)
export const getPersonalProfile = () => API.get("/users/profile/personal");
export const getUserDashboard = () => API.get("/users/dashboard-stats");
export const getDashboardStats = () => API.get("/users/dashboard-stats");
export const updateUserProfile = (userData) => API.put("/users/profile/update", userData);

// Targeted Section Data Fetches (Added for tab-based profile loading)
export const getAcademicProfile = () => API.get("/users/profile/academic");
export const getEmergencyProfile = () => API.get("/users/profile/emergency");
export const getPaymentProfile = () => API.get("/users/profile/payment");

// Profile Picture Management
export const updateProfilePicture = (formData) => 
  API.post("/users/profile/picture", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const removeProfilePicture = () => API.delete("/users/profile/picture");

// Document & Action Management
export const getMyDocuments = () => API.get("/users/documents");
export const uploadUserDocument = (formData) => 
  API.post("/users/upload-doc", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteUserDocument = (documentType) => API.post("/users/delete-doc", { documentType });
export const getMyAgreement = () => API.get("/users/agreement");
export const getMyTimeline = () => API.get("/users/timeline");
export const getMyCheckIns = () => API.get("/users/checkins");
export const createCheckIn = (data) => API.post("/users/checkin-action", data);
export const getOwnerContactData = () => API.get("/users/my-owner-contact");

/* =========================
    OWNER & PROPERTY APIs 
========================= */
export const getOwnerDashboardStats = () => API.get("/owner/dashboard-summary");
export const addPgProperty = (pgData) => API.post("/owner/add-pg", pgData);
export const getMyPgs = () => API.get('/owner/my-pgs');
export const updateRoomPrices = (roomPrices) => API.post('/owner/update-room-prices', { roomPrices });
export const deleteBooking = (id) => API.delete(`/owner/delete-booking/${id}`);
export const submitForApproval = (pgId) => API.post(`/owner/submit-for-approval/${pgId}`);

/* =========================
    ADMIN APIs 
========================= */
export const getPendingProperties = () => API.get("/admin/pending-properties");
export const approveProperty = (id) => API.post(`/admin/approve-property/${id}`);
export const rejectProperty = (id, reason) => API.post(`/admin/reject-property/${id}`, { rejectionReason: reason });

/* =========================
    CITY & HOME APIs
========================= */
export const getCities = () => API.get("/cities");
export const getFaqs = () => API.get("/faqs");
export const getHomeFeatures = () => API.get("/features");
export const getPublicReviews = () => API.get("/reviews/public");

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
