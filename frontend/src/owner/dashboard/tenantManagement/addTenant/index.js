import React, { useState } from "react";
import { FaTimes, FaUser, FaPhone, FaEnvelope, FaDoorOpen, FaCalendarAlt, FaBuilding } from "react-icons/fa";
import CButton from "../../../../components/cButton";
import CInput from "../../../../components/cInput";

const PG_LIST = [
  { id: 1, name: "Green Villa" },
  { id: 2, name: "Sunshine Residency" },
  { id: 3, name: "Metro Living" },
];

const AddTenant = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    pgId: "",
    room: "",
    joiningDate: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let tempErrors = {};
    if (!form.name.trim()) tempErrors.name = "Name is required";
    if (!form.phone.trim() || form.phone.length < 10) tempErrors.phone = "Enter a valid 10-digit number";
    if (!form.email.match(/.+@.+\..+/)) tempErrors.email = "Enter a valid email address";
    if (!form.pgId) tempErrors.pgId = "Please select a PG";
    if (!form.room.trim()) tempErrors.room = "Room number is required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(form);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] p-2 sm:p-4">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      ></div>

      {/* MODAL CONTAINER */}
      <div className="bg-white rounded-2xl shadow-2xl z-10 w-full max-w-lg max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in duration-200 border border-border">
        
        {/* HEADER - Sticky at top */}
        <div className="relative flex items-center justify-center p-5 sm:p-6 bg-primary shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 sm:p-2.5 rounded-lg text-textLight">
              <FaUser size={18} className="sm:size-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-textLight uppercase tracking-tight">
                Add Tenant
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-light/80 hover:text-text-light transition-all"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* BODY - Scrollable for small screens */}
        <div className="p-5 sm:p-8 space-y-5 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* FULL NAME */}
            <div className="sm:col-span-2">
              <CInput
                label="Full Name"
                icon={<FaUser className="text-primary" />}
                placeholder="Enter tenant name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={errors.name}
              />
            </div>

            {/* PHONE NUMBER */}
            <CInput
              label="Phone Number"
              icon={<FaPhone className="text-primary" />}
              placeholder="10-digit number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
              error={errors.phone}
              maxLength={10}
            />

            {/* EMAIL */}
            <CInput
              label="Email"
              icon={<FaEnvelope className="text-primary" />}
              placeholder="email@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
            />

            {/* PG SELECT */}
            <div className="flex flex-col">
              <label className="text-[10px] sm:text-[11px] font-bold text-text-secondary uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <FaBuilding size={10} className="text-primary" /> Select PG
              </label>
              <div className="relative">
                <select
                    className={`w-full border rounded-xl p-3 text-sm outline-none bg-background-default transition-all appearance-none text-text-primary ${errors.pgId ? 'border-red-500' : 'border-border focus:border-primary'}`}
                    value={form.pgId}
                    onChange={(e) => setForm({ ...form, pgId: parseInt(e.target.value) })}
                >
                    <option value="">Choose Property</option>
                    {PG_LIST.map((pg) => (
                    <option key={pg.id} value={pg.id}>{pg.name}</option>
                    ))}
                </select>
                {/* Custom arrow for select since appearance-none is used */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary opacity-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              {errors.pgId && <p className="text-[10px] text-red-500 mt-1">{errors.pgId}</p>}
            </div>

            {/* ROOM NO */}
            <CInput
              label="Room No."
              icon={<FaDoorOpen className="text-primary" />}
              placeholder="e.g. 104-B"
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
              error={errors.room}
            />

            {/* JOINING DATE */}
            <div className="sm:col-span-2">
              <label className="text-[10px] sm:text-[11px] font-bold text-text-secondary uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <FaCalendarAlt size={10} className="text-primary" /> Joining Date
              </label>
              <input
                type="date"
                className="w-full border border-border rounded-xl p-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primarySoft transition-all text-text-primary bg-background-default"
                value={form.joiningDate}
                onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* FOOTER - Sticky at bottom */}
        <div className="p-5 sm:p-6 bg-primarySoft/30 border-t border-border flex flex-col-reverse sm:flex-row justify-center gap-3 sm:gap-4 shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:flex-1 px-6 py-2.5 sm:py-3 bg-background-default border border-border rounded-xl font-bold text-text-secondary hover:bg-primarySoft transition-colors shadow-sm text-sm"
          >
            Cancel
          </button>
          <CButton
            onClick={handleSubmit}
            className="w-full sm:flex-[2] py-2.5 sm:py-3 !font-bold shadow-lg shadow-primary/20 text-sm sm:text-base"
          >
            Register Tenant
          </CButton>
        </div>
      </div>
    </div>
  );
};

export default AddTenant;