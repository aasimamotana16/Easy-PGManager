import React, { useState, useEffect } from "react";
import CButton from "../../../components/cButton";
import Swal from "sweetalert2";
import { getMyAgreement } from "../../../api/api";
import {
  FaDownload, 
  FaShieldAlt
} from "react-icons/fa";

const Agreements = () => {
  const [agreementInfo, setAgreementInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiBaseUrl = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/+$/, "");
  const hasSignatureForThisPg = Boolean(agreementInfo?.signatureVerified || agreementInfo?.ownerSignatureUrl);
  const agreementHeaderText = hasSignatureForThisPg
    ? "Verified Legal Document - Signature Verified"
    : "Verified Legal Document";
  const agreementBadgeText = hasSignatureForThisPg ? "Signature Verified" : "Signature Awaited";

  useEffect(() => {
    const fetchAgreement = async () => {
      try {
        const res = await getMyAgreement();
        if (res.data.success) {
          setAgreementInfo(res.data.data);
        }
      } catch (err) {
        const status = err?.response?.status;
        if (status === 404) {
          setAgreementInfo(null);
        } else {
          console.error("Agreement fetch error:", err);
          Swal.fire({
            icon: 'error',
            title: 'Connection Error',
            text: 'Unable to load agreement details.',
            confirmButtonColor: '#D97706'
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAgreement();
  }, []);

  const resolveAgreementUrl = (fileUrl) => {
    if (!fileUrl) return "";
    const rawUrl = String(fileUrl).trim();
    if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
    const normalizedPath = rawUrl.replace(/^\/+/, "");
    return `${apiBaseUrl}/${normalizedPath}`;
  };

  const triggerAgreementDownload = async (agreementUrl) => {
    const response = await fetch(agreementUrl, { method: "GET", credentials: "include" });
    if (!response.ok) {
      throw new Error("Failed to download agreement PDF");
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `Agreement-${agreementInfo?.agreementId || "copy"}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(objectUrl);
  };

  const handleDownloadPDF = () => {
    const agreementUrl = resolveAgreementUrl(agreementInfo?.fileUrl);
    if (!agreementUrl) {
      return Swal.fire({
        icon: 'info',
        title: 'Document Not Ready',
        text: 'Agreement PDF is not generated yet.',
        confirmButtonColor: '#D97706'
      });
    }

    Swal.fire({
      title: 'Download Agreement?',
      text: "This will download your generated agreement PDF.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#D97706',
      cancelButtonColor: '#1C1C1C',
      confirmButtonText: 'Download PDF'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await triggerAgreementDownload(agreementUrl);
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Download Failed",
            text: "Unable to download agreement right now.",
            confirmButtonColor: "#D97706"
          });
        }
      }
    });
  };

  {/*if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-md h-10 w-10 border-t-2 border-[#D97706]"></div>
    </div>
  );*/}

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-200 min-h-screen space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div>
          <h2 className=" font-bold text-textPrimary"> Digital Agreement </h2>
          <h3 className=" text-primary ">
            {agreementHeaderText}
          </h3>
        </div>
        <div className={`self-start md:self-center px-4 py-2 rounded-md text-xs font-bold border ${
          hasSignatureForThisPg ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-[#D97706] border-orange-200'
        }`}>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-md bg-current animate-pulse"></span>
            {agreementBadgeText}
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

