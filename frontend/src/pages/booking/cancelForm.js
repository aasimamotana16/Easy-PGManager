import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CButton from "../../components/cButton";
import CancelConfirmModal from "./cancelConfirm";

const reasons = [
  "Change in plans",
  "Found another PG",
  "Location issue",
  "Price issue",
  "Facility issue",
  "Personal reason",
  "Other",
];

const CancelForm = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    reason: "",
    otherReason: "",
  });

  const isValid =
    form.email && form.password && form.reason &&
    (form.reason !== "Other" || form.otherReason);

  return (
    <section className="max-w-3xl mx-auto px-6 py-14">
      {/* Warning */}
      <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-xl p-4 mb-8">
        ⚠️ Advance payment will not be refunded.  
        Your profile will be archived for 10 days.
      </div>

      <h2 className="text-2xl font-bold mb-6 text-primary">
        Cancel Booking
      </h2>

      <div className="space-y-5">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded-lg border"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded-lg border"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <select
          className="w-full p-3 rounded-lg border"
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
        >
          <option value="">Select reason</option>
          {reasons.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>

        {form.reason === "Other" && (
          <textarea
            placeholder="Enter reason"
            className="w-full p-3 rounded-lg border"
            onChange={(e) =>
              setForm({ ...form, otherReason: e.target.value })
            }
          />
        )}

        <CButton
          disabled={!isValid}
          className="bg-red-500 hover:bg-red-600"
          onClick={() => setShowModal(true)}
        >
          Cancel Booking
        </CButton>
      </div>

      {showModal && (
        <CancelConfirmModal
          onClose={() => setShowModal(false)}
          onConfirm={() => navigate("/booking/cancel-success")}
        />
      )}
    </section>
  );
};

export default CancelForm;
