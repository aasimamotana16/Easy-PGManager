import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/navbar";
import CFormCard from "../../components/cFormCard";
import CInput from "../../components/cInput";
import CButton from "../../components/cButton";

// Import sendOtp along with registerUser
import { registerUser, sendOtp } from "../../api/api"; 

const SignUp = () => {
  const navigate = useNavigate();

  const images = [
    "/images/aboutImages/aboutIMG1.png",
    "/images/loginImages/loginImg1.jpg",
    "/images/loginImages/loginImg2.jpg",
  ];
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const [role, setRole] = useState("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [otpStage, setOtpStage] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpMessage, setOtpMessage] = useState("");

  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  };

  // ✅ UPDATED: Calls backend to generate and log the real OTP
  const handleSendOtp = async () => {
    if (!email || !phone) {
      alert("Please enter your email and phone number to receive OTP.");
      return;
    }
    if (!agreeTerms) {
      alert("Please agree to Terms & Conditions and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      // Logic from backend side to avoid merge issues [cite: 2026-01-06]
      const response = await sendOtp({ email }); 
      if (response?.data?.success) {
        setOtpMessage("OTP sent! (Check your VS Code terminal)");
        setOtpStage(true);
      } else {
        alert(response?.data?.message || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("OTP Error:", error);
      alert("Error connecting to server. Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATED: Sends fullName and otp to the backend
  const handleVerifyOtpAndSignup = async () => {
    if (!enteredOtp) {
      setOtpMessage("❌ Please enter the OTP.");
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
      const response = await registerUser({
        role,
        fullName: name, // Variable name mapped to camelCase [cite: 2026-01-01]
        email,
        phone,
        password,
        otp: enteredOtp, // Include OTP for backend verification
      });

      if (response?.data?.success) {
        alert("Sign up successful! Please login.");
        navigate("/login");
      } else {
        alert(response?.data?.message || "Sign up failed.");
      }
    } catch (error) {
      console.error("SignUp Error:", error);
      // This catches the 400 error we saw in your browser console
      alert(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background.DEFAULT">
      <section className="relative w-full h-screen px-4 sm:px-8 lg:px-20 flex overflow-hidden">
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

        <div className="relative z-10 w-full max-w-xs sm:w-4/5 md:max-w-lg lg:max-w-xl flex flex-col justify-center h-full mx-auto lg:mx-0">
          <CFormCard className="bg-white border border-border rounded-xl shadow-lg p-5 sm:p-8 md:p-10 w-full">
            <div className="mb-2 flex justify-center">
              <img
                src="/logos/logo1.png"
                alt="EasyPG Manager Logo"
                className="h-12 md:h-20 w-auto"
              />
            </div>

            {!otpStage ? (
              <>
                <h1 className="text-md sm:text-2xl font-bold mb-4 text-primary text-center">
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

                  <CInput label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                  <CInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <CInput label="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <CInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <CInput label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

                  <label className="flex items-start gap-2 text-xs text-gray-600 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 accent-primary"
                    />
                    <span>
                      I agree to the{" "}
                      <span className="text-primary font-medium hover:underline" onClick={() => navigate("/terms")}>Terms & Conditions</span> and{" "}
                      <span className="text-primary font-medium hover:underline" onClick={() => navigate("/privacy")}>Privacy Policy</span>
                    </span>
                  </label>

                  <CButton
                    type="button"
                    fullWidth
                    variant="contained"
                    className="mt-2 py-2 text-base rounded-md font-medium"
                    onClick={handleSendOtp}
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send OTP"}
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

                <CInput
                  label="Enter OTP"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                />

                <CButton
                  type="button"
                  fullWidth
                  variant="contained"
                  className="mt-2 py-2 text-base rounded-md font-medium"
                  onClick={handleVerifyOtpAndSignup}
                  disabled={loading}
                >
                  {loading ? "Signing Up..." : "Verify OTP & Sign Up"}
                </CButton>
              </>
            )}

            <p className="text-center mt-2 text-sm text-text-secondary">
              Already have an account?{" "}
              <span onClick={() => navigate("/login")} className="font-semibold text-primary cursor-pointer hover:underline">Login</span>
            </p>

            <div className="mt-3 text-center">
              <span onClick={() => navigate("/")} className="text-sm text-gray-500 cursor-pointer hover:text-primary hover:underline">← Back to Home</span>
            </div>
          </CFormCard>
        </div>
      </section>
    </div>
  );
};

export default SignUp;