import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  // 🔒 validation helper
  const validateForm = () => {
    if (!formData.name.trim()) return "Property Name is required";
    if (!formData.propertyType) return "Property Type is required";
    if (!formData.forWhom) return "Please select For whom";
    if (!formData.totalFloors || formData.totalFloors <= 0)
      return "Enter valid Total Floors";
    if (!formData.description.trim())
      return "Description is required";

    if (!formData.city.trim()) return "City is required";
    if (!formData.address.trim()) return "Full Address is required";
    if (!/^\d{6}$/.test(formData.pincode))
      return "Enter valid 6 digit Pincode";

    if (formData.facilities.length === 0)
      return "Select at least one Facility";

    if (!formData.rules.curfew)
      return "Curfew Time is required";

    if (!formData.proofDocuments.aadhaar)
      return "Aadhaar document required";
    if (!formData.proofDocuments.electricityBill)
      return "Electricity Bill required";
    if (!formData.proofDocuments.propertyTax)
      return "Property Tax document required";

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

  const handleSubmit = (e) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      alert(error); // ⛔ stop submit
      return;
    }

    console.log("ADD PROPERTY DATA 👉", formData);

    navigate("/owner/dashBoard/pgManagment/addRooms", {
      state: { propertyData: formData },
    });
  };

  return (
    <div className="max-w-6xl mx-auto my-6 font-sans px-2">
      <h2 className="text-center text-3xl font-bold text-amber-600 mb-8">
        Add New Property
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ======= First Row ======= */}
        <div className="flex flex-wrap gap-6 items-stretch">
          <div className="flex-1 min-w-[350px]">
            <CFormCard className="border border-gray-400 h-full relative">
              <span className="absolute -top-3 left-4 bg-white px-2 font-semibold text-gray-700">
                Basic Details
              </span>
              <div className="mt-4 space-y-3">
                <CInput label="Property Name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter property name" required />
                <CSelect label="Property Type" name="propertyType" value={formData.propertyType} onChange={handleChange} options={propertyTypes} required />
                <CSelect label="For" name="forWhom" value={formData.forWhom} onChange={handleChange} options={genderOptions} required />
                <CInput label="Total Floors" type="number" name="totalFloors" value={formData.totalFloors} onChange={handleChange} />
                <CInput type="textarea" label="Description" name="description" value={formData.description} onChange={handleChange} rows={6} placeholder="Enter property description" />
              </div>
            </CFormCard>
          </div>

          <div className="flex-1 min-w-[400px]">
            <CFormCard className="border border-gray-400 h-full relative">
              <span className="absolute -top-3 left-4 bg-white px-2 font-semibold text-gray-700">
                Location
              </span>
              <div className="mt-4 space-y-3">
                <CInput label="City" name="city" value={formData.city} onChange={handleChange} required />
                <CInput label="Area" name="area" value={formData.area} onChange={handleChange} />
                <CInput type="textarea" label="Full Address" name="address" value={formData.address} onChange={handleChange} rows={4} required />
                <CInput label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
              </div>
            </CFormCard>
          </div>
        </div>

        {/* ======= Second Row ======= */}
        <div className="flex flex-wrap gap-6 items-stretch">
          <div className="flex-1 min-w-[350px]">
            <CFormCard className="border border-gray-400 h-full relative">
              <span className="absolute -top-3 left-4 bg-white px-2 font-semibold text-gray-700">
                Facilities
              </span>
              <div className="mt-4">
                {facilitiesList.map((item) => (
                  <label key={item} className="block mb-2">
                    <input type="checkbox" className="mr-2" checked={formData.facilities.includes(item)} onChange={() => toggleFacility(item)} />
                    {item}
                  </label>
                ))}
              </div>
            </CFormCard>
          </div>

          <div className="flex-1 min-w-[350px]">
            <CFormCard className="border border-gray-400 h-full relative">
              <span className="absolute -top-3 left-4 bg-white px-2 font-semibold text-gray-700">
                Rules & Curfew
              </span>
              <div className="mt-4">
                {rulesList.map((rule) => (
                  <label key={rule.key} className="block mb-2">
                    <input type="checkbox" className="mr-2" checked={formData.rules[rule.key]} onChange={(e) => updateRule(rule.key, e.target.checked)} />
                    {rule.label}
                  </label>
                ))}
                <CInput type="time" label="Curfew Time" value={formData.rules.curfew} onChange={(e) => updateRule("curfew", e.target.value)} />
              </div>
            </CFormCard>
          </div>
        </div>

        {/* ======= Third Row ======= */}
        <CFormCard className="border border-gray-400 relative">
          <span className="absolute -top-3 left-4 bg-white px-2 font-semibold text-gray-700">
            Proof of Property Documents
          </span>
          <div className="mt-4 space-y-4">
            {["aadhaar", "electricityBill", "propertyTax"].map((key) => (
              <div key={key} className="flex items-center gap-4">
                <label className="font-bold">
                  {key === "aadhaar" ? "Aadhaar Card" : key === "electricityBill" ? "Electricity Bill" : "Property Tax Document"}:
                </label>
                <input type="file" accept=".jpg,.png,.pdf" disabled={!!formData.proofDocuments[key]} onChange={(e) => handleFileChange(e, key)} />
                {formData.proofDocuments[key] && (
                  <>
                    <span className="text-gray-700">{formData.proofDocuments[key].name}</span>
                    <button type="button" onClick={() => viewFile(key)} className="text-blue-600 hover:text-blue-800">
                      <FaEye />
                    </button>
                    <button type="button" onClick={() => removeFile(key)} className="text-red-600 hover:text-red-800">
                      <FaTrash />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </CFormCard>

        <div className="text-center mt-8">
          <CButton type="submit">Save & Continue</CButton>
        </div>
      </form>
    </div>
  );
};

export default AddProperty;
