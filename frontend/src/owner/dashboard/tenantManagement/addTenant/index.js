import React, { useState } from "react";
import { FaTimes, FaUser, FaPhone, FaEnvelope, FaDoorOpen, FaCalendarAlt, FaBuilding } from "react-icons/fa";
import CButton from "../../../../components/cButton";
import CInput from "../../../../components/cInput";

// Example PGs list
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
    <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      ></div>

      {/* MODAL */}
      <div className="bg-white rounded-2xl shadow-2xl z-10 w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
        
        {/* HEADER - BACKGROUND AS PRIMARY */}
        <div className="relative flex items-center justify-center p-6 bg-[#ef7e24]">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-lg text-white">
              <FaUser size={22} />
            </div>
            <h2 className="text-2xl font-bold text-white">Add New Tenant</h2>
          </div>
          <button 
            onClick={onClose} 
            className="absolute right-5 top-6 text-white/80 hover:text-white transition-all"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* FULL NAME */}
            <div className="md:col-span-2">
              <CInput
                label="Full Name"
                icon={<FaUser />}
                placeholder="Enter tenant name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={errors.name}
              />
            </div>

            {/* PHONE NUMBER */}
            <CInput
              label="Phone Number"
              icon={<FaPhone />}
              placeholder="10-digit number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
              error={errors.phone}
              maxLength={10}
            />

            {/* EMAIL */}
            <CInput
              label="Email"
              icon={<FaEnvelope />}
              placeholder="email@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
            />

            {/* PG SELECT */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <FaBuilding size={10} /> Select PG
              </label>
              <select
                className={`w-full border rounded-xl p-3 text-sm outline-none bg-white transition-all appearance-none ${errors.pgId ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#ef7e24]'}`}
                value={form.pgId}
                onChange={(e) => setForm({ ...form, pgId: parseInt(e.target.value) })}
              >
                <option value="">Choose Property</option>
                {PG_LIST.map((pg) => (
                  <option key={pg.id} value={pg.id}>{pg.name}</option>
                ))}
              </select>
              {errors.pgId && <p className="text-[10px] text-red-500 mt-1">{errors.pgId}</p>}
            </div>

            {/* ROOM NO */}
            <CInput
              label="Room No."
              icon={<FaDoorOpen />}
              placeholder="e.g. 104-B"
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
              error={errors.room}
            />

            {/* JOINING DATE */}
            <div className="md:col-span-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <FaCalendarAlt size={10} /> Joining Date
              </label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#ef7e24] focus:ring-4 focus:ring-orange-50 transition-all"
                value={form.joiningDate}
                onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 bg-gray-50/50 border-t flex flex-col-reverse sm:flex-row justify-center gap-4">
          <button
            onClick={onClose}
            className="w-full sm:w-1/3 px-6 py-3 bg-white border border-gray-200 rounded-md font-bold hover:bg-gray-100 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <CButton
            onClick={handleSubmit}
            className="w-full sm:w-2/3 py-3  !font-bold shadow-lg shadow-orange-100"
          >
            Register Tenant
          </CButton>
        </div>
      </div>
    </div>
  );
};

export default AddTenant;