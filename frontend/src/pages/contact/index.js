import React, { useState } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import CInput from "../../components/cInput";
import CButton from "../../components/cButton";
import { useNavigate } from "react-router-dom";

const Contact = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // New loading state

  /* ---------------- VALIDATION (NO MESSAGES) ---------------- */
  const validate = () => {
    const newErrors = {};

    if (!form.fullName.trim()) newErrors.fullName = true;
    if (!form.email.trim()) newErrors.email = true;
    if (!form.mobile.trim()) newErrors.mobile = true;
    if (!form.message.trim()) newErrors.message = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true); // Start loading

    // Prepare data to match your backend model [cite: 2026-01-01]
    const contactData = {
      fullName: form.fullName,
      emailAddress: form.email,
      phoneNumber: form.mobile,
      yourMessage: form.message,
    };

    try {
      const response = await fetch("http://localhost:5000/api/contact-us", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactData),
      });

      const data = await response.json();

      if (data.success) {
        alert("Message sent successfully!");
        setForm({
          fullName: "",
          email: "",
          mobile: "",
          message: "",
        });
        setErrors({});
      } else {
        alert("Failed to send message: " + data.message);
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert("Server is not responding. Please check your backend.");
    } finally {
      setLoading(false); // Stop loading regardless of outcome
    }
  };

  /* ---------------- CHANGE HANDLER ---------------- */
  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });

    if (errors[field]) {
      setErrors({ ...errors, [field]: false });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-default text-text-secondary">
      <Navbar />

      {/* HEADER */}
      <div className="text-center mt-6 mb-6 px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-black">
          Contact Us
        </h2>
      </div>

      <main className="flex-1 flex flex-col lg:flex-row gap-10 px-4 lg:px-12 mb-10">
        {/* LEFT FORM */}
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-2xl  md:max-w-3xl mx-auto ">
            <div className="bg-white border rounded-md p-10 shadow-lg">
              <h2 className="text-center font-bold mb-6 text-3xl sm:text-4xl text-primary">
                Contact our Sales Team
              </h2>

             <form
  className="flex flex-col gap-4 sm:gap-5 lg:gap-6"
  onSubmit={handleSubmit}
>
  {/* FULL NAME */}
  <CInput
    label={
      <span
        className={`
          block
          text-base sm:text-lg lg:text-base
          ${errors.fullName ? "text-red-600 font-semibold" : "text-gray-800"}
        `}
      >
        Full Name
        {errors.fullName && <span className="text-red-600 ml-1">*</span>}
      </span>
    }
    value={form.fullName}
    onChange={handleChange("fullName")}
    disabled={loading}
  />

  {/* EMAIL */}
  <CInput
    label={
      <span
        className={`
          block
          text-base sm:text-lg lg:text-base
          ${errors.email ? "text-red-600 font-semibold" : "text-gray-800"}
        `}
      >
        Email Address
        {errors.email && <span className="text-red-600 ml-1">*</span>}
      </span>
    }
    type="email"
    value={form.email}
    onChange={handleChange("email")}
    disabled={loading}
  />

  {/* PHONE */}
  <CInput
    label={
      <span
        className={`
          block
          text-base sm:text-lg lg:text-base
          ${errors.mobile ? "text-red-600 font-semibold" : "text-gray-800"}
        `}
      >
        Phone Number
        {errors.mobile && <span className="text-red-600 ml-1">*</span>}
      </span>
    }
    type="tel"
    value={form.mobile}
    onChange={handleChange("mobile")}
    disabled={loading}
  />

  {/* MESSAGE */}
  <CInput
    label={
      <span
        className={`
          block
          text-base sm:text-lg lg:text-base
          ${errors.message ? "text-red-600 font-semibold" : "text-gray-800"}
        `}
      >
        Your Message
        {errors.message && <span className="text-red-600 ml-1">*</span>}
      </span>
    }
    multiline
    rows={6}
    value={form.message}
    onChange={handleChange("message")}
    disabled={loading}
  />

  {/* SUBMIT BUTTON */}
  <CButton
    type="submit"
    text={loading ? "Sending..." : "Send Message"}
    disabled={loading}
    variant="contained"
    className="
      mt-2
      w-full
      py-3 sm:py-3 lg:py-3
      text-lg sm:text-lg lg:text-lg
      font-semibold
    "
  />
</form>

            </div>
          </div>
        </div>

        {/* RIGHT INFO */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl md:text-4xl lg:text-2xl font-bold text-gray-900 mb-4">
              How can We Help?
            </h3>

            <p className="text-gray-600 mb-4 md:text-2xl lg:text-xl">
              Get in touch with our sales and support teams for demos,
              onboarding support, or product questions.
            </p>

            <ul className="space-y-3 md:text-2xl lg:text-xl">
              <li className="flex items-center gap-2 font-semibold">
                <span className="text-green-500 ">✔</span> Request a demo
              </li>
              <li className="flex items-center gap-2 font-semibold">
                <span className="text-green-500">✔</span> Choose the right plan
              </li>
              <li className="flex items-center gap-2 font-semibold">
                <span className="text-green-500">✔</span> Get onboarding help
              </li>
            </ul>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <div className="bg-gray-50 p-6 rounded-xl shadow">
                <h4 className="font-bold text-gray-900 mb-2 md:text-2xl lg:text-xl">
                  General Communication
                </h4>
                <p className="text-sm text-gray-700 mb-2 md:text-2xl lg:text-xl">Email us at:</p>
                <p className="font-medium text-indigo-600 break-all md:text-2xl lg:text-xl">
                  support@easyPGmanager.com
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl shadow">
                <h4 className="font-bold text-gray-900 mb-2 md:text-2xl lg:text-xl">
                  About EasyPG Manager
                </h4>
                <p className="text-sm text-gray-700 mb-2 md:text-2xl lg:text-xl">
                  Learn more about our mission and product.
                </p>
                <button
                  onClick={() => navigate("/about")}
                  className="font-medium text-indigo-600 hover:underline md:text-2xl lg:text-xl "
                >
                  About Us →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;