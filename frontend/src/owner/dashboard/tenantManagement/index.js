import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FaEdit, FaPlus, FaSearch, FaEye, FaTrash, FaSignOutAlt, FaMapMarkerAlt, FaHistory, FaClock, FaInfoCircle } from "react-icons/fa";
import CButton from "../../../components/cButton";
import CSelect from "../../../components/cSelect";
import Swal from "sweetalert2";
import AddTenant from "./addTenant";
import {
  getMyTenants,
  addTenant as apiAddTenant,
  updateTenant as apiUpdateTenant,
  getMyPgs,
  deleteTenant as apiDeleteTenant,
  confirmArrival as apiConfirmArrival,
  approveExtension as apiApproveExtension,
  completeMoveOut as apiCompleteMoveOut
} from "../../../api/api";

const Tenants = () => {
  const location = useLocation();
  const initialFilter = location.state?.filter === "extension" || location.state?.filter === "checkout"
    ? location.state.filter
    : "all";
  const [tenants, setTenants] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPG, setSelectedPG] = useState("all");
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [showAddModal, setShowAddModal] = useState(false);
  const [pgOptions, setPgOptions] = useState([]);

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

  useEffect(() => {
    fetchTenants();
    fetchPgs();
  }, []);

  useEffect(() => {
    if (location.state?.filter === "extension" || location.state?.filter === "checkout") {
      setActiveFilter(location.state.filter);
    }
  }, [location.state?.filter]);

  const isExtensionTenant = (tenant) => {
    const status = String(tenant?.status || "").toLowerCase();
    return (
      tenant?.hasDeferralRequest === true ||
      tenant?.extensionRequested === true ||
      status.includes("extension") ||
      status.includes("deferral")
    );
  };

  const isPendingCheckoutTenant = (tenant) => {
    const status = String(tenant?.status || "").toLowerCase();
    return (
      tenant?.hasMoveOutNotice === true ||
      tenant?.moveOutRequested === true ||
      status.includes("checkout") ||
      status.includes("move-out") ||
      status.includes("move out")
    );
  };

  const fetchTenants = async () => {
    try {
      const res = await getMyTenants();
      if (res.data && res.data.success) setTenants(res.data.data || []);
      else setTenants([]);
    } catch (error) {
      console.error("fetchTenants err", error);
      Swal.fire({ title: "Error", text: error.message || "Failed to load tenants", icon: "error", confirmButtonColor: "#D97706" });
    }
  };

  const fetchPgs = async () => {
    try {
      const res = await getMyPgs();
      if (res.data && res.data.success) {
        const opts = (res.data.data || []).map((p) => ({ value: p._id, label: p.pgName }));
        setPgOptions(opts);
      }
    } catch (error) {
      console.error("fetchPgs err", error);
    }
  };

  const filteredTenants = tenants.filter((t) => {
    const searchMatch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.pgName.toLowerCase().includes(search.toLowerCase());
    const pgMatch = selectedPG === "all" || t.pgId === selectedPG;
    const filterMatch =
      activeFilter === "all" ||
      (activeFilter === "extension" && isExtensionTenant(t)) ||
      (activeFilter === "checkout" && isPendingCheckoutTenant(t));
    return searchMatch && pgMatch && filterMatch;
  });

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
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          const apiRes = await apiConfirmArrival(id);
          Swal.fire({
            title: "Welcome!",
            text: apiRes.data?.message || "Arrival confirmed successfully.",
            icon: "success",
            confirmButtonColor: "#D97706"
          });
          fetchTenants();
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: error.response?.data?.message || "Failed to confirm arrival",
            icon: "error",
            confirmButtonColor: "#D97706"
          });
        }
      }
    });
  };

  const getDisplayPhone = (value) => {
    const phone = String(value || "").trim();
    if (!phone || phone.toLowerCase() === "not provided" || /^0+$/.test(phone)) {
      return "";
    }
    return phone;
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
           <p style="margin-bottom: 8px;"><b>Requested Till:</b> ${tenant.extensionUntil ? new Date(tenant.extensionUntil).toLocaleDateString() : "N/A"}</p>
           <p><b>Tenant's Reason:</b> ${tenant.extensionReason || "Not provided"}</p>
        </div>
        <p style="font-size: 12px; color: #4B4B4B; margin-top: 15px;">Late fee (₹100/day) stays paused till requested date.</p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#B45309",
      confirmButtonText: "Yes, Grant Deferral",
      cancelButtonColor: "#4B4B4B",
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          const apiRes = await apiApproveExtension(tenant._id);
          Swal.fire({
            title: "Granted",
            text: apiRes.data?.message || "Rent deferral has been activated.",
            icon: "success",
            confirmButtonColor: "#D97706"
          });
          fetchTenants();
        } catch (error) {
          Swal.fire({
            title: "Error",
            text: error.response?.data?.message || "Failed to approve extension",
            icon: "error",
            confirmButtonColor: "#D97706"
          });
        }
      }
    });
  };

  const handleCompleteMoveOut = (tenant) => {
    Swal.fire({
      title: "Finalize Move-Out",
      html: `
        <div style="text-align:left;">
          <label style="font-size:12px;font-weight:600;">Security Deposit</label>
          <input id="settlement-deposit" type="number" class="swal2-input" value="${tenant.securityDeposit || 0}" />
          <label style="font-size:12px;font-weight:600;">Damage Charges</label>
          <input id="settlement-damage" type="number" class="swal2-input" value="${tenant.damageCharges || 0}" />
          <label style="font-size:12px;font-weight:600;">Pending Fine (₹100/day rule)</label>
          <input id="settlement-fine" type="number" class="swal2-input" value="${tenant.pendingFine || 0}" />
          <textarea id="settlement-reason" class="swal2-textarea" placeholder="Deduction notes">${tenant.deductionReason || ""}</textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Complete Move-Out",
      confirmButtonColor: "#1C1C1C",
      cancelButtonColor: "#4B4B4B",
      preConfirm: () => {
        const securityDeposit = Number(document.getElementById("settlement-deposit")?.value || 0);
        const damageCharges = Number(document.getElementById("settlement-damage")?.value || 0);
        const pendingFine = Number(document.getElementById("settlement-fine")?.value || 0);
        const deductionReason = document.getElementById("settlement-reason")?.value || "";
        return { securityDeposit, damageCharges, pendingFine, deductionReason };
      }
    }).then(async (res) => {
      if (!res.isConfirmed || !res.value) return;
      try {
        const apiRes = await apiCompleteMoveOut(tenant._id, res.value);
        const finalRefund = apiRes.data?.data?.finalRefund ?? 0;
        Swal.fire({
          title: "Move-Out Completed",
          text: `Settlement saved. Final refund: ₹${finalRefund}`,
          icon: "success",
          confirmButtonColor: "#D97706"
        });
        fetchTenants();
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: error.response?.data?.message || "Failed to complete move-out",
          icon: "error",
          confirmButtonColor: "#D97706"
        });
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
      preConfirm: () => {
        const nextRoom = String(document.getElementById("swal-room")?.value || "").trim();
        if (!nextRoom) {
          Swal.showValidationMessage("Room number is required");
          return null;
        }
        return nextRoom;
      }
    }).then(async (res) => {
      if (!res.isConfirmed || !res.value) return;
      try {
        const payload = {
          name: tenant.name,
          phone: tenant.phone,
          email: tenant.email,
          pgId: tenant.pgId,
          status: tenant.status,
          room: res.value
        };
        const apiRes = await apiUpdateTenant(tenant._id, payload);
        if (apiRes.data?.success) {
          Swal.fire({
            title: "Updated",
            text: "Room info updated successfully.",
            icon: "success",
            confirmButtonColor: "#D97706"
          });
          fetchTenants();
        } else {
          Swal.fire({
            title: "Error",
            text: apiRes.data?.message || "Failed to update room info",
            icon: "error",
            confirmButtonColor: "#D97706"
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: error.response?.data?.message || error.message || "Failed to update room info",
          icon: "error",
          confirmButtonColor: "#D97706"
        });
      }
    });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Delete Tenant?',
      text: 'This will permanently remove the tenant record.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#D97706',
      cancelButtonColor: '#4B4B4B',
      confirmButtonText: 'Delete'
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          const r = await apiDeleteTenant(id);
          if (r.data && r.data.success) {
            Swal.fire({ title: 'Deleted', icon: 'success', confirmButtonColor: '#D97706' });
            fetchTenants();
          } else {
            Swal.fire({ title: 'Error', text: r.data?.message || 'Could not delete tenant', icon: 'error' });
          }
        } catch (err) {
          Swal.fire({ title: 'Error', text: err.response?.data?.message || err.message || 'Failed to delete tenant', icon: 'error' });
        }
      }
    });
  };

  return (
    <div className="p-4 md:p-10 bg-gray-200 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className=" text-[#1C1C1C]">Tenants</h2>
          <p className="text-primary">Track arrivals, active stays, and past residents.</p>
        </div>
        <CButton onClick={() => setShowAddModal(true)} text="Add New Tenant" className="flex items-center gap-2">
          <FaPlus /> Add New Tenant
        </CButton>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-4 py-2 text-xs font-bold rounded-md border transition-colors ${
            activeFilter === "all"
              ? "bg-[#D97706] text-white border-[#D97706]"
              : "bg-white text-[#4B4B4B] border-[#E5E0D9] hover:border-[#D97706]"
          }`}
        >
          All Tenants
        </button>
        <button
          onClick={() => setActiveFilter("extension")}
          className={`px-4 py-2 text-xs font-bold rounded-md border transition-colors ${
            activeFilter === "extension"
              ? "bg-[#D97706] text-white border-[#D97706]"
              : "bg-white text-[#4B4B4B] border-[#E5E0D9] hover:border-[#D97706]"
          }`}
        >
          Extension Requests
        </button>
        <button
          onClick={() => setActiveFilter("checkout")}
          className={`px-4 py-2 text-xs font-bold rounded-md border transition-colors ${
            activeFilter === "checkout"
              ? "bg-[#D97706] text-white border-[#D97706]"
              : "bg-white text-[#4B4B4B] border-[#E5E0D9] hover:border-[#D97706]"
          }`}
        >
          Pending Check-outs
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-md shadow-sm border border-[#D97706]">
        <div className="relative flex-grow mt-3 mb-3">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or PG..."
            className="w-full pl-12 pr-4 py-3 rounded-md border border-[#E5E0D9] focus:outline-none focus:ring-1 focus:ring-[#D97706] text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <CSelect
          value={selectedPG}
          onChange={(e) => setSelectedPG(e.target.value)}
          options={[{ value: "all", label: "All Properties" }, ...pgOptions]}
          className="mt-3"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E5E0D9] overflow-hidden">
        <div className="p-6 border-b border-[#E5E0D9]">
          <h2 className="text-xl font-bold text-[#1C1C1C]">Resident List</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead className="bg-primarySoft text-[#1C1C1C] text-sm uppercase font-bold">
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
                    {getDisplayPhone(t.phone) && (
                      <div className="text-xs text-[#4B4B4B]">{getDisplayPhone(t.phone)}</div>
                    )}
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
                            <button
                              onClick={() => handleCompleteMoveOut(t)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-[#1C1C1C] text-white text-[10px] font-bold rounded hover:bg-black transition-all"
                            >
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
                      
                      <button onClick={() => handleDelete(t._id)} className="p-2 text-[#4B4B4B] hover:text-red-600 rounded-full"><FaTrash size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showAddModal && (
        <AddTenant
          onClose={() => setShowAddModal(false)}
          onSave={async (form) => {
            try {
              const res = await apiAddTenant(form);
              if (res.data && res.data.success) {
                Swal.fire({ title: "Tenant added", icon: "success", confirmButtonColor: "#D97706" });
                setShowAddModal(false);
                fetchTenants();
              } else {
                Swal.fire({ title: "Error", text: res.data?.message || "Could not add tenant", icon: "error" });
              }
            } catch (err) {
              Swal.fire({ title: "Error", text: err.response?.data?.message || err.message || "Failed to add tenant", icon: "error" });
            }
          }}
          pgOptions={pgOptions}
        />
      )}
    </div>
  );
};

export default Tenants;
