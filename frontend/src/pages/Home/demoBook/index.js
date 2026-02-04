import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Added for navigation
import CInput from "../../../components/cInput";
import CButton from "../../../components/cButton";
import Swal from "sweetalert2";

const DemoBook = ({ isOpen, onClose }) => {
  const navigate = useNavigate(); // Initialize navigate
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  /* ================= HANDLERS ================= */

  const handleChange = (field, value) => {
    let val = value;

    // Strict Phone logic: Numbers only and max 10 digits
    if (field === "phone") {
      val = val.replace(/\D/g, "");
      if (val.length > 10) return;
    }

    setFormData({ ...formData, [field]: val });

    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: false });
    }
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.name.trim() || formData.name.length < 2) newErrors.name = true;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) newErrors.email = true;

    if (!formData.phone.trim() || formData.phone.length !== 10) newErrors.phone = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill all required fields correctly. Phone must be 10 digits.',
        confirmButtonColor: "#f97316",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/request-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          yourName: formData.name,
          emailAddress: formData.email,
          phone: formData.phone,
          message: formData.message
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "Demo request submitted successfully!",
          icon: "success",
          confirmButtonColor: "#f97316",
        });

        setFormData({ name: "", email: "", phone: "", message: "" });
        onClose(); 
      } else {
        Swal.fire({
          title: "Error",
          text: data.message || "Something went wrong",
          icon: "error",
          confirmButtonColor: "#f97316",
        });
      }
    } catch (error) {
      console.error("Submission failed:", error);
      Swal.fire({
        title: "Connection Error",
        text: "Could not connect to the server.",
        icon: "warning",
        confirmButtonColor: "#f97316",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl p-8 shadow-2xl mx-4">

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-6 text-2xl text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          ✕
        </button>

        <h2 className="text-3xl  text-center text-gray-800 mb-2">
          Schedule Demo
        </h2>

        <p className="text-center text-gray-500 mb-8">
          Please submit your information and our team will reach out shortly.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <CInput
              label="Your Name"
              required
              error={errors.name}
              placeholder="Enter your name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              disabled={isSubmitting}
            />

            <CInput
              label="Email Address"
              type="email"
              required
              error={errors.email}
              placeholder="Enter email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <CInput
            label="Phone"
            required
            error={errors.phone}
            placeholder="Enter 10-digit phone number"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            disabled={isSubmitting}
          />

          <CInput
            label="Message"
            type="textarea"
            placeholder="Have a message for us?"
            rows={4}
            value={formData.message}
            onChange={(e) => handleChange("message", e.target.value)}
            disabled={isSubmitting}
          />

          <CButton
            text={isSubmitting ? "REQUESTING..." : "REQUEST DEMO"}
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            className="w-full py-4 text-lg  tracking-wide"
          />
        </form>

        <p className="text-[11px] text-center text-gray-400 mt-6 uppercase tracking-widest">
          By submitting, you agree to our{" "}
          <span 
            onClick={() => {
                onClose(); // Optional: close modal before navigating
                navigate("/privacyPolicy");
            }}
            className="text-blue-500 cursor-pointer hover:underline font-semibold"
          >
            Privacy Policy
          </span>
        </p>
      </div>
    </div>
  );
};

export default DemoBook;