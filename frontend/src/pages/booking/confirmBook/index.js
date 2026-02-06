import React, { useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";
import CButton from "../../../components/cButton";
import { 
  CheckCircleIcon, 
  CalendarIcon, 
  UserGroupIcon, 
  CurrencyRupeeIcon,
  ArrowRightIcon 
} from "@heroicons/react/24/outline";

const ConfirmBooking = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const bookingData = location.state?.bookingData;

  useEffect(() => {
    if (!bookingData) {
      navigate(`/book/${id}`, { replace: true });
    }
  }, [bookingData, id, navigate]);

  useEffect(() => {
    if (!bookingData) return;

    const bookingId = "BK" + Date.now();
    const tenantId = "TN" + Date.now();
    const agreementId = "AG" + Date.now();

    const tenantProfile = {
      tenantId,
      bookingId,
      pgId: bookingData.pgId,
      members: bookingData.members,
      stayDetails: bookingData.stayDetails,
      totalRent: bookingData.totalRent,
      agreement: {
        agreementId,
        isSigned: true,
      },
    };

    localStorage.setItem("tenantProfile", JSON.stringify(tenantProfile));
  }, [bookingData]);

  if (!bookingData) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12 md:py-20">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <CheckCircleIcon className="h-20 w-20 text-green-500 animate-bounce-short" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600">
            Pack your bags! Your stay at <span className="font-semibold text-gray-800">{bookingData.pgName || "the PG"}</span> is all set.
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gray-900 px-6 py-4">
            <h2 className="text-white font-medium flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              Booking Summary
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Members */}
              <div className="flex items-start gap-3">
                <UserGroupIcon className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Guests</p>
                  <p className="text-gray-800 font-medium">{bookingData.members?.length || 1} Member(s)</p>
                </div>
              </div>

              {/* Rent */}
              <div className="flex items-start gap-3">
                <CurrencyRupeeIcon className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Rent</p>
                  <p className="text-gray-800 font-medium">₹{bookingData.totalRent} / month</p>
                </div>
              </div>

              {/* Stay Duration */}
              <div className="flex items-start gap-3 md:col-span-2 border-t pt-4 border-gray-50">
                <CalendarIcon className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Stay Period</p>
                  <p className="text-gray-800 font-medium">
                    {bookingData.stayDetails?.startDate} — {bookingData.stayDetails?.endDate || "Long term"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <CButton
            text="Go to Dashboard"
            fullWidth
            onClick={() => navigate("/services")}
            className="shadow-md"
          />
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate(`/agreement/${id}`)}
              className="flex-1 py-3 px-4 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              View Agreement
            </button>
            
            <button
              onClick={() => navigate(`/cancel/${id}`)}
              className="flex-1 py-3 px-4 border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition-colors text-sm font-medium"
            >
              Cancel Booking
            </button>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-gray-400 text-sm mt-10">
          A confirmation email has been sent to your registered email address. <br />
          Need help? <span className="text-primary cursor-pointer hover:underline">Contact Support</span>
        </p>
      </main>

      <Footer />

      {/* Internal CSS for the small animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-short {
          animation: bounce-short 2s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

export default ConfirmBooking;