import React, { useState } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import CInput from "../../components/cInput";
import CButton from "../../components/cButton";
import { contactInfo } from "../../config/staticData";

const Contact = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
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
    } else if (message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const fullName = `${firstName} ${lastName}`;

    console.log({
      name: fullName,
      mobile,
      email,
      message,
    });

    // Reset
    setFirstName("");
    setLastName("");
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
        {/* LEFT: Contact Form */}
        <div className="flex-1 flex items-start justify-center">
          <div className="w-full max-w-2xl">
            <div className="bg-white border rounded-xl p-10 shadow-lg">
              <h2 className="text-center font-bold mb-6 text-3xl text-primary">
                Contact our Sales Team
              </h2>

              <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <div className="flex gap-14">
                  <CInput
                    label="First Name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="px-10"
                  />
                  <CInput
                    label="Last Name"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="px-10"
                  />
                </div>

                {(errors.firstName || errors.lastName) && (
                  <p className="text-red-500 text-sm -mt-3">
                    {errors.firstName || errors.lastName}
                  </p>
                )}

                <CInput
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm -mt-3">{errors.email}</p>
                )}

                <CInput
                  label="Phone Number"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
                {errors.mobile && (
                  <p className="text-red-500 text-sm -mt-3">{errors.mobile}</p>
                )}

                <CInput
                  label="Your Message"
                  type="text"
                  multiline
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                {errors.message && (
                  <p className="text-red-500 text-sm -mt-3">{errors.message}</p>
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

        {/* RIGHT SIDE */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col justify-center h-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              How can We Help?
            </h3>
            <p className="text-gray-600 mb-4">
              Get in touch with our sales and support teams for demos, onboarding support, or product questions.
            </p>

            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-700 font-semibold">
                <span className="text-green-500 text-xl">✔</span>
                Request a demo
              </li>
              <li className="flex items-center gap-2 text-gray-700 font-semibold">
                <span className="text-green-500 text-xl">✔</span>
                Learn which plan is right for your team
              </li>
              <li className="flex items-center gap-2 text-gray-700 font-semibold">
                <span className="text-green-500 text-xl">✔</span>
                Get onboarding help
              </li>
            </ul>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <div className="bg-gray-50 p-6 rounded-xl shadow flex flex-col">
                <h4 className="font-bold text-gray-900 mb-2">
                  General Communication
                </h4>
                <p className="text-gray-700 text-sm">
                  For other queries, please get in touch with us via email.
                </p>
                <p className="mt-2 font-medium text-indigo-600">
                  {contactInfo.email}
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl shadow flex flex-col">
                <h4 className="font-bold text-gray-900 mb-2">
                  Documentation
                </h4>
                <p className="text-gray-700 text-sm">
                  Get an overview of our features, integrations, and how to use them.
                </p>
                <a href="#" className="mt-2 font-medium text-indigo-600 hover:underline">
                  See Docs →
                </a>
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
