import React, { useState, useEffect } from "react";
import { FaEdit, FaPlus, FaSearch, FaEye, FaTrash, FaSignOutAlt, FaMapMarkerAlt, FaHistory, FaClock, FaInfoCircle } from "react-icons/fa";
import CButton from "../../../components/cButton";
import CSelect from "../../../components/cSelect";
import Swal from "sweetalert2";

const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPG, setSelectedPG] = useState("all");

  const staticData = [
    {
      _id: "1",
      name: "John Doe (Demo)",
      phone: "+91 98765 43210",
      pgName: "Sunrise Heights",
      room: "101-A",
      status: "Active",
      rentDeferred: true,
      hasMoveOutNotice: true,
      lastDeferredDate: "2025-11-10",
      deferredReason: "Job transition delay",
      deferredDays: 10,
    },
    {
      _id: "2",
      name: "Rahul Sharma (New)",
      phone: "+91 99887 76655",
      pgName: "Sunrise Heights",
      room: "202-B",
      status: "Pending Arrival",
      hasPaidRent: true,
    },
    {
      _id: "3",
      name: "Amit Patel (Old)",
      phone: "+91 91234 56789",
      pgName: "Sunrise Heights",
      room: "301-C",
      status: "Inactive",
      securityDeposit: 5000,
      finalRefund: 4200,
      damageCharges: 500,
      pendingFine: 300,
      deductionReason: "Room paint damage and cleaning fee"
    },
    {
      _id: "4",
      name: "Suresh Kumar",
      phone: "+91 98989 89898",
      pgName: "Sunrise Heights",
      room: "105-D",
      status: "Active",
      hasDeferralRequest: true, 
      requestReason: "Medical emergency in family", // Details owner needs to see
      requestDays: 7, // Details owner needs to see
    }
  ];

  useEffect(() => { setTenants(staticData); }, []);

  const filteredTenants = tenants.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.pgName.toLowerCase().includes(search.toLowerCase())
  );

  // ACTION: Confirm Arrival
  const handleConfirmArrival = (id) => {
    Swal.fire({
      title: "Confirm Arrival?",
      text: "Tenant has paid and is at the property. Set to Active?",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#D97706",
      cancelButtonColor: "#4B4B4B",
      confirmButtonText: "Confirm Arrival"
    }).then((res) => {
      if (res.isConfirmed) {
        setTenants(prev => prev.map(t => t._id === id ? { ...t, status: "Active" } : t));
        Swal.fire({ title: "Welcome!", icon: "success", confirmButtonColor: "#D97706" });
      }
    });
  };

  // ACTION: View Inactive Audit
  const handleViewAudit = (tenant) => {
    Swal.fire({
      title: '<span style="color: #1C1C1C">Move-Out Settlement</span>',
      html: `
        <div style="text-align: left; font-family: sans-serif; font-size: 14px; color: #4B4B4B;">
          <p><b>Deposit:</b> ₹${tenant.securityDeposit}</p>
          <div style="background: #FEF3C7; padding: 12px; border-radius: 8px; margin: 10px 0; border: 1px solid #E5E0D9;">
            <div style="display: flex; justify-content: space-between; color: #dc2626;"><span>Damages:</span> <span>- ₹${tenant.damageCharges}</span></div>
            <div style="display: flex; justify-content: space-between; color: #dc2626;"><span>Fines:</span> <span>- ₹${tenant.pendingFine}</span></div>
            <hr style="border: 0.5px solid #E5E0D9; margin: 8px 0;">
            <div style="display: flex; justify-content: space-between; font-weight: bold; color: #1C1C1C; font-size: 16px;">
              <span>Total Refund:</span> <span style="color: #D97706;">₹${tenant.finalRefund}</span>
            </div>
          </div>
          <p style="font-size: 11px;"><b>Notes:</b> ${tenant.deductionReason}</p>
        </div>
      `,
      confirmButtonColor: "#D97706",
    });
  };

  // NEW: Handle Deferral History View (Owner sees details here after granting)
  const handleViewDeferralInfo = (tenant) => {
    Swal.fire({
      title: "Rent Deferral Record",
      html: `
        <div style="text-align: left; font-size: 14px; color: #4B4B4B;">
          <p><b>Last Granted:</b> ${tenant.lastDeferredDate || "N/A"}</p>
          <p><b>Extension Given:</b> ${tenant.deferredDays || "N/A"} Days</p>
          <p><b>Reason:</b> ${tenant.deferredReason || "General deferral request"}</p>
          <hr style="margin: 10px 0; border-top: 1px solid #E5E0D9;">
          <p style="margin-top: 10px; color: #B45309; font-weight: bold;">Status: 1 Time Rent Deferred</p>
          <p style="font-size: 11px; margin-top: 5px;"><i>*This action is allowed once every 6 months.</i></p>
        </div>
      `,
      confirmButtonColor: "#D97706",
    });
  };

  // NEW: Grant Deferral Logic (Owner sees details here BEFORE granting)
  const handleGrantDeferral = (tenant) => {
    Swal.fire({
      title: "Grant Rent Deferral?",
      html: `
        <div style="text-align: left; font-size: 14px; color: #1C1C1C; background: #FEF3C7; padding: 15px; border-radius: 10px; border: 1px solid #E5E0D9;">
           <p style="margin-bottom: 8px;"><b>Requested Extension:</b> ${tenant.requestDays} Days</p>
           <p><b>Tenant's Reason:</b> ${tenant.requestReason}</p>
        </div>
        <p style="font-size: 12px; color: #4B4B4B; margin-top: 15px;">Are you sure you want to approve this? This will be marked as their 6-month quota.</p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#B45309",
      confirmButtonText: "Yes, Grant Deferral",
      cancelButtonColor: "#4B4B4B",
    }).then((res) => {
      if (res.isConfirmed) {
        setTenants(prev => prev.map(t => t._id === tenant._id ? { 
            ...t, 
            rentDeferred: true, 
            hasDeferralRequest: false, 
            deferredDays: tenant.requestDays,
            deferredReason: tenant.requestReason,
            lastDeferredDate: new Date().toISOString().split('T')[0] 
        } : t));
        Swal.fire({ title: "Granted", text: "Rent deferral has been activated.", icon: "success", confirmButtonColor: "#D97706" });
      }
    });
  };

  const handleEditClick = (tenant) => {
    Swal.fire({
      title: "Edit Room Info",
      html: `
        <div style="text-align: left;">
          <label style="font-weight: bold; color: #1C1C1C; font-size: 14px;">Room Number</label>
          <input id="swal-room" class="swal2-input" value="${tenant.room}" style="width: 85%; margin-top: 5px;">
          <p style="font-size: 11px; color: #4B4B4B; margin-top: 15px;">
            <i>Note: Status updates automatically based on Move-in/Move-out actions.</i>
          </p>
        </div>
      `,
      confirmButtonColor: "#D97706",
      showCancelButton: true,
      cancelButtonColor: "#4B4B4B",
    });
  };

  return (
    <div className="p-4 md:p-10 bg-[#ffffff] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#1C1C1C]">Tenants</h1>
          <p className="text-[#4B4B4B] mt-2">Track arrivals, active stays, and past residents.</p>
        </div>
        <CButton text="Add New Tenant" className="flex items-center gap-2">
          <FaPlus /> Add New Tenant
        </CButton>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-[#D97706]">
        <div className="relative flex-grow">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or PG..."
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-[#E5E0D9] focus:outline-none focus:ring-1 focus:ring-[#D97706] text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <CSelect options={[{ value: "all", label: "All Properties" }]} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E5E0D9] overflow-hidden">
        <div className="p-6 border-b border-[#E5E0D9]">
          <h2 className="text-xl font-bold text-[#1C1C1C]">Resident List</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-[#FEF3C7] text-[#1C1C1C] text-sm uppercase font-bold">
              <tr>
                <th className="p-5">Tenant Details</th>
                <th className="p-5">Property</th>
                <th className="p-5 text-center">Room</th>
                <th className="p-5 text-center">Status</th>
                <th className="p-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D9]">
              {filteredTenants.map((t) => (
                <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-5">
                    <div className="font-bold text-[#1C1C1C]">{t.name}</div>
                    <div className="text-xs text-[#4B4B4B]">{t.phone}</div>
                  </td>
                  <td className="p-5 text-[#4B4B4B] text-sm font-medium">{t.pgName}</td>
                  <td className="p-5 text-center">
                    <span className="px-3 py-1 rounded border border-[#D97706] text-[#B45309] font-bold text-[10px]">{t.room}</span>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        t.status === "Active" ? "bg-green-100 text-green-700" : 
                        t.status === "Inactive" ? "bg-gray-100 text-gray-500" : "bg-amber-100 text-[#B45309]"
                      }`}>
                        {t.status}
                      </span>
                      {t.hasMoveOutNotice && t.status === "Active" && (
                        <span className="bg-red-50 text-red-600 text-[9px] px-2 py-0.5 rounded font-bold animate-pulse">NOTICE SERVED</span>
                      )}
                      {t.rentDeferred && (
                        <button 
                          onClick={() => handleViewDeferralInfo(t)}
                          className="bg-blue-50 text-blue-600 text-[9px] px-2 py-0.5 rounded flex items-center gap-1 font-bold border border-blue-100 hover:bg-blue-100 transition-all cursor-pointer shadow-sm"
                        >
                          <FaHistory size={8} /> 1 TIME RENT DEFERRED
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center justify-center gap-3">
                      
                      {/* Scenario 1: Pending + Move-in Triggered */}
                      {t.status === "Pending Arrival" && t.hasPaidRent && (
                        <button onClick={() => handleConfirmArrival(t._id)} className="flex items-center gap-1 px-3 py-1.5 bg-[#D97706] text-white text-[10px] font-bold rounded hover:bg-[#B45309] shadow-sm">
                          <FaMapMarkerAlt /> CONFIRM ARRIVAL
                        </button>
                      )}

                      {/* Scenario 2: Active */}
                      {t.status === "Active" && (
                        <>
                          {/* Grant Deferral: Detailed reason is shown inside handleGrantDeferral alert */}
                          {t.hasDeferralRequest && (
                            <button onClick={() => handleGrantDeferral(t)} className="flex items-center gap-1 px-3 py-1.5 bg-[#B45309] text-white text-[10px] font-bold rounded hover:bg-[#D97706] shadow-sm animate-bounce">
                              <FaClock /> GRANT RENT DEFERRED
                            </button>
                          )}

                          {t.hasMoveOutNotice && (
                            <button className="flex items-center gap-1 px-3 py-1.5 bg-[#1C1C1C] text-white text-[10px] font-bold rounded hover:bg-black transition-all">
                              <FaSignOutAlt /> MOVE OUT
                            </button>
                          )}
                          <button onClick={() => handleEditClick(t)} className="p-2 text-[#4B4B4B] hover:text-[#D97706] rounded-full">
                            <FaEdit size={16} />
                          </button>
                        </>
                      )}

                      {/* Scenario 3: Inactive */}
                      {t.status === "Inactive" && (
                        <button onClick={() => handleViewAudit(t)} className="p-2 text-[#1C1C1C] bg-[#FEF3C7] hover:bg-[#D97706] hover:text-white rounded-full transition-all">
                          <FaEye size={18} />
                        </button>
                      )}
                      
                      <button className="p-2 text-[#4B4B4B] hover:text-red-600 rounded-full"><FaTrash size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Tenants;