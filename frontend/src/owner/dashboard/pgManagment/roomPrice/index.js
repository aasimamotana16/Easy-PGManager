import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom"; // For page navigation
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { updateRoomPrices } from "../../../../api/api";
import { FaTrash, FaPlus, FaSave, FaCheck, FaSnowflake, FaTree, FaToilet, FaCalendarAlt, FaFan } from "react-icons/fa";
import Swal from "sweetalert2"; // Standard Swal import
import CInput from "../../../../components/cInput";
import CButton from "../../../../components/cButton";

const SetRoomPrice = () => {
  const navigate = useNavigate();
    const location = useLocation();
    const fromCreate = location.state?.fromCreate === true;
    const incomingPgId = location.state?.pgId;
  const [roomPrices, setRoomPrices] = useState([
    {
      variantName: "",
      price: "",
      billingCycle: "Month",
      securityDeposit: "",
      acType: "AC", 
      features: { balcony: false, attachedWashroom: true }
    },
  ]);

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const billingOptions = ["Month", "Quarter", "Year"];
  const incomingRoomData = location.state?.roomData || null;
  const createRoomFlow = location.state?.createRoomFlow === true;

  useEffect(() => {
    if (incomingRoomData) {
      // Prefill the first variant with the room specification's type
      setRoomPrices(prev => {
        const copy = [...prev];
        copy[0] = {
          ...copy[0],
          variantName: incomingRoomData.roomType || copy[0].variantName,
          price: copy[0].price || "",
        };
        return copy;
      });
    }
  }, [incomingRoomData]);

  const toggleFeature = (index, feature) => {
    const updated = [...roomPrices];
    updated[index].features[feature] = !updated[index].features[feature];
    setRoomPrices(updated);
  };

  const handleChange = (index, field, value) => {
    const updated = [...roomPrices];
    updated[index][field] = value;
    setRoomPrices(updated);
    if (errors[`${index}-${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${index}-${field}`];
      setErrors(newErrors);
    }
  };

  const addPriceCard = () => {
    setRoomPrices([...roomPrices, {
      variantName: "",
      price: "",
      billingCycle: "Month",
      securityDeposit: "",
      acType: "Non-AC",
      features: { balcony: false, attachedWashroom: false }
    }]);
  };

  const handleSavePricing = async () => {
    const newErrors = {};
    roomPrices.forEach((room, index) => {
      if (!room.variantName) newErrors[`${index}-variantName`] = "Required";
      if (!room.price) newErrors[`${index}-price`] = "Required";
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    try {
      const pgId = incomingPgId || localStorage.getItem("currentPropertyId");
      const resp = await updateRoomPrices(roomPrices, pgId);
      setIsSaving(false);

      if (resp?.data?.success) {
        // If this flow was started from AddRooms, create the room now
        if (createRoomFlow && incomingRoomData) {
          try {
            const token = localStorage.getItem("userToken");
            const roomResp = await axios.post(
              "http://localhost:5000/api/owner/add-room",
              {
                roomType: incomingRoomData.roomType,
                totalRooms: parseInt(incomingRoomData.totalRooms || 0),
                bedsPerRoom: parseInt(incomingRoomData.bedsPerRoom || 0),
                description: incomingRoomData.description || "",
                pgId: pgId,
                // Attach pricing from the variants the owner just saved
                rent: Number(roomPrices[0]?.price || 0),
                securityDeposit: Number(roomPrices[0]?.securityDeposit || 0),
                variantLabel: roomPrices[0]?.variantName || incomingRoomData.roomType || ''
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (roomResp.data && roomResp.data.success) {
              // Upload images if provided
              const createdRoom = roomResp.data.data && roomResp.data.data.room;
              if (incomingRoomData.mainImage || (incomingRoomData.subImages && incomingRoomData.subImages.length > 0)) {
                const formData = new FormData();
                if (incomingRoomData.mainImage) formData.append("mainImage", incomingRoomData.mainImage);
                (incomingRoomData.subImages || []).forEach(f => formData.append("images", f));
                formData.append("pgId", pgId);
                if (createdRoom && createdRoom._id) formData.append("roomId", createdRoom._id);

                await axios.post(`http://localhost:5000/api/owner/upload-images/${pgId}`, formData, {
                  headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
                });
              }
            }
          } catch (err) {
            console.error('Failed to create room after saving pricing', err);
          }
        }
        Swal.fire({
          title: 'Pricing Saved!',
          text: "Your room variants have been recorded successfully.",
          icon: "success",
          confirmButtonColor: "#D97706",
          confirmButtonText: fromCreate ? "Proceed to Approval" : "OK",
          background: "#ffffff",
          customClass: {
            popup: 'rounded-3xl border-none font-poppins',
            confirmButton: 'rounded-xl px-10 py-3 text-xs font-medium tracking-widest'
          }
        }).then((result) => {
          if (fromCreate) {
            if (result.isConfirmed) {
              navigate("/owner/dashboard/pgManagment/submitApproval");
            }
          } else {
            navigate("/owner/dashboard/pgManagment");
          }
        });
      } else {
        Swal.fire({ title: 'Error', text: resp?.data?.message || 'Failed to save pricing', icon: 'error', confirmButtonColor: '#D97706' });
      }
    } catch (err) {
      setIsSaving(false);
      console.error('Error updating room prices:', err);
      Swal.fire({ title: 'Error', text: err.response?.data?.message || err.message || 'Failed to save pricing', icon: 'error', confirmButtonColor: '#D97706' });
    }
  };

  return (
    <div className="p-6 md:p-10 bg-[#ffffff] min-h-screen font-poppins text-[#1C1C1C]">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-light uppercase tracking-tighter italic">Pricing & <span className="font-semibold not-italic">Features</span></h1>
          <p className="text-[#4B4B4B] font-normal mt-2 text-lg italic opacity-80">Define costs and payment cycles for each room variant.</p>
        </header>

        <div className="space-y-8">
          <AnimatePresence>
            {roomPrices.map((room, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border-2 border-[#E5E0D9] overflow-hidden hover:border-[#D97706] transition-all"
              >
                <div className="flex flex-col lg:flex-row">
                  
                  {/* LEFT: FEATURE SELECTION */}
                  <div className="lg:w-80 p-8 bg-gray-50/50 border-r border-[#E5E0D9] space-y-4">
                    <label className="text-xs font-semibold uppercase text-[#4B4B4B] tracking-widest mb-4 block">Room Inclusions</label>
                    
                    <div className="flex gap-2 mb-4">
                        <button 
                            type="button"
                            onClick={() => handleChange(index, 'acType', 'AC')}
                            className={`flex-1 flex flex-col items-center p-4 rounded-xl border-2 transition-all ${room.acType === 'AC' ? 'bg-white border-[#D97706] text-[#D97706] shadow-sm' : 'bg-transparent border-transparent opacity-40 grayscale'}`}
                        >
                            <FaSnowflake size={18} className="mb-1" />
                            <span className="text-[10px] font-medium uppercase tracking-wider">AC</span>
                        </button>
                        <button 
                            type="button"
                            onClick={() => handleChange(index, 'acType', 'Non-AC')}
                            className={`flex-1 flex flex-col items-center p-4 rounded-xl border-2 transition-all ${room.acType === 'Non-AC' ? 'bg-white border-[#D97706] text-[#D97706] shadow-sm' : 'bg-transparent border-transparent opacity-40 grayscale'}`}
                        >
                            <FaFan size={18} className="mb-1" />
                            <span className="text-[10px] font-medium uppercase tracking-wider">Non-AC</span>
                        </button>
                    </div>

                    <FeatureToggle label="Private Balcony" icon={<FaTree />} active={room.features.balcony} onClick={() => toggleFeature(index, 'balcony')} />
                    <FeatureToggle label="Attached Bath" icon={<FaToilet />} active={room.features.attachedWashroom} onClick={() => toggleFeature(index, 'attachedWashroom')} />
                  </div>

                  {/* RIGHT: PRICING FORM */}
                  <div className="flex-1 p-8 flex flex-col justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                      
                      <div className="md:col-span-2">
                        <CInput 
                          label="Variant Label" 
                          placeholder="e.g. Single Occupancy"
                          value={room.variantName}
                          onChange={(e) => handleChange(index, 'variantName', e.target.value)}
                          error={errors[`${index}-variantName`]}
                          className="text-lg font-normal"
                          readOnly={Boolean(incomingRoomData)}
                        />
                        {incomingRoomData && (
                          <p className="text-xs text-textSecondary mt-1">Using room type from specification — change it in Room Specifications if needed.</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#4B4B4B] mb-2 block uppercase tracking-wide">Rent (₹)</label>
                        <div className="flex h-14">
                          <div className="flex-1">
                            <input 
                                type="number" 
                                value={room.price} 
                                onChange={(e) => handleChange(index, 'price', e.target.value)}
                                className={`w-full h-full bg-white border-2 ${errors[`${index}-price`] ? 'border-red-400' : 'border-[#E5E0D9]'} border-r-0 rounded-l-xl px-4 text-lg font-normal focus:border-[#D97706] outline-none transition-all`}
                            />
                          </div>
                          <select 
                            value={room.billingCycle}
                            onChange={(e) => handleChange(index, 'billingCycle', e.target.value)}
                            className="h-full bg-gray-50 border-2 border-[#E5E0D9] rounded-r-xl px-4 text-sm font-semibold text-[#1C1C1C] focus:border-[#D97706] outline-none transition-all cursor-pointer min-w-[120px]"
                          >
                            {billingOptions.map(opt => <option key={opt} value={opt}>{opt}ly</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#4B4B4B] mb-2 block uppercase tracking-wide">Security Deposit (₹)</label>
                        <input 
                            type="number" 
                            placeholder="One-time collection" 
                            value={room.securityDeposit} 
                            onChange={(e) => handleChange(index, 'securityDeposit', e.target.value)}
                            className="w-full h-14 bg-white border-2 border-[#E5E0D9] rounded-xl px-4 text-lg font-normal focus:border-[#D97706] outline-none transition-all"
                        />
                      </div>

                      <div className="md:col-span-2 bg-[#FEF3C7]/20 p-5 rounded-2xl border border-[#D97706]/10 flex items-start gap-4">
                         <div className="bg-[#D97706] p-2 rounded-lg text-white mt-1"><FaCalendarAlt size={14}/></div>
                         <div>
                            <p className="text-[10px] font-semibold text-[#B45309] uppercase mb-1 tracking-widest">Owner Note</p>
                            <p className="text-sm text-[#4B4B4B] font-normal leading-relaxed">
                               Maintenance is handled by the user. Electricity charges are extra per unit.
                            </p>
                         </div>
                      </div>
                    </div>
                  </div>

                  {roomPrices.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => setRoomPrices(roomPrices.filter((_, i) => i !== index))}
                      className="p-8 bg-red-50 text-red-300 hover:text-red-500 transition-all border-l border-[#E5E0D9]"
                    >
                      <FaTrash size={18} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <button 
            type="button"
            onClick={addPriceCard} 
            className="w-full py-8 border-2 border-dashed border-[#E5E0D9] rounded-2xl text-[#4B4B4B] font-medium uppercase text-[10px] tracking-[0.4em] hover:border-[#D97706] hover:text-[#D97706] transition-all bg-white"
          >
            + Add New Price Variant
          </button>
        </div>

        <div className="mt-16 flex justify-end">
          <CButton 
            onClick={handleSavePricing}
            className="!bg-[#D97706] !px-16 !py-4 shadow-xl !rounded-xl !text-white !font-medium !uppercase !text-xs !tracking-widest transition-all hover:bg-[#B45309]"
          >
            {isSaving ? "Processing..." : <><FaSave className="inline mr-2" /> Save Pricing Details</>}
          </CButton>
        </div>
      </div>
    </div>
  );
};

const FeatureToggle = ({ label, icon, active, onClick }) => (
  <button 
    type="button"
    onClick={onClick}
    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${active ? 'bg-white border-[#D97706] shadow-sm' : 'bg-transparent border-transparent grayscale opacity-30'}`}
  >
    <div className="flex items-center gap-4">
      <div className={`p-2 rounded-xl ${active ? 'bg-[#FEF3C7] text-[#D97706]' : 'bg-gray-200 text-gray-500'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-semibold uppercase tracking-wider ${active ? 'text-[#1C1C1C]' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
    {active && <FaCheck className="text-[#D97706]" size={10} />}
  </button>
);

export default SetRoomPrice;