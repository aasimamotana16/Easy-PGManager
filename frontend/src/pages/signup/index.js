import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, X } from "lucide-react"; 
import CCheckbox from "../../components/cCheckbox";
import CFormCard from "../../components/cFormCard";
import CInput from "../../components/cInput";
import CButton from "../../components/cButton";
import Loader from "../../components/loader";

import { registerUser, sendOtp } from "../../api/api";
import Swal from "sweetalert2";

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

  const [role, setRole] = useState("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otpStage, setOtpStage] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [errors, setErrors] = useState({});

  // Real-time Confirm Password Validation
  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
    } else {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
  }, [confirmPassword, password]);

  // Password Strength Logic
  const getStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (/[a-zA-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
  const currentStrength = getStrength(password);

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
    if (!name.trim()) newErrors.name = "Full name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(phone)) {
      newErrors.phone = "Enter a valid 10-digit mobile number";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    // Final check for confirm password on submit
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!agreeTerms) newErrors.terms = "You must agree to the terms and Conditions and Privacy Policy";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      // Pass a development bypass token so backend reCAPTCHA check allows local testing
      const response = await sendOtp({ email, recaptchaToken: "development_bypass" });
      if (response?.data?.success) setOtpStage(true);
    } catch (error) {
      setErrors({ server: "Failed to send OTP" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async () => {
    // basic guard
    if (!enteredOtp || enteredOtp.length !== 6) {
      return setErrors({ ...errors, otp: "Enter 6-digit OTP" });
    }

    setLoading(true);
    try {
      const payload = {
        fullName: name,
        name,
        email: email.toLowerCase().trim(),
        phone,
        password,
        confirmPassword,
        role,
        otp: enteredOtp,
      };

      const response = await registerUser(payload);
      
      // Changed Logic: Redirect to login instead of dashboard
      if (response?.status === 201 || response?.data?.success || response?.data?.token) {
        Swal.fire({ 
          icon: "success", 
          title: "Registered Successfully", 
          text: "Please login to continue", 
          timer: 2000, 
          showConfirmButton: false 
        });
        
        setOtpStage(false);
        
        // Short delay to let the user see the success message
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      setErrors({ ...errors, server: msg });
      Swal.fire("Error", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await sendOtp({ email, recaptchaToken: "development_bypass" });
      Swal.fire({ icon: "success", title: "OTP Sent", timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire("Error", "Failed to resend OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <Loader />;

  return (
    <div className="min-h-screen relative flex items-center justify-center lg:justify-start bg-orange-50 overflow-x-hidden">
      
      <div className="hidden lg:block">
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImage ? "opacity-100" : "opacity-0"}`}
            style={{ backgroundImage: `url('${img}')`, backgroundSize: "cover", backgroundPosition: "center" }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full px-4 lg:ml-20 flex justify-center lg:justify-start">
        <CFormCard className="bg-white border border-gray-100 rounded-xl p-5 sm:p-8 w-full max-w-[360px] lg:max-w-none lg:w-[700px] animate-fadeIn shadow-none">
          
          <div className="mb-2 flex justify-center">
            <img src="/logos/logo1.png" alt="Logo" className="h-10 md:h-14 w-auto" />
          </div>

          <h1 className="text-lg font-bold text-center mb-4 text-primary">
            Create Your <span className="text-black">Account</span>
          </h1>
          
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 mb-2">
              <CButton fullWidth variant={role === "user" ? "contained" : "outlined"} onClick={() => setRole("user")}>User</CButton>
              <CButton fullWidth variant={role === "owner" ? "contained" : "outlined"} onClick={() => setRole("owner")}>Owner</CButton>
            </div>

            <div className="w-full">
               <CInput label="Full Name" value={name} onChange={(e) => {setName(e.target.value); setErrors({...errors, name: ""})}} error={!!errors.name} />
               {errors.name && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <CInput label="Email" type="email" value={email} onChange={(e) => {setEmail(e.target.value); setErrors({...errors, email: ""})}} error={!!errors.email} />
                {errors.email && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.email}</p>}
              </div>
              <div>
                <CInput label="Phone" type="tel" value={phone} onChange={(e) => {setPhone(e.target.value.slice(0, 10)); setErrors({...errors, phone: ""})}} error={!!errors.phone} />
                {errors.phone && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <CInput label="Password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => {setPassword(e.target.value); setErrors({...errors, password: ""})}} error={!!errors.password} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[42px] text-gray-400">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`h-full flex-1 transition-colors duration-300 ${i < currentStrength ? strengthColors[currentStrength - 1] : "bg-gray-200"}`} />
                      ))}
                    </div>
                    <p className={`text-[9px] mt-1 font-bold uppercase tracking-wider ${currentStrength > 0 ? strengthColors[currentStrength - 1].replace('bg-', 'text-') : 'text-gray-400'}`}>
                      Strength: {strengthLabels[currentStrength - 1] || "None"}
                    </p>
                  </div>
                )}
                {errors.password && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.password}</p>}
              </div>

              <div className="relative">
                <CInput label="Confirm Password" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={!!errors.confirmPassword} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-[42px] text-gray-400">
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {/* Error message for confirm password */}
                {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="mt-1">
              <CCheckbox
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  setErrors({ ...errors, terms: "" });
                }}
                label={
                  <span className="cursor-default select-none text-xs">
                    I agree to the{" "}
                    <span onClick={(e) => { e.stopPropagation(); navigate("/termsConditions"); }} className="text-primary font-medium hover:underline cursor-pointer">Terms & Conditions</span>{" "}
                    and{" "}
                    <span onClick={(e) => { e.stopPropagation(); navigate("/privacyPolicy"); }} className="text-primary font-medium hover:underline cursor-pointer">Privacy Policy</span>
                  </span>
                }
              />
              {errors.terms && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.terms}</p>}
            </div>

            <CButton fullWidth variant="contained" className="mt-2" onClick={handleSendOtp} disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </CButton>
          </div>

          <p className="text-center text-sm mt-6 text-gray-600">
            Already have an account?{" "}
            <span onClick={() => navigate("/loginPage")} className="font-bold text-[#D97706] cursor-pointer hover:underline underline-offset-4 transition-colors hover:text-blue-600">Login</span>
          </p>
        </CFormCard>
      </div>

      {/* --- SEPARATE OTP SECURITY MODAL --- */}
      {otpStage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOtpStage(false)} />
          
          <div className="relative bg-white w-full max-w-[360px] rounded-2xl shadow-2xl p-6 animate-slideUp">
            <button onClick={() => setOtpStage(false)} className="absolute top-3 right-3 text-gray-400 hover:text-primary"><X size={20} /></button>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <ShieldCheck size={28} className="text-primary" />
              </div>
              
              <h2 className="text-lg font-bold text-gray-800 mb-1">Verify OTP</h2>
              <p className="text-gray-500 text-xs mb-5">We've sent a 6-digit code to <br/><span className="font-semibold text-gray-700">{email}</span></p>

              <div className="w-full text-left">
                <CInput label="Enter OTP" value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value.slice(0, 6))} />
              </div>

              <CButton fullWidth variant="contained" className="mt-5" onClick={handleVerifyAndRegister} disabled={loading}>
                {loading ? "Please wait..." : "Verify & Register"}
              </CButton>

              <p className="mt-4 text-xs text-gray-500">
                Didn't receive it? <span onClick={handleResendOtp} className="text-primary font-bold cursor-pointer hover:underline">Resend</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUp;