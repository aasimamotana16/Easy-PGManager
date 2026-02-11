import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CInput from "../../../../components/cInput";
import CSelect from "../../../../components/cSelect";
import CButton from "../../../../components/cButton";
import CFormCard from "../../../../components/cFormCard";
import { genderOptions } from "../../../../config/staticData";
import { FaTrash, FaEye, FaFileAlt, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import Swal from "sweetalert2";

const facilitiesList = ["WiFi", "Food", "Laundry", "Parking", "Power Backup", "AC"];
const rulesList = [
  { label: "Smoking Allowed", key: "smoking" },
  { label: "Alcohol Allowed", key: "alcohol" },
  { label: "Visitors Allowed", key: "visitors" },
  { label: "Pets Allowed", key: "pets" },
];

const AddProperty = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const roomsRef = useRef(null);
  const pincodeRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    forWhom: "",
    totalRooms: "",
    description: "",
    city: "",
    area: "",
    address: "",
    pincode: "",
    facilities: [],
    rules: {
      smoking: false,
      alcohol: false,
      visitors: true,
      pets: false,
      curfew: "",
    },
    proofDocuments: {
      aadhaar: null,
      electricityBill: null,
      propertyTax: null,
    },
  });

  // Prevent scroll change on number inputs
  useEffect(() => {
    const handleWheel = (e) => {
      if (document.activeElement.type === "number") e.preventDefault();
    };
    const roomsInput = roomsRef.current;
    const pincodeInput = pincodeRef.current;
    if (roomsInput) roomsInput.addEventListener("wheel", handleWheel, { passive: false });
    if (pincodeInput) pincodeInput.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      if (roomsInput) roomsInput.removeEventListener("wheel", handleWheel);
      if (pincodeInput) pincodeInput.removeEventListener("wheel", handleWheel);
    };
  }, []);

  useEffect(() => {
    const savedData = localStorage.getItem("tempPropertyData");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFormData(prev => ({ ...prev, ...parsed, proofDocuments: prev.proofDocuments }));
    }
  }, []);

  useEffect(() => {
    const { proofDocuments, ...rest } = formData;
    localStorage.setItem("tempPropertyData", JSON.stringify(rest));
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "pincode" && value.length > 6) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const toggleFacility = (facility) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
    if (errors.facilities) setErrors(prev => ({ ...prev, facilities: null }));
  };

  const updateRule = (key, value) => {
    setFormData((prev) => ({ ...prev, rules: { ...prev.rules, [key]: value } }));
    if (key === "curfew" && errors.curfew) setErrors(prev => ({ ...prev, curfew: null }));
  };

  const handleFileChange = (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    const isDuplicate = Object.values(formData.proofDocuments).some(
      (existingFile) =>
        existingFile &&
        existingFile.name === file.name &&
        existingFile.size === file.size &&
        existingFile.lastModified === file.lastModified
    );

    if (isDuplicate) {
      Swal.fire({ title: "Duplicate File!", text: "This file is already selected.", icon: "warning", confirmButtonColor: "#D97706" });
      e.target.value = "";
      return;
    }

    setFormData(prev => ({ ...prev, proofDocuments: { ...prev.proofDocuments, [key]: file } }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
  };

  const removeFile = (key) => {
    setFormData((prev) => ({ ...prev, proofDocuments: { ...prev.proofDocuments, [key]: null } }));
  };

  const viewFile = (key) => {
    const file = formData.proofDocuments[key];
    if (file) window.open(URL.createObjectURL(file), "_blank");
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Property name is required";
    if (!formData.forWhom) newErrors.forWhom = "Please select category";
    if (!formData.totalRooms) newErrors.totalRooms = "Enter total rooms";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.area.trim()) newErrors.area = "Area is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = "Enter valid 6-digit pincode";
    if (formData.facilities.length === 0) newErrors.facilities = "Select at least one facility";
    if (!formData.rules.curfew) newErrors.curfew = "Gate closing time is required";
    if (!formData.proofDocuments.aadhaar) newErrors.aadhaar = "Aadhaar card is required";
    if (!formData.proofDocuments.electricityBill) newErrors.electricityBill = "Electricity bill is required";
    if (!formData.proofDocuments.propertyTax) newErrors.propertyTax = "Property tax receipt is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire({ title: "Form Incomplete", text: "Please fill all required fields and upload documents.", icon: "error", confirmButtonColor: "#D97706" });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    navigate("/owner/dashBoard/pgManagment/addRooms");
  };

  const ErrorLabel = ({ message }) => (
    message ? <p className="text-red-600 text-[11px] font-bold mt-1 animate-pulse">{message}</p> : null
  );

  return (
    <div className="p-4 sm:p-8 bg-gray-200 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-2">Add New Property</h1>
        <p className="text-textSecondary mb-8">Fields marked with <span className="text-red-500">*</span> are mandatory.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. BASIC DETAILS */}
          <CFormCard className="p-6 border border-primary shadow-sm bg-white">
            <h2 className="text-lg font-bold text-textPrimary mb-6 border-b pb-2 tracking-wide">BASIC DETAILS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CInput label="Property Name *" name="name" value={formData.name} onChange={handleChange} error={!!errors.name} helperText={errors.name} />
              </div>
              <div>
                <CSelect label="For *" name="forWhom" value={formData.forWhom} onChange={handleChange} options={genderOptions} error={!!errors.forWhom} helperText={errors.forWhom} />
              </div>
              <div>
                <CInput ref={roomsRef} label="Total Rooms *" type="number" name="totalRooms" value={formData.totalRooms} onChange={handleChange} placeholder="0" error={!!errors.totalRooms} helperText={errors.totalRooms} />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <CInput type="textarea" label="Description" name="description" value={formData.description} onChange={handleChange} rows={3} />
              </div>
            </div>
          </CFormCard>

          {/* 2. LOCATION DETAILS */}
          <CFormCard className="p-6 border border-primary shadow-sm bg-white">
            <h2 className="text-lg font-bold text-textPrimary mb-6 border-b pb-2 flex items-center gap-2 tracking-wide">
                <FaMapMarkerAlt className="text-primary"/> LOCATION DETAILS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <CInput label="City *" name="city" value={formData.city} onChange={handleChange} error={!!errors.city} helperText={errors.city} />
              </div>
              <div>
                <CInput label="Area / Landmark *" name="area" value={formData.area} onChange={handleChange} error={!!errors.area} helperText={errors.area} />
              </div>
              <div>
                <CInput ref={pincodeRef} label="Pincode *" type="number" name="pincode" value={formData.pincode} onChange={handleChange} error={!!errors.pincode} helperText={errors.pincode} />
              </div>
              <div className="md:col-span-3">
                <CInput type="textarea" label="Full Address *" name="address" value={formData.address} onChange={handleChange} rows={2} error={!!errors.address} helperText={errors.address} />
              </div>
            </div>
          </CFormCard>

          {/* 3. FACILITIES */}
          <CFormCard className="p-6 border border-primary shadow-sm bg-white">
            <h2 className="text-lg font-bold text-textPrimary mb-6 border-b pb-2 tracking-wide">FACILITIES <span className="text-red-500 text-sm">*</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {facilitiesList.map((item) => (
                <label key={item} className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.facilities.includes(item) ? 'bg-primarySoft border-primary text-primaryDark' : 'bg-white border-border hover:border-primary/30'}`}>
                  <input type="checkbox" className="accent-primary w-4 h-4" checked={formData.facilities.includes(item)} onChange={() => toggleFacility(item)} />
                  <span className="text-sm font-bold uppercase">{item}</span>
                </label>
              ))}
            </div>
            <ErrorLabel message={errors.facilities} />
          </CFormCard>

          {/* 4. RULES */}
          <CFormCard className="p-6 border border-primary shadow-sm bg-white">
            <h2 className="text-lg font-bold text-textPrimary mb-6 border-b pb-2 tracking-wide">RULES & GATE TIMING</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="grid grid-cols-2 gap-3">
                {rulesList.map((rule) => (
                  <label key={rule.key} className={`flex items-center gap-3 p-3 rounded-lg border ${formData.rules[rule.key] ? 'bg-primarySoft border-primary/50' : 'bg-white border-border'}`}>
                    <input type="checkbox" className="accent-primary w-4 h-4" checked={formData.rules[rule.key]} onChange={(e) => updateRule(rule.key, e.target.checked)} />
                    <span className="text-sm font-semibold">{rule.label}</span>
                  </label>
                ))}
              </div>
              <div className="max-w-xs">
                <CInput type="time" label="Gate Closing Time *" value={formData.rules.curfew} onChange={(e) => updateRule("curfew", e.target.value)} error={!!errors.curfew} helperText={errors.curfew} />
              </div>
            </div>
          </CFormCard>

          {/* 5. DOCUMENTS */}
          <CFormCard className="p-6 border border-primary shadow-sm bg-white">
            <h2 className="text-lg font-bold text-textPrimary mb-6 border-b pb-2 tracking-wide">VERIFICATION DOCUMENTS</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { key: "aadhaar", label: "Owner Aadhaar Card *" },
                { key: "electricityBill", label: "Electricity Bill *" },
                { key: "propertyTax", label: "Property Tax Receipt *" }
              ].map((doc) => (
                <div key={doc.key} className="flex flex-col">
                  <label className="block text-xs font-bold text-textSecondary mb-3 uppercase tracking-wider">{doc.label}</label>
                  {!formData.proofDocuments[doc.key] ? (
                    <div className="relative group">
                      <input type="file" id={`file-${doc.key}`} accept=".pdf,image/*" onChange={(e) => handleFileChange(e, doc.key)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className={`p-4 bg-gray-50 rounded-lg border-2 border-dashed ${errors[doc.key] ? 'border-red-400' : 'border-border'} group-hover:border-primary group-hover:bg-primarySoft/30 transition-all duration-200 flex flex-col items-center justify-center min-h-[100px]`}>
                         <div className="bg-primary text-white px-4 py-2 rounded-md text-sm font-bold shadow-sm group-hover:scale-105 transition-transform">Choose File</div>
                         <p className="text-[10px] text-textSecondary mt-2">No file chosen</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border-2 border-primary/30 shadow-sm">
                      <div className="flex items-center gap-2 overflow-hidden text-textPrimary">
                        <FaFileAlt className="text-primary flex-shrink-0" />
                        <span className="text-[10px] font-bold truncate">{formData.proofDocuments[doc.key].name}</span>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => viewFile(doc.key)} className="p-1.5 text-primary hover:bg-primarySoft rounded-full"><FaEye size={16}/></button>
                        <button type="button" onClick={() => removeFile(doc.key)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-full"><FaTrash size={16}/></button>
                      </div>
                    </div>
                  )}
                  <ErrorLabel message={errors[doc.key]} />
                </div>
              ))}
            </div>
          </CFormCard>

          <div className="text-center pb-10">
            <CButton size="lg" type="submit" className="px-16 py-4 text-xl">Save & Proceed to Rooms</CButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;