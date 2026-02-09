import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CInput from "../../../../components/cInput";
import CButton from "../../../../components/cButton";
import { FaTrash, FaRupeeSign, FaPlus, FaSave, FaBed } from "react-icons/fa";
import Swal from "sweetalert2";

const SetRoomPrice = () => {
  const navigate = useNavigate();

  const [roomPrices, setRoomPrices] = useState([
    {
      roomType: "Single",
      pricePerMonth: "",
      pricePerYear: "",
      advancePayment: "",
    },
  ]);

  const [errors, setErrors] = useState({});

  // --- BULLETPROOF SCROLL FIX FOR NUMBER INPUTS ---
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.target.type === "number" && document.activeElement === e.target) {
        e.preventDefault();
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...roomPrices];
    updated[index][field] = value;
    setRoomPrices(updated);

    const errorKey = `${index}-${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const addRoomType = () => {
    setRoomPrices((prev) => [
      ...prev,
      {
        roomType: "",
        pricePerMonth: "",
        pricePerYear: "",
        advancePayment: "",
      },
    ]);
  };

  const removeRoomType = (index) => {
    if (roomPrices.length === 1) {
      Swal.fire({
        title: "Note",
        text: "At least one room category is required.",
        icon: "info",
        confirmButtonColor: "#D97706"
      });
      return;
    }
    const updated = roomPrices.filter((_, i) => i !== index);
    setRoomPrices(updated);
    
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`${index}-`)) delete newErrors[key];
    });
    setErrors(newErrors);
  };

  const validate = () => {
    const newErrors = {};
    roomPrices.forEach((room, index) => {
      if (!room.roomType.trim()) newErrors[`${index}-roomType`] = "Category name required";
      if (!room.pricePerMonth) newErrors[`${index}-pricePerMonth`] = "Monthly price required";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    try {
      Swal.fire({
        title: "Saving Prices...",
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); },
      });

      const token = localStorage.getItem("userToken");
      const response = await fetch(
        "http://localhost:5000/api/owner/update-room-prices",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ roomPrices }),
        }
      );

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Prices Saved!",
          text: "Your room pricing has been updated.",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          navigate("/owner/dashboard/pgManagment/submitApproval");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: result.message || "Something went wrong.",
          confirmButtonColor: "#D97706"
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Could not connect to the server.",
        confirmButtonColor: "#D97706"
      });
    }
  };

  const ErrorLabel = ({ name }) => (
    errors[name] ? <p className="text-red-500 text-[10px] mt-1 font-bold uppercase tracking-tight">{errors[name]}</p> : null
  );

  return (
    <div className="p-4 md:p-10 bg-gray-100 min-h-screen">
      {/* HEADER SECTION */}
      <div className="max-w-5xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-[#1C1C1C]">Set Room Prices</h1>
        <p className="text-[#4B4B4B] mt-2">
          Define pricing for each room category. These prices apply to all rooms of that type.
        </p>
      </div>

      <div className="max-w-5xl mx-auto space-y-8 mt-6">
        {roomPrices.map((room, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-[#E5E0D9] overflow-hidden">
            {/* CARD HEADER */}
            <div className="p-4 bg-[#FEF3C7]/40 border-b border-[#E5E0D9] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-lg text-white">
                  <FaRupeeSign size={14} />
                </div>
                <h3 className="text-lg font-bold text-[#1C1C1C]">
                  Pricing Category {index + 1}
                </h3>
              </div>
              {roomPrices.length > 1 && (
                <button 
                  onClick={() => removeRoomType(index)}
                  className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-lg transition-all border border-red-200"
                  title="Remove Category"
                >
                  <FaTrash size={14} />
                </button>
              )}
            </div>

            {/* CARD BODY */}
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <CInput
                  label="Room Category Name"
                  placeholder="e.g., Double Sharing"
                  value={room.roomType}
                  onChange={(e) => handleChange(index, "roomType", e.target.value)}
                />
                <ErrorLabel name={`${index}-roomType`} />
              </div>

              <div>
                <CInput
                  label="Price /Month (₹)"
                  type="number"
                  placeholder="0"
                  value={room.pricePerMonth}
                  onChange={(e) => handleChange(index, "pricePerMonth", e.target.value)}
                />
                <ErrorLabel name={`${index}-pricePerMonth`} />
              </div>

              <div>
                <CInput
                  label="Price /Year (Optional)"
                  type="number"
                  placeholder="0"
                  value={room.pricePerYear}
                  onChange={(e) => handleChange(index, "pricePerYear", e.target.value)}
                />
              </div>

              <div>
                <CInput
                  label="Advance Payment (₹)"
                  type="number"
                  placeholder="0"
                  value={room.advancePayment}
                  onChange={(e) => handleChange(index, "advancePayment", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}

        {/* BOTTOM ACTIONS */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl border border-[#E5E0D9] shadow-sm mb-10">
          <button 
            onClick={addRoomType} 
            className="w-full md:w-auto flex items-center justify-center gap-2 border-2 border-primary text-primary hover:bg-primarySoft px-6 py-3 rounded-lg font-bold transition-all"
          >
            <FaPlus size={14} /> Add Another Category
          </button>

          <CButton 
            onClick={handleSubmit} 
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primaryDark text-white px-10 py-3 rounded-lg font-bold shadow-lg transition-all"
          >
            <FaSave /> Save & Finish Setup
          </CButton>
        </div>
      </div>
    </div>
  );
};

export default SetRoomPrice;