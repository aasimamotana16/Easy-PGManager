import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar";
import CFormCard from "../../components/cFormCard";
import CInput from "../../components/cInput";
import CButton from "../../components/cButton";
import Swal from "sweetalert2";
import { ShieldCheck, X, Eye, EyeOff } from "lucide-react";
import { forgotPassword, verifyOtpAndResetPassword } from "../../api/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otpStage, setOtpStage] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!email || !validateEmail(email)) {
      newErrors.email = "Valid email is required";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await forgotPassword(email);
      if (response?.data?.success) {
        console.log("✅ OTP generated (development):", response.data.otp);
        Swal.fire("Success", "OTP sent to your registered phone number", "success");
        setOtpStage(true);
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to send OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async () => {
    let newErrors = {};

    if (!otp || otp.length !== 6) {
      newErrors.otp = "Enter 6-digit OTP";
    }
    if (!newPassword || newPassword.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await verifyOtpAndResetPassword({
        email,
        otp,
        newPassword
      });
      if (response?.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Password Reset",
          text: "Your password has been reset successfully",
          timer: 1500,
          showConfirmButton: false
        });
        setTimeout(() => {
          navigate("/login");
        }, 1600);
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to reset password", "error");
    } finally {
      setLoading(false);
    }
  };

  if (otpStage) {
    return (
      <div className="min-h-screen flex flex-col bg-background-default md:pt-2 lg:pt-0">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-6">
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOtpStage(false)} />
            
            <div className="relative bg-white w-full max-w-[360px] rounded-2xl shadow-2xl p-6">
              <button onClick={() => setOtpStage(false)} className="absolute top-3 right-3 text-gray-400 hover:text-primary">
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <ShieldCheck size={28} className="text-primary" />
                </div>
                
                <h2 className="text-lg font-bold text-gray-800 mb-1">Reset Password</h2>
                <p className="text-gray-500 text-xs mb-5">Enter OTP and new password<br/><span className="font-semibold">{email}</span></p>

                <div className="w-full text-left space-y-3">
                  <div>
                    <CInput label="OTP (6 digits)" value={otp} onChange={(e) => setOtp(e.target.value.slice(0, 6))} error={!!errors.otp} />
                    {errors.otp && <p className="text-red-500 text-[10px] mt-1">{errors.otp}</p>}
                  </div>
                  
                  <div className="relative">
                    <CInput label="New Password" type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} error={!!errors.password} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[42px] text-gray-400">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    {errors.password && <p className="text-red-500 text-[10px] mt-1">{errors.password}</p>}
                  </div>

                  <div className="relative">
                    <CInput label="Confirm Password" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={!!errors.confirmPassword} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-[42px] text-gray-400">
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>

                <CButton fullWidth variant="contained" className="mt-5 py-2.5 text-sm font-bold" onClick={handleVerifyAndReset} disabled={loading}>
                  {loading ? "Processing..." : "Reset Password"}
                </CButton>

                <p className="mt-4 text-xs text-gray-500">
                  Remember password? <span onClick={() => navigate("/login")} className="text-primary font-bold cursor-pointer hover:underline">Login</span>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-default md:pt-2 lg:pt-0">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-[360px] sm:max-w-[420px] md:max-w-[700px] mx-auto">
          <CFormCard className="p-6 sm:p-8 md:p-10">
            <h1 className="text-center font-bold mb-6 text-2xl sm:text-3xl md:text-4xl text-text-primary">
              Forgot Password
            </h1>
            <p className="text-center mb-6 text-gray-600 text-sm">
              Enter your email to receive an OTP for password reset.
            </p>
            <form onSubmit={handleSendOtp} className="flex flex-col gap-6">
              <div>
                <CInput
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({...errors, email: ""});
                  }}
                  error={!!errors.email}
                />
                {errors.email && <p className="text-red-500 text-[10px] mt-1">{errors.email}</p>}
              </div>
              <CButton
                type="submit"
                text={loading ? "Sending OTP..." : "Send OTP"}
                fullWidth
                variant="contained"
                color="primary"
                className="py-3 text-base sm:text-lg md:text-xl font-semibold"
                disabled={loading}
              />
            </form>
            <p className="text-center mt-4 text-sm text-gray-600">
              Remember password? <span onClick={() => navigate("/login")} className="text-primary cursor-pointer font-semibold hover:underline">Login</span>
            </p>
          </CFormCard>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
