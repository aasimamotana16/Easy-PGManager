import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react"; // Added for visual confirmation
import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";
import CButton from "../../../components/cButton";

const CancelSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <section className="flex-grow flex items-center justify-center px-6 py-20">
        <div className="max-w-md w-full text-center">
          {/* Success Icon using primary brand color [cite: 2026-02-09] */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primarySoft rounded-full">
              <CheckCircle2 size={64} className="text-primary" />
            </div>
          </div>

          {/* Responsive Heading [cite: 2026-02-06] */}
          <h1 className="text-h2-sm lg:text-h2 font-bold text-textPrimary mb-4">
            Booking Cancelled
          </h1>

          {/* Descriptive text using secondary token [cite: 2026-02-09] */}
          <p className="text-textSecondary text-body-sm lg:text-body mb-10">
            Your booking has been successfully removed from our system. 
            We're sorry to see you go!
          </p>

          {/* Themed Primary Button [cite: 2026-02-09] */}
          <CButton
            onClick={() => navigate("/pages/Home")}
            className="w-full sm:w-auto px-10 bg-primary hover:bg-primaryDark text-textLight font-bold shadow-lg shadow-primarySoft transition-all"
          >
            Go to Dashboard
          </CButton>
          
          <p className="mt-6 text-xs text-textSecondary opacity-60 italic">
            Redirecting you to the home page...
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CancelSuccess;