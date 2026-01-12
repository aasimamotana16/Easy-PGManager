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
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    console.log(form);

    setForm({
      fullName: "",
      email: "",
      mobile: "",
      message: "",
    });
    setErrors({});
  };

  /* ---------------- CHANGE HANDLER ---------------- */
  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });

    // remove red label as soon as user types
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
          <div className="w-full max-w-2xl">
            <div className="bg-white border rounded-xl p-10 shadow-lg">
              <h2 className="text-center font-bold mb-6 text-3xl text-primary">
                Contact our Sales Team
              </h2>

              <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                {/* FULL NAME */}
                <CInput
                  label={
                    <span
                      className={
                        errors.fullName ? "text-red-600 font-semibold" : ""
                      }
                    >
                      Full Name
                      {errors.fullName && (
                        <span className="text-red-600 ml-1">*</span>
                      )}
                    </span>
                  }
                  value={form.fullName}
                  onChange={handleChange("fullName")}
                />

                {/* EMAIL */}
                <CInput
                  label={
                    <span
                      className={
                        errors.email ? "text-red-600 font-semibold" : ""
                      }
                    >
                      Email Address
                      {errors.email && (
                        <span className="text-red-600 ml-1">*</span>
                      )}
                    </span>
                  }
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                />

                {/* PHONE */}
                <CInput
                  label={
                    <span
                      className={
                        errors.mobile ? "text-red-600 font-semibold" : ""
                      }
                    >
                      Phone Number
                      {errors.mobile && (
                        <span className="text-red-600 ml-1">*</span>
                      )}
                    </span>
                  }
                  type="tel"
                  value={form.mobile}
                  onChange={handleChange("mobile")}
                />

                {/* MESSAGE */}
                <CInput
                  label={
                    <span
                      className={
                        errors.message ? "text-red-600 font-semibold" : ""
                      }
                    >
                      Your Message
                      {errors.message && (
                        <span className="text-red-600 ml-1">*</span>
                      )}
                    </span>
                  }
                  multiline
                  rows={6}
                  value={form.message}
                  onChange={handleChange("message")}
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

        {/* RIGHT INFO */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              How can We Help?
            </h3>

            <p className="text-gray-600 mb-4">
              Get in touch with our sales and support teams for demos,
              onboarding support, or product questions.
            </p>

            <ul className="space-y-3">
              <li className="flex items-center gap-2 font-semibold">
                <span className="text-green-500">✔</span> Request a demo
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
                <h4 className="font-bold text-gray-900 mb-2">
                  General Communication
                </h4>
                <p className="text-sm text-gray-700 mb-2">
                  Email us at:
                </p>
                <p className="font-medium text-indigo-600 break-all">
                  support@easyPGmanager.com
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl shadow">
                <h4 className="font-bold text-gray-900 mb-2">
                  About EasyPG Manager
                </h4>
                <p className="text-sm text-gray-700 mb-2">
                  Learn more about our mission and product.
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
