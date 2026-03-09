import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isAuthRoute =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/forgot-password') ||
      requestUrl.includes('/auth/reset-password');

    if (error.response?.status === 401 && !isAuthRoute) {
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, adminSecretKey) => api.post('/auth/login', {
    email: email?.trim().toLowerCase(),
    adminSecretKey,
    password: adminSecretKey
  }),
  forgotPassword: (email) => api.post('/auth/forgot-password', {
    email: email?.trim().toLowerCase()
  }),
  resetPassword: (token, newPassword, confirmPassword) => api.post('/auth/reset-password', {
    token,
    newPassword,
    confirmPassword
  }),
  register: (userData) => api.post('/auth/register', userData),
  verifyToken: (token) => api.get('/auth/verify', { headers: { Authorization: `Bearer ${token}` } })
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats')
};

export const usersAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`)
};

export const ownersAPI = {
  getOwners: (params) => api.get('/owners', { params }),
  getOwner: (id) => api.get(`/owners/${id}`),
  createOwner: (ownerData) => api.post('/owners', ownerData),
  updateOwner: (id, ownerData) => api.put(`/owners/${id}`, ownerData),
  deleteOwner: (id) => api.delete(`/owners/${id}`)
};

export const pgsAPI = {
  getPGs: (params) => api.get('/pgs', { params }),
  getPG: (id) => api.get(`/pgs/${id}`),
  createPG: (pgData) => api.post('/pgs', pgData),
  updatePG: (id, pgData) => api.put(`/pgs/${id}`, pgData),
  deletePG: (id) => api.delete(`/pgs/${id}`),
  approvePG: (id, action) => api.put(`/pgs/${id}/approval`, { action })
};

export const documentsAPI = {
  getDocuments: (params) => api.get('/documents', { params }),
  getDocument: (id) => api.get(`/documents/${id}`),
  updateVerification: (id, payload) => api.put(`/documents/${id}/verification`, payload),
  createDocument: (documentData) => api.post('/documents', documentData),
  updateDocument: (id, documentData) => api.put(`/documents/${id}`, documentData),
  deleteDocument: (id) => api.delete(`/documents/${id}`)
};

export const complaintsAPI = {
  getComplaints: (params) => api.get('/complaints', { params }),
  getComplaint: (id) => api.get(`/complaints/${id}`),
  createComplaint: (complaintData) => api.post('/complaints', complaintData),
  updateComplaint: (id, complaintData) => api.put(`/complaints/${id}`, complaintData),
  deleteComplaint: (id) => api.delete(`/complaints/${id}`)
};

export const requestsAPI = {
  getRequests: (params) => api.get('/requests', { params }),
  getRequest: (id) => api.get(`/requests/${id}`),
  createRequest: (requestData) => api.post('/requests', requestData),
  updateRequest: (id, requestData) => api.put(`/requests/${id}`, requestData),
  replyRequest: (id, payload) => api.post(`/requests/${id}/reply`, payload),
  deleteRequest: (id) => api.delete(`/requests/${id}`),
  getStats: () => api.get('/requests/stats/overview')
};

export const contactsAPI = {
  getContacts: (params) => api.get('/contacts', { params }),
  getContact: (id) => api.get(`/contacts/${id}`),
  replyContact: (id, payload) => api.post(`/contacts/${id}/reply`, payload),
  deleteContact: (id) => api.delete(`/contacts/${id}`),
  getStats: () => api.get('/contacts/stats/overview')
};

export const reviewsAPI = {
  getReviews: (params) => api.get('/reviews', { params }),
  getReviewsAdmin: (params) => api.get('/reviews/admin', { params }),
  updateReviewStatus: (id, status) => api.put(`/reviews/${id}/status`, { status })
};

const requestWithFallback = async (primaryRequest, fallbackRequest) => {
  try {
    return await primaryRequest();
  } catch (error) {
    const statusCode = error.response?.status;
    if (statusCode === 404 || statusCode === 405) {
      return fallbackRequest();
    }
    throw error;
  }
};

export const adminConfigAPI = {
  getAgreementSettings: () =>
    requestWithFallback(
      () => api.get('/admin/agreement-settings'),
      () => api.get('/easypg/admin/agreement-settings')
    ),
  updateAgreementSettings: (agreementSettingsData) =>
    requestWithFallback(
      () => api.put('/admin/agreement-settings', agreementSettingsData),
      () => api.put('/easypg/admin/agreement-settings', agreementSettingsData)
    ),
  getPricingRules: () =>
    requestWithFallback(
      () => api.get('/admin/pricing-rules'),
      () => api.get('/easypg/admin/pricing-rules')
    ),
  updatePricingRules: (pricingRulesData) =>
    requestWithFallback(
      () => api.put('/admin/pricing-rules', pricingRulesData),
      () => api.put('/easypg/admin/pricing-rules', pricingRulesData)
    )
};

// EasyPG Manager APIs
export const easyPGUsersAPI = {
  getUsers: (params) => api.get('/easypg/users', { params }),
  getUser: (id) => api.get(`/easypg/users/${id}`),
  getUsersByRole: (role, params) => api.get(`/easypg/users/role/${role}`, { params }),
  createUser: (userData) => api.post('/easypg/users', userData),
  updateUser: (id, userData) => api.put(`/easypg/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/easypg/users/${id}`),
  getUserStats: () => api.get('/easypg/users/stats/overview')
};

export const easyPGPGsAPI = {
  getPGs: (params) => api.get('/easypg/pgs', { params }),
  getPG: (id) => api.get(`/easypg/pgs/${id}`),
  getPGsByOwner: (ownerId, params) => api.get(`/easypg/pgs/owner/${ownerId}`, { params }),
  createPG: (pgData) => api.post('/easypg/pgs', pgData),
  updatePG: (id, pgData) => api.put(`/easypg/pgs/${id}`, pgData),
  deletePG: (id) => api.delete(`/easypg/pgs/${id}`),
  getPGStats: () => api.get('/easypg/pgs/stats/overview')
};

export const easyPGBookingsAPI = {
  getBookings: (params) => api.get('/easypg/bookings', { params }),
  getBooking: (id) => api.get(`/easypg/bookings/${id}`),
  getBookingsByOwner: (ownerId, params) => api.get(`/easypg/bookings/owner/${ownerId}`, { params }),
  createBooking: (bookingData) => api.post('/easypg/bookings', bookingData),
  updateBooking: (id, bookingData) => api.put(`/easypg/bookings/${id}`, bookingData),
  ownerApprovalAction: (id, approval, notes = '') => api.patch(`/easypg/bookings/${id}/owner-approval`, { approval, notes }),
  deleteBooking: (id) => api.delete(`/easypg/bookings/${id}`),
  getBookingStats: () => api.get('/easypg/bookings/stats/overview')
};

export const easyPGPaymentsAPI = {
  getPayments: (params) => api.get('/easypg/payments', { params }),
  getPayment: (id) => api.get(`/easypg/payments/${id}`),
  getPaymentsByUser: (userId, params) => api.get(`/easypg/payments/user/${userId}`, { params }),
  createPayment: (paymentData) => api.post('/easypg/payments', paymentData),
  updatePayment: (id, paymentData) => api.put(`/easypg/payments/${id}`, paymentData),
  deletePayment: (id) => api.delete(`/easypg/payments/${id}`),
  getPaymentStats: () => api.get('/easypg/payments/stats/overview')
};

export const easyPGAgreementsAPI = {
  getAgreements: (params) => api.get('/easypg/agreements', { params }),
  getAgreement: (id) => api.get(`/easypg/agreements/${id}`),
  getAgreementsByUser: (userId, params) => api.get(`/easypg/agreements/user/${userId}`, { params }),
  createAgreement: (agreementData) => api.post('/easypg/agreements', agreementData),
  updateAgreement: (id, agreementData) => api.put(`/easypg/agreements/${id}`, agreementData),
  deleteAgreement: (id) => api.delete(`/easypg/agreements/${id}`),
  getAgreementStats: () => api.get('/easypg/agreements/stats/overview')
};

export const easyPGSupportTicketsAPI = {
  getSupportTickets: (params) => api.get('/easypg/support-tickets', { params }),
  getSupportTicket: (id) => api.get(`/easypg/support-tickets/${id}`),
  getSupportTicketsByOwner: (ownerId, params) => api.get(`/easypg/support-tickets/owner/${ownerId}`, { params }),
  createSupportTicket: (ticketData) => api.post('/easypg/support-tickets', ticketData),
  updateSupportTicket: (id, ticketData) => api.put(`/easypg/support-tickets/${id}`, ticketData),
  deleteSupportTicket: (id) => api.delete(`/easypg/support-tickets/${id}`),
  getSupportTicketStats: () => api.get('/easypg/support-tickets/stats/overview')
};

export const easyPGTenantsAPI = {
  getTenants: (params) => api.get('/easypg/tenants', { params }),
  getTenant: (id) => api.get(`/easypg/tenants/${id}`),
  getTenantsByOwner: (ownerId, params) => api.get(`/easypg/tenants/owner/${ownerId}`, { params }),
  getTenantsByPG: (pgId, params) => api.get(`/easypg/tenants/pg/${pgId}`, { params }),
  createTenant: (tenantData) => api.post('/easypg/tenants', tenantData),
  updateTenant: (id, tenantData) => api.put(`/easypg/tenants/${id}`, tenantData),
  deleteTenant: (id) => api.delete(`/easypg/tenants/${id}`),
  getTenantStats: () => api.get('/easypg/tenants/stats/overview')
};

export const easyPGFAQsAPI = {
  getFAQs: (params) => api.get('/easypg/faqs', { params }),
  getFAQ: (id) => api.get(`/easypg/faqs/${id}`),
  getCategories: () => api.get('/easypg/faqs/meta/categories'),
  createFAQ: (faqData) => api.post('/easypg/faqs', faqData),
  updateFAQ: (id, faqData) => api.put(`/easypg/faqs/${id}`, faqData),
  deleteFAQ: (id) => api.delete(`/easypg/faqs/${id}`)
};

export const agreementsAPI = {
  getAgreements: (params) => api.get('/agreements', { params }),
  getAgreement: (id) => api.get(`/agreements/${id}`),
  createAgreement: (agreementData) => api.post('/agreements', agreementData),
  updateAgreement: (id, agreementData) => api.put(`/agreements/${id}`, agreementData),
  deleteAgreement: (id) => api.delete(`/agreements/${id}`)
};

export default api;
