import React, { useState, useEffect } from "react";
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

  // 🔹 Background images for animation
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

  const validateEmail = (email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      {/* <Navbar /> */}

      <section className="relative w-full min-h-screen flex items-center px-4 sm:px-8 lg:px-20 overflow-hidden">
        {/* Background Images */}
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

        {/* Form Container */}
        <div className="relative z-10 w-full max-w-xs sm:w-4/5 md:max-w-lg lg:max-w-xl flex flex-col justify-center h-full mx-auto lg:mx-0">
          <CFormCard className="bg-white border border-border rounded-xl shadow-lg p-5 sm:p-8 md:p-10 w-full">
            <div className="mb-1 flex justify-center">
              <img
                src="/logos/logo1.png"
                alt="Logo"
                className="h-16 md:h-20 w-auto"
              />
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-primary text-center">
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

              {/* Password */}
              <CInput
                label="Password"
                type="password"
                value={password}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* Login Button */}
              <CButton
                text={loading ? "Logging in..." : "Login"}
                type="submit"
                fullWidth
                className="mt-2"
                disabled={loading}
              />

              {/* Remember Me + Forgot */}
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
              <a
                href="/signup"
                className="font-semibold text-primary hover:underline"
              >
                Sign Up
              </a>
            </p>
          </CFormCard>
        </div>
      </section>
    </div>
  );
};

export default Login;
