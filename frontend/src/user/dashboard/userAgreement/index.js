import React, { useState, useEffect } from "react";
import CButton from "../../../components/cButton";
import jsPDF from "jspdf";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  FaFileContract, 
  FaDownload, 
  FaListUl, 
  FaRegCheckCircle,
  FaShieldAlt,
  FaTimes
} from "react-icons/fa";

const stampImg = "/pg_stamp.png";

const Agreements = () => {
  const [showRules, setShowRules] = useState(false);
  const [agreementInfo, setAgreementInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch live agreement data [cite: 2026-01-06]
  useEffect(() => {
    const fetchAgreement = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const res = await axios.get("http://localhost:5000/api/users/agreement", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.success) {
          setAgreementInfo(res.data.data);
        }
      } catch (err) {
        console.error("Agreement fetch error:", err);
        Swal.fire({
          icon: 'error',
          title: 'Connection Error',
          text: 'Unable to load agreement details at this time.',
          confirmButtonColor: '#000000'
        });
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
    // Validation: Check if backend data is actually ready for PDF generation
    const isDataValid = agreementInfo && agreementInfo.tenantName && agreementInfo.rentAmount;

    if (!isDataValid) {
      return Swal.fire({
        icon: 'info',
        title: 'Document Not Ready',
        text: 'Your agreement details are being verified. Please try again in a few minutes.',
        confirmButtonColor: '#000000'
      });
    }

    Swal.fire({
      title: 'Download Agreement?',
      text: "This will generate a digital copy of your signed contract.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#000000',
      confirmButtonText: 'Yes, Download'
    }).then((result) => {
      if (result.isConfirmed) generatePDF();
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Rental Agreement", 105, 15, null, null, "center");

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    let y = 30;
    doc.text(`Agreement ID: ${agreementInfo.agreementId || 'N/A'}`, 14, y); y += 7;
    doc.text(`Tenant Name: ${agreementInfo.tenantName || 'N/A'}`, 14, y); y += 7;
    doc.text(`PG Name: ${agreementInfo.pgName || 'N/A'}`, 14, y); y += 7;
    doc.text(`Room: ${agreementInfo.roomNo || 'N/A'}`, 14, y); y += 7;
    doc.text(`Period: ${agreementInfo.startDate || ''} - ${agreementInfo.endDate || ''}`, 14, y); y += 7;
    doc.text(`Monthly Rent: Rs ${agreementInfo.rentAmount || '0'}`, 14, y); y += 7;
    doc.text(`Security Deposit: Rs ${agreementInfo.securityDeposit || '0'}`, 14, y); y += 10;

    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(14, y, 196, y); y += 10;

    doc.setFont("helvetica", "bold");
    doc.text("Rules:", 14, y); y += 7;
    doc.setFont("helvetica", "normal");
    agreementRules.forEach((rule, index) => { doc.text(`${index + 1}. ${rule}`, 14, y); y += 6; });

    y += 10;
    doc.text("Tenant Signature: ____________________", 14, y);
    doc.text("Owner Signature / Stamp: ____________________", 130, y);

    const img = new Image();
    img.src = stampImg;
    img.onload = function () { 
      doc.addImage(img, "PNG", 150, y - 8, 40, 20); 
      doc.save(`Rental_Agreement_${agreementInfo.tenantName}.pdf`); 
      Swal.fire('Success', 'Agreement downloaded.', 'success');
    };
    img.onerror = function () { 
      doc.save(`Rental_Agreement_${agreementInfo.tenantName}.pdf`); 
      Swal.fire('Success', 'Agreement downloaded (Stamp image error).', 'info');
    };
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500"></div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div>
        <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-4xl font-bold text-gray-800"> Digital Agreement
          </h1>
        <p className="text-xs sm:text-lg md:text-3xl lg:text-xl text-gray-500">
            Verified Legal Document • E-Signed
          </p>
        </div>
        
        <div className={`self-start md:self-center px-4 py-1.5 rounded-full text-[10px] md:text-sm font-black uppercase tracking-tighter shadow-sm border ${
          agreementInfo?.status === 'Active' 
            ? 'bg-green-50 text-green-700 border-green-200' 
            : 'bg-orange-50 text-orange-700 border-orange-200'
        }`}>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-md bg-current animate-pulse"></span>
            {agreementInfo?.status || "Pending"}
          </span>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden max-w-5xl ">
        <div className="p-5 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 mb-8">
            <Info label="PG Name" value={agreementInfo?.pgName} />
            <Info label="Room Details" value={agreementInfo?.roomNo} />
            <Info label="Validity" 
                value={agreementInfo?.startDate && agreementInfo?.endDate 
                ? `${agreementInfo.startDate} – ${agreementInfo.endDate}` 
                : undefined} 
            />
            <Info label="Monthly Rent" value={agreementInfo?.rentAmount ? `₹${agreementInfo.rentAmount}` : undefined} />
            <Info label="Deposit" value={agreementInfo?.securityDeposit ? `₹${agreementInfo.securityDeposit}` : undefined} />
            <Info label="Agreement ID" value={agreementInfo?.agreementId} />
            <div className="sm:col-span-2 lg:col-span-1">
              <Info label="Tenant Name" value={agreementInfo?.tenantName} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
            <CButton 
              className=" text-xs md:text-sm font-bold flex items-center justify-center gap-2 w-full sm:w-auto  transition-all" 
              onClick={() => setShowRules(true)}
            >
              <FaListUl className="text-white" /> View House Rules
            </CButton>
            <CButton 
              className="  text-xs md:text-sm font-bold flex items-center justify-center gap-2 w-full sm:w-auto  shadow-md transition-all" 
              onClick={handleDownloadPDF}
            >
              <FaDownload /> Get PDF Copy
            </CButton>
          </div>
        </div>
        
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center gap-2">
          <FaShieldAlt className="text-green-600 text-[10px]" />
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">
            Encrypted & Tamper-Proof Digital Document
          </span>
        </div>
      </div>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-lg rounded-md shadow-2xl relative overflow-hidden">
            <div className="h-1.5 bg-orange-500 w-full" />
            <div className="p-6 md:p-8">
              <button 
                onClick={() => setShowRules(false)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
              <h2 className="text-lg md:text-xl font-black mb-5 text-black uppercase tracking-tight">
                PG Occupancy Rules
              </h2>
              <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                <ul className="space-y-3">
                  {agreementRules.map((rule, index) => (
                    <li key={index} className="flex gap-3 text-xs md:text-sm text-gray-600 border-b border-gray-50 pb-2 leading-relaxed">
                      <span className="text-orange-500 font-black">{index + 1}.</span> {rule}
                    </li>
                  ))}
                </ul>
              </div>
              <CButton 
                className="mt-6 bg-black text-white w-full py-3 text-xs md:text-sm font-bold uppercase tracking-widest"
                onClick={() => setShowRules(false)}
              >
                Acknowledge Rules
              </CButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for info displays
const Info = ({ label, value }) => {
  const isPending = !value || value.includes("undefined") || value === "₹undefined";
  
  return (
    <div className="bg-white rounded-md p-3.5 border border-gray-100 shadow-sm">
      <p className="text-[9px] md:text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">{label}</p>
      <p className={`text-xs md:text-sm font-black truncate ${isPending ? "text-gray-300 italic" : "text-black"}`}>
        {isPending ? "Pending Update" : value}
      </p>
    </div>
  );
};

export default Agreements;