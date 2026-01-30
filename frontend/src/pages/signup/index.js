import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import CFormCard from "../../components/cFormCard";
import CInput from "../../components/cInput";
import CButton from "../../components/cButton";

import { registerUser, sendOtp } from "../../api/api";

const SignUp = () => {
  const navigate = useNavigate();

  const images = [
    "/images/aboutImages/aboutIMG1.png",
    "/images/loginImages/loginImg1.jpg",
    "/images/loginImages/loginImg2.jpg",
  ];
  const [currentImage, setCurrentImage] = useState(0);

  // Smooth Image Transition Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

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
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  };

  // Password Strength Logic
  const getPasswordStrength = (pwd) => {
    if (!pwd) return "";
    const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})");
    const mediumRegex = new RegExp("^(?=.*[a-zA-Z])(?=.*[0-9])(?=.{6,})");
    
    if (strongRegex.test(pwd)) return "Strong Password";
    if (mediumRegex.test(pwd)) return "Medium Password (Add symbols/caps)";
    return "Weak Password (Min 6 chars, combine letters & numbers)";
  };

  const handleSendOtp = async () => {
    // 1. Basic Field Validation
    if (!name.trim()) {
      alert("Please enter your full name.");
      return;
    }
    if (!validateEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // 2. Contact Number Validation (Indian Standard 10 Digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      alert("Please enter a valid 10-digit mobile number starting with 6-9.");
      return;
    }

    // 3. Password Strength Validation
    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      alert("Please agree to Terms & Conditions and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
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

  const handleVerifyOtpAndSignup = async () => {
    if (!enteredOtp) {
      setOtpMessage("❌ Please enter the OTP.");
      return;
    }
    if (!name || !email || !phone || !password || !confirmPassword) {
      alert("Please fill in all fields.");
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
        if (userObj) {
          localStorage.setItem("user", JSON.stringify(userObj));
          localStorage.setItem("userName", userObj.fullName);
          localStorage.setItem("userId", userObj._id);
          localStorage.setItem("role", role);
          localStorage.setItem("isLoggedIn", "true");
          if (response.data.token)
            localStorage.setItem("userToken", response.data.token);
          window.dispatchEvent(new Event("storage"));
        }
        alert("Sign up successful!");
        window.location.href = "/";
      } else {
        alert(response?.data?.message || "Sign up failed.");
      }
    } catch (error) {
      console.error("SignUp Error:", error);
      alert(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background.DEFAULT">
      <section className="relative w-full h-screen px-4 sm:px-8 lg:px-20 flex overflow-hidden">
        {/* IMPROVED TRANSITION: Added z-index and smoother opacity */}
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImage ? "opacity-100 z-0" : "opacity-0 -z-10"
            }`}
            style={{
              backgroundImage: `url('${img}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ))}

        <div className="relative z-10 w-full max-w-sm sm:w-4/5 md:max-w-xl lg:max-w-2xl flex flex-col justify-center h-full mx-auto lg:mx-0">
          <CFormCard className="bg-white border border-border rounded-md shadow-lg p-5 sm:p-8 md:p-10 w-full text-sm">
            <div className="mb-2 flex justify-center">
              <img
                src="/logos/logo1.png"
                alt="EasyPG Manager Logo"
                className="h-10 md:h-16 w-auto"
              />
            </div>

            {!otpStage ? (
              <>
                <h1 className="text-sm sm:text-lg font-semibold mb-3 text-primary text-center">
                  Create Your EasyPG Manager Account
                </h1>

                <div className="flex flex-col gap-3 overflow-hidden">
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

                  <CInput
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />

                  <div className="flex flex-col sm:flex-row gap-6">
                    <CInput
                      label="Email"
                      type="email"
                      value={email}
                      className="flex-1"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <CInput
                      label="Phone Number"
                      type="tel"
                      value={phone}
                      className="flex-1"
                      placeholder="10-digit number"
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1 flex flex-col gap-1">
                      <CInput
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      {password && (
                        <span className={`text-[10px] font-bold ${
                          getPasswordStrength(password).includes("Strong") ? "text-green-600" : 
                          getPasswordStrength(password).includes("Medium") ? "text-orange-500" : "text-red-500"
                        }`}>
                          {getPasswordStrength(password)}
                        </span>
                      )}
                    </div>
                    <CInput
                      label="Confirm Password"
                      type="password"
                      value={confirmPassword}
                      className="flex-1"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <label className="flex items-start gap-2 text-xs text-gray-600 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 accent-primary"
                    />
                    <span>
                      I agree to the{" "}
                      <span className="text-primary font-medium hover:underline" onClick={() => navigate("/terms")}>
                        Terms & Conditions
                      </span>{" "}
                      and{" "}
                      <span className="text-primary font-medium hover:underline" onClick={() => navigate("/privacy")}>
                        Privacy Policy
                      </span>
                    </span>
                  </label>

                  <CButton
                    type="button"
                    fullWidth
                    variant="contained"
                    className="mt-2 py-2 text-sm rounded-md font-medium"
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
                  <span className="text-lg font-bold">←</span>
                  <span className="text-xs text-primary font-medium">Back</span>
                </div>
                <h1 className="text-lg font-semibold mb-4 text-primary text-center">Verify OTP</h1>
                {otpMessage && <p className="text-center text-xs mb-2">{otpMessage}</p>}
                <CInput
                  label="Enter OTP"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                />
                <CButton
                  type="button"
                  fullWidth
                  variant="contained"
                  className="mt-2 py-2 text-sm rounded-md font-medium"
                  onClick={handleVerifyOtpAndSignup}
                  disabled={loading}
                >
                  {loading ? "Signing Up..." : "Verify OTP & Sign Up"}
                </CButton>
              </>
            )}

            <p className="text-center mt-2 text-xs text-text-secondary">
              Already have an account?{" "}
              <span onClick={() => navigate("/login")} className="font-semibold text-primary cursor-pointer hover:underline">
                Login
              </span>
            </p>

            <div className="mt-3 text-center">
              <span onClick={() => navigate("/")} className="text-xs text-gray-500 cursor-pointer hover:text-primary hover:underline">
                ← Back to Home
              </span>
            </div>
          </CFormCard>
        </div>
      </section>
    </div>
  );
};

export default SignUp;