import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import Users from './pages/Users';
import Owners from './pages/Owners';
import PGs from './pages/PGs';
import Bookings from './pages/Bookings';
import Payments from './pages/Payments';
import Documents from './pages/Documents';
import Complaints from './pages/Complaints';
import Requests from './pages/Requests';
import Contacts from './pages/Contacts';
import Agreements from './pages/Agreements';
import EasyPGDashboard from './pages/EasyPGDashboard';
import Reviews from './pages/Reviews';
import AgreementSettings from './pages/AgreementSettings';
import PricingRules from './pages/PricingRules';
import FAQs from './pages/FAQs';
import PageLoader from './components/PageLoader';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <PageLoader fullScreen message="Loading..." />;
  }
  
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<EasyPGDashboard />} />
                    <Route path="/easypg-dashboard" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/owners" element={<Owners />} />
                    <Route path="/pgs" element={<PGs />} />
                    <Route path="/bookings" element={<Bookings />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/complaints" element={<Complaints />} />
                    <Route path="/requests" element={<Requests />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/agreements" element={<Agreements />} />
                    <Route path="/reviews" element={<Reviews />} />
                    <Route path="/faqs" element={<FAQs />} />
                    <Route path="/agreement-settings" element={<AgreementSettings />} />
                    <Route path="/pricing-rules" element={<PricingRules />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
