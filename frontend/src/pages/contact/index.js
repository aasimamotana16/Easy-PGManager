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
    <div className="min-h-screen flex flex-col bg-white text-text-secondary">
      <Navbar />

      {/* Page title */}
      <h2 className="text-3xl lg:text-4xl font-bold text-center mt-10 mb-8">
        CONTACT US
      </h2>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 px-4 lg:px-12 py-6 gap-10">
        {/* LEFT: Contact Info */}
        <div className="bg-yellow-200 p-8 rounded-xl flex flex-col justify-center shadow-lg text-black font-semibold text-center space-y-6">
          <div>
            <p className="text-xl font-bold">Email Address</p>
            <p className="mt-2">{contactInfo.email}</p>
            <hr className="my-3 border-black" />
          </div>
          <div>
            <p className="text-xl font-bold">Contact Number</p>
            <p className="mt-2">For info : <strong>{contactInfo.supportPhone}</strong></p>
            <p className="mt-1">For support details: <strong>{contactInfo.infoPhone}</strong></p>
            <hr className="my-3 border-black" />
          </div>
          <div>
            <p className="text-xl font-bold">Address</p>
            <p className="mt-2">{contactInfo.addressLine1}</p>
            <p className="mt-1">{contactInfo.addressLine2}</p>
          </div>
        </div>

        {/* RIGHT: Form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="border-4 border-indigo-500 rounded-xl p-8 shadow-lg">
              <h2 className="text-center font-bold mb-6 text-3xl text-indigo-600">
                Get A Quote
              </h2>
              <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <CInput
                  label="Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <CInput
                  label="Mobile Number"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
                <CInput
                  label="Email ID *"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <CInput
                  label="Message"
                  type="text"
                  multiline
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div className="flex justify-between gap-4 mt-4">
                  <CButton
                    type="button"
                    text="CANCEL"
                    variant="outlined"
                    className="w-1/2 py-3 font-semibold"
                    onClick={() => {
                      setName("");
                      setMobile("");
                      setEmail("");
                      setMessage("");
                    }}
                  />
                  <CButton
                    type="submit"
                    text="SUBMIT"
                    variant="contained"
                    className="w-1/2 py-3 font-semibold"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
