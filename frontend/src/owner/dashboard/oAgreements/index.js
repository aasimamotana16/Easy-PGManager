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
    // Initial sample data for immediate display
    const sampleData = [
      {
        id: 1,
        agreementId: 'AGR001',
        tenant: 'Rahul Sharma',
        tenantEmail: 'rahul.sharma@email.com',
        tenantPhone: '9876543210',
        property: 'My Dream PG',
        room: '101',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        rent: 5000,
        securityDeposit: 10000,
        status: 'Active',
        signed: true
      },
      {
        id: 2,
        agreementId: 'AGR002',
        tenant: 'Priya Patel',
        tenantEmail: 'priya.patel@email.com',
        tenantPhone: '9876543211',
        property: 'Sunrise Boys PG',
        room: '201',
        startDate: '2025-05-01',
        endDate: '2026-04-30',
        rent: 4500,
        securityDeposit: 9000,
        status: 'Pending Signature',
        signed: false
      },
      {
        id: 3,
        agreementId: 'AGR003',
        tenant: 'Amit Kumar',
        tenantEmail: 'amit.kumar@email.com',
        tenantPhone: '9876543212',
        property: 'My Dream PG',
        room: '102',
        startDate: '2026-02-01',
        endDate: '2027-01-31',
        rent: 5200,
        securityDeposit: 10400,
        status: 'Active',
        signed: true
      }
    ];
    setAgreements(sampleData);
    setLoading(false);

    try {
      const response = await axios.get("http://localhost:5000/api/owner/my-agreements", {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.data.success && response.data.data.length > 0) {
        setAgreements(response.data.data);
      }
    } catch (error) {
      console.log('API failed, keeping sample data');
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
    const agreementContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Rental Agreement - ${agreement.agreementId}</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
              .header { text-align: center; border-bottom: 2px solid #f97316; padding-bottom: 20px; margin-bottom: 30px; }
              .section { margin-bottom: 25px; }
              .section-title { font-size: 18px; font-weight: bold; color: #f97316; margin-bottom: 10px; border-bottom: 1px solid #eee; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>RENTAL AGREEMENT</h1>
              <p>ID: ${agreement.agreementId}</p>
          </div>
          <div class="section">
              <div class="section-title">PARTIES</div>
              <p><strong>Landlord:</strong> EasyPG Manager</p>
              <p><strong>Tenant:</strong> ${agreement.tenant} (${agreement.tenantEmail})</p>
          </div>
          <div class="section">
              <div class="section-title">DETAILS</div>
              <p>Property: ${agreement.property} - Room ${agreement.room}</p>
              <p>Rent: ₹${agreement.rent}</p>
          </div>
      </body>
      </html>
    `.trim();

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
      confirmButtonColor: '#f97316',
    });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">
      
      {/* PAGE HEADER */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 rounded-lg">
            <FaFileContract className="text-orange-500 text-3xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Agreements</h1>
            <p className="text-gray-500 text-sm">View and manage tenant rental agreements</p>
          </div>
        </div>

        <CButton
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg shadow-sm transition-all"
          onClick={() => navigate("/owner/dashboard")}
        >
          Add New Agreement
        </CButton>
      </div>

      {/* SEARCH / FILTER SECTION */}
      <div className="bg-white p-5 rounded-xl shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by Tenant Name..."
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-400 transition"
            value={tenantSearch}
            onChange={(e) => setTenantSearch(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by Property / Room..."
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-400 transition"
            value={propertySearch}
            onChange={(e) => setPropertySearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-orange-50 text-orange-900">
            <tr>
              <th className="p-4 text-left font-semibold">ID</th>
              <th className="p-4 text-left font-semibold">Tenant Information</th>
              <th className="p-4 text-left font-semibold">Property / Room</th>
              <th className="p-4 text-left font-semibold">Start Date</th>
              <th className="p-4 text-left font-semibold">End Date</th>
              <th className="p-4 text-left font-semibold">Rent</th>
              <th className="p-4 text-center font-semibold">Status</th>
              <th className="p-4 text-center font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-20 text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    Loading agreements...
                  </div>
                </td>
              </tr>
            ) : filteredAgreements.length > 0 ? (
              filteredAgreements.map((ag) => (
                <tr key={ag.id} className="hover:bg-orange-50/30 transition-colors">
                  <td className="p-4 text-gray-500">#{ag.id}</td>
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{ag.tenant}</div>
                    <div className="text-xs text-gray-500">{ag.tenantEmail}</div>
                  </td>
                  <td className="p-4 font-medium text-gray-700">{ag.property} / {ag.room}</td>
                  <td className="p-4 text-gray-600">{ag.startDate}</td>
                  <td className="p-4 text-gray-600">{ag.endDate}</td>
                  <td className="p-4 font-bold text-black text-base">₹{ag.rent}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      ag.status === "Active" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {ag.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openModal(ag)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View Details"
                      >
                        <FaEye size={18} />
                      </button>
                      <button
                        onClick={() => handleDownloadFile(ag)}
                        className="p-2 text-gray-500 hover:bg-orange-50 rounded-lg transition"
                        title="Download"
                      >
                        <FaDownload size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-20 text-gray-500">
                  No agreements matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* REACT + TAILWIND MODAL */}
      {isModalOpen && selectedAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="bg-orange-500 px-6 py-5 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <FaFileContract /> Agreement Details
                </h2>
                <p className="text-orange-100 text-sm">ID: {selectedAgreement.agreementId}</p>
              </div>
              <button 
                onClick={closeModal}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Modal Body - No more custom colors/gradients as requested */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-8">
              
              {/* Tenant Section */}
              <section>
                <h3 className="text-gray-800 font-bold text-sm uppercase tracking-widest flex items-center gap-2 mb-4">
                  <FaUser className="text-gray-400" /> Tenant Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-100 p-3 rounded-lg bg-gray-50">
                    <label className="text-[10px] text-gray-500 uppercase font-bold">Full Name</label>
                    <p className="text-gray-800 font-semibold">{selectedAgreement.tenant}</p>
                  </div>
                  <div className="border border-gray-100 p-3 rounded-lg bg-gray-50">
                    <label className="text-[10px] text-gray-500 uppercase font-bold">Email Address</label>
                    <p className="text-gray-800 font-semibold">{selectedAgreement.tenantEmail}</p>
                  </div>
                  <div className="border border-gray-100 p-3 rounded-lg bg-gray-50">
                    <label className="text-[10px] text-gray-500 uppercase font-bold">Phone Number</label>
                    <p className="text-gray-800 font-semibold">{selectedAgreement.tenantPhone}</p>
                  </div>
                  <div className="border border-gray-100 p-3 rounded-lg bg-gray-50">
                    <label className="text-[10px] text-gray-500 uppercase font-bold">Status</label>
                    <p className="text-gray-800 font-semibold">{selectedAgreement.status}</p>
                  </div>
                </div>
              </section>

              {/* Property Section */}
              <section>
                <h3 className="text-gray-800 font-bold text-sm uppercase tracking-widest flex items-center gap-2 mb-4">
                  <FaHome className="text-gray-400" /> Property Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-100 p-3 rounded-lg bg-gray-50">
                    <label className="text-[10px] text-gray-500 uppercase font-bold">Property Name</label>
                    <p className="text-gray-800 font-semibold">{selectedAgreement.property}</p>
                  </div>
                  <div className="border border-gray-100 p-3 rounded-lg bg-gray-50">
                    <label className="text-[10px] text-gray-500 uppercase font-bold">Room</label>
                    <p className="text-gray-800 font-semibold">{selectedAgreement.room}</p>
                  </div>
                </div>
              </section>

              {/* Finance & Dates Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section>
                  <h3 className="text-gray-800 font-bold text-sm uppercase tracking-widest flex items-center gap-2 mb-4 border-b pb-2">
                    <FaWallet className="text-gray-400" /> Financials
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Monthly Rent</span>
                      <span className="font-bold text-gray-800">₹{selectedAgreement.rent}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Security Deposit</span>
                      <span className="font-bold text-gray-800">₹{selectedAgreement.securityDeposit}</span>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-gray-800 font-bold text-sm uppercase tracking-widest flex items-center gap-2 mb-4 border-b pb-2">
                    <FaCalendarAlt className="text-gray-400" /> Period
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Start Date</span>
                      <span className="font-bold text-gray-800">{selectedAgreement.startDate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">End Date</span>
                      <span className="font-bold text-gray-800">{selectedAgreement.endDate}</span>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-5 flex justify-between items-center border-t border-gray-100">
              <span className="text-[11px] text-gray-400 italic">Document is legally binding.</span>
              <div className="flex gap-3">
                <button 
                  onClick={closeModal}
                  className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    handleDownloadFile(selectedAgreement);
                    closeModal();
                  }}
                  className="px-5 py-2 text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 rounded-lg shadow-md transition flex items-center gap-2"
                >
                  <FaDownload size={14} /> Download PDF
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