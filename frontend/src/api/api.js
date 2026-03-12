import axios from "axios";
import { API_BASE } from "../config/apiBaseUrl";

const AUTH_TIMEOUT_MS = 15000;

const API = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((req) => {
  let userToken = localStorage.getItem("userToken") || localStorage.getItem("token");
  if (userToken && userToken !== "null" && userToken !== "undefined") {
    // Handle legacy token formats like quoted strings or "Bearer <token>" in storage.
    userToken = userToken.trim().replace(/^['"]|['"]$/g, "");
    if (userToken.toLowerCase().startsWith("bearer ")) {
      userToken = userToken.slice(7).trim();
    }
    req.headers.Authorization = `Bearer ${userToken}`;
  }
  return req;
});

/* =========================
    AUTH & USER APIs 
========================= */
export const registerUser = (userData) => API.post("/auth/signup", userData, { timeout: AUTH_TIMEOUT_MS });
export const loginUser = (userData) => API.post("/auth/login", userData, { timeout: AUTH_TIMEOUT_MS });
export const sendOtp = (data) => API.post("/auth/send-otp", data, { timeout: AUTH_TIMEOUT_MS });
export const forgotPassword = (email) => API.post("/auth/forgot-password", { email }, { timeout: AUTH_TIMEOUT_MS });
export const verifyOtpAndResetPassword = (data) => API.post("/auth/verify-otp-reset", data, { timeout: AUTH_TIMEOUT_MS });
export const resetPassword = (token, password) => API.post(`/auth/reset-password/${token}`, { password }, { timeout: AUTH_TIMEOUT_MS });
export const verifySecurityAction = (data) => API.post("/auth/verify-action", data, { timeout: AUTH_TIMEOUT_MS });

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

// Account
export const deleteMyAccount = () => API.delete('/users/delete-account');

// Document & Action Management
export const getMyDocuments = () => API.get("/users/documents");
export const uploadUserDocument = (formData) => 
  API.post("/users/upload-doc", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteUserDocument = (documentType) => API.post("/users/delete-doc", { documentType });
export const downloadUserDocumentFile = (documentType) =>
  API.get(`/users/documents/file/${documentType}`, { responseType: "blob" });
export const getMyAgreement = () => API.get("/users/agreement");
export const getMyTimeline = () => API.get("/users/timeline");
export const getMyCheckIns = () => API.get("/users/checkins");
export const createCheckIn = (data) => API.post("/users/checkin-action", data);
export const getOwnerContactData = () => API.get("/users/my-owner-contact");
export const requestExtension = (payload) => API.put("/users/request-extension", payload);
export const requestMoveIn = () => API.put("/users/move-in");
export const requestMoveOut = (payload) => API.put("/users/move-out", payload || {});

/* =========================
    OWNER & PROPERTY APIs 
========================= */
export const getOwnerDashboardStats = () => API.get("/owner/dashboard-summary");
export const getOwnerProfile = () => API.get("/owner/profile");
export const addPgProperty = (pgData) => API.post("/owner/add-pg", pgData);
export const getMyPgs = () => API.get('/owner/my-pgs');
export const getOwnerPgById = (pgId) => API.get(`/owner/pg/${pgId}`);
export const getPgById = (pgId) => API.get(`/pg/${pgId}`);
export const uploadPropertyDocuments = (pgId, formData) =>
  API.post(`/owner/upload-property-docs/${pgId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const uploadAgreementTemplate = (pgId, formData) =>
  API.post(`/owner/upload-agreement-template/${pgId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateRoomPrices = (roomPrices, pgId) => API.post('/owner/update-room-prices', { roomPrices, pgId });
export const deleteBooking = (id) => API.delete(`/owner/delete-booking/${id}`);
export const submitForApproval = (pgId) => API.post(`/owner/submit-for-approval/${pgId}`);
export const addTenant = (tenantData) => API.post('/owner/add-tenant', tenantData);
export const getMyTenants = () => API.get('/owner/my-tenants');
export const updateTenant = (id, payload) => API.put(`/owner/update-tenant/${id}`, payload);
export const confirmArrival = (id) => API.put(`/owner/confirm-arrival/${id}`);
export const getMyBookings = () => API.get('/owner/my-bookings');
export const deleteTenant = (id) => API.delete(`/owner/tenant/${id}`);
export const approveExtension = (id) => API.put(`/owner/approve-extension/${id}`);
export const completeMoveOut = (id, payload) => API.put(`/owner/complete-move-out/${id}`, payload);
export const createOwnerSupportTicket = (payload) => API.post('/owner/create-support-ticket', payload);
export const getOwnerSupportTickets = () => API.get('/owner/my-support-tickets');
export const updateOwnerSupportTicket = (id, payload) => API.put(`/owner/update-support-ticket/${id}`, payload);
export const deleteOwnerAccount = () => API.delete('/owner/delete-account');

/* =========================
    ADMIN APIs 
========================= */
export const getPendingProperties = () => API.get("/admin/pending-properties");
export const approveProperty = (id) => API.post(`/admin/approve-property/${id}`);
export const rejectProperty = (id, reason) => API.post(`/admin/reject-property/${id}`, { rejectionReason: reason });
export const getAdminSupportTickets = () => API.get("/admin/support-tickets");
export const updateAdminSupportTicket = (id, status) => API.put(`/admin/support-ticket/${id}`, { status });

/* =========================
    CITY & HOME APIs
========================= */
export const getCities = () => API.get("/cities");
export const getFaqs = () => API.get("/faqs");
export const getHomeFeatures = () => API.get("/features");
// Public page data endpoints
export const getAboutPageData = () => API.get("/about");
export const getPrivacyPolicyData = () => API.get("/privacy-policy");
export const getServicesPageData = () => API.get("/services");
export const getPublicReviews = (limit) => API.get(`/reviews/public${limit ? `?limit=${limit}` : ''}`);
export const createReview = (data) => API.post('/reviews/create', data);
export const getReviewsByPg = (pgId) => API.get(`/reviews/pg/${pgId}`);
export const getPendingReviews = () => API.get('/reviews/pending');
export const approveReview = (id) => API.put(`/reviews/approve/${id}`);
export const rejectReview = (id) => API.delete(`/reviews/reject/${id}`);
// Terms & Conditions
export const getTerms = () => API.get('/terms');

/* =========================
    PG SEARCH & BOOKING APIs
========================= */
export const searchPGs = (params) => API.get("/pgs/search", { params });
export const getBookings = () => API.get("/bookings/my");
export const createBooking = (bookingData) => API.post("/bookings/create", bookingData);
export const getBookingAgreement = (bookingMongoId) => API.get(`/bookings/${bookingMongoId}/agreement`);

/* =========================
    ROOMS & PAYMENTS APIs
========================= */
export const getAllRooms = () => API.get("/rooms/all");
export const getRoom = (roomId) => API.get(`/rooms/${roomId}`);
export const createRoom = (roomData) => API.post("/rooms/create", roomData);
export const getRoomsByPg = (pgId) => API.get(`/rooms/pg/${pgId}`);
export const payRent = (paymentData) => API.post("/payments/pay-rent", paymentData);
export const getAllPayments = () => API.get("/payments/all");

/* =========================
    AGREEMENT APIs
========================= */
export const getAgreement = (bookingId) => API.get(`/agreements/${bookingId}`);
export const createAgreement = (agreementData) => API.post("/agreements/create", agreementData);

export default API;
