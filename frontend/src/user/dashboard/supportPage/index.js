import React, { useState } from "react";
import CButton from "../../../components/cButton";
import CInput from "../../../components/cInput";

const Support = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Call backend API here to save support request
    console.log("Support Request Submitted:", formData);
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="space-y-8">

      {/* GRADIENT WRAPPER */}
      <div className=" rounded-md p-6 space-y-6">

        {/* SUPPORT CARD */}

          <h2 className="text-2xl font-semibold text-primary">Support</h2>
          <p className="text-gray-600 text-md">
            Need help? Contact our support team or submit your query below.
          </p>
          <div className="bg-white rounded-md shadow p-6 space-y-5">
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
              className="  "
            >
              Submit
            </CButton>
          </form>
        </div>

      </div>
    </div>
  );
};

// Reusable Info component
const Info = ({ label, value }) => (
  <div className="bg-gray-50 rounded-md p-4">
    <p className="text-text-muted  text-xs mb-1">{label}</p>
    <p className="font-medium">{value}</p>
  </div>
);

export default Support;
