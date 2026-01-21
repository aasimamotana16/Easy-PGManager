import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CInput from "../../../../components/cInput";
import CSelect from "../../../../components/cSelect";
import CButton from "../../../../components/cButton";
import CFormCard from "../../../../components/cFormCard";
import { genderOptions, propertyTypes } from "../../../../config/staticData";
import { FaTrash, FaEye } from "react-icons/fa";

const facilitiesList = ["WiFi", "Food", "Laundry", "Parking", "Power Backup", "AC"];
const rulesList = [
  { label: "Smoking Allowed", key: "smoking" },
  { label: "Alcohol Allowed", key: "alcohol" },
  { label: "Visitors Allowed", key: "visitors" },
  { label: "Pets Allowed", key: "pets" },
];

const AddProperty = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    propertyType: "",
    forWhom: "",
    totalFloors: "",
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

  const validateForm = () => {
    if (!formData.name.trim()) return "Property Name is required";
    if (!formData.propertyType) return "Property Type is required";
    if (!formData.forWhom) return "Please select For whom";
    if (!formData.description.trim()) return "Description is required";
    if (!formData.city.trim()) return "City is required";
    if (!formData.address.trim()) return "Full Address is required";
    if (!/^\d{6}$/.test(formData.pincode)) return "Enter valid 6 digit Pincode";
    if (formData.facilities.length === 0) return "Select at least one Facility";
    if (!formData.rules.curfew) return "Curfew Time is required";
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleFacility = (facility) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
  };

  const updateRule = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      rules: { ...prev.rules, [key]: value },
    }));
  };

  const handleFileChange = (e, key) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        proofDocuments: { ...prev.proofDocuments, [key]: e.target.files[0] },
      }));
    }
  };

  const removeFile = (key) => {
    setFormData((prev) => ({
      ...prev,
      proofDocuments: { ...prev.proofDocuments, [key]: null },
    }));
  };

  const viewFile = (key) => {
    if (formData.proofDocuments[key]) {
      const fileURL = URL.createObjectURL(formData.proofDocuments[key]);
      window.open(fileURL);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const dataToSend = {
        pgName: formData.name,
        location: `${formData.area}, ${formData.city}`,
        totalRooms: 0,
        propertyType: formData.propertyType,
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
        alert("Property saved successfully!");
        navigate("/owner/dashBoard/pgManagment/addRooms", {
          state: { propertyData: formData, pgId: response.data.data._id },
        });
      }
    } catch (err) {
      console.error("Submission Error:", err);
      alert("Failed to save property.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">

        {/* PAGE HEADER */}
        <h1 className="text-3xl font-bold text-primary mb-2">
          Add New Property
        </h1>
        <p className="text-gray-500 mb-8">
          Enter property details to list your PG
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* BASIC DETAILS */}
          <CFormCard className="p-6 shadow">
            <h2 className="text-lg font-semibold mb-6">Basic Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CInput label="Property Name" name="name" value={formData.name} onChange={handleChange} />
              <CSelect label="Property Type" name="propertyType" value={formData.propertyType} onChange={handleChange} options={propertyTypes} />
              <CSelect label="For" name="forWhom" value={formData.forWhom} onChange={handleChange} options={genderOptions} />
              <CInput label="Total Floors" type="number" name="totalFloors" value={formData.totalFloors} onChange={handleChange} />
              <div className="md:col-span-2">
                <CInput type="textarea" label="Description" name="description" value={formData.description} onChange={handleChange} rows={4} />
              </div>
            </div>
          </CFormCard>

          {/* LOCATION */}
          <CFormCard className="p-6 shadow">
            <h2 className="text-lg font-semibold mb-6">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CInput label="City" name="city" value={formData.city} onChange={handleChange} />
              <CInput label="Area" name="area" value={formData.area} onChange={handleChange} />
              <div className="md:col-span-2">
                <CInput type="textarea" label="Full Address" name="address" value={formData.address} onChange={handleChange} rows={3} />
              </div>
              <CInput label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
            </div>
          </CFormCard>

          {/* FACILITIES */}
          <CFormCard className="p-6 shadow">
            <h2 className="text-lg font-semibold mb-4">Facilities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {facilitiesList.map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.facilities.includes(item)} onChange={() => toggleFacility(item)} />
                  {item}
                </label>
              ))}
            </div>
          </CFormCard>

          {/* RULES */}
          <CFormCard className="p-6 shadow">
            <h2 className="text-lg font-semibold mb-4">Rules & Curfew</h2>
            <div className="space-y-3">
              {rulesList.map((rule) => (
                <label key={rule.key} className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.rules[rule.key]} onChange={(e) => updateRule(rule.key, e.target.checked)} />
                  {rule.label}
                </label>
              ))}
              <CInput type="time" label="Curfew Time" value={formData.rules.curfew} onChange={(e) => updateRule("curfew", e.target.value)} />
            </div>
          </CFormCard>

          {/* DOCUMENTS */}
          <CFormCard className="p-6 shadow">
            <h2 className="text-lg font-semibold mb-4">Property Documents</h2>
            {["aadhaar", "electricityBill", "propertyTax"].map((key) => (
              <div key={key} className="flex items-center gap-4 mb-3">
                <input type="file" onChange={(e) => handleFileChange(e, key)} disabled={!!formData.proofDocuments[key]} />
                {formData.proofDocuments[key] && (
                  <>
                    <button type="button" onClick={() => viewFile(key)}><FaEye /></button>
                    <button type="button" onClick={() => removeFile(key)}><FaTrash /></button>
                  </>
                )}
              </div>
            ))}
          </CFormCard>

          <div className="text-center pt-4">
            <CButton size="lg" type="submit">Save & Continue</CButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;
