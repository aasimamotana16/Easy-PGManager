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

  if (!bookingData) return null;

  const checkInLabel = bookingData.stayDetails?.checkIn || bookingData.checkInDate || "N/A";
  const checkOutLabel = bookingData.stayDetails?.checkOut || bookingData.checkOutDate || "Long Term";
  const membersCount = bookingData.members?.length || bookingData.seatsBooked || 1;
  const rentLabel = bookingData.totalRent || bookingData.rentAmount || 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12 md:py-20">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <CheckCircleIcon className="h-20 w-20 text-primary animate-bounce-short" />
          </div>
          <h1 className="text-h2-sm md:text-h2 font-bold text-textPrimary mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-textSecondary text-body-sm lg:text-body">
            Pack your bags! Your stay at{" "}
            <span className="font-semibold text-textPrimary">{bookingData.pgName || "the PG"}</span> is all set.
          </p>
        </div>

        <div className="bg-background rounded-2xl shadow-sm border border-border overflow-hidden mb-8">
          <div className="bg-primary px-6 py-4">
            <h2 className="text-textLight font-medium flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-primarySoft" />
              Booking Summary
            </h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <UserGroupIcon className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-textSecondary uppercase tracking-wider font-semibold">Guests</p>
                  <p className="text-textPrimary font-medium">{membersCount} Member(s)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CurrencyRupeeIcon className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-textSecondary uppercase tracking-wider font-semibold">Total Rent</p>
                  <p className="text-textPrimary font-medium">Rs {rentLabel} / month</p>
                </div>
              </div>

              <div className="flex items-start gap-3 md:col-span-2 border-t pt-4 border-border">
                <CalendarIcon className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-textSecondary uppercase tracking-wider font-semibold">Stay Period</p>
                  <p className="text-textPrimary font-medium">
                    {checkInLabel} - {checkOutLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <CButton
            text="Go to Home"
            className="w-full bg-primary hover:bg-primaryDark text-textLight shadow-md py-3"
            onClick={() => navigate("/Home")}
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate(`/agreement/${bookingData._id}`)}
              className="flex-1 py-3 px-4 border border-border rounded-md text-textSecondary hover:bg-primarySoft transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              View Agreement
            </button>

            <button
              onClick={() => navigate(`/cancel/${id}`)}
              className="flex-1 py-3 px-4 border border-primarySoft rounded-md text-primaryDark hover:bg-primarySoft transition-colors text-sm font-medium"
            >
              Cancel Booking
            </button>
          </div>
        </div>
      </main>

      <Footer />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-short {
          animation: bounce-short 2s ease-in-out infinite;
        }
      `,
        }}
      />
    </div>
  );
};

export default ConfirmBooking;
