import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CButton from "../../../components/cButton";
import CInput from "../../../components/cInput";
import CSelect from "../../../components/cSelect";
import CancelConfirmModal from "../cancelConfirm";
import { cancelReasons } from "../../../config/staticData"; 

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
    form.email &&
    form.password &&
    form.reason &&
    (form.reason !== "Other" || form.otherReason);

  return (
    <section className="max-w-3xl mx-auto px-6 py-14">
      {/* Warning */}
      <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-xl p-4 mb-8">
        ⚠️ Advance payment will not be refunded.  
        Your profile will be archived for 10 days.
      </div>

      <h2 className="text-2xl  mb-6 text-primary">
        Cancel Booking
      </h2>

      <div className="space-y-5">
        <CInput
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <CInput
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <CSelect
          placeholder="Select reason"
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
          options={cancelReasons} // ✅ static data used
        />

        {form.reason === "Other" && (
          <CInput
            type="text"
            placeholder="Enter reason"
            value={form.otherReason}
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
          onConfirm={() => navigate("/cancel-success")}
        />
      )}
    </section>
  );
};

export default CancelForm;
