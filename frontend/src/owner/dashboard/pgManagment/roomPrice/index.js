import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CInput from "../../../../components/cInput";
import CButton from "../../../../components/cButton";
import { FaTrash } from "react-icons/fa";
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

  // Track validation errors
  const [errors, setErrors] = useState({});

  const handleChange = (index, field, value) => {
    const updated = [...roomPrices];
    updated[index][field] = value;
    setRoomPrices(updated);

    // Clear error for this specific field when user types
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
      Swal.fire("Note", "At least one room category is required.", "info");
      return;
    }
    const updated = roomPrices.filter((_, i) => i !== index);
    setRoomPrices(updated);
    
    // Clean up errors for the removed index
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

    if (!validate()) {
      return; // Errors are now shown via individual labels
    }

    try {
      Swal.fire({
        title: "Saving Prices...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
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
        });
      }
    } catch (error) {
      console.error("Connection Error:", error);
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Could not connect to the server.",
      });
    }
  };

  // Error label component to match AddRooms style
  const ErrorLabel = ({ name }) => (
    errors[name] ? <p className="text-red-500 text-xs mt-1 font-bold animate-pulse">{errors[name]}</p> : null
  );

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      {/* PAGE HEADER */}
      <div className="max-w-4xl mx-auto mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-orange-600">Set Room Prices</h1>
        <p className="text-gray-500 mt-1 text-sm md:text-base">
          Define pricing for each room category. These prices apply to all rooms of that type.
        </p>
      </div>

      {/* ROOM PRICE CARDS */}
      <div className="max-w-4xl mx-auto space-y-6 mt-6">
        {roomPrices.map((room, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-4 md:p-6 border-t-4 border-primary relative">
            
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-bold text-gray-800">
                Room Category {index + 1}
              </h3>
              {roomPrices.length > 1 && (
                <button 
                  onClick={() => removeRoomType(index)}
                  className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-full transition-colors"
                  title="Remove Category"
                >
                  <FaTrash size={16} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <CInput
                  label="Room Category Name"
                  placeholder="e.g., Single, Double, AC"
                  value={room.roomType}
                  onChange={(e) => handleChange(index, "roomType", e.target.value)}
                />
                <ErrorLabel name={`${index}-roomType`} />
              </div>

              <div>
                <CInput
                  label="Price per Month (₹)"
                  type="number"
                  placeholder="0"
                  value={room.pricePerMonth}
                  onChange={(e) => handleChange(index, "pricePerMonth", e.target.value)}
                />
                <ErrorLabel name={`${index}-pricePerMonth`} />
              </div>

              <div>
                <CInput
                  label="Price per Year (optional)"
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

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 pb-10">
          <CButton 
    variant="outlined" 
    onClick={addRoomType} 
    className="w-full sm:w-auto border-2 border-orange-600 text-orange-600 hover:bg-orange-50 font-bold"
  >
    + Add Another Category
  </CButton>

          <CButton 
            onClick={handleSubmit} 
            className="w-full sm:w-auto text-white px-10 py-3 text-lg font-bold shadow-lg"
          >
            Save & Finish
          </CButton>
        </div>
      </div>
    </div>
  );
};

export default SetRoomPrice;