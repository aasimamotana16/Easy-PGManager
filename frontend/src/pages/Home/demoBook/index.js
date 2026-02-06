import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CInput from "../../../components/cInput";
import CButton from "../../../components/cButton";
import Swal from "sweetalert2";

const DemoBook = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    let val = value;
    if (field === "phone") {
      val = val.replace(/\D/g, "");
      if (val.length > 10) return;
    }
    setFormData({ ...formData, [field]: val });
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
        text: 'Please fill all required fields correctly.',
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

      if (response.ok) {
        Swal.fire({ title: "Success!", text: "Demo request submitted!", icon: "success", confirmButtonColor: "#f97316" });
        setFormData({ name: "", email: "", phone: "", message: "" });
        onClose(); 
      } else {
        Swal.fire({ title: "Error", text: "Something went wrong", icon: "error", confirmButtonColor: "#f97316" });
      }
    } catch (error) {
      Swal.fire({ title: "Error", text: "Connection failed", icon: "warning", confirmButtonColor: "#f97316" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      {/* Increased max-width to xl to allow subheading to sit in one line */}
      <div className="relative w-full max-w-lg lg:max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER SECTION - Reduced vertical padding */}
        <div className="bg-primary py-5 px-6 sm:px-10 text-center relative">
          <button
            onClick={onClose}
            type="button"
            className="absolute top-3 right-4 text-white/80 hover:text-white text-xl transition-colors cursor-pointer"
          >
            ✕
          </button>
          <h2 className="text-xl sm:text-3xl font-bold text-white mb-1">
            Schedule a Demo
          </h2>
          {/* whitespace-nowrap ensures one line on larger screens */}
          <p className="text-xs sm:text-sm md:text-base text-white/90 font-medium sm:whitespace-nowrap">
            Submit your information and our experts will reach out shortly.
          </p>
        </div>

        {/* FORM SECTION - Reduced overall padding and gap */}
        <div className="overflow-y-auto p-5 sm:p-8 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CInput
                label="Your Name"
                required
                error={errors.name}
                placeholder="Ex: John Doe"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                disabled={isSubmitting}
              />

              <CInput
                label="Email Address"
                type="email"
                required
                error={errors.email}
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <CInput
              label="Phone Number"
              required
              error={errors.phone}
              placeholder="10-digit number"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              disabled={isSubmitting}
            />

            <CInput
              label="Message (Optional)"
              type="textarea"
              placeholder="Anything else?"
              rows={2}
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              disabled={isSubmitting}
            />

            <div className="pt-2">
              <CButton
                text={isSubmitting ? "PROCESSING..." : "GET FREE DEMO"}
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                className="w-full h-12 text-base font-bold rounded-xl bg-primary text-white hover:bg-black transition-all shadow-md"
              />
            </div>
          </form>

          <p className="text-[10px] text-center text-gray-400 mt-4 uppercase tracking-widest font-medium">
            Agree to our{" "}
            <span 
              onClick={() => { onClose(); navigate("/privacyPolicy"); }}
              className="text-primary cursor-pointer hover:underline font-bold"
            >
              Privacy Policy
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoBook;