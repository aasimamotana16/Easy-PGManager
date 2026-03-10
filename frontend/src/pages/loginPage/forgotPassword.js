import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  const validateEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

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
        Swal.fire("Success", "OTP sent successfully", "success");
        setOtpStage(true);
      }
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to send OTP",
        "error"
      );
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
        newPassword,
      });
      if (response?.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Password Reset",
          text: "Your password has been reset successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        setTimeout(() => {
          navigate("/loginPage");
        }, 1600);
      }
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to reset password",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (otpStage) {
    return (
      <div className="min-h-screen relative flex items-center justify-center lg:justify-start bg-orange-50 overflow-x-hidden">
        <div className="hidden lg:block">
          {images.map((img, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{
                backgroundImage: `url(${img})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: i === currentImage ? 1 : 0,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 w-full px-4 lg:ml-20 flex justify-center lg:justify-start">
          <CFormCard className="relative bg-white p-4 sm:p-6 rounded-md shadow-xl border border-[#D97706] w-full max-w-[340px] lg:max-w-[500px]">
            <button
              onClick={() => setOtpStage(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-amber-600"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                <ShieldCheck size={28} className="text-amber-600" />
              </div>

              <h2 className="text-lg font-bold text-gray-800 mb-1">
                Reset Password
              </h2>
              <p className="text-gray-500 text-xs mb-5">
                Enter OTP and new password
                <br />
                <span className="font-semibold text-gray-700">{email}</span>
              </p>

              <div className="w-full space-y-4">
                <CInput
                  label="OTP (6 digits)"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  error={!!errors.otp}
                  helperText={errors.otp}
                />

                <CInput
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  error={!!errors.password}
                  helperText={errors.password}
                  endAdornment={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="h-9 w-9 -mr-2 inline-flex items-center justify-center text-gray-400 hover:text-amber-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  }
                />

                <CInput
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  endAdornment={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      className="h-9 w-9 -mr-2 inline-flex items-center justify-center text-gray-400 hover:text-amber-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  }
                />
              </div>

              <CButton
                fullWidth
                variant="contained"
                className="mt-5"
                onClick={handleVerifyAndReset}
                disabled={loading}
              >
                {loading ? "Processing..." : "Reset Password"}
              </CButton>

              <p className="mt-4 text-xs text-gray-500">
                Remember password?{" "}
                <span
                  onClick={() => navigate("/loginPage")}
                  className="text-amber-600 font-bold cursor-pointer hover:underline"
                >
                  Login
                </span>
              </p>
            </div>
          </CFormCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center lg:justify-start bg-orange-50 overflow-x-hidden">
      <div className="hidden lg:block">
        {images.map((img, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: i === currentImage ? 1 : 0,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full px-4 lg:ml-20 flex justify-center lg:justify-start">
        <CFormCard className="bg-white p-4 sm:p-6 rounded-md shadow-xl border border-[#D97706] w-full max-w-[340px] lg:max-w-[500px]">
          <img
            src="/logos/logo1.png"
            alt="logo"
            className="h-16 mx-auto mb-2"
          />
          <h1 className="text-2xl font-bold text-center mb-4 text-[#D97706]">
            Forgot Password
          </h1>
          <p className="text-center mb-6 text-gray-600 text-sm">
            Enter your email to receive an OTP for password reset.
          </p>

          <form onSubmit={handleSendOtp} className="space-y-4">
            <CInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: "" });
              }}
              error={!!errors.email}
              helperText={errors.email}
            />

            <CButton type="submit" fullWidth variant="contained" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </CButton>
          </form>

          <p className="text-center mt-4 text-sm text-gray-600">
            Remember password?{" "}
            <span
              onClick={() => navigate("/loginPage")}
              className="text-amber-600 font-bold cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
        </CFormCard>
      </div>
    </div>
  );
};

export default ForgotPassword;