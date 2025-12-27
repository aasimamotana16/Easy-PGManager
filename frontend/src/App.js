// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import theme from "./theme";

// Public Pages
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
import BookingPage from "./pages/booking";
import ConfirmBooking from "./pages/booking/confirm";
import CancelBooking from "./pages/booking/cancelBooking";
import CancelForm from "./pages/booking/cancelForm";
import CancelConfirm from "./pages/booking/cancelConfirm";
import CancelSuccess from "./pages/booking/cancelSuccess";
import RentalAgreement from "./pages/booking/agreement";
import TermsConditions from "./pages/termsConditions";
import PrivacyPolicy from "./pages/privacyPolicy";

// User Dashboard Pages
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

// Protected Route Wrapper for dashboard
const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const hasBooking = user?.pgId;
  if (!user) return <Navigate to="/login" replace />;
  if (!hasBooking) return <Navigate to="/book" replace />;
  return children;
};

// Protected Route Wrapper for cancellation
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
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/about" element={<About />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<Services />} />
          <Route path="/faq" element={<FAQ />} />

          {/* PG Details Pages */}
          <Route path="/pg/:id" element={<PGOverview />} />
          <Route path="/pg/:id/details" element={<PGFullDetails />} />

          {/* Booking Flow */}
          <Route path="/book/:id" element={<BookingPage />} />
          <Route path="/confirm/:id" element={<ConfirmBooking />} />
          <Route path="/agreement/:id" element={<RentalAgreement />} />

          {/* Cancellation Flow (protected) */}
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

          {/* Policies */}
          <Route path="/termsConditions" element={<TermsConditions />} />
          <Route path="/privacyPolicy" element={<PrivacyPolicy />} />

          {/* Protected User Dashboard */}
          <Route
            path="/user/dashboard/*"
            element={
              <ProtectedRoute>
                <UserDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="profile" element={<Profile />} />
            <Route path="payments" element={<Payments />} />
            <Route path="agreements" element={<Agreements />} />
            <Route path="check-ins" element={<CheckIns />} />
            <Route path="documents" element={<Documents />} />
            <Route path="timeline" element={<Timeline />} />
            <Route path="rebook" element={<Rebook />} />
            <Route path="owner-contact" element={<OwnerContact />} />
            <Route path="support" element={<Support />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
