import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import CButton from "../../../components/cButton";
import CInput from "../../../components/cInput";
import CSelect from "../../../components/cSelect";
import CancelConfirmModal from "../cancelConfirm";
import { cancelReasons } from "../../../config/staticData";
import { FaExclamationTriangle } from "react-icons/fa";

const CancelForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    email: "",
    reason: "",
    otherReason: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!form.reason) {
      newErrors.reason = "Please select a reason";
    }
    if (form.reason === "Other" && !form.otherReason.trim()) {
      newErrors.otherReason = "Please specify your reason";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancelClick = () => {
    if (validate()) {
      setShowModal(true);
    }
  };

  return (
    /* Background set to your dark theme or light depending on UI mode [cite: 2026-02-09] */
    <section className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-2xl mx-auto">
        
        {/* Warning Card - Updated with Primary brand colors for caution [cite: 2026-02-09] */}
       
        {/* Main Form Card */}
        <div className="bg-background rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="bg-primarySoft/30 px-4 sm:px-8 py-4 sm:py-6 border-b border-border">
            <h2 className="text-h2-sm lg:text-h2 font-bold text-textPrimary">Cancel Booking</h2>
            <p className="text-textSecondary text-body-sm">Please verify your details to proceed</p>
          </div>

          <div className="p-4 sm:p-8 space-y-6">
            <CInput
              label="Registered Email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              error={errors.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: null });
              }}
            />

            <div className="space-y-1">
              <label className="text-body-sm lg:text-body font-semibold text-textSecondary">
                Reason for Cancellation
              </label>
              <CSelect
                placeholder="Select a reason"
                value={form.reason}
                onChange={(e) => {
                  setForm({ ...form, reason: e.target.value });
                  if (errors.reason) setErrors({ ...errors, reason: null });
                }}
                options={cancelReasons}
              />
              {errors.reason && <p className="text-primaryDark text-xs mt-1">{errors.reason}</p>}
            </div>

            {form.reason === "Other" && (
              <CInput
                label="Specify Reason"
                type="text"
                placeholder="Why are you leaving?"
                value={form.otherReason}
                error={errors.otherReason}
                onChange={(e) => {
                  setForm({ ...form, otherReason: e.target.value });
                  if (errors.otherReason) setErrors({ ...errors, otherReason: null });
                }}
              />
            )}

            <div className="pt-4">
              {/* Primary Action Button [cite: 2026-02-09] */}
              <CButton
                className="w-full bg-primary hover:bg-primaryDark text-textLight font-bold transition-all shadow-lg shadow-primarySoft"
                onClick={handleCancelClick}
              >
                Confirm Cancellation
              </CButton>
              <CButton 
                text="Nevermind, take me back"
                variant="text"
                onClick={() => navigate(-1)}
                className="w-full mt-4"
              />
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <CancelConfirmModal
          onClose={() => setShowModal(false)}
          onConfirm={async () => {
            try {
              const token = localStorage.getItem("userToken");
              const res = await axios.put(
                `http://localhost:5000/api/bookings/${id}/request-cancel`,
                {
                  reason: form.reason,
                  otherReason: form.reason === "Other" ? form.otherReason : "",
                  email: form.email
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (res.data?.success) {
                navigate("/cancel-success");
              } else {
                navigate("/Home");
              }
            } catch (error) {
              navigate("/Home");
            }
          }}
        />
      )}
    </section>
  );
};

export default CancelForm;
