import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CButton from "../../../../components/cButton";

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

  const handleChange = (index, field, value) => {
    const updated = [...roomPrices];
    updated[index][field] = value;
    setRoomPrices(updated);
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

  const handleSubmit = async () => {
    try {
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
        alert("Room prices saved successfully!");
        navigate("/owner/dashboard/pgManagment/submitApproval");
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert("Could not connect to the server.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      {/* PAGE HEADER */}
      <div className="max-w-4xl mx-auto mb-2">
        <h1 className="text-3xl font-bold text-primary">
          Set Room Prices
        </h1>
        <p className="text-gray-500 mt-1">
          Define pricing for each room category (Single / Double / Triple).
          These prices apply to all rooms of that type.
        </p>
      </div>

      {/* ROOM PRICE CARDS */}
      <div className="max-w-4xl mx-auto space-y-6 mt-6">
        {roomPrices.map((room, index) => (
          <div
            key={index}
            className="bg-white rounded-md shadow p-6 space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-800">
              Room Category {index + 1}
            </h3>

            <p className="text-sm text-gray-500">
              Example: Single, Double, Triple, AC
            </p>

            <input
              type="text"
              placeholder="Room Category (e.g., Single, Double)"
              value={room.roomType}
              onChange={(e) =>
                handleChange(index, "roomType", e.target.value)
              }
              className="border rounded-md px-4 py-2 w-full"
            />

            <input
              type="number"
              placeholder="Price per Month"
              value={room.pricePerMonth}
              onChange={(e) =>
                handleChange(index, "pricePerMonth", e.target.value)
              }
              className="border rounded-md px-4 py-2 w-full"
            />

            <input
              type="number"
              placeholder="Price per Year (optional)"
              value={room.pricePerYear}
              onChange={(e) =>
                handleChange(index, "pricePerYear", e.target.value)
              }
              className="border rounded-md px-4 py-2 w-full"
            />

            <input
              type="number"
              placeholder="Advance Payment (optional)"
              value={room.advancePayment}
              onChange={(e) =>
                handleChange(index, "advancePayment", e.target.value)
              }
              className="border rounded-md px-4 py-2 w-full"
            />
          </div>
        ))}

        {/* ACTION BUTTONS */}
        <div className="flex justify-between items-center pt-4">
          <CButton
            variant="outlined"
            onClick={addRoomType}
          >
            + Add Another Room Category
          </CButton>

          <CButton
            variant="contained"
            onClick={handleSubmit}
          >
            Save & Continue
          </CButton>
        </div>
      </div>
    </div>
  );
};

export default SetRoomPrice;
