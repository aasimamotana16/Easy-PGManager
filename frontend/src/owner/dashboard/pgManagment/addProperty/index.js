import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CInput from "../../../../components/cInput";
import CSelect from "../../../../components/cSelect";
import CButton from "../../../../components/cButton";
import CFormCard from "../../../../components/cFormCard";
import { genderOptions } from "../../../../config/staticData";
import { FaTrash, FaEye, FaFileAlt } from "react-icons/fa";
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

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Property Name is required";
    if (!formData.forWhom) newErrors.forWhom = "Please select gender preference";
    if (!formData.totalRooms) newErrors.totalRooms = "Total Rooms is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.address.trim()) newErrors.address = "Full Address is required";
    if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = "Enter a valid 6-digit Pincode";
    if (formData.facilities.length === 0) newErrors.facilities = "Select at least one facility";
    if (!formData.rules.curfew) newErrors.curfew = "Gate closing time is required";
    if (!formData.proofDocuments.aadhaar) newErrors.aadhaar = "Aadhaar Card is required";
    if (!formData.proofDocuments.electricityBill) newErrors.electricityBill = "Electricity Bill is required";
    if (!formData.proofDocuments.propertyTax) newErrors.propertyTax = "Property Tax Receipt is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "pincode" && value.length > 6) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const toggleFacility = (facility) => {
    setFormData((prev) => {
      const updated = prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility];
      return { ...prev, facilities: updated };
    });
    setErrors(prev => ({ ...prev, facilities: null }));
  };

  const updateRule = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      rules: { ...prev.rules, [key]: value },
    }));
    if (key === "curfew") setErrors(prev => ({ ...prev, curfew: null }));
  };

  const handleFileChange = (e, key) => {
    const newFile = e.target.files[0];
    if (!newFile) return;

    const isDuplicate = Object.values(formData.proofDocuments).some((existingFile) => {
      if (!existingFile) return false;
      return existingFile.name === newFile.name && existingFile.size === newFile.size;
    });

    if (isDuplicate) {
      setErrors(prev => ({ ...prev, [key]: "This file is already uploaded" }));
      e.target.value = ""; 
      return;
    }

    setFormData((prev) => ({
      ...prev,
      proofDocuments: { ...prev.proofDocuments, [key]: newFile },
    }));
    setErrors(prev => ({ ...prev, [key]: null }));
  };

  const removeFile = (key) => {
    setFormData((prev) => ({
      ...prev,
      proofDocuments: { ...prev.proofDocuments, [key]: null },
    }));
  };

  const viewFile = (key) => {
    const file = formData.proofDocuments[key];
    if (!file) return;
    window.open(URL.createObjectURL(file), "_blank");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const token = localStorage.getItem("userToken");
      const dataToSend = {
        pgName: formData.name,
        location: `${formData.area}, ${formData.city}`,
        price: 5000, 
        totalRooms: parseInt(formData.totalRooms) || 0,
        forWhom: formData.forWhom,
        facilities: formData.facilities,
        rules: formData.rules,
      };

      const response = await axios.post(
        "http://localhost:5000/api/owner/add-pg",
        dataToSend,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        localStorage.removeItem("tempPropertyData");
        Swal.fire({ title: "Success!", text: "Property saved!", icon: "success", timer: 1500, showConfirmButton: false });
        navigate("/owner/dashBoard/pgManagment/addRooms", {
          state: { propertyData: formData, pgId: response.data.data._id },
        });
      }
    } catch (err) {
      Swal.fire({ title: "Error!", text: "Submission failed.", icon: "error" });
    }
  };

  const ErrorMsg = ({ name }) => (
    errors[name] ? <p className="text-red-500 text-xs mt-1 font-bold animate-pulse">{errors[name]}</p> : null
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-2">Add New Property</h1>
        <p className="text-gray-500 mb-8">All fields are required unless stated otherwise.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* BASIC DETAILS */}
          <CFormCard className="p-6 shadow-md border-t-4 border-primary">
            <h2 className="text-lg font-semibold mb-6 border-b pb-2">Basic Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <CInput label="Property Name" name="name" value={formData.name} onChange={handleChange} />
                <ErrorMsg name="name" />
              </div>
              <div>
                <CSelect label="For" name="forWhom" value={formData.forWhom} onChange={handleChange} options={genderOptions} />
                <ErrorMsg name="forWhom" />
              </div>
              <div>
                <CInput label="Total Rooms" type="number" name="totalRooms" value={formData.totalRooms} onChange={handleChange} />
                <ErrorMsg name="totalRooms" />
              </div>
              <div className="md:col-span-2">
                <CInput type="textarea" label="Description" name="description" value={formData.description} onChange={handleChange} rows={4} />
                <ErrorMsg name="description" />
              </div>
            </div>
          </CFormCard>

          {/* FACILITIES */}
          <CFormCard className="p-6 shadow-md border-t-4 border-primary">
            <h2 className="text-lg font-semibold mb-4">Facilities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {facilitiesList.map((item) => (
                <label key={item} className={`flex items-center gap-2 cursor-pointer p-3 rounded-md border transition-all ${formData.facilities.includes(item) ? 'bg-orange-50 border-orange-400' : 'bg-white border-gray-200 hover:border-orange-300'}`}>
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 cursor-pointer accent-orange-600" 
                    checked={formData.facilities.includes(item)} 
                    onChange={() => toggleFacility(item)} 
                  />
                  <span className="text-gray-700 font-medium cursor-pointer">{item}</span>
                </label>
              ))}
            </div>
            <ErrorMsg name="facilities" />
          </CFormCard>

          {/* RULES */}
          <CFormCard className="p-6 shadow-md border-t-4 border-primary">
            <h2 className="text-lg font-semibold mb-4">Rules & Gate Timing</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rulesList.map((rule) => (
                  <label key={rule.key} className={`flex items-center gap-3 cursor-pointer p-3 rounded-md border transition-all ${formData.rules[rule.key] ? 'bg-orange-50 border-orange-400' : 'bg-white border-gray-200 hover:border-orange-300'}`}>
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 cursor-pointer accent-orange-600" 
                      checked={formData.rules[rule.key]} 
                      onChange={(e) => updateRule(rule.key, e.target.checked)} 
                    />
                    <span className="text-gray-700 font-medium cursor-pointer">{rule.label}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4 max-w-xs">
                <CInput type="time" label="Gate Closing Time" value={formData.rules.curfew} onChange={(e) => updateRule("curfew", e.target.value)} />
                <ErrorMsg name="curfew" />
              </div>
            </div>
          </CFormCard>

          {/* DOCUMENTS */}
          <CFormCard className="p-6 shadow-md border-t-4 border-primary">
            <h2 className="text-lg font-semibold mb-4">Upload Verification Documents</h2>
            <div className="grid grid-cols-1 gap-6">
              {[
                { key: "aadhaar", label: "Owner Aadhaar Card (PDF/Image)" },
                { key: "electricityBill", label: "Electricity Bill (Latest)" },
                { key: "propertyTax", label: "Property Tax Receipt" }
              ].map((doc) => (
                <div key={doc.key} className="p-4 bg-gray-50 rounded-md border-2 border-dashed border-gray-300">
                  <label className="block text-sm font-bold text-gray-700 mb-2">{doc.label}</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      {!formData.proofDocuments[doc.key] ? (
                        <input
                          type="file"
                          accept=".pdf, .jpg, .jpeg, .png"
                          onChange={(e) => handleFileChange(e, doc.key)}
                          className="block w-full text-sm text-gray-500 cursor-pointer
                            file:mr-4 file:py-2 file:px-4 
                            file:rounded file:border-0 
                            file:text-sm file:font-semibold 
                            file:bg-primary file:text-white 
                            file:cursor-pointer hover:file:bg-primary
                            cursor-pointer"
                        />
                      ) : (
                        <div className="flex items-center justify-between w-full bg-white px-4 py-2 rounded-md border border-primary shadow-sm">
                          <div className="flex items-center gap-3">
                            <FaFileAlt className="text-primary" />
                            <span className="text-sm font-semibold text-gray-800">{formData.proofDocuments[doc.key].name}</span>
                          </div>
                          <div className="flex gap-3">
                            <button type="button" className="p-2 text-blue-600 hover:bg-blue-50 rounded" onClick={() => viewFile(doc.key)}><FaEye /></button>
                            <button type="button" className="p-2 text-red-500 hover:bg-red-50 rounded" onClick={() => removeFile(doc.key)}><FaTrash /></button>
                          </div>
                        </div>
                      )}
                    </div>
                    <ErrorMsg name={doc.key} />
                  </div>
                </div>
              ))}
            </div>
          </CFormCard>

          <div className="text-center pt-6">
            <CButton size="lg" type="submit" className=" text-white px-12 py-4 text-xl">
              Save & Proceed to Rooms
            </CButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;