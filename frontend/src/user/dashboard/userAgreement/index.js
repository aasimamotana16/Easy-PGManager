import React, { useState, useEffect } from "react"; // Added useEffect
import CButton from "../../../components/cButton";
import jsPDF from "jspdf";
import axios from "axios"; // Ensure axios is installed

const stampImg = "/pg_stamp.png";

const Agreements = () => {
  const [showRules, setShowRules] = useState(false);
  const [agreementInfo, setAgreementInfo] = useState(null); // Changed to null initially
  const [loading, setLoading] = useState(true);

  // 1. Fetch live data from your new API [cite: 2026-01-06]
  useEffect(() => {
    const fetchAgreement = async () => {
      try {
        const token = localStorage.getItem("token"); // Assumes token is in localStorage
        const res = await axios.get("http://localhost:5000/api/users/agreement", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.success) {
          setAgreementInfo(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch live agreement data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgreement();
  }, []);

  const agreementRules = [
    "No smoking inside the PG.",
    "Guests allowed only between 8 AM - 10 PM.",
    "Maintain cleanliness in the room and common areas.",
    "No pets allowed.",
    "Any damage to property will be deducted from security deposit.",
    "Rent must be paid before the 5th of every month.",
    "Early termination by tenant requires 1 month's notice.",
    "Security deposit may be adjusted for unpaid rent or damages.",
    "Any breach of rules may incur fines or penalties.",
  ];

  const handleDownloadPDF = () => {
    if (!agreementInfo) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Rental Agreement", 105, 15, null, null, "center");

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    let y = 30;
    // Using camelCase names from your backend [cite: 2026-01-01]
    doc.text(`Agreement ID: ${agreementInfo.agreementId}`, 14, y); y += 7;
    doc.text(`Tenant Name: ${agreementInfo.tenantName}`, 14, y); y += 7;
    doc.text(`PG Name: ${agreementInfo.pgName}`, 14, y); y += 7;
    doc.text(`Room / Bed: ${agreementInfo.roomNo}`, 14, y); y += 7;
    doc.text(`Agreement Period: ${agreementInfo.startDate} - ${agreementInfo.endDate}`, 14, y); y += 7;
    doc.text(`Monthly Rent: Rs ${agreementInfo.rentAmount}`, 14, y); y += 7;
    doc.text(`Security Deposit: Rs ${agreementInfo.securityDeposit}`, 14, y); y += 10;

    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(14, y, 196, y); y += 10;

    doc.setFont("helvetica", "bold");
    doc.text("Rules:", 14, y); y += 7;
    doc.setFont("helvetica", "normal");
    agreementRules.forEach((rule, index) => { doc.text(`${index + 1}. ${rule}`, 14, y); y += 6; });

    y += 10;
    doc.text("Tenant Signature: ____________________", 14, y);
    doc.text("PG Owner Signature / Stamp: ____________________", 130, y);

    const img = new Image();
    img.src = stampImg;
    img.onload = function () { 
      doc.addImage(img, "PNG", 150, y - 8, 40, 20); 
      doc.save(`Rental_Agreement_${agreementInfo.tenantName}.pdf`); 
    };
    img.onerror = function () { 
      doc.save(`Rental_Agreement_${agreementInfo.tenantName}.pdf`); 
    };
  };

  if (loading) return <div className="p-10 text-center text-primary">Loading live agreement...</div>;
  if (!agreementInfo) return <div className="p-10 text-center text-red-500">No active agreement found in database.</div>;

  return (
    <div className="space-y-8">
      <div className="bg-dashboard-gradient rounded-3xl p-6 space-y-6">
        <h2 className="text-2xl font-semibold text-primary mt-4">Rental Agreement</h2>

        <div className="bg-white rounded-2xl shadow p-6 space-y-5">
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${agreementInfo.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {agreementInfo.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Displaying live data from Postman */}
            <Info label="PG Name" value={agreementInfo.pgName} />
            <Info label="Room / Bed" value={agreementInfo.roomNo} />
            <Info label="Agreement Period" value={`${agreementInfo.startDate} – ${agreementInfo.endDate}`} />
            <Info label="Rent Amount" value={`Rs ${agreementInfo.rentAmount} / month`} />
            <Info label="Security Deposit" value={`Rs ${agreementInfo.securityDeposit}`} />
            <Info label="Agreement ID" value={agreementInfo.agreementId} />
            <Info label="Tenant Name" value={agreementInfo.tenantName} />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <CButton className="bg-primary px-5 py-2 text-sm" onClick={() => setShowRules(true)}>
              View Rules
            </CButton>
            <CButton className="border px-5 py-2 text-sm" onClick={handleDownloadPDF}>
              Download Agreement
            </CButton>
          </div>
        </div>
      </div>

      {/* RULES MODAL stays the same */}
      {showRules && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative">
            <button onClick={() => setShowRules(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl">×</button>
            <h2 className="text-xl font-semibold mb-4 text-primary text-center">Agreement Rules</h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 px-2">
              {agreementRules.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-gray-50 rounded-xl p-4">
    <p className="text-gray-400 text-xs mb-1">{label}</p>
    <p className="text-sm font-medium">{value}</p>
  </div>
);

export default Agreements;