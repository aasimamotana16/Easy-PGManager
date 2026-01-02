// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import theme from "./theme";

/* ================= PUBLIC PAGES ================= */
import Home from "./pages/Home";
import SignUp from "./pages/signup";
import Login from "./pages/Login";
import About from "./pages/about";
import ForgotPassword from "./pages/Login/forgotPassword";
import ResetPassword from "./pages/Login/resetPassword";
import Contact from "./pages/contact";
import Services from "./pages/services";
import FAQ from "./pages/faq";
import { PGOverview, PGFullDetails } from "./pages/detailsPage";

/* ================= BOOKING ================= */
import BookingPage from "./pages/booking";
import ConfirmBooking from "./pages/booking/confirm";
import CancelBooking from "./pages/booking/cancelBooking";
import CancelForm from "./pages/booking/cancelForm";
import CancelConfirm from "./pages/booking/cancelConfirm";
import CancelSuccess from "./pages/booking/cancelSuccess";
import RentalAgreement from "./pages/booking/agreement";

/* ================= POLICIES ================= */
import TermsConditions from "./pages/termsConditions";
import PrivacyPolicy from "./pages/privacyPolicy";

/* ================= USER DASHBOARD ================= */
import {
  UserDashboardLayout,
  DashboardHome,
  Profile,
  Payments,
  Agreements,
  CheckIns,
  Documents,
  Timeline,
  Rebook,
  OwnerContact,
  Support,
} from "./user/dashboard";

/* ================= OWNER DASHBOARD ================= */
import OwnerDashboardLayout from "./owner/dashboard/layout";
import OwnerDashboardHome from "./owner/dashboard/dashboardHome";
import PgManagement from "./owner/dashboard/pgManagment";
import AddProperty from "./owner/dashboard/pgManagment/addProperty";
import RoomManagement from "./owner/dashboard/pgManagment/roomManagement";
import AddRooms from "./owner/dashboard/pgManagment/addRooms";
import TenantManagement from "./owner/dashboard/tenantManagement";
import OAgreements from "./owner/dashboard/oAgreements";
import OSupport from "./owner/dashboard/oSupport";
import Earnings from "./owner/dashboard/totalEarnings";
import OwnerProfile from "./owner/dashboard/profileStatus";
import SubmitApproval from "./owner/dashboard/pgManagment/submitApproval";
import SetRoomPrice from "./owner/dashboard/pgManagment/roomPrice";
import ProfileCard from "./owner/dashboard/profileStatus/profileCard";
import StatsCard from "./owner/dashboard/profileStatus/statCard";
import ExtraInfoCard from "./owner/dashboard/profileStatus/extraCardinfo";

/* ================= PROTECTED ROUTES ================= */

// USER protected
const UserProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// OWNER protected
const OwnerProtectedRoute = ({ children }) => {
  const owner = JSON.parse(localStorage.getItem("owner"));
  if (!owner) return <Navigate to="/login" replace />;
  return children;
};

// Booking flow protected
const ProtectedBookingRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>

          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<Home />} />
          <Route path="/findMypg" element={<FindMyPg />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/about" element={<About />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<Services />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/search-results" element={< SearchResults />} />

          {/* ================= PG DETAILS ================= */}
          <Route path="/pg/:id" element={<PGOverview />} />
          <Route path="/pg/:id/details" element={<PGFullDetails />} />

          {/* ================= BOOKING FLOW ================= */}
          <Route path="/book/:id" element={<BookingPage />} />
          <Route path="/confirm/:id" element={<ConfirmBooking />} />
          <Route path="/agreement/:id" element={<RentalAgreement />} />

          {/* ================= CANCELLATION ================= */}
          <Route
            path="/cancel/:id"
            element={
              <ProtectedBookingRoute>
                <CancelBooking />
              </ProtectedBookingRoute>
            }
          />
          <Route
            path="/cancel-form/:id"
            element={
              <ProtectedBookingRoute>
                <CancelForm />
              </ProtectedBookingRoute>
            }
          />
          <Route
            path="/cancel-confirm/:id"
            element={
              <ProtectedBookingRoute>
                <CancelConfirm />
              </ProtectedBookingRoute>
            }
          />
          <Route
            path="/cancel-success"
            element={
              <ProtectedBookingRoute>
                <CancelSuccess />
              </ProtectedBookingRoute>
            }
          />

          {/* ================= POLICIES ================= */}
          <Route path="/termsConditions" element={<TermsConditions />} />
          <Route path="/privacyPolicy" element={<PrivacyPolicy />} />

          {/* ================= USER DASHBOARD ================= */}
          <Route
            path="/user/dashboard/*"
            element={
              <UserProtectedRoute>
                <UserDashboardLayout />
              </UserProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="userProfile" element={<Profile />} />
            <Route path="payments" element={<Payments />} />
            <Route path="agreements" element={<Agreements />} />
            <Route path="check-ins" element={<CheckIns />} />
            <Route path="documents" element={<Documents />} />
            <Route path="timeline" element={<Timeline />} />
            <Route path="rebook" element={<Rebook />} />
            <Route path="owner-contact" element={<OwnerContact />} />
            <Route path="support" element={<Support />} />
          </Route>

          {/* ================= OWNER DASHBOARD ================= */}
          <Route
            path="/owner/dashboard/*"
            element={
              <OwnerProtectedRoute>
                <OwnerDashboardLayout />
              </OwnerProtectedRoute>
            }
          >
            <Route index element={<OwnerDashboardHome />} />
            <Route path="pgManagment" element={<PgManagement />} />
            <Route path="pgManagment/addProperty" element={<AddProperty />} />
            <Route path="pgManagment/addRooms" element={<AddRooms />} />
            <Route path="pgs/rooms" element={<RoomManagement />} />
            <Route path="tenant-management" element={<TenantManagement />} />
            <Route path="agreements" element={<OAgreements />} />
            <Route path="support" element={<OSupport />} />
            <Route path="earnings" element={<Earnings />} />
            <Route path="profileStatus" element={<OwnerProfile />} />
            <Route path="pgManagment/submitApproval" element={<SubmitApproval />} />
            <Route path="pgManagment/roomManagement" element={<RoomManagement />} />
            <Route path="pgManagment/roomPrice" element={<SetRoomPrice />} />
            <Route path="profileStatus/profileCard" element={<ProfileCard />} />
            <Route path="profileStatus/statCard" element={<StatsCard />} />
            <Route path="profileStatus/extraCardinfo" element={<ExtraInfoCard />} />
          </Route>

          {/* ================= FALLBACK ================= */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
