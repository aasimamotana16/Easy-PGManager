// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";

/* ================= PUBLIC PAGES ================= */
import Home from "./pages/Home";
import SignUp from "./pages/signup";
import Login from "./pages/loginPage";
import About from "./pages/about";
import ForgotPassword from "./pages/loginPage/forgotPassword";
import ResetPassword from "./pages/loginPage/resetPassword";
import Contact from "./pages/contact";
import Services from "./pages/services";
import FAQ from "./pages/faq";
import FindMyPg from "./pages/findMypg";
import DemoBook from "./pages/Home/demoBook";

/* ================= BOOKING ================= */
import BookingPage from "./pages/booking/bookNowPage";
import ConfirmBooking from "./pages/booking/confirmBook";
import UserAgreement from "./pages/booking/agreement";
import PayNow from "./pages/booking/payNow";

/* ================= PG DETAILS ================= */
import PGDetails from "./pages/detailsPage";

/* ================= CANCELLATION ================= */
import {
  CancelBooking,
  CancelConfirm,
  CancelForm,
  CancelSuccess,
} from "./pages/bookCancellation";

/* ================= POLICIES ================= */
import TermsConditions from "./pages/termsConditions";
import PrivacyPolicy from "./pages/privacyPolicy";

/* ================= USER DASHBOARD ================= */
import {
  DashboardLayout,
  DashboardHome,
  Profile,
  Payments,
  Agreements,
  CheckIns,
  Documents,
  Timeline,
  OwnerContact,
} from "./user/dashboard";

/* ================= OWNER DASHBOARD ================= */
import OwnerLayout from "./owner/dashboard/layout";
import OwnerDashboardHome from "./owner/dashboard/dashboardHome";
import PgManagement from "./owner/dashboard/pgManagment";
import AddProperty from "./owner/dashboard/pgManagment/addProperty";
import AddRooms from "./owner/dashboard/pgManagment/addRooms";
import RoomManagement from "./owner/dashboard/pgManagment/roomManagement";
import SubmitApproval from "./owner/dashboard/pgManagment/submitApproval";
import SetRoomPrice from "./owner/dashboard/pgManagment/roomPrice";
import TenantManagement from "./owner/dashboard/tenantManagement";
import BookingManagement from "./owner/dashboard/oBookings";
import OAgreements from "./owner/dashboard/oAgreements";
import OSupport from "./owner/dashboard/oSupport";
import Earnings from "./owner/dashboard/totalEarnings";
import MonthPendingPayments from "./owner/dashboard/monthPendingPayments";
import OwnerProfile from "./owner/dashboard/profileStatus";

/* ================= PROTECTED ROUTES ================= */

const UserProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("userToken") || localStorage.getItem("token");
  const hasValidToken = !!token && token !== "null" && token !== "undefined";
  return isLoggedIn && hasValidToken && role === "user"
    ? children
    : <Navigate to="/loginPage" replace />;
};

const OwnerProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("userToken") || localStorage.getItem("token");
  const hasValidToken = !!token && token !== "null" && token !== "undefined";
  return isLoggedIn && hasValidToken && role === "owner"
    ? children
    : <Navigate to="/loginPage" replace />;
};

const ProtectedBookingRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const token = localStorage.getItem("userToken") || localStorage.getItem("token");
  const hasValidToken = !!token && token !== "null" && token !== "undefined";
  return isLoggedIn && hasValidToken ? children : <Navigate to="/loginPage" replace />;
};

