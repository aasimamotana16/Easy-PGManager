import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import CFormCard from "../../components/cFormCard";
import CInput from "../../components/cInput";
import CButton from "../../components/cButton";
import Loader from "../../components/loader";

import { registerUser, sendOtp } from "../../api/api";

const SignUp = () => {
  const navigate = useNavigate();

  const images = [
    "/images/aboutImages/aboutIMG1.png",
    "/images/loginImages/loginImg1.jpg",
    "/images/loginImages/loginImg2.jpg",
  ];
  
  const [currentImage, setCurrentImage] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form States
  const [role, setRole] = useState("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // OTP States
  const [otpStage, setOtpStage] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpMessage, setOtpMessage] = useState("");

  // Validation Error States
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const validateForm = () => {
    let newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!name.trim()) newErrors.name = "Full name is required";
    if (!emailRegex.test(email)) newErrors.email = "Enter a valid email address";
    if (!phoneRegex.test(phone)) newErrors.phone = "Enter a valid 10-digit mobile number";
    if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!agreeTerms) newErrors.terms = "You must agree to the terms";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return "";
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    const mediumRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.{6,})/;
    
    if (strongRegex.test(pwd)) return { text: "Strong Password", color: "text-green-600" };
    if (mediumRegex.test(pwd)) return { text: "Medium Password", color: "text-orange-500" };
    return { text: "Weak Password", color: "text-red-500" };
  };

  const handleSendOtp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await sendOtp({ email });
      if (response?.data?.success) {
        setOtpStage(true);
        setOtpMessage("OTP sent successfully to your email.");
      } else {
        setErrors({ server: response?.data?.message || "Failed to send OTP" });
      }
    } catch (error) {
      setErrors({ server: "Server connection failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndSignup = async () => {
    if (!enteredOtp) {
      setErrors({ otp: "Please enter the OTP" });
      return;
    }

    setLoading(true);
    try {
      const response = await registerUser({
        role,
        fullName: name,
        email,
        phone,
        password,
        otp: enteredOtp,
      });

      if (response?.data?.success) {
        const userObj = response.data.user;
        localStorage.setItem("user", JSON.stringify(userObj));
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userToken", response.data.token);
        window.location.href = "/";
      } else {
        setErrors({ otp: response?.data?.message || "Sign up failed" });
      }
    } catch (error) {
      setErrors({ otp: error.response?.data?.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <Loader />;

  return (
    <div className="min-h-screen flex flex-col bg-background.DEFAULT">
      <section className="relative w-full h-screen px-4 sm:px-8 lg:px-20 flex overflow-hidden">
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImage ? "opacity-100 z-0" : "opacity-0 -z-10"
            }`}
            style={{ backgroundImage: `url('${img}')`, backgroundSize: "cover", backgroundPosition: "center" }}
          />
        ))}

        <div className="relative z-10 w-full max-w-sm sm:w-4/5 md:max-w-xl lg:max-w-2xl flex flex-col justify-center h-full mx-auto lg:mx-0">
          <CFormCard className="bg-white border border-border rounded-md shadow-lg p-5 sm:p-8 md:p-10 w-full text-sm">
            <div className="mb-2 flex justify-center">
              <img src="/logos/logo1.png" alt="Logo" className="h-10 md:h-16 w-auto" />
            </div>

            {!otpStage ? (
              <>
                <h1 className="text-sm sm:text-lg font-semibold mb-3 text-primary text-center">Create Your Account</h1>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2 mb-2">
                    <CButton size="sm" fullWidth variant={role === "user" ? "contained" : "outlined"} onClick={() => setRole("user")}>User</CButton>
                    <CButton size="sm" fullWidth variant={role === "owner" ? "contained" : "outlined"} onClick={() => setRole("owner")}>Owner</CButton>
                  </div>

                  <CInput label="Full Name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />

                  <div className="flex flex-col sm:flex-row gap-4">
                    <CInput label="Email" type="email" value={email} className="flex-1" onChange={(e) => setEmail(e.target.value)} error={errors.email} />
                    <CInput label="Phone Number" type="tel" value={phone} className="flex-1" placeholder="10-digit number" onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} error={errors.phone} />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 flex flex-col gap-1">
                      <CInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
                      {password && (
                        <span className={`text-[10px] font-bold ${getPasswordStrength(password).color}`}>
                          {getPasswordStrength(password).text}
                        </span>
                      )}
                    </div>
                    <CInput label="Confirm Password" type="password" value={confirmPassword} className="flex-1" onChange={(e) => setConfirmPassword(e.target.value)} error={errors.confirmPassword} />
                  </div>

                  <div className="mt-1">
                    <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
                      <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-1 accent-primary" />
                      <span>I agree to the <span className="text-primary font-medium hover:underline">Terms</span> and <span className="text-primary font-medium hover:underline">Privacy Policy</span></span>
                    </label>
                    {errors.terms && <p className="text-red-500 text-[10px] mt-1">{errors.terms}</p>}
                  </div>

                  <CButton fullWidth variant="contained" className="mt-2 py-2" onClick={handleSendOtp} disabled={loading}>
                    {loading ? "Sending..." : "Send OTP"}
                  </CButton>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4 cursor-pointer" onClick={() => setOtpStage(false)}>
                  <span className="text-lg">←</span> <span className="text-xs text-primary font-medium">Back</span>
                </div>
                <h1 className="text-lg font-semibold mb-4 text-primary text-center">Verify OTP</h1>
                <p className="text-center text-xs text-gray-500 mb-4">{otpMessage}</p>
                <CInput label="Enter OTP" value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value)} error={errors.otp} />
                <CButton fullWidth variant="contained" className="mt-4 py-2" onClick={handleVerifyOtpAndSignup} disabled={loading}>
                  {loading ? "Signing Up..." : "Verify OTP & Sign Up"}
                </CButton>
              </>
            )}

            <p className="text-center mt-4 text-xs">
              Already have an account? <span onClick={() => navigate("/login")} className="font-semibold text-primary cursor-pointer hover:underline">Login</span>
            </p>
          </CFormCard>
        </div>
      </section>
    </div>
  );
};

export default SignUp;