import React, { useState, useEffect } from "react";
import CButton from "../../../components/cButton";
import { getOwnerContactData } from "../../../api/api";
import {
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaBuilding,
  FaMapMarkerAlt,
  FaCheckCircle,
} from "react-icons/fa";

const OwnerContact = () => {
  const [ownerData, setOwnerData] = useState({
    name: "Loading...",
    phone: "",
    email: "",
    pgName: "",
    address: "",
  });

  useEffect(() => {
    const fetchOwnerDetails = async () => {
      try {
        const res = await getOwnerContactData();
        if (res.data.success && res.data.data) {
          const d = res.data.data;
          setOwnerData({
            name: d.ownerName || "Not Assigned",
            phone: d.phone || "Not Set",
            email: d.email || "Not Set",
            pgName: d.pgName || "No PG Booked",
            address: d.pgAddress || "Not Set",
          });
        }
      } catch (error) {
        console.error("Error fetching owner contact:", error);
        setOwnerData((prev) => ({ ...prev, name: "Error loading data" }));
      }
    };
    fetchOwnerDetails();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-10 bg-gray-50 min-h-screen space-y-8 lg:space-y-12">
      
      {/* HEADER - Matched to Timeline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-xl md:text-3xl lg:text-4xl font-black uppercase tracking-tight flex items-center gap-3 text-gray-800">
             Owner Contact
          </h1>
          <p className="text-[10px] md:text-sm lg:text-lg text-gray-700 uppercase ">
            Property Management & Support Details
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm self-start">
          <FaCheckCircle className="text-green-500" />
          <span className="text-[10px] md:text-xs font-black uppercase text-green-700 tracking-tighter">
            Verified Profile
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        
        {/* LEFT COLUMN: QUICK ACTIONS */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-4">
          <h3 className="text-base md:text-3xl lg:text-xl font-black uppercase tracking-tight text-gray-800 mb-6">
            Quick Connect
          </h3>
          
          <CButton
            className="w-full bg-orange-500 text-white py-4 rounded-2xl flex items-center justify-center gap-3 text-xs md:text-2xl lg:text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
            onClick={() => { window.location.href = `tel:${ownerData.phone}`; }}
          >
            <FaPhoneAlt /> Call Owner
          </CButton>

          <CButton
            className="w-full bg-black text-white py-4 rounded-2xl flex items-center justify-center gap-3 text-xs  md:text-2xl lg:text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10"
            onClick={() => { window.location.href = `mailto:${ownerData.email}`; }}
          >
            <FaEnvelope /> Email Owner
          </CButton>

          <p className="text-[9px] font-bold text-gray-400 text-center uppercase mt-6 tracking-widest">
            Available for urgent queries
          </p>
        </div>

        {/* RIGHT COLUMN: DETAILS CARD - Matched to Timeline Data Style */}
        <div className="lg:col-span-8 md:text-4xl lg:text-lg bg-white rounded-md border border-gray-100 shadow-sm p-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <Info icon={<FaUser />} label="Owner Name" value={ownerData.name} />
            <Info icon={<FaPhoneAlt />} label="Phone Number" value={ownerData.phone} />
            <Info icon={<FaEnvelope />} label="Email Address" value={ownerData.email} />
            <Info icon={<FaBuilding />} label="PG Name" value={ownerData.pgName} />
            <Info
              icon={<FaMapMarkerAlt />}
              label="Property Location"
              value={ownerData.address}
              className="md:col-span-2 border-l-4 border-orange-500 pl-6 bg-gray-50/50 py-4 rounded-r-md"
            />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-md border border-gray-100 shadow-sm">
           <div className="w-2 h-2 rounded-md bg-green-500 animate-pulse"></div>
           <span className="text-[9px] md:text-xs font-black uppercase text-gray-400 tracking-widest">
             End-to-end encrypted contact information
           </span>
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value, icon, className = "" }) => (
  <div className={`flex flex-col gap-1.5 group transition-all ${className}`}>
    <div className="flex items-center gap-2 text-gray-400 group-hover:text-orange-500 transition-colors">
      <span className="text-xs lg:text-sm">{icon}</span>
      <p className="text-[9px] md:text-[11px] lg:text-[12px] font-black uppercase tracking-widest">
        {label}
      </p>
    </div>
    <p className="text-sm md:text-lg lg:text-2xl font-black text-gray-900 break-words leading-tight">
      {value || "---"}
    </p>
  </div>
);

export default OwnerContact;