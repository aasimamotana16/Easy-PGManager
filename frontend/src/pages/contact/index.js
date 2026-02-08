import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import CInput from "../../components/cInput";
import CButton from "../../components/cButton";
import Loader from "../../components/loader";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

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
    if (!form.fullName.trim()) newErrors.fullName = true;
    
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!form.email.trim() || !emailRegex.test(form.email)) newErrors.email = true;
    
    if (!form.mobile.trim() || form.mobile.length !== 10) newErrors.mobile = true;
    
    if (!form.message.trim()) newErrors.message = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill all required fields correctly.',
        confirmButtonColor: "#f97316",
      });
      return;
    }

    setLoading(true);

    const contactData = {
      fullName: form.fullName,
      emailAddress: form.email,
      phoneNumber: form.mobile,
      yourMessage: form.message,
    };

    try {
      const response = await fetch("http://localhost:5000/api/contact-us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Message Sent!',
          text: 'Our team will get back to you shortly.',
          confirmButtonColor: "#f97316",
        });

        setForm({ fullName: "", email: "", mobile: "", message: "" });
        setErrors({});
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: data.message || 'Something went wrong.',
          confirmButtonColor: "#f97316",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Server Error',
        text: 'The server is not responding. Please try again later.',
        confirmButtonColor: "#f97316",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- CHANGE HANDLER ---------------- */
  const handleChange = (field) => (e) => {
    let value = e.target.value;

    if (field === "mobile") {
      value = value.replace(/\D/g, ""); 
      if (value.length > 10) return; 
    }

    setForm({ ...form, [field]: value });

    if (errors[field]) {
      setErrors({ ...errors, [field]: false });
    }
  };

  if (pageLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-text-secondary">
      <Navbar />

      {/* UPDATED HEADING: Bold tracking-tight style */}
      <div className="text-center mt-10 mb-10 px-4">
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 tracking-tight">
          Contact Us
        </h1>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          Have questions? Our team is here to help.
        </p>
      </div>

      <main className="flex-1 flex flex-col lg:flex-row gap-16 px-4 lg:px-12 mb-10 max-w-8xl mx-auto w-full">
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-2xl md:max-w-3xl mx-auto ">
            {/* UPDATED: Added border-gray-200 to match Filter Card */}
            <div className="bg-white border  border-primary rounded-md p-10 shadow-lg">
              <h2 className="text-center mb-6 text-3xl sm:text-4xl font-bold text-primary tracking-tight">
                Get in Touch
              </h2>

              <form className="flex flex-col gap-4 sm:gap-5 lg:gap-6" onSubmit={handleSubmit}>
                <CInput
                  label="Full Name"
                  required
                  error={errors.fullName}
                  value={form.fullName}
                  onChange={handleChange("fullName")}
                  disabled={loading}
                  placeholder="Enter your full name"
                />

                <CInput
                  label="Email Address"
                  type="email"
                  required
                  error={errors.email}
                  value={form.email}
                  onChange={handleChange("email")}
                  disabled={loading}
                  placeholder="example@mail.com"
                />

                <CInput
                  label="Phone Number (10 Digits)"
                  required
                  error={errors.mobile}
                  value={form.mobile}
                  onChange={handleChange("mobile")}
                  disabled={loading}
                  placeholder="Enter mobile number"
                  onWheel={(e) => e.target.blur()} // Prevents scroll changes
                />

                <CInput
                  label="Your Message"
                  type="textarea"
                  required
                  error={errors.message}
                  rows={5}
                  value={form.message}
                  onChange={handleChange("message")}
                  disabled={loading}
                  placeholder="How can we help you?"
                />

                <CButton
                  type="submit"
                  text={loading ? "Sending..." : "Send Message"}
                  disabled={loading}
                  variant="contained"
                  className="mt-2 w-full py-3 text-lg font-bold"
                />
              </form>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          {/* UPDATED: Added border-gray-200 */}
          <div className="bg-white p-8 rounded-md shadow-lg border border-primary">
            <h3 className="text-2xl md:text-4xl lg:text-2xl font-bold text-gray-900 mb-4 tracking-tight">
              How can We Help?
            </h3>
            <p className="text-gray-600 mb-4 md:text-2xl lg:text-xl">
              Get in touch with our support team for demos,
              onboarding help, or product questions.
            </p>
            <ul className="space-y-3 md:text-2xl lg:text-xl font-medium">
              <li className="flex items-center gap-2"><span className="text-green-500 ">✔</span> Request a demo</li>
              <li className="flex items-center gap-2"><span className="text-green-500 ">✔</span> Choose the right plan</li>
              <li className="flex items-center gap-2"><span className="text-green-500 ">✔</span> Get onboarding help</li>
            </ul>
            <div className="mt-8">
              {/* UPDATED: Added border-gray-200 */}
              <div className="bg-gray-50 p-6 rounded-xl shadow border border-gray-200">
                <h4 className=" text-gray-900 mb-2 text-lg md:text-2xl lg:text-xl font-bold">General Communication</h4>
                <p className="text-sm md:text-xl lg:text-base text-gray-600 mb-1">Email us at:</p>
                <p className="font-semibold text-indigo-600 break-all text-base md:text-2xl lg:text-xl">support@easyPGmanager.com</p>
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