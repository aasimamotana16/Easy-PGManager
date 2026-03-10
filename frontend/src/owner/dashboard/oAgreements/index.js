import React, { useState, useEffect } from "react";
import {
  FaFileContract,
  FaEye,
  FaTimes,
  FaUser,
  FaHome,
  FaWallet,
  FaCalendarAlt
} from "react-icons/fa";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const AgreementPage = () => {
  const [tenantSearch, setTenantSearch] = useState("");
  const [propertySearch, setPropertySearch] = useState("");
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const authToken = localStorage.getItem("userToken");

  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/owner/my-agreements", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.data.success) {
        setAgreements(response.data.data || []);
      }
    } catch (error) {
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

  return (
    <div className="h-screen w-full bg-gray-200 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <div>
          <h2 className=" font-bold text-textPrimary">Agreements</h2>
          <p className="text-primary">Agreement records for your tenants.</p>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-md border border-primary shadow-sm flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by Tenant Name..."
            className="w-full border border-gray-200  rounded-md px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#D97706] text-sm"
            value={tenantSearch}
            onChange={(e) => setTenantSearch(e.target.value)}
          />
          <input
            type="text"
            placeholder="Search by Property..."
            className="w-full border border-gray-200 rounded-md px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#D97706] text-sm"
            value={propertySearch}
            onChange={(e) => setPropertySearch(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-primarySoft border-b border-orange-100">
                <tr className="text-black text-sm uppercase">
                  <th className="p-4 text-left">ID</th>
                  <th className="p-4 text-left">Tenant</th>
                  <th className="p-4 text-left">Property</th>
                  <th className="p-4 text-left">Move-In</th>
                  <th className="p-4 text-left">Move-Out</th>
                  <th className="p-4 text-left">Rent</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10">
                      Loading...
                    </td>
                  </tr>
                ) : (
                  filteredAgreements.map((ag) => (
                    <tr key={ag.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-500">#{ag.agreementId}</td>
                      <td className="p-4">
                        <div className="font-bold text-gray-800">{ag.tenant}</div>
                        <div className="text-xs text-gray-500">{ag.tenantEmail}</div>
                      </td>
                      <td className="p-4 font-medium text-gray-700">
                        {ag.property} / {ag.room}
                      </td>
                      <td className="p-4 text-gray-600">{ag.checkInDate || ag.startDate}</td>
                      <td className="p-4 text-gray-600">{ag.isLongTerm ? "Long Term" : (ag.checkOutDate || ag.endDate)}</td>
                      <td className="p-4 font-bold text-black">Rs {ag.rent}</td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                            ag.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {ag.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => { setSelectedAgreement(ag); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
                          <FaEye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && selectedAgreement && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-primary px-6 py-5 text-white flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-textLight flex items-center gap-3">
                  <FaFileContract /> Agreement Details
                </h2>
                <p className="text-orange-100 text-sm">ID: {selectedAgreement.agreementId}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-2 rounded-full">
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-8 bg-white">
              <section>
                <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-4">
                  <FaUser /> Tenant Information
                </h3>
                <p className="text-gray-800 font-semibold">{selectedAgreement.tenant}</p>
                <p className="text-gray-500 text-sm">{selectedAgreement.tenantEmail}</p>
              </section>

              <section>
                <h3 className="text-gray-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-4">
                  <FaHome /> Property Details
                </h3>
                <p className="text-gray-800 font-semibold">{selectedAgreement.property}</p>
                <p className="text-gray-500 text-sm">Room: {selectedAgreement.room}</p>
              </section>

              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-gray-100">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                    <FaWallet /> Financials
                  </h4>
                  <p className="text-sm flex justify-between"><span>Rent:</span> <span className="font-bold">Rs {selectedAgreement.rent}</span></p>
                  <p className="text-sm flex justify-between"><span>Deposit:</span> <span className="font-bold">Rs {selectedAgreement.securityDeposit}</span></p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                    <FaCalendarAlt /> Timeline
                  </h4>
                  <p className="text-sm flex justify-between"><span>Move-In:</span> <span className="font-bold">{selectedAgreement.checkInDate || selectedAgreement.startDate}</span></p>
                  <p className="text-sm flex justify-between"><span>Move-Out:</span> <span className="font-bold">{selectedAgreement.isLongTerm ? "Long Term" : (selectedAgreement.checkOutDate || selectedAgreement.endDate)}</span></p>
                </div>
              </div>

              {selectedAgreement.fileUrl && (
                <a
                  href={`${API_BASE_URL}${selectedAgreement.fileUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-primary font-bold"
                >
                  Open Uploaded Agreement PDF
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgreementPage;
