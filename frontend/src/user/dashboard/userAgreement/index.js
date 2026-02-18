import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom"; // Required for Portal
import CButton from "../../../components/cButton";
import jsPDF from "jspdf";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  FaDownload, 
  FaListUl, 
  FaShieldAlt, 
  FaTimes 
} from "react-icons/fa";

const stampImg = "/pg_stamp.png";

const Agreements = () => {
  const [showRules, setShowRules] = useState(false);
  const [agreementInfo, setAgreementInfo] = useState(null);
  const [loading, setLoading] = useState(true);

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
          text: 'Unable to load agreement details.',
          confirmButtonColor: '#D97706'
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
    const isDataValid = agreementInfo && agreementInfo.tenantName && agreementInfo.rentAmount;
    if (!isDataValid) {
      return Swal.fire({
        icon: 'info',
        title: 'Document Not Ready',
        text: 'Agreement details are being verified.',
        confirmButtonColor: '#D97706'
      });
    }
    Swal.fire({
      title: 'Download Agreement?',
      text: "This will generate a digital copy of your signed contract.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#D97706',
      cancelButtonColor: '#1C1C1C',
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
      Swal.fire('Success', 'Agreement downloaded.', 'info');
    };
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-md h-10 w-10 border-t-2 border-[#D97706]"></div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white min-h-screen space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1C1C1C]"> Digital Agreement </h1>
          <p className="text-sm md:text-lg text-[#4B4B4B] mt-1"> Verified Legal Document • E-Signed </p>
        </div>
        <div className={`self-start md:self-center px-4 py-2 rounded-md text-xs font-bold border ${
          agreementInfo?.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-[#D97706] border-orange-200'
        }`}>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-md bg-current animate-pulse"></span>
            {agreementInfo?.status || "Pending"}
          </span>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white rounded-md shadow-lg border border-[#E5E0D9] overflow-hidden max-w-5xl">
        <div className="p-6 md:p-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 rounded-b-md">
            <Info label="PG Name" value={agreementInfo?.pgName} />
            <Info label="Room Details" value={agreementInfo?.roomNo} />
            <Info label="Validity" value={agreementInfo?.startDate ? `${agreementInfo.startDate} – ${agreementInfo?.isLongTerm ? "Long Term" : (agreementInfo?.endDate || "N/A")}` : undefined} />
            <Info label="Monthly Rent" value={agreementInfo?.rentAmount ? `₹${agreementInfo.rentAmount}` : undefined} />
            <Info label="Deposit" value={agreementInfo?.securityDeposit ? `₹${agreementInfo.securityDeposit}` : undefined} />
            <Info label="Agreement ID" value={agreementInfo?.agreementId} />
            <div className="sm:col-span-2 lg:col-span-1">
              <Info label="Tenant Name" value={agreementInfo?.tenantName} />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-100">
            <CButton variant="outline" className="font-bold flex items-center justify-center gap-2 w-full sm:w-auto" onClick={() => setShowRules(true)}>
              <FaListUl /> View House Rules
            </CButton>
            <CButton className="font-bold flex items-center justify-center gap-2 w-full sm:w-auto" onClick={handleDownloadPDF}>
              <FaDownload /> Get PDF Copy
            </CButton>
          </div>
        </div>
        <div className="bg-[#FEF3C7]/30 px-6 py-4 border-t border-[#E5E0D9] flex items-center gap-2">
          <FaShieldAlt className="text-[#D97706] text-sm" />
          <span className="text-[11px] text-[#4B4B4B] font-bold uppercase tracking-widest">
            Encrypted & Tamper-Proof Digital Document
          </span>
        </div>
      </div>

      {/* --- MODAL USING PORTAL TO COVER ENTIRE SCREEN --- */}
      {showRules && ReactDOM.createPortal(
        <div className="fixed inset-0 w-screen h-screen flex items-center justify-center z-[99999] p-4">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
            onClick={() => setShowRules(false)}
          />
          
          <div className="bg-white w-full max-w-lg rounded-md shadow-2xl relative overflow-hidden transition-all animate-in zoom-in duration-200 z-[100000]">
            
            {/* UPDATED: Solid Header Background using primary color */}
            <div className="bg-primary px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white uppercase">
                PG  Occupancy  Rules
              </h2>
              <button 
                onClick={() => setShowRules(false)} 
                className="text-white/80 hover:text-white transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="p-6 md:p-10">
              <div className="max-h-[50vh] overflow-y-auto pr-3 custom-scrollbar">
                <ul className="space-y-4">
                  {agreementRules.map((rule, index) => (
                    <li key={index} className="flex gap-4 text-sm md:text-base text-[#4B4B4B] border-b border-gray-50 pb-3 leading-relaxed">
                      <span className="text-[#D97706] font-bold">{index + 1}.</span> 
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>

              <CButton 
                className="mt-8 w-full py-4 text-sm font-bold uppercase tracking-widest"
                onClick={() => setShowRules(false)}
              >
                Acknowledge Rules
              </CButton>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const Info = ({ label, value }) => {
  const isPending = !value || value.includes("undefined") || value === "₹undefined";
  return (
    <div className="bg-white rounded-md p-4 border border-[#E5E0D9] shadow-sm">
      <p className="text-[10px] text-[#4B4B4B] uppercase font-bold tracking-widest mb-1">{label}</p>
      <p className={`text-sm md:text-base font-bold truncate ${isPending ? "text-gray-300 italic" : "text-[#1C1C1C]"}`}>
        {isPending ? "Pending Update" : value}
      </p>
    </div>
  );
};

export default Agreements;
