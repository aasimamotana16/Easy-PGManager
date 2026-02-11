import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import CInput from "../../components/cInput";
import CButton from "../../components/cButton";
import CFormCard from "../../components/cFormCard";
import Loader from "../../components/loader";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

const Contact = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.mobile.trim()) {
      newErrors.mobile = "Phone number is required";
    } else if (form.mobile.length !== 10) {
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    }

    if (!form.message.trim()) {
      newErrors.message = "Message cannot be empty";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill all required fields correctly.",
        confirmButtonColor: "#D97706",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/contact-us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          emailAddress: form.email,
          phoneNumber: form.mobile,
          yourMessage: form.message,
        }),
      });
      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Message Sent!",
          text: "Our team will get back to you shortly.",
          confirmButtonColor: "#D97706",
        });
        setForm({ fullName: "", email: "", mobile: "", message: "" });
        setErrors({});
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Server Error", confirmButtonColor: "#D97706" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    let value = e.target.value;
    if (field === "mobile") {
      value = value.replace(/\D/g, "");
      if (value.length > 10) return;
    }
    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  if (pageLoading) return <Loader />;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#4B4B4B]">
      <Navbar />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mt-10 mb-10 px-4"
      >
        <h1 className="text-h1-sm lg:text-h1 font-bold text-[#1C1C1C] tracking-tight">
          Contact Us
        </h1>
        <p className="text-[#4B4B4B] mt-2 text-sm sm:text-base font-medium">
          Have questions? Our team is here to help.
        </p>
      </motion.div>

      <main className="flex-1 flex flex-col lg:flex-row gap-16 px-4 lg:px-12 mb-16 max-w-8xl mx-auto w-full">
        
        {/* Contact Form Card */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 flex justify-center"
        >
          <CFormCard className="w-full max-w-2xl md:max-w-3xl border-[#D97706] p-8 lg:p-12">
            <h2 className="text-center mb-8 text-3xl sm:text-4xl font-bold text-[#D97706] tracking-tight">
              Get in Touch
            </h2>

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <CInput 
                label="Full Name" 
                required 
                error={!!errors.fullName} 
                helperText={errors.fullName} // Integrated helperText
                value={form.fullName} 
                onChange={handleChange("fullName")} 
                disabled={loading} 
              />

              <CInput 
                label="Email Address" 
                type="email" 
                required 
                error={!!errors.email} 
                helperText={errors.email} // Integrated helperText
                value={form.email} 
                onChange={handleChange("email")} 
                disabled={loading} 
              />

              <CInput 
                label="Phone Number" 
                type="tel"
                required 
                error={!!errors.mobile} 
                helperText={errors.mobile} // Integrated helperText
                value={form.mobile} 
                onChange={handleChange("mobile")} 
                disabled={loading} 
                onWheel={(e) => e.target.blur()} 
              />

              <CInput 
                label="Your Message" 
                type="textarea" 
                required 
                error={!!errors.message} 
                helperText={errors.message} // Integrated helperText
                rows={5} 
                value={form.message} 
                onChange={handleChange("message")} 
                disabled={loading} 
              />

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="mt-4">
                <CButton 
                  type="submit" 
                  text={loading ? "Sending..." : "Send Message"} 
                  disabled={loading} 
                  variant="contained" 
                  className="w-full py-4 text-lg font-bold shadow-md bg-[#D97706]" 
                />
              </motion.div>
            </form>
          </CFormCard>
        </motion.div>

        {/* Info Column */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="flex-1 flex flex-col gap-8"
        >
          <div className="bg-white p-8 rounded-md shadow-lg border border-[#D97706]">
            <h3 className="text-2xl md:text-3xl font-bold text-[#1C1C1C] mb-4">
              How can We Help?
            </h3>
            <p className="text-[#4B4B4B] mb-6 text-lg">
              Get in touch with our support team for demos, onboarding help, or product questions.
            </p>
            <ul className="space-y-4 text-lg font-medium">
              <li className="flex items-center gap-3"><span className="text-[#D97706] font-bold">✔</span> Request a demo</li>
              <li className="flex items-center gap-3"><span className="text-[#D97706] font-bold">✔</span> Choose the right plan</li>
              <li className="flex items-center gap-3"><span className="text-[#D97706] font-bold">✔</span> Get onboarding help</li>
            </ul>
            
            <div className="mt-10">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-[#FEF3C7] p-8 rounded-xl shadow border border-[#E5E0D9]"
              >
                <h4 className="text-[#1C1C1C] mb-2 text-xl font-bold">General Communication</h4>
                <p className="text-[#4B4B4B] mb-1">Email us at:</p>
                <p className="font-semibold text-[#B45309] break-all text-xl underline decoration-[#D97706]/30">
                  support@easyPGmanager.com
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;