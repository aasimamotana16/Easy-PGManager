import React, { useState } from "react";
import CButton from "../../../components/cButton";
import CInput from "../../../components/cInput";
import axios from "axios"; // Added for connection

const Support = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
    

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false); // New: Invisible logic state

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault(); // Stops the "mistaken" refresh
    setLoading(true);
    
    try {
      // [cite: 2026-01-06] Connecting the owner flow to the backend perfectly
      const response = await axios.post("http://localhost:5000/api/auth/support/submit", {
        ticketSubject: formData.subject,   
        issueDescription: formData.message, 
        email: formData.email,
        name: formData.name
      });

      if (response.data.success) {
        setSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (error) {
      console.error("Support Submission Error:", error);
      alert(error.response?.data?.message || "Connection failed. Check your terminal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* GRADIENT WRAPPER */}
      <div className="rounded-md p-6 space-y-6">
        {/* SUPPORT CARD */}
        <h2 className="text-2xl font-semibold text-primary">Support</h2>
        <p className="text-gray-600 text-md">
          Need help? Contact our support team or submit your query below.
        </p>
        <div className="bg-white rounded-2xl shadow p-6 space-y-5">
          {/* Support Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Info label="Email" value="support@easypgmanager.com" />
            <Info label="Phone" value="+91 98765 43210" />
            <Info label="Working Hours" value="Mon-Sat, 9AM - 6PM" />
          </div>

          {/* Support Form */}
          {submitted && (
            <p className="text-green-600 font-medium mb-3">
              Your query has been submitted successfully!
            </p>
          )}

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
            <CInput
              type="text"
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="md:col-span-2"
            />
            <CInput
              type="textarea"
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              required
              className="md:col-span-2 h-32"
            />
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
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-gray-50 rounded-md p-4">
    <p className="text-text-muted text-xs mb-1">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

export default Support;