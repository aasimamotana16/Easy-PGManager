import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaFileContract, 
  FaEye, 
  FaDownload, 
  FaTimes, 
  FaUser, 
  FaHome, 
  FaWallet, 
  FaCalendarAlt 
} from "react-icons/fa";
import Swal from "sweetalert2";
import CButton from "../../../components/cButton";
import axios from "axios";

const AgreementPage = () => {
  const navigate = useNavigate();
  const [tenantSearch, setTenantSearch] = useState("");
  const [propertySearch, setPropertySearch] = useState("");
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const authToken = localStorage.getItem("userToken");

  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/owner/my-agreements", {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.data.success) {
        setAgreements(response.data.data || []);
      }
    } catch (error) {
      console.log('Failed to load agreements');
      setAgreements([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgreements = agreements.filter(
    (ag) =>
      ag.tenant.toLowerCase().includes(tenantSearch.toLowerCase()) &&
      ag.property.toLowerCase().includes(propertySearch.toLowerCase())
  );

  const openModal = (agreement) => {
    setSelectedAgreement(agreement);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAgreement(null);
  };

  const handleDownloadFile = (agreement) => {
    const agreementContent = `<html>...</html>`; // Shortened for brevity
    const blob = new Blob([agreementContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rental_Agreement_${agreement.agreementId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    Swal.fire({
      icon: 'success',
      title: 'Agreement Downloaded!',
      text: 'The file has been saved to your device.',
      confirmButtonColor: '#D97706',
    });
  };

  return (
    /* FIX: Changed min-h-screen to h-screen and added overflow-hidden.
       This prevents the "white gap" at the top by forcing the container 
       to stay exactly within the browser window.
    */
    <div className="h-screen w-full bg-gray-200 flex flex-col overflow-hidden">
      
      {/* Scrollable Content Wrapper */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div>
<h1 className="text-2xl sm:text-4xl font-bold text-textPrimary">
          Agreements
        </h1>              <p className="text-gray-500 text-sm">View and manage tenant rental agreements</p>
            </div>
          </div>

          {/*<CButton
            className="w-full sm:w-auto text-white px-6 py-2.5 rounded-md shadow-sm text-sm md:text-base"
            onClick={() => navigate("/owner/dashboard")}
          >
            + Add New Agreement
          </CButton>*/}
        </div>

        {/* SEARCH SECTION */}
        <div className="bg-white p-4 md:p-5 rounded-md border border-primary shadow-sm flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by Tenant Name..."
              className="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400"
              value={tenantSearch}
              onChange={(e) => setTenantSearch(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by Property..."
              className="w-full border border-gray-200 rounded-md px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400"
              value={propertySearch}
              onChange={(e) => setPropertySearch(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-primarySoft border-b border-orange-100">
                <tr className="text-black text-sm uppercase ">
                  <th className="p-4 text-left">ID</th>
                  <th className="p-4 text-left">Tenant Info</th>
                  <th className="p-4 text-left">Property</th>
                  <th className="p-4 text-left">Start Date</th>
                  <th className="p-4 text-left">End Date</th>
                  <th className="p-4 text-left">Rent</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-10">Loading...</td></tr>
                ) : filteredAgreements.map((ag) => (
                  <tr key={ag.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-500">#{ag.agreementId}</td>
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{ag.tenant}</div>
                      <div className="text-xs text-gray-500">{ag.tenantEmail}</div>
                    </td>
                    <td className="p-4 font-medium text-gray-700">{ag.property} / {ag.room}</td>
                    <td className="p-4 text-gray-600">{ag.startDate}</td>
                    <td className="p-4 text-gray-600">{ag.endDate}</td>
                    <td className="p-4 font-bold text-black">₹{ag.rent}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${ag.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {ag.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => openModal(ag)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <FaEye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL SECTION - FIXED FOR RESPONSIVENESS */}
      {isModalOpen && selectedAgreement && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
          
          {/* MODAL BOX FIX: 
              1. Added 'max-h-[85vh]' to keep it away from the browser edges.
              2. Added 'flex flex-col' so the header and footer stay fixed.
          */}
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header: Fixed at top */}
            <div className="bg-primary px-6 py-5 text-white flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-textLight flex items-center gap-3">
                  <FaFileContract /> Agreement Details
                </h2>
                <p className="text-orange-100 text-sm">ID: {selectedAgreement.agreementId}</p>
              </div>
              <button onClick={closeModal} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                <FaTimes size={20} />
              </button>
            </div>

            {/* Modal Body: This part is now the ONLY part that scrolls */}
            <div className="p-6 overflow-y-auto flex-1 space-y-8 bg-white">
              <section>
                <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-4">
                  <FaUser /> Tenant Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <label className="text-[10px] text-gray-400 uppercase font-bold">Full Name</label>
                    <p className="text-gray-800 font-semibold">{selectedAgreement.tenant}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <label className="text-[10px] text-gray-400 uppercase font-bold">Email</label>
                    <p className="text-gray-800 font-semibold truncate">{selectedAgreement.tenantEmail}</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-4">
                  <FaHome /> Property Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <label className="text-[10px] text-gray-400 uppercase font-bold">Property</label>
                    <p className="text-gray-800 font-semibold">{selectedAgreement.property}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <label className="text-[10px] text-gray-400 uppercase font-bold">Room No.</label>
                    <p className="text-gray-800 font-semibold">{selectedAgreement.room}</p>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-gray-100">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                    <FaWallet /> Financials
                  </h4>
                  <p className="text-sm flex justify-between"><span>Rent:</span> <span className="font-bold">₹{selectedAgreement.rent}</span></p>
                  <p className="text-sm flex justify-between"><span>Deposit:</span> <span className="font-bold">₹{selectedAgreement.securityDeposit}</span></p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                    <FaCalendarAlt /> Timeline
                  </h4>
                  <p className="text-sm flex justify-between"><span>Start:</span> <span className="font-bold">{selectedAgreement.startDate}</span></p>
                  <p className="text-sm flex justify-between"><span>End:</span> <span className="font-bold">{selectedAgreement.endDate}</span></p>
                </div>
              </div>
            </div>

            {/* Modal Footer: Fixed at bottom */}
            <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t shrink-0">
              <span className="text-xs text-gray-400 italic">ID: {selectedAgreement.agreementId}</span>
              <div className="flex gap-3 w-full sm:w-auto">
                <button onClick={closeModal} className="flex-1 px-5 py-2 text-sm font-bold text-gray-500 hover:bg-gray-200 rounded-lg transition">
                  Close
                </button>
                <button 
                   onClick={() => { handleDownloadFile(selectedAgreement); closeModal(); }}
                   className="flex-1 px-5 py-2 text-sm font-bold bg-primary text-white rounded-lg shadow-lg flex items-center justify-center gap-2"
                >
                  <FaDownload size={14} /> Download
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AgreementPage;
