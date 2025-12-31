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
      optional2Beds: "",
      optional3Beds: "",
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

  const handleSubmit = () => {
    console.log("ROOM PRICES:", roomPrices);
    alert("Room prices saved successfully!");
    navigate("/owner/dashboard/pgManagment/submitApproval");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Set Room Prices</h2>
      <p className="text-gray-600 mb-6">
        Set pricing details for each room type. Optional fields can be left blank.
      </p>

      {roomPrices.map((room, index) => (
        <div key={index} className="border p-4 rounded-lg space-y-3">
          <h3 className="font-medium text-lg">Room Type {index + 1}</h3>

          <input
            type="text"
            placeholder="Room Type (e.g., Single, Double)"
            value={room.roomType}
            onChange={(e) =>
              handleChange(index, "roomType", e.target.value)
            }
            className="border p-2 w-full rounded"
          />
          <input
            type="text"
            placeholder="Price per Month"
            value={room.pricePerMonth}
            onChange={(e) =>
              handleChange(index, "pricePerMonth", e.target.value)
            }
            className="border p-2 w-full rounded"
          />
          <input
            type="text"
            placeholder="Price per Year"
            value={room.pricePerYear}
            onChange={(e) =>
              handleChange(index, "pricePerYear", e.target.value)
            }
            className="border p-2 w-full rounded"
          />
          <input
            type="text"
            placeholder="Advance Payment"
            value={room.advancePayment}
            onChange={(e) =>
              handleChange(index, "advancePayment", e.target.value)
            }
            className="border p-2 w-full rounded"
          />
        </div>
      ))}

      <div className="flex justify-between items-center">
        <CButton
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          onClick={addRoomType}
        >
          + Add Another Room Type
        </CButton>

        <CButton
          className="bg-amber text-white px-4 py-2 rounded-md hover:bg-amber-600"
          onClick={handleSubmit}
        >
          Save & Continue
        </CButton>
      </div>
    </div>
  );
};

export default SetRoomPrice;
