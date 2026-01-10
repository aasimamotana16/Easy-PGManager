import React, { useState } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import CInput from "../../components/cInput";
import CButton from "../../components/cButton";
import { contactInfo } from "../../config/staticData";
import { useNavigate } from "react-router-dom";

const Contact = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!mobile.trim()) {
      newErrors.mobile = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(mobile)) {
      newErrors.mobile = "Enter a valid 10-digit phone number";
    }

    if (!message.trim()) {
      newErrors.message = "Message cannot be empty";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    console.log({
      name: fullName,
      mobile,
      email,
      message,
    });

    setFullName("");
    setMobile("");
    setEmail("");
    setMessage("");
    setErrors({});
  };

  return (
    <div className="min-h-screen flex flex-col bg-default text-text-secondary">
      <Navbar />

      <div className="text-center mt-6 mb-6 px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-black">
          Contact Us
        </h2>
      </div>

      <main className="flex-1 flex flex-col lg:flex-row gap-10 px-4 lg:px-12 mb-10">
        {/* LEFT FORM */}
        <div className="flex-1 flex items-start justify-center">
          <div className="w-full max-w-2xl">
            <div className="bg-white border rounded-xl p-10 shadow-lg">
              <h2 className="text-center font-bold mb-6 text-3xl text-primary">
                Contact our Sales Team
              </h2>

              <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <CInput
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm -mt-3">
                    {errors.fullName}
                  </p>
                )}

                <CInput
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm -mt-3">
                    {errors.email}
                  </p>
                )}

                <CInput
                  label="Phone Number"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
                {errors.mobile && (
                  <p className="text-red-500 text-sm -mt-3">
                    {errors.mobile}
                  </p>
                )}

                <CInput
                  label="Your Message"
                  multiline
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                {errors.message && (
                  <p className="text-red-500 text-sm -mt-3">
                    {errors.message}
                  </p>
                )}

                <CButton
                  type="submit"
                  text="Send Message"
                  variant="contained"
                  className="mt-3 w-full py-3 font-semibold text-lg"
                />
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT INFO */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col justify-center h-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              How can We Help?
            </h3>

            <p className="text-gray-600 mb-4">
              Get in touch with our sales and support teams for demos, onboarding
              support, or product questions.
            </p>

            <ul className="space-y-3">
              <li className="flex items-center gap-2 font-semibold">
                <span className="text-green-500">✔</span> Request a demo
              </li>
              <li className="flex items-center gap-2 font-semibold">
                <span className="text-green-500">✔</span> Learn which plan is
                right for your team
              </li>
              <li className="flex items-center gap-2 font-semibold">
                <span className="text-green-500">✔</span> Get onboarding help
              </li>
            </ul>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              {/* EMAIL CARD */}
              <div className="bg-gray-50 p-6 rounded-xl shadow">
                <h4 className="font-bold text-gray-900 mb-2">
                  General Communication
                </h4>
                <p className="text-gray-700 text-sm mb-2">
                  For other queries, please get in touch with us via email.
                </p>
                <p className="font-medium text-indigo-600 break-all">
                email:support@easyPGmanager.com
                </p>
              </div>

              {/* ABOUT US CARD */}
              <div className="bg-gray-50 p-6 rounded-xl shadow">
                <h4 className="font-bold text-gray-900 mb-2">
                  About EasyPG Manager
                </h4>
                <p className="text-gray-700 text-sm mb-2">
                  Learn more about our mission, vision, and how EasyPG Manager
                  helps PG owners and tenants.
                </p>
                <button
                  onClick={() => navigate("/about")}
                  className="font-medium text-indigo-600 hover:underline"
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
