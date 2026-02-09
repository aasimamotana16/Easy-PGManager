import React, { useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";
import CButton from "../../../components/cButton";
import { pgdetails } from "../../../config/staticData";
import { Printer, Download, ArrowLeft } from "lucide-react";

const UserAgreement = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const agreementRef = useRef();

  // Find property by ID - using non-strict equality as URL params are strings
  const property = pgdetails.find((item) => String(item.id) === String(id));

  // Accessing saved tenant data from localStorage [cite: 2026-02-09]
  const tenantData = JSON.parse(localStorage.getItem("tenantProfile")) || {};

  const handleDownload = () => {
    // Pro-tip: Simple print triggers "Save as PDF" in browsers
    window.print();
  };

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <p className="text-2xl font-bold text-primaryDark">Property not found!</p>
          <CButton text="Go Back" className="mt-4" onClick={() => navigate(-1)} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Header Section [cite: 2026-02-06] */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 print:hidden">
          <div className="text-center md:text-left">
            <h1 className="text-h2-sm lg:text-h2 font-bold text-textPrimary">Rental Agreement</h1>
            <p className="text-textSecondary text-body-sm">Document ID: {tenantData.agreement?.agreementId || "PENDING"}</p>
          </div>
          <div className="flex gap-3">
             <CButton 
              variant="outline" 
              className="border-border text-textSecondary"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={18} className="mr-2" /> Back
            </CButton>
            <CButton onClick={handleDownload}>
              <Printer size={18} className="mr-2" /> Save as PDF
            </CButton>
          </div>
        </div>

        {/* Agreement Document Card */}
        <div 
          ref={agreementRef}
          className="bg-white shadow-xl rounded-xl border border-border p-8 md:p-12 text-textPrimary print:shadow-none print:border-none print:p-0"
        >
          {/* Document Header */}
          <div className="border-b-2 border-primarySoft pb-6 mb-8 flex justify-between items-end">
            <div>
               <h2 className="text-2xl font-bold text-primary">LEASE AGREEMENT</h2>
               <p className="text-sm text-textSecondary">Date: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">{property.name}</p>
              <p className="text-xs text-textSecondary">{property.location}</p>
            </div>
          </div>

          {/* Document Content [cite: 2026-02-09] */}
          <div className="space-y-6 text-sm leading-relaxed text-textPrimary">
            <section>
              <h3 className="font-bold uppercase text-xs tracking-widest text-textSecondary mb-2">1. The Parties</h3>
              <p>
                This agreement is made between the Property Owner of <strong>{property.name}</strong> and 
                the Tenant, <strong>{tenantData.members?.[0]?.fullName || "Registered Tenant"}</strong>.
              </p>
            </section>

            <section>
              <h3 className="font-bold uppercase text-xs tracking-widest text-textSecondary mb-2">2. Term of Lease</h3>
              <p>
                The lease shall commence on <strong>{tenantData.stayDetails?.checkIn || "TBD"}</strong> and 
                continue until <strong>{tenantData.stayDetails?.checkOut || "Long Term"}</strong>.
              </p>
            </section>

            <section>
              <h3 className="font-bold uppercase text-xs tracking-widest text-textSecondary mb-2">3. Rent & Payments</h3>
              <p>
                The monthly rent agreed upon is <strong className="text-primary">₹{tenantData.totalRent || property.startingPrice}</strong>. 
                Payments are due by the 5th of every month.
              </p>
            </section>

            <section className="bg-primarySoft/30 p-4 rounded-lg border border-primarySoft">
               <h3 className="font-bold text-primaryDark mb-1">House Rules</h3>
               <ul className="list-disc ml-5 text-xs space-y-1">
                 <li>Maintain cleanliness in common areas.</li>
                 <li>No unauthorized guests after 10:00 PM.</li>
                 <li>Quiet hours are observed from 11:00 PM to 6:00 AM.</li>
               </ul>
            </section>

            {/* Signature Section */}
            <div className="mt-16 pt-8 border-t border-border grid grid-cols-2 gap-12">
               <div>
                 <div className="h-12 border-b border-textPrimary mb-2 italic text-primarySoft font-serif">Digital Signature</div>
                 <p className="text-xs font-bold uppercase">Tenant Signature</p>
               </div>
               <div>
                 <div className="h-12 border-b border-textPrimary mb-2"></div>
                 <p className="text-xs font-bold uppercase">Owner/Manager Signature</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      <Footer className="print:hidden" />

      {/* CSS for Print View */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .bg-background { background: white !important; }
          nav, footer { display: none !important; }
        }
      `}} />
    </div>
  );
};

export default UserAgreement;