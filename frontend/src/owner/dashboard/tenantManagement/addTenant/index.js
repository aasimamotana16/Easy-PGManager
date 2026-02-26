import React, { useState } from "react";
import { FaTimes, FaUser, FaPhone, FaEnvelope, FaDoorOpen, FaCalendarAlt } from "react-icons/fa";
import CButton from "../../../../components/cButton";
import CInput from "../../../../components/cInput";
import CSelect from "../../../../components/cSelect";

const AddTenant = ({ onClose, onSave, pgOptions = [] }) => {
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
    if (!form.name.trim()) tempErrors.name = "Full name is required";
    if (!form.phone.trim() || form.phone.length < 10) tempErrors.phone = "Phone number is required";
    if (!form.email.match(/.+@.+\..+/)) tempErrors.email = "Email is required";
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose}></div>

      {/* MODAL CONTAINER */}
      <div className="bg-white rounded-2xl shadow-2xl z-10 w-full max-w-lg max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in duration-200 border border-border">
        
        {/* HEADER */}
        <div className="relative bg-primary shrink-0 px-5 sm:px-6 py-5 sm:py-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-textLight/90 hover:text-white transition-colors"
            aria-label="Close"
            type="button"
          >
            <FaTimes size={20} />
          </button>

          <div className="pr-10">
            <h2 className="text-textLight uppercase font-black tracking-tight text-3xl sm:text-4xl leading-tight">
              ADD TENANT
            </h2>
            <p className="text-white/90 font-medium text-sm sm:text-base leading-snug mt-2">
              Register a new tenant to your PG and manage their stay effectively
            </p>
          </div>
        </div>

        {/* BODY */}
        <div className="p-5 sm:p-8 space-y-5 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* FULL NAME */}
            <div className="sm:col-span-2">
              <CInput
                label="Full Name"
                icon={<FaUser className="text-primary" />}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={!!errors.name} 
                helperText={errors.name} // Integrated
              />
            </div>

            {/* PHONE NUMBER */}
            <div>
              <CInput
                label="Phone Number"
                icon={<FaPhone className="text-primary" />}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                error={!!errors.phone}
                helperText={errors.phone} // Integrated
              />
            </div>

            {/* EMAIL */}
            <div>
              <CInput
                label="Email"
                icon={<FaEnvelope className="text-primary" />}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                error={!!errors.email}
                helperText={errors.email} // Integrated
              />
            </div>

            {/* PG SELECT */}
            <div>
              <CSelect
                label="Select PG"
                value={form.pgId}
                onChange={(e) => setForm({ ...form, pgId: e.target.value })}
                options={pgOptions}
                error={!!errors.pgId}
                helperText={errors.pgId} // Integrated
              />
            </div>

            {/* ROOM NO */}
            <div>
              <CInput
                label="Room No."
                icon={<FaDoorOpen className="text-primary" />}
className="mt-6"
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                error={!!errors.room}
                helperText={errors.room} // Integrated
              />
            </div>

            {/* JOINING DATE */}
            <div className="sm:col-span-2">
              <label className="text-[10px] sm:text-[11px] font-bold text-textSecondary uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <FaCalendarAlt size={10} className="text-primary" /> Joining Date
              </label>
              <input
                type="date"
                className={`w-full border rounded-md p-3 text-sm outline-none transition-all ${
                  errors.name ? 'border-red-500' : 'border-border focus:border-primary'
                }`}
                value={form.joiningDate}
                onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-5 sm:p-6 bg-primarySoft/30 border-t border-border flex flex-col-reverse sm:flex-row justify-center gap-3 sm:gap-4 shrink-0">
          <CButton onClick={onClose} variant="outlined" className="w-full sm:flex-1">Cancel</CButton>
          <CButton onClick={handleSubmit} className="w-full sm:flex-[2] py-2.5 sm:py-3 !font-bold shadow-lg shadow-primary/20">
            Register Tenant
          </CButton>
        </div>
      </div>
    </div>
  );
};

export default AddTenant;
