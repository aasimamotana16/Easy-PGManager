import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

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
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!agreeTerms) newErrors.terms = "You must agree to the terms";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await sendOtp({ email });
      if (response?.data?.success) setOtpStage(true);
    } catch (error) {
      setErrors({ server: "Failed to send OTP" });
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

          {!otpStage ? (
            <>
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
                    {errors.password && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.password}</p>}
                  </div>

                  <div className="relative">
                    <CInput label="Confirm Password" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => {setConfirmPassword(e.target.value); setErrors({...errors, confirmPassword: ""})}} error={!!errors.confirmPassword} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-[42px] text-gray-400">
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.confirmPassword}</p>}
                  </div>
                </div>

                <div className="mt-1">
                  <label className="flex items-start gap-2 text-[11px] text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={agreeTerms} onChange={(e) => {setAgreeTerms(e.target.checked); setErrors({...errors, terms: ""})}} className="mt-1 accent-primary scale-110" />
                    <span>
                      I agree to the <Link to="/termsConditions" className="text-primary font-medium hover:underline">Terms</Link> and <Link to="/privacyPolicy" className="text-primary font-medium hover:underline">Privacy Policy</Link>
                    </span>
                  </label>
                  {errors.terms && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.terms}</p>}
                </div>

                <CButton fullWidth variant="contained" className="mt-2 py-2.5 text-sm font-bold" onClick={handleSendOtp} disabled={loading}>
                  {loading ? "Sending..." : "Send OTP"}
                </CButton>
              </div>
            </>
          ) : (
            <div className="max-w-sm mx-auto w-full py-4 text-center">
               <h2 className="text-lg font-bold mb-4">Verify OTP</h2>
               <CInput label="Enter OTP" value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value)} />
               <CButton fullWidth variant="contained" className="mt-4 py-2" onClick={() => {}}>Verify</CButton>
            </div>
          )}

          <p className="text-center text-sm mt-6 text-gray-600">
            Already have an account?{" "}
            <span 
              onClick={() => navigate("/login")} 
              className="font-bold text-[#D97706] cursor-pointer hover:underline underline-offset-4 transition-colors hover:text-blue-600"
            >
              Login
            </span>
          </p>
        </CFormCard>
      </div>
    </div>
  );
};

export default SignUp;