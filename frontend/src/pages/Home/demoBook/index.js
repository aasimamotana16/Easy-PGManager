import React, { useState } from "react";
import CInput from "../../../components/cInput";
import CButton from "../../../components/cButton";

const DemoBook = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  /* ================= HANDLERS ================= */

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    // Clear error when user starts typing
    setErrors({ ...errors, [field]: "" });
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
// ✅ Connect to Backend [cite: 2026-01-06]
    try {
      const response = await fetch('http://localhost:5000/api/request-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Mapping frontend fields to backend camelCase keys [cite: 2026-01-01]
        body: JSON.stringify({
          yourName: formData.name,
          emailAddress: formData.email,
          phone: formData.phone,
          message: formData.message
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Demo request submitted successfully!");
        onClose(); // Close modal after success
        // Reset form
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Could not connect to the server. Please check if backend is running.");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl bg-dashboard-gradient rounded-2xl p-8">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl text-gray-500"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold text-center mb-2">
          Schedule Demo
        </h2>

        <p className="text-center text-gray-500 mb-6">
          Please submit your information and our team will reach out shortly.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <CInput
                label="Your Name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <CInput
                label="Email Address"
                placeholder="Enter email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          <div>
            <CInput
              label="Phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>

          <CInput
            label="Message"
            placeholder="Have a message for us?"
            textarea
            value={formData.message}
            onChange={(e) => handleChange("message", e.target.value)}
          />

          <CButton
            text="REQUEST DEMO"
            type="submit"
            className="w-full"
          />
        </form>

        <p className="text-xs text-center text-gray-400 mt-4">
          By submitting this form, you agree to our{" "}
          <span className="text-blue-600 cursor-pointer">
            Privacy Policy
          </span>
        </p>
      </div>
    </div>
  );
};

export default DemoBook;
