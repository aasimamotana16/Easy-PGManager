import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CInput from "../../../components/cInput";
import CButton from "../../../components/cButton";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "../../../config/apiBaseUrl";

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

  // Theme-consistent colors
  const primaryColor = "#D97706"; 

  const handleChange = (field, value) => {
    let val = value;
    if (field === "phone") {
      val = val.replace(/\D/g, "");
      if (val.length > 10) return;
    }
    setFormData({ ...formData, [field]: val });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Your name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (formData.phone.length !== 10) {
      newErrors.phone = "Enter a valid 10-digit mobile number";
    }

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
        confirmButtonColor: primaryColor,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/request-demo`, {
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
        Swal.fire({ 
          title: "Success!", 
          text: "Demo request submitted!", 
          icon: "success", 
          confirmButtonColor: primaryColor 
        });
        setFormData({ name: "", email: "", phone: "", message: "" });
        onClose(); 
      } else {
        Swal.fire({ 
          title: "Error", 
          text: "Something went wrong", 
          icon: "error", 
          confirmButtonColor: primaryColor 
        });
      }
    } catch (error) {
      Swal.fire({ 
        title: "Error", 
        text: "Connection failed", 
        icon: "warning", 
        confirmButtonColor: primaryColor 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
        >
          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg lg:max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[90vh]"
          >
            
            {/* HEADER SECTION */}
            <div className="bg-[#D97706] py-5 px-6 sm:px-10 text-center relative">
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
              <p className="text-xs sm:text-sm md:text-base text-white/90 font-medium sm:whitespace-nowrap">
                Submit your information and our experts will reach out shortly.
              </p>
            </div>

            {/* FORM SECTION */}
            <div className="overflow-y-auto p-5 sm:p-8 scrollbar-hide">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CInput
                    label="Your Name"
                    required
                    error={!!errors.name}
                    helperText={errors.name}
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    disabled={isSubmitting}
                  />

                  <CInput
                    label="Email Address"
                    type="email"
                    required
                    error={!!errors.email}
                    helperText={errors.email}
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <CInput
                  label="Phone Number"
                  required
                  error={!!errors.phone}
                  helperText={errors.phone}
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  disabled={isSubmitting}
                />

                <CInput
                  label="Message (Optional)"
                  type="textarea"
                  rows={2}
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  disabled={isSubmitting}
                />

                <div className="pt-2">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <CButton
                      text={isSubmitting ? "PROCESSING..." : "GET FREE DEMO"}
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                      className="w-full h-12 text-base font-bold rounded-md bg-[#D97706] text-white hover:bg-[#B45309] transition-all shadow-md"
                    />
                  </motion.div>
                </div>
              </form>

              <p className="text-[10px] text-center text-[#4B4B4B] mt-4 uppercase tracking-widest font-medium">
                Agree to our{" "}
                <span 
                  onClick={() => { onClose(); navigate("/privacyPolicy"); }}
                  className="text-[#D97706] cursor-pointer hover:underline font-bold"
                >
                  Privacy Policy
                </span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DemoBook;