/* ================= APP ================= */

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>

          {/* ===== PUBLIC ===== */}
          <Route path="/" element={<Home />} />
          <Route path="/loginPage" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/demoBook" element={<DemoBook />} />
          <Route path="/findMypg" element={<FindMyPg />} />
          <Route path="/findMypg/:type" element={<FindMyPg />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* ===== PG DETAILS ===== */}
          <Route path="/pg/:id" element={<PGDetails />} />

          {/* ===== BOOKING ===== */}
          <Route path="/book/:id" element={
            <ProtectedBookingRoute>
              <BookingPage />
            </ProtectedBookingRoute>
          } />
          <Route path="/confirmBook/:id" element={
            <ProtectedBookingRoute>
              <ConfirmBooking />
            </ProtectedBookingRoute>
          } />
          <Route path="/agreement/:id" element={
            <ProtectedBookingRoute>
              <UserAgreement />
            </ProtectedBookingRoute>
          } />

          {/* ===== PAY NOW (email link) ===== */}
          <Route path="/paynow" element={<PayNow />} />
          <Route path="/paynow/:bookingId" element={<PayNow />} />

          {/* ===== CANCELLATION ===== */}
          <Route path="/cancel/:id" element={<ProtectedBookingRoute><CancelBooking /></ProtectedBookingRoute>} />
          <Route path="/cancel-form/:id" element={<ProtectedBookingRoute><CancelForm /></ProtectedBookingRoute>} />
          <Route path="/cancel-confirm/:id" element={<ProtectedBookingRoute><CancelConfirm /></ProtectedBookingRoute>} />
          <Route path="/cancel-success" element={<ProtectedBookingRoute><CancelSuccess /></ProtectedBookingRoute>} />

          {/* ===== POLICIES ===== */}
          <Route path="/termsConditions" element={<TermsConditions />} />
          <Route path="/privacyPolicy" element={<PrivacyPolicy />} />

          {/* ===== USER PROFILE (NO SIDEBAR) ===== */}
          <Route
            path="/user/userProfile"
            element={
              <UserProtectedRoute>
                <Profile />
              </UserProtectedRoute>
            }
          />

          {/* ===== USER DASHBOARD (WITH SIDEBAR) ===== */}
          <Route
            path="/user/dashboard"
            element={
              <UserProtectedRoute>
                <DashboardLayout />
              </UserProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboardHome" replace />} />
            <Route path="dashboardHome" element={<DashboardHome />} />
            <Route path="payments" element={<Payments />} />
            <Route path="agreements" element={<Agreements />} />
            <Route path="check-ins" element={<CheckIns />} />
            <Route path="documents" element={<Documents />} />
            <Route path="timeline" element={<Timeline />} />
            <Route path="owner-contact" element={<OwnerContact />} />
          </Route>

          {/* ===== OWNER PROFILE & EARNINGS (NO SIDEBAR) ===== */}
          <Route
            path="/owner/dashboard/profileStatus"
            element={
              <OwnerProtectedRoute>
                <OwnerProfile />
              </OwnerProtectedRoute>
            }
          />

          {/* ===== OWNER DASHBOARD (WITH SIDEBAR) ===== */}
          <Route
            path="/owner/dashboard"
            element={
              <OwnerProtectedRoute>
                <OwnerLayout />
              </OwnerProtectedRoute>
            }
          >
            <Route path="pg/:id" element={<PGDetails />} />
            <Route index element={<Navigate to="dashboardHome" replace />} />
            <Route path="dashboardHome" element={<OwnerDashboardHome />} />
            <Route path="pgManagment" element={<PgManagement />} />
            <Route path="pgManagment/addProperty" element={<AddProperty />} />
            <Route path="pgManagment/addRooms" element={<AddRooms />} />
            <Route path="pgManagment/roomManagement/:pgId?" element={<RoomManagement />} />
            <Route path="pgManagment/roomPrice" element={<SetRoomPrice />} />
            <Route path="pgManagment/submitApproval" element={<SubmitApproval />} />
            <Route path="tenantManagement" element={<TenantManagement />} />
            <Route path="oBookings" element={<BookingManagement />} />
            <Route path="oAgreements" element={<OAgreements />} />
            <Route path="oSupport" element={<OSupport />} />
            <Route path="totalEarnings" element={<Earnings />}/>
            <Route path="monthPendingPayments" element={<MonthPendingPayments />} />
          </Route>

          {/* ===== FALLBACK ===== */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
