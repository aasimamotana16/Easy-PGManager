import React, { useState } from "react";
import Navbar from "../../components/navbar";
import CFormCard from "../../components/cFormCard";
import CInput from "../../components/cInput";
import CButton from "../../components/cButton";
import CCheckbox from "../../components/cCheckbox";
import { loginUser } from "../../api/api";

const Login = () => {
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpMessage, setOtpMessage] = useState("");

  const validateEmail = (email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  };

  // Generate frontend OTP
  const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

  // Send OTP
  const handleSendOtp = () => {
    if (!email || !validateEmail(email)) {
      alert("Please enter a valid email first");
      return;
    }
    const otp = generateOtp();
    setGeneratedOtp(otp);
    setOtpSent(true);
    setOtpMessage(`OTP sent to ${email} (check console for demo)`);
    console.log("Generated OTP:", otp); // Only for testing
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (enteredOtp === generatedOtp) {
      alert("✅ OTP verified. Logging in...");
      setLoading(true);
      try {
        // Call existing login API with email and dummy password (or leave empty)
        const response = await loginUser({ email, password, role });
        const data = response.data;
        if (data && data.success) {
          if (data.token) localStorage.setItem("token", data.token);
          const serverRole = data.user.role.toLowerCase();
          if (serverRole === "owner") {
            localStorage.setItem("owner", JSON.stringify(data.user));
            localStorage.removeItem("user");
            window.location.href = "/owner/dashboard";
          } else {
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.removeItem("owner");
            window.location.href = "/user/dashboard";
          }
          if (rememberMe) localStorage.setItem("rememberMe", "true");
        }
      } catch (error) {
        alert(error.response?.data?.message || "Login failed.");
      } finally {
        setLoading(false);
      }
    } else {
      setOtpMessage("❌ OTP incorrect. Try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otpSent) {
      handleVerifyOtp();
      return;
    }

    // Existing password login
    if (!email || !password) {
      alert("Please fill in both email and password.");
      return;
    }
    if (!validateEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const response = await loginUser({ email, password, role });
      const data = response.data;
      if (data && data.success) {
        if (data.token) localStorage.setItem("token", data.token);
        const serverRole = data.user.role.toLowerCase();
        if (serverRole === "owner") {
          localStorage.setItem("owner", JSON.stringify(data.user));
          localStorage.removeItem("user");
          window.location.href = "/owner/dashboard";
        } else {
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.removeItem("owner");
          window.location.href = "/user/dashboard";
        }
        if (rememberMe) localStorage.setItem("rememberMe", "true");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background.DEFAULT">
      <Navbar />

      <section
        className="relative w-full min-h-screen flex items-center px-8 lg:px-20"
        style={{
          backgroundImage: "url('/images/aboutImages/aboutIMG1.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative w-full max-w-2xl lg:max-w-xl flex flex-col justify-start mb-2">
          <CFormCard className="bg-white border border-border rounded-xl shadow-lg p-8 sm:p-10 mt-1">

            <div className="mb-1 flex justify-center">
              <img src="/logos/logo1.png" alt="Logo" className="h-12 sm:h-16 md:h-20 w-auto" />
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-3xl font-bold mb-6 text-primary text-center">
              Login – EasyPG Manager
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Role Toggle */}
              <div className="flex gap-2 mb-4">
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

              {/* Email */}
              <CInput
                label="Email"
                type="email"
                value={email}
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* Password field only shows if OTP not sent */}
              {!otpSent && (
                <CInput
                  label="Password"
                  type="password"
                  value={password}
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}

              {/* OTP input shows if sent */}
              {otpSent && (
                <CInput
                  label="Enter OTP"
                  type="text"
                  value={enteredOtp}
                  placeholder="Enter OTP"
                  onChange={(e) => setEnteredOtp(e.target.value)}
                />
              )}

              {/* Buttons */}
              {!otpSent ? (
                <CButton
                  text={loading ? "Sending..." : "Send OTP"}
                  onClick={handleSendOtp}
                  fullWidth
                  className="mt-2"
                  disabled={loading}
                />
              ) : (
                <CButton
                  text="Verify OTP"
                  onClick={handleVerifyOtp}
                  fullWidth
                  className="mt-2"
                  disabled={loading}
                />
              )}

              {/* Remember Me + Forgot */}
              <div className="flex justify-between items-center text-sm sm:text-base">
                <CCheckbox
                  label="Remember Me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <a href="/forgot-password" className="font-semibold text-primary hover:underline">
                  Forgot Password?
                </a>
              </div>
            </form>

            {/* Terms & SignUp */}
            <p className="text-center mt-4 text-sm text-gray-500">
              By logging in, you agree to our{" "}
              <a href="/termsConditions" className="text-primary hover:underline">
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a href="/privacyPolicy" className="text-primary hover:underline">
                Privacy Policy
              </a>.
            </p>
            <p className="text-center mt-4 text-sm text-text-secondary">
              Don’t have an account?{" "}
              <a href="/signup" className="font-semibold text-primary hover:underline">
                Sign Up
              </a>
            </p>

            {/* OTP Message */}
            {otpMessage && <p className="mt-2 text-center text-sm">{otpMessage}</p>}
          </CFormCard>
        </div>
      </section>
    </div>
  );
};

export default Login;
