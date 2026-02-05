import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CInput from "../../../../components/cInput";
import CButton from "../../../../components/cButton";
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

  // Track validation errors for each index
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

  const validate = () => {
    const newErrors = {};
    roomPrices.forEach((room, index) => {
      if (!room.roomType) newErrors[`${index}-roomType`] = "Category name required";
      if (!room.pricePerMonth) newErrors[`${index}-pricePerMonth`] = "Monthly price required";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validate()) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Data",
        text: "Please fill in all mandatory fields for each room category.",
      });
      return;
    }

    try {
      Swal.fire({
        title: "Saving Prices...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const token = localStorage.getItem("token");
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
          timer: 2000,
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
        text: "Could not connect to the server. Please try again later.",
      });
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* PAGE HEADER */}
      <div className="max-w-4xl mx-auto mb-2">
        <h1 className="text-3xl font-bold text-primary">Set Room Prices</h1>
        <p className="text-gray-500 mt-1">
          Define pricing for each room category. These prices apply to all rooms of that type.
        </p>
      </div>

      {/* ROOM PRICE CARDS */}
      <div className="max-w-4xl mx-auto space-y-6 mt-6">
        {roomPrices.map((room, index) => (
          <div key={index} className="bg-white rounded-md shadow p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              Room Category {index + 1}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <CInput
                  label="Room Category"
                  placeholder="e.g., Single, Double, AC"
                  value={room.roomType}
                  onChange={(e) => handleChange(index, "roomType", e.target.value)}
                  required={true}
                  error={!!errors[`${index}-roomType`]}
                />
                {errors[`${index}-roomType`] && (
                  <p className="text-red-600 text-sm mt-1">{errors[`${index}-roomType`]}</p>
                )}
              </div>

              <div>
                <CInput
                  label="Price per Month"
                  type="number"
                  placeholder="0.00"
                  value={room.pricePerMonth}
                  onChange={(e) => handleChange(index, "pricePerMonth", e.target.value)}
                  required={true}
                  error={!!errors[`${index}-pricePerMonth`]}
                />
                {errors[`${index}-pricePerMonth`] && (
                  <p className="text-red-600 text-sm mt-1">{errors[`${index}-pricePerMonth`]}</p>
                )}
              </div>

              <CInput
                label="Price per Year (optional)"
                type="number"
                placeholder="0.00"
                value={room.pricePerYear}
                onChange={(e) => handleChange(index, "pricePerYear", e.target.value)}
              />

              <CInput
                label="Advance Payment (optional)"
                type="number"
                placeholder="0.00"
                value={room.advancePayment}
                onChange={(e) => handleChange(index, "advancePayment", e.target.value)}
              />
            </div>
          </div>
        ))}

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 pb-10">
          <CButton variant="outlined" onClick={addRoomType} className="w-full sm:w-auto">
            + Add Another Room Category
          </CButton>

          <CButton variant="contained" size="lg" onClick={handleSubmit} className="w-full sm:w-auto">
            Save & Continue
          </CButton>
        </div>
      </div>
    </div>
  );
};

export default SetRoomPrice;