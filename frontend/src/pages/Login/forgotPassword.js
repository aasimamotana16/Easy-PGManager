import React, { useState } from "react";
import Navbar from "../../components/navbar";
import CFormCard from "../../components/cFormCard";
import CInput from "../../components/cInput";
import CButton from "../../components/cButton";
import { forgotPassword } from "../../api/api"; // Your existing API call

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpMessage, setOtpMessage] = useState("");

  const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleSendOtp = async () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    // Call existing backend API to notify user
    try {
      await forgotPassword({ email });
    } catch (err) {
      console.error(err);
    }

    // Frontend OTP generation
    const otp = generateOtp();
    setGeneratedOtp(otp);
    setOtpSent(true);
    setOtpMessage(`OTP sent to ${email} (check console for demo)`);
    console.log("Generated OTP:", otp); // For testing
  };

  const handleVerifyOtp = () => {
    if (enteredOtp === generatedOtp) {
      alert("✅ OTP verified! You can now reset your password.");
      setOtpMessage("OTP verified successfully. You can now set a new password.");
      // You can navigate to ResetPassword page here if needed
    } else {
      setOtpMessage("❌ OTP incorrect. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-default md:pt-2 lg:pt-0">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-[360px] sm:max-w-[420px] md:max-w-[700px] mx-auto">
          <CFormCard className="p-6 sm:p-8 md:p-10">
            <h1 className="text-center  mb-6 text-2xl sm:text-3xl md:text-4xl text-text-primary">
              Forgot Password
            </h1>
            <p className="text-center mb-6 text-gray-600">
              Enter your email to receive an OTP for password reset.
            </p>

            <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
              <CInput
                label="Email Address"
                type="email"
                placeholder="tester@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* Show OTP input if sent */}
              {otpSent && (
                <CInput
                  label="Enter OTP"
                  type="text"
                  placeholder="Enter OTP"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                />
              )}

              {/* Buttons */}
              {!otpSent ? (
                <CButton
                  text="Send OTP"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className="py-3 text-base sm:text-lg md:text-xl font-semibold"
                  onClick={handleSendOtp}
                />
              ) : (
                <CButton
                  text="Verify OTP"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className="py-3 text-base sm:text-lg md:text-xl font-semibold"
                  onClick={handleVerifyOtp}
                />
              )}

              {/* OTP Message */}
              {otpMessage && <p className="mt-2 text-center text-sm">{otpMessage}</p>}
            </form>
          </CFormCard>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
