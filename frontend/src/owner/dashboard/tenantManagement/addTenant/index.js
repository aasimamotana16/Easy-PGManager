import React, { useState } from "react";

// Example PGs list (replace with backend fetch later)
const PG_LIST = [
  { id: 1, name: "Green Villa" },
  { id: 2, name: "Sunshine Residency" },
];

const AddTenant = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    pgId: "", 
    room: "",
    personsInRoom: 1, // default 1
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black opacity-40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* MODAL */}
      <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add Tenant</h2>

        {/* NAME */}
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full border p-2 rounded"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* PHONE */}
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="text"
            placeholder="Phone Number"
            className="w-full border p-2 rounded"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        {/* EMAIL */}
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        {/* PG SELECT */}
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">PG / Hostel</label>
          <select
            className="w-full border p-2 rounded"
            value={form.pgId}
            onChange={(e) => setForm({ ...form, pgId: parseInt(e.target.value) })}
          >
            <option value="">Select PG / Hostel</option>
            {PG_LIST.map((pg) => (
              <option key={pg.id} value={pg.id}>
                {pg.name}
              </option>
            ))}
          </select>
        </div>

        {/* ROOM NUMBER */}
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Room Number</label>
          <input
            type="text"
            placeholder="e.g., 101"
            className="w-full border p-2 rounded"
            value={form.room}
            onChange={(e) => setForm({ ...form, room: e.target.value })}
          />
        </div>

        {/* PERSONS IN ROOM */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Persons in Room</label>
          <input
            type="number"
            min={1}
            value={form.personsInRoom}
            onChange={(e) =>
              setForm({ ...form, personsInRoom: parseInt(e.target.value) })
            }
            className="w-full border p-2 rounded"
          />
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-4 py-2 bg-orange-500 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTenant;
