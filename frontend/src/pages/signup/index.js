import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/navbar";
import CFormCard from "../../components/cFormCard";
import CInput from "../../components/cInput";
import CButton from "../../components/cButton";

import { registerUser } from "../../api/api";

const SignUp = () => {
  const navigate = useNavigate();

  // 🔹 BACKGROUND IMAGE STATE (NEW)
  const images = [
    "/images/aboutImages/aboutIMG1.png",
    "/images/loginImages/loginImg1.jpg",
    "/images/loginImages/loginImg2.jpg",
  ];
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000); // change every 5s
    return () => clearInterval(interval);
  }, []);

  const [role, setRole] = useState("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [otpStage, setOtpStage] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpMessage, setOtpMessage] = useState("");

  const validateEmail = (email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  };

  const generateOtp = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const handleSendOtp = () => {
    if (!email || !phone) {
      alert("Please enter your email and phone number to receive OTP.");
      return;
    }
    const otp = generateOtp();
    setGeneratedOtp(otp);
    setOtpMessage("OTP sent! (Check console for demo)");
    console.log("Generated OTP:", otp);
    setOtpStage(true);
  };

  const handleVerifyOtpAndSignup = async () => {
    if (enteredOtp !== generatedOtp) {
      setOtpMessage("❌ OTP incorrect. Please try again.");
      return;
    }
    if (!name || !email || !phone || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }
    if (!validateEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser({ role, name, email, phone, password });
      if (response?.data?.success) {
        alert("Sign up successful! Please login.");
        navigate("/login");
      } else {
        alert(response?.data?.message || "Sign up failed.");
      }
    } catch (error) {
      console.error("SignUp Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background.DEFAULT">
      <Navbar />

      {/* 🔹 IMAGE FADE SECTION */}
      <section className="relative w-full h-screen px-4 sm:px-8 lg:px-20 flex overflow-hidden">

        {/* Background Images */}
        {images.map((img, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              backgroundImage: `url('${img}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: index === currentImage ? 1 : 0,
            }}
          />
        ))}

        {/* FORM CONTAINER */}
        <div
          className="
            relative z-10
            w-full
            max-w-xs
            sm:w-4/5
            md:max-w-lg
            lg:max-w-xl
            flex flex-col
            justify-center
            h-full
            mx-auto
            lg:mx-0
          "
        >
          <CFormCard className="bg-white border border-border rounded-xl shadow-lg p-5 sm:p-8 md:p-10 w-full">

            {/* Logo */}
            <div className="mb-2 flex justify-center">
              <img
                src="/logos/logo1.png"
                alt="EasyPG Manager Logo"
                className="h-16 md:h-20 w-auto"
              />
            </div>

            {!otpStage ? (
              <>
                <h1 className="text-xl sm:text-2xl font-bold mb-4 text-primary text-center">
                  Create Your EasyPG Manager Account
                </h1>

                <div className="flex flex-col gap-2 overflow-hidden">
                  <div className="flex gap-2 mb-2">
                    <CButton
                      size="sm"
                      fullWidth
                      variant={role === "user" ? "contained" : "outlined"}
                      onClick={() => setRole("user")}
                    >
                      User
                    </CButton>
                    <CButton
                      size="sm"
                      fullWidth
                      variant={role === "owner" ? "contained" : "outlined"}
                      onClick={() => setRole("owner")}
                    >
                      Owner
                    </CButton>
                  </div>

                  <CInput label="Full Name" value={name} placeholder="Enter your full name" onChange={(e) => setName(e.target.value)} />
                  <CInput label="Email" type="email" value={email} placeholder="Enter your email address" onChange={(e) => setEmail(e.target.value)} />
                  <CInput label="Phone Number" type="tel" value={phone} placeholder="Enter your phone number" onChange={(e) => setPhone(e.target.value)} />
                  <CInput label="Password" type="password" value={password} placeholder="Enter your password" onChange={(e) => setPassword(e.target.value)} />
                  <CInput label="Confirm Password" type="password" value={confirmPassword} placeholder="Confirm your password" onChange={(e) => setConfirmPassword(e.target.value)} />

                  <CButton type="button" fullWidth variant="contained" className="mt-2 py-2 text-base rounded-md font-medium" onClick={handleSendOtp}>
                    Send OTP
                  </CButton>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4 cursor-pointer" onClick={() => setOtpStage(false)}>
                  <span className="text-xl font-bold">←</span>
                  <span className="text-sm text-primary font-medium">Back</span>
                </div>

                <h1 className="text-2xl font-bold mb-5 text-primary text-center">Verify OTP</h1>

                {otpMessage && <p className="text-center text-sm mb-2">{otpMessage}</p>}

                <CInput label="Enter OTP" value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value)} />

                <CButton type="button" fullWidth variant="contained" className="mt-2 py-2 text-base rounded-md font-medium" onClick={handleVerifyOtpAndSignup} disabled={loading}>
                  {loading ? "Signing Up..." : "Verify OTP & Sign Up"}
                </CButton>
              </>
            )}

            <p className="text-center mt-2 text-sm text-text-secondary">
              Already have an account?{" "}
              <span onClick={() => navigate("/login")} className="font-semibold text-primary cursor-pointer hover:underline">
                Login
              </span>
            </p>

          </CFormCard>
        </div>
      </section>
    </div>
  );
};

export default SignUp;
