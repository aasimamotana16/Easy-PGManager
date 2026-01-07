import React, { useState } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import CInput from "../../components/cInput";
import CButton from "../../components/cButton";
import { contactInfo } from "../../config/staticData";

const Contact = () => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ name, mobile, email, message });
  };

  return (
    <div className="min-h-screen flex flex-col bg-default text-text-secondary">
      <Navbar />

      {/* Page title */}
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
                <div className="flex gap-4">
                  <CInput
                    label="First Name"
                    type="text"
                    value={name.split(" ")[0] || name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <CInput
                    label="Last Name"
                    type="text"
                    value={name.split(" ")[1] || ""}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <CInput
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <CInput
                  label="Phone Number"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
                 <CInput
                  label="Your Message"
                  type="text"
                  multiline
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
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

        {/* RIGHT: How can we help box */}
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

            {/* Additional info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              <div className="bg-gray-50 p-6 rounded-xl shadow flex flex-col">
                <h4 className="font-bold text-gray-900 mb-2">General Communication</h4>
                <p className="text-gray-700 text-sm">For other queries, please get in touch with us via email.</p>
                <p className="mt-2 font-medium text-indigo-600">{contactInfo.email}</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl shadow flex flex-col">
                <h4 className="font-bold text-gray-900 mb-2">Documentation</h4>
                <p className="text-gray-700 text-sm">Get an overview of our features, integrations, and how to use them.</p>
                <a
                  href="#"
                  className="mt-2 font-medium text-indigo-600 hover:underline"
                >
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
