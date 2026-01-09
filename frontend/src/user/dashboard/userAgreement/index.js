import React, { useState } from "react";
import CButton from "../../../components/cButton";
import jsPDF from "jspdf";

// PG stamp image (optional) - put your stamp image in public folder or import
const stampImg = "/pg_stamp.png"; // Example path

const Agreements = () => {
  const [showRules, setShowRules] = useState(false);

  // Tenant & PG Info
  const agreementInfo = {
    id: "AGR-PG-2031",
    tenant: "Asima Motana",
    pgName: "Shree Residency PG",
    room: "A-203 / Bed 1",
    period: "01 Jan 2025 – 31 Dec 2025",
   rent: "Rs 9000 / month",       // safe text
  deposit: "Rs 18000", 
  };

  // Rules including realistic clauses
  const agreementRules = [
    "No smoking inside the PG.",
    "Guests allowed only between 8 AM - 10 PM.",
    "Maintain cleanliness in the room and common areas.",
    "No pets allowed.",
    "Any damage to property will be deducted from security deposit.",
    "Rent must be paid before the 5th of every month.",
    "Early termination by tenant requires 1 month's notice.",
    "Security deposit may be adjusted for unpaid rent or damages.",
    "Any breach of rules may incur fines or penalties."
  ];

  // PDF download handler
  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Rental Agreement", 105, 15, null, null, "center");

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    // Agreement Info
    let y = 30;
    doc.text(`Agreement ID: ${agreementInfo.id}`, 14, y);
    y += 7;
    doc.text(`Tenant Name: ${agreementInfo.tenant}`, 14, y);
    y += 7;
    doc.text(`PG Name: ${agreementInfo.pgName}`, 14, y);
    y += 7;
    doc.text(`Room / Bed: ${agreementInfo.room}`, 14, y);
    y += 7;
    doc.text(`Agreement Period: ${agreementInfo.period}`, 14, y);
    y += 7;
    doc.text(`Monthly Rent: ${agreementInfo.rent}`, 14, y);
    y += 7;
    doc.text(`Security Deposit: ${agreementInfo.deposit}`, 14, y);

    y += 10;
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(14, y, 196, y); // horizontal line
    y += 10;

    // Rules
    doc.setFont("helvetica", "bold");
    doc.text("Rules:", 14, y);
    y += 7;
    doc.setFont("helvetica", "normal");

    agreementRules.forEach((rule, index) => {
      doc.text(`${index + 1}. ${rule}`, 14, y);
      y += 6;
    });

    y += 10;

    // Signatures
    doc.text("Tenant Signature: ____________________", 14, y);
    doc.text("PG Owner Signature / Stamp: ____________________", 130, y);

    // Add stamp image if available
    const img = new Image();
    img.src = stampImg;
    img.onload = function () {
      doc.addImage(img, "PNG", 150, y - 8, 40, 20); // x, y, width, height
      doc.save(`Rental_Agreement_${agreementInfo.tenant}.pdf`);
    };
    img.onerror = function () {
      doc.save(`Rental_Agreement_${agreementInfo.tenant}.pdf`);
    };
  };

  return (
    <div className="space-y-8">

      {/* GRADIENT WRAPPER */}
      <div className="bg-dashboard-gradient rounded-3xl p-6 space-y-6">

        {/* AGREEMENT CARD */}
        <div className="bg-white rounded-2xl shadow p-6 space-y-5">

          {/* HEADER */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">
              Rental Agreement
            </h2>

            <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
              Active
            </span>
          </div>

          {/* AGREEMENT INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Info label="PG Name" value={agreementInfo.pgName} />
            <Info label="Room / Bed" value={agreementInfo.room} />
            <Info label="Agreement Period" value={agreementInfo.period} />
            <Info label="Rent Amount" value={agreementInfo.rent} />
            <Info label="Security Deposit" value={agreementInfo.deposit} />
            <Info label="Agreement ID" value={agreementInfo.id} />
            <Info label="Tenant Name" value={agreementInfo.tenant} />
          </div>

          {/* ACTIONS */}
          <div className="flex flex-wrap gap-3 pt-2">
            <CButton
              className="bg-primary text-white px-5 py-2 rounded-xl text-sm"
              onClick={() => setShowRules(true)}
            >
              View Rules
            </CButton>

            <CButton
              className="border px-5 py-2 rounded-xl text-sm"
              onClick={handleDownloadPDF}
            >
              Download PDF
            </CButton>
          </div>
        </div>
      </div>

      {/* RULES MODAL */}
      {showRules && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">

            {/* Close Button */}
            <button
              onClick={() => setShowRules(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl"
            >
              ×
            </button>

            <h2 className="text-xl font-semibold mb-4 text-primary">
              Agreement Rules
            </h2>

            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
              {agreementRules.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>

            <CButton
              onClick={() => setShowRules(false)}
              className="w-full mt-6 bg-primary text-white py-2 rounded-xl"
            >
              Close
            </CButton>
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
