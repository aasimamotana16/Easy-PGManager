import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar";
import ImageCarousel1 from "../../components/imageCarousel";

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

  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
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
      // Use the API function from your api.js
      const response = await loginUser({ email, password, role });
      const data = response.data;

      // Check if response is successful (Axios throws error for non-2xx codes)
      if (data) {
        // SAVE THE JWT TOKEN - This is what the dashboard needs
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        if (role === "user") {
          localStorage.setItem("user", JSON.stringify(data));
          localStorage.removeItem("owner");
          navigate("/user/dashboard");
        } else if (role === "owner") {
          localStorage.setItem("owner", JSON.stringify(data));
          localStorage.removeItem("user");
          navigate("/owner/dashboard");
        }

        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      // Handle Axios error responses
      const errorMessage = error.response?.data?.message || "Login failed. Please check your credentials.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background.DEFAULT md:pt-2 lg:pt-0">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen place-items-center lg:place-items-stretch px-4 lg:px-6 py-1 gap-x-8">

          {/* LEFT : LOGIN FORM */}
          <div className="flex w-full lg:w-auto justify-center lg:justify-end items-center min-h-[100vh]">
            <div className="w-full max-w-[360px] sm:max-w-[480px] md:max-w-[680px] mx-auto lg:mx-0">

              <CFormCard className="p-6 sm:p-8 bg-card border border-border rounded-xl shadow-card hover:shadow-hover transition">

                {/* Logo */}
                <div className="mb-6 flex justify-center">
                  <img
                    src="/logos/logo1.png"
                    alt="EasyPG Manager Logo"
                    className="h-14 sm:h-16 md:h-20 w-auto"
                  />
                </div>

                <h1 className="text-center font-bold mb-6 text-2xl sm:text-3xl md:text-2xl text-primary">
                  Login – EasyPG Manager
                </h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">

                  {/* Role Toggle */}
                  <div className="flex gap-2">
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

                  {/* Password */}
                  <CInput
                    label="Password"
                    type="password"
                    value={password}
                    placeholder="Enter your password"
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  {/* Remember Me + Forgot Password */}
                  <div className="flex justify-between items-center text-sm sm:text-base">
                    <CCheckbox
                      label="Remember Me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />

                    <a
                      href="/forgot-password"
                      className="font-semibold text-primary hover:underline"
                    >
                      Forgot Password?
                    </a>
                  </div>

                  {/* Submit Button */}
                  <CButton
                    type="submit"
                    text={loading ? "Logging in..." : "Login"}
                    fullWidth
                    variant="contained"
                    size="md"
                    className="mt-2"
                    disabled={loading}
                  />
                </form>

                {/* Terms & Privacy */}
                <p className="text-center mt-4 text-xs sm:text-sm text-gray-500">
                  By logging in, you agree to our{" "}
                  <a
                    href="/termsConditions"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms & Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacyPolicy"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>.
                </p>

                {/* Sign Up */}
                <p className="text-center mt-6 text-text-secondary text-sm sm:text-base">
                  Don’t have an account?{" "}
                  <a
                    href="/signup"
                    className="font-semibold text-primary hover:underline"
                  >
                    Sign Up
                  </a>
                </p>

              </CFormCard>
            </div>
          </div>

          {/* RIGHT : IMAGE CAROUSEL */}
          <div className="hidden lg:flex justify-start items-center">
            <div className="w-full max-w-[500px]">
              <ImageCarousel1 />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Login;