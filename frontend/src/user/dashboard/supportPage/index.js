import React, { useState } from "react";
import CButton from "../../../components/cButton";
import CInput from "../../../components/cInput";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2

const Support = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/auth/support/submit", {
        ticketSubject: formData.subject,
        issueDescription: formData.message,
        email: formData.email,
        name: formData.name,
      });

      if (response.data.success) {
        // SweetAlert Success instead of manual state
        Swal.fire({
          title: "Submitted!",
          text: "Your query has been submitted successfully!",
          icon: "success",
          confirmButtonColor: "#D97706",
        });

        setFormData({ name: "", email: "", subject: "", message: "" });
      }
    } catch (error) {
      console.error("Support Submission Error:", error);
      
      // SweetAlert Error
      Swal.fire({
        title: "Submission Failed",
        text: error.response?.data?.message || "Connection failed. Please try again later.",
        icon: "error",
        confirmButtonColor: "#D97706",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-6 bg-gray-200 min-h-screen">
      <div className="space-y-2">
        <h2 className=" text-primary">Support</h2>
        <h3 className="text-gray-600 text-md">
          Need help? Contact our support team or submit your query below.
        </h3>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 space-y-5">
        {/* Support Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Info label="Email" value="support@easypgmanager.com" />
          <Info label="Phone" value="+91 98765 43210" />
          <Info label="Working Hours" value="Mon-Sat, 9AM - 6PM" />
        </div>

        {/* Support Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CInput
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <CInput
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <div className="md:col-span-2">
            <CInput
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>
          <div className="md:col-span-2">
             <CInput
              type="textarea"
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              required
              className="h-32"
            />
          </div>
          <CButton
            type="submit"
            disabled={loading}
            className="md:col-span-2"
          >
            {loading ? "Submitting..." : "Submit"}
          </CButton>
        </form>
      </div>
    </div>
  );
};

// Fixed Info Component
const Info = ({ label, value }) => (
  <div className="bg-gray-50 rounded-md p-4 text-center border border-primary">
    <p className="text-[#4B4B4B] text-xs uppercase tracking-wider mb-1">{label}</p>
    <p className="text-[#1C1C1C] font-semibold">{value}</p>
  </div>
);

export default Support;