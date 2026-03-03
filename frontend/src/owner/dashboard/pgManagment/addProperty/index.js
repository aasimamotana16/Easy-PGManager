import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CInput from "../../../../components/cInput";
import CSelect from "../../../../components/cSelect";
import CButton from "../../../../components/cButton";
import CFormCard from "../../../../components/cFormCard";
import { genderOptions } from "../../../../config/staticData";
import { FaTrash, FaEye, FaFileAlt, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import Swal from "sweetalert2";
import { addPgProperty, uploadAgreementTemplate, uploadPropertyDocuments } from "../../../../api/api";

const facilitySections = [
  {
    title: "Basic Living Facilities",
    items: [
      "Electricity Included",
      "Water Supply (24x7 / Limited)",
      "Power Backup",
      "Lift",
      "Parking (Two-wheeler)",
      "Parking (Four-wheeler)",
    ],
  },
  {
    title: "Room Facilities",
    items: [
      "Attached Bathroom",
      "Balcony",
      "Furnished Room",
    ],
  },
  {
    title: "Food & Kitchen Facilities",
    items: [
      "Food Included",
      "Veg Only",
      "Non-Veg Allowed",
      "Common Kitchen Access",
      "RO Drinking Water",
    ],
  },
  {
    title: "Internet & Utility",
    items: [
      "Wi-Fi",
      "TV (Common Area)",
      "Washing Machine",
      "Refrigerator (Common)",
      "Geyser / Hot Water",
    ],
  },
  {
    title: "Safety & Rules Related Facilities",
    items: [
      "CCTV Surveillance",
      "Security Guard",
      "Biometric / Key Access",
      "Fire Safety",
      "First Aid",
    ],
  },
];
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
  const fanRef = useRef(null);
  const lightRef = useRef(null);
  const bedRef = useRef(null);
  const cupboardRef = useRef(null);
  const mattressRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    forWhom: "",
    description: "",
    city: "",
    area: "",
    address: "",
    pincode: "",
    facilities: [],
    inventory: {
      fan: "",
      light: "",
      bed: "",
      cupboard: "",
      mattress: "",
      note: "",
    },
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
    legalConfirmed: false, // ✅ NEW
  });

  // Prevent scroll change on number inputs
  useEffect(() => {
    const handleWheel = (e) => {
      if (document.activeElement.type === "number") e.preventDefault();
    };
    const roomsInput = roomsRef.current;
    const pincodeInput = pincodeRef.current;
    const fanInput = fanRef.current;
    const lightInput = lightRef.current;
    const bedInput = bedRef.current;
    const cupboardInput = cupboardRef.current;
    const mattressInput = mattressRef.current;
    
    if (roomsInput) roomsInput.addEventListener("wheel", handleWheel, { passive: false });
    if (pincodeInput) pincodeInput.addEventListener("wheel", handleWheel, { passive: false });
    if (fanInput) fanInput.addEventListener("wheel", handleWheel, { passive: false });
    if (lightInput) lightInput.addEventListener("wheel", handleWheel, { passive: false });
    if (bedInput) bedInput.addEventListener("wheel", handleWheel, { passive: false });
    if (cupboardInput) cupboardInput.addEventListener("wheel", handleWheel, { passive: false });
    if (mattressInput) mattressInput.addEventListener("wheel", handleWheel, { passive: false });
    
    return () => {
      if (roomsInput) roomsInput.removeEventListener("wheel", handleWheel);
      if (pincodeInput) pincodeInput.removeEventListener("wheel", handleWheel);
      if (fanInput) fanInput.removeEventListener("wheel", handleWheel);
      if (lightInput) lightInput.removeEventListener("wheel", handleWheel);
      if (bedInput) bedInput.removeEventListener("wheel", handleWheel);
      if (cupboardInput) cupboardInput.removeEventListener("wheel", handleWheel);
      if (mattressInput) mattressInput.removeEventListener("wheel", handleWheel);
    };
  }, []);

  useEffect(() => {
    const savedData = localStorage.getItem("tempPropertyData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        console.log("Loaded from localStorage:", parsed); // Debug
        setFormData(prev => ({ ...prev, ...parsed, proofDocuments: prev.proofDocuments }));
      } catch (e) {
        console.error("Error parsing saved data:", e);
        localStorage.removeItem("tempPropertyData"); // Clear corrupted data
      }
    }
  }, []);

  useEffect(() => {
    const { proofDocuments, ...rest } = formData;
    console.log("Saving to localStorage:", rest); // Debug
    localStorage.setItem("tempPropertyData", JSON.stringify(rest));
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name} = ${value}`); // Debug
    
    if (name === "pincode" && value.length > 6) return;
    
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      console.log("Updated formData:", updated); // Debug
      return updated;
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const toggleFacility = (facility) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
    // Clear facilities error when user selects a facility
    if (errors.facilities) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.facilities;
        return newErrors;
      });
    }
  };

  const handleInventoryChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      inventory: { ...prev.inventory, [name]: value },
    }));
  };

  const updateRule = (key, value) => {
    setFormData((prev) => ({ ...prev, rules: { ...prev.rules, [key]: value } }));
    // Clear curfew error when user sets gate timing
    if (key === "curfew" && errors.curfew) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.curfew;
        return newErrors;
      });
    }
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
    // Get document name for display
    const docNames = {
      aadhaar: "Aadhaar Card",
      electricityBill: "Electricity Bill",
      propertyTax: "Property Tax Receipt",
    };
    
    Swal.fire({
      title: "Delete Document?",
      text: `Are you sure you want to delete ${docNames[key] || "this document"}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        setFormData((prev) => ({ ...prev, proofDocuments: { ...prev.proofDocuments, [key]: null } }));
        Swal.fire({
          title: "Deleted!",
          text: "Document has been removed.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          confirmButtonColor: "#D97706"
        });
      }
    });
  };

  const viewFile = (key) => {
    const file = formData.proofDocuments[key];
    if (file) window.open(URL.createObjectURL(file), "_blank");
  };

  const validateForm = () => {
    let newErrors = {};
    
    // BASIC DETAILS
    const nameValue = formData.name ? formData.name.trim() : "";
    if (!nameValue) newErrors.name = "Property name is required";
    
    if (!formData.forWhom || formData.forWhom === "") {
      newErrors.forWhom = "Please select category";
    }
    
    // LOCATION DETAILS
    const cityValue = formData.city ? formData.city.trim() : "";
    if (!cityValue) newErrors.city = "City is required";
    
    const areaValue = formData.area ? formData.area.trim() : "";
    if (!areaValue) newErrors.area = "Area is required";
    
    const addressValue = formData.address ? formData.address.trim() : "";
    if (!addressValue) newErrors.address = "Address is required";
    
    const pincodeValue = formData.pincode ? formData.pincode.toString().trim() : "";
    if (!/^\d{6}$/.test(pincodeValue)) newErrors.pincode = "Enter valid 6-digit pincode";
    
    // FACILITIES
    if (!formData.facilities || formData.facilities.length === 0) {
      newErrors.facilities = "Select at least one facility";
    }
    
    // RULES
    if (!formData.rules.curfew || formData.rules.curfew === "") {
      newErrors.curfew = "Gate closing time is required";
    }
    
    // DOCUMENTS
    if (!formData.proofDocuments.aadhaar) newErrors.aadhaar = "Aadhaar card is required";
    if (!formData.proofDocuments.electricityBill) newErrors.electricityBill = "Electricity bill is required";
    if (!formData.proofDocuments.propertyTax) newErrors.propertyTax = "Property tax receipt is required";
    if (!formData.legalConfirmed) {
      newErrors.legalConfirmed = "You must confirm the legal declaration";
    }


    console.log("Form Data:", formData); // Debug: see what data is being validated
    console.log("Validation Errors:", newErrors); // Debug: see what errors are found

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      // Get all field names has errors
      const errorFields = Object.keys(errors).join(", ");
      Swal.fire({
        title: "Form Incomplete",
        text: `Please fill these fields: ${errorFields}`,
        icon: "error",
        confirmButtonColor: "#D97706"
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Declare outside try-catch so it's accessible in catch block
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    try {
      // Show loading
      btn.innerHTML = "Saving...";
      btn.disabled = true;

      // Prepare data for backend (map frontend field names)
      const dataToSend = {
        name: formData.name,           // Maps to pgName
        forWhom: formData.forWhom,     // Maps to type
        description: formData.description,
        city: formData.city,
        area: formData.area,
        address: formData.address,
        pincode: formData.pincode,
        facilities: formData.facilities,  // Will map to both amenities and facilities
        inventory: formData.inventory,
        rules: formData.rules,
        legalConfirmed: formData.legalConfirmed // ✅ SENT
      };

      console.log("Frontend - Data being sent to backend:", dataToSend); // Debug

      // Make API call to backend using the API function
      const response = await addPgProperty(dataToSend);

      if (response.data.success) {
        const pgId = response.data.data._id;

        // Upload proof documents to backend for admin verification queue.
        const docsFormData = new FormData();
        if (formData.proofDocuments.aadhaar) {
          docsFormData.append("aadhaar", formData.proofDocuments.aadhaar);
        }
        if (formData.proofDocuments.electricityBill) {
          docsFormData.append("electricityBill", formData.proofDocuments.electricityBill);
        }
        if (formData.proofDocuments.propertyTax) {
          docsFormData.append("propertyTax", formData.proofDocuments.propertyTax);
        }

        if ([...docsFormData.keys()].length > 0) {
          try {
            await uploadPropertyDocuments(pgId, docsFormData);
          } catch (docError) {
            console.error("Property document upload failed:", docError);
          }
        }

        
        // Store property data for next steps
        localStorage.setItem("currentPropertyId", pgId);
        localStorage.setItem("currentPropertyName", formData.name);
        
        // Clear temp data
        localStorage.removeItem("tempPropertyData");
        
        Swal.fire({
          title: "Success!",
          text: "Property created successfully!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          confirmButtonColor: "#D97706"
          }).then(() => {
          // Navigate to add rooms with pgId and mark that we're coming from create flow
          navigate("/owner/dashboard/pgManagment/addRooms", {
            state: { pgId: pgId, propertyData: { name: formData.name }, fromCreate: true }
          });
        });
      }
    } catch (error) {
      console.error("Error creating property:", error);
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to create property. Please try again.",
        icon: "error",
        confirmButtonColor: "#D97706"
      });
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  };

  const ErrorLabel = ({ message }) => (
    message ? <p className="text-red-600 text-[11px] font-bold mt-1 animate-pulse">{message}</p> : null
  );

  return (
    <div className="p-4 sm:p-8 bg-gray-200 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h2 className="  text-textprimary mb-8">Add New Property</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. BASIC DETAILS */}
          <CFormCard className="p-6  border border-primary shadow-sm bg-white">
            <h2 className="text-lg font-bold text-textPrimary mb-6 border-b pb-2 tracking-wide">BASIC DETAILS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
<CInput
  className="mt-6"
  label="Property Name *"
  name="name"
  value={formData.name}
  onChange={handleChange}
  error={!!errors.name}
  helperText={errors.name}
/>              </div>
              <div>
                <CSelect label="For *" name="forWhom" value={formData.forWhom} onChange={handleChange} options={genderOptions} error={!!errors.forWhom} helperText={errors.forWhom} />
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
            <h2 className="text-lg font-bold text-textPrimary mb-6 border-b pb-2 tracking-wide">
              FACILITIES <span className="text-red-500 text-sm">*</span>
            </h2>

            <div className="space-y-3">
              {facilitySections.map((section) => {
                const selectedInSection = section.items.filter((item) => formData.facilities.includes(item)).length;
                return (
                  <details key={section.title} className="border border-border rounded-md bg-white">
                    <summary className="cursor-pointer select-none list-none flex items-center justify-between px-4 py-3 font-bold text-sm text-textPrimary">
                      <span>{section.title}</span>
                      <span className="text-xs font-semibold text-primary">
                        {selectedInSection}/{section.items.length} selected
                      </span>
                    </summary>
                    <div className="px-4 pb-4 pt-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 border-t border-border">
                      {section.items.map((item) => (
                        <label
                          key={item}
                          className={`flex items-center gap-2 p-3 rounded-md border cursor-pointer transition-all ${
                            formData.facilities.includes(item)
                              ? "bg-primarySoft border-primary text-primaryDark"
                              : "bg-white border-border hover:border-primary/30"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="accent-primary w-4 h-4"
                            checked={formData.facilities.includes(item)}
                            onChange={() => toggleFacility(item)}
                          />
                          <span className="text-xs font-semibold">{item}</span>
                        </label>
                      ))}
                    </div>
                  </details>
                );
              })}
            </div>

            {errors.facilities && (
              <p className="text-red-500 text-xs mt-2 font-medium">
                {errors.facilities}
              </p>
            )}
          </CFormCard>

          {/* INVENTORY */}
          <CFormCard className="p-6 border border-primary bg-white">
            <h2 className="text-lg font-bold mb-6 border-b pb-2">
              INVENTORY LISTINGS
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <CInput ref={fanRef} type="number" label="Fan" name="fan" value={formData.inventory.fan} onChange={handleInventoryChange} />
              <CInput ref={lightRef} type="number" label="Light" name="light" value={formData.inventory.light} onChange={handleInventoryChange} />
              <CInput ref={bedRef} type="number" label="Bed" name="bed" value={formData.inventory.bed} onChange={handleInventoryChange} />
              <CInput ref={cupboardRef} type="number" label="CupBoard" name="cupboard" value={formData.inventory.cupboard} onChange={handleInventoryChange} />
              <CInput ref={mattressRef} type="number" label="Matterss" name="mattress" value={formData.inventory.mattress} onChange={handleInventoryChange} />
            </div>
            <div className="mt-4">
              <CInput
                type="textarea"
                label="Additional Inventory / Notes (Optional)"
                name="note"
                value={formData.inventory.note}
                onChange={handleInventoryChange}
                rows={2}
              />
            </div>
          </CFormCard>

          {/* 4. RULES */}
          <CFormCard className="p-6 border border-primary shadow-sm bg-white">
            <h2 className="text-lg font-bold text-textPrimary mb-6 border-b pb-2 tracking-wide">RULES & GATE TIMING</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="grid grid-cols-2 gap-3">
                {rulesList.map((rule) => (
                  <label key={rule.key} className={`flex items-center gap-3 p-3 rounded-md border ${formData.rules[rule.key] ? 'bg-primarySoft border-primary/50' : 'bg-white border-border'}`}>
                    <input type="checkbox" className="accent-primary w-4 h-4" checked={formData.rules[rule.key]} onChange={(e) => updateRule(rule.key, e.target.checked)} />
                    <span className="text-sm font-semibold">{rule.label}</span>
                  </label>
                ))}
              </div>
              <div className="flex flex-col gap-1">
  <label className="text-sm font-semibold text-textPrimary">
    Gate Closing Time *
  </label>

  <input
    type="time"
    value={formData.rules.curfew}
    onChange={(e) => updateRule("curfew", e.target.value)}
    className={`
      border border-gray-300
      rounded-md
      px-3 py-2
      text-sm
      focus:outline-none
      focus:ring-primary
      focus:border-primary
      ${errors.curfew ? "border-red-500" : ""}
    `}
  />

  {errors.curfew && (
    <p className="text-xs text-red-500 mt-1">
      {errors.curfew}
    </p>
  )}
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
      { key: "propertyTax", label: "Property Tax Receipt *" },
    ].map((doc) => (
      <div key={doc.key} className="flex flex-col">
        <label className="block text-xs font-bold text-textSecondary mb-3 uppercase tracking-wider">{doc.label}</label>
        {!formData.proofDocuments[doc.key] ? (
          <div className="relative group">
            <input type="file" id={`file-${doc.key}`} accept=".pdf,image/*" onChange={(e) => handleFileChange(e, doc.key)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div className={`p-4 bg-gray-50 rounded-md border-2 border-dashed ${errors[doc.key] ? 'border-red-400' : 'border-border'} group-hover:border-primary group-hover:bg-primarySoft/30 transition-all duration-200 flex flex-col items-center justify-center min-h-[100px]`}>
               <div className="bg-primary text-white px-4 py-2 rounded-md text-sm font-bold shadow-sm group-hover:scale-105 transition-transform">Choose File</div>
               <p className="text-[10px] text-textSecondary mt-2">No file chosen</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-white p-3 rounded-md border border-primary/30 shadow-sm">
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
         
        {/* Simple Error Message Replacement */}
        {errors[doc.key] && (
          <p className="text-red-500 text-[10px] mt-2 font-medium">
            {errors[doc.key]}
          </p>
        )}
      </div>
    ))}
  </div>
</CFormCard>
 {/* LEGAL DECLARATION */}
          <CFormCard className="p-4 bg-yellow-50 border border-yellow-400">
            <p className="text-xs text-yellow-800 mb-2">
              The property details, facilities, inventory, and rules entered above will be used to generate digital tenant agreements. 
              The owner is responsible for ensuring that all information provided is accurate.
            </p>
            <label className="flex items-start gap-2">
              <input type="checkbox" checked={formData.legalConfirmed} onChange={(e) => setFormData(p => ({ ...p, legalConfirmed: e.target.checked }))} />
              <span className="text-xs font-semibold">I confirm the above information is accurate.</span>
            </label>
            {errors.legalConfirmed && <p className="text-red-500 text-xs">{errors.legalConfirmed}</p>}
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
