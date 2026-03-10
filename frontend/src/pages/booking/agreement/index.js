import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/navbar";
import Footer from "../../../components/footer";
import CButton from "../../../components/cButton";
import { ArrowLeft, Printer, ExternalLink } from "lucide-react";
import { getBookingAgreement } from "../../../api/api";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const BookingAgreement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAgreement = async () => {
      try {
        const res = await getBookingAgreement(id);
        if (res.data?.success) {
          setAgreement(res.data.data);
        }
      } catch (error) {
        setAgreement(null);
      } finally {
        setLoading(false);
      }
    };

    loadAgreement();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16">Loading agreement...</div>
        <Footer />
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <p className="text-xl font-semibold text-textPrimary">Agreement not found for this booking.</p>
          <CButton text="Back" className="mt-4" onClick={() => navigate(-1)} />
        </div>
        <Footer />
      </div>
    );
  }

  const checkOutLabel = agreement.isLongTerm ? "Long Term" : agreement.checkOutDate || agreement.endDate || "N/A";

  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 print:hidden">
          <div className="text-center md:text-left">
            <h1 className="text-h2-sm lg:text-h2 font-bold text-textPrimary">Rental Agreement</h1>
            <p className="text-textSecondary text-body-sm">Document ID: {agreement.agreementId || "N/A"}</p>
          </div>
          <div className="flex gap-3">
            <CButton variant="outline" className="border-border text-textSecondary" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} className="mr-2" /> Back
            </CButton>
            <CButton onClick={() => window.print()}>
              <Printer size={18} className="mr-2" /> Save as PDF
            </CButton>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-md border border-border p-8 md:p-12 text-textPrimary print:shadow-none print:border-none print:p-0">
          <div className="border-b-2 border-primarySoft pb-6 mb-8 flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold text-primary">LEASE AGREEMENT</h2>
              <p className="text-sm text-textSecondary">Date: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">{agreement.pgName || "N/A"}</p>
              <p className="text-xs text-textSecondary">Booking ID: {agreement.bookingId || "N/A"}</p>
            </div>
          </div>

          <div className="space-y-6 text-sm leading-relaxed text-textPrimary">
            <section>
              <h3 className="font-bold uppercase text-xs tracking-widest text-textSecondary mb-2">1. Parties</h3>
              <p>
                This agreement is between the property owner and tenant <strong>{agreement.tenantName || "Tenant"}</strong>.
              </p>
            </section>

            <section>
              <h3 className="font-bold uppercase text-xs tracking-widest text-textSecondary mb-2">2. Stay Period</h3>
              <p>
                Check-in date: <strong>{agreement.checkInDate || agreement.startDate || "N/A"}</strong>
              </p>
              <p>
                Check-out date: <strong>{checkOutLabel}</strong>
              </p>
            </section>

            <section>
              <h3 className="font-bold uppercase text-xs tracking-widest text-textSecondary mb-2">3. Rent Details</h3>
              <p>Monthly Rent: <strong>Rs {agreement.rentAmount || 0}</strong></p>
              <p>Security Deposit: <strong>Rs {agreement.securityDeposit || 0}</strong></p>
            </section>

            {agreement.fileUrl && (
              <section className="bg-primarySoft/20 p-4 rounded-md border border-primarySoft">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold">Owner uploaded signed agreement PDF is available.</p>
                  <a
                    href={`${API_BASE_URL}${agreement.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-primary font-semibold"
                  >
                    Open PDF <ExternalLink size={16} />
                  </a>
                </div>
              </section>
            )}

            <div className="mt-16 pt-8 border-t border-border grid grid-cols-2 gap-12">
              <div>
                <div className="h-12 border-b border-textPrimary mb-2"></div>
                <p className="text-xs font-bold uppercase">Tenant Signature</p>
              </div>
              <div>
                <div className="h-12 border-b border-textPrimary mb-2"></div>
                <p className="text-xs font-bold uppercase">Owner Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer className="print:hidden" />
    </div>
  );
};

export default BookingAgreement;
