import React, { useState, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import Swal from "sweetalert2";
import { Eye, EyeOff, X, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CFormCard from "../../components/cFormCard";
import CInput from "../../components/cInput";
import CButton from "../../components/cButton";
import CCheckbox from "../../components/cCheckbox";
import Loader from "../../components/loader";

import { loginUser } from "../../api/api";

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "", captcha: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);

  const images = [
    "/images/aboutImages/aboutIMG1.png",
    "/images/loginImages/loginImg1.jpg",
    "/images/loginImages/loginImg2.jpg",
  ];
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleLoginClick = () => {
    let newErrors = { email: "", password: "", captcha: "" };
    let hasError = false;
    if (!email || !validateEmail(email)) {
      newErrors.email = "Valid email required";
      hasError = true;
    }
    if (!password || password.length < 6) {
      newErrors.password = "Min 6 characters required";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    setShowCaptchaModal(true);
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
    if (token) {
      setShowCaptchaModal(false);
      executeLogin(token);
    }
  };

  const executeLogin = async (token) => {
    try {
      setLoading(true);
      const response = await loginUser({ email, password, captchaToken: token, role });

      // Assuming your backend returns response.data.token and response.data.user
      if (response.data?.token) {
        // 1. SAVE AUTH DATA
        localStorage.setItem("userToken", response.data.token);
        localStorage.setItem("role", role);
        localStorage.setItem("isLoggedIn", "true");
        // Fallback for direct browser-tab API opens (e.g. /api/users/me)
        document.cookie = `userToken=${response.data.token}; path=/; SameSite=Lax`;
        document.cookie = `token=${response.data.token}; path=/; SameSite=Lax`;

        // 2. SAVE NAME FOR NAVBAR (supports both flat and nested backend payloads)
        const fullName =
          response.data.fullName ||
          response.data.name ||
          response.data.user?.fullName ||
          response.data.user?.name ||
          "User";
        localStorage.setItem("userName", fullName);
        
        // Optional: Save whole object for Profile page
        const userPayload = response.data.user || {
          _id: response.data._id,
          fullName: response.data.fullName || response.data.name || fullName,
          email: response.data.email,
          role: response.data.role,
        };
        localStorage.setItem("user", JSON.stringify(userPayload));

        Swal.fire({
          icon: "success",
          title: "Login Successful",
          text: `Welcome back, ${fullName}!`,
          showConfirmButton: false,
          timer: 1500,
        });

        // 3. REDIRECT BASED ON ROLE
        setTimeout(() => {
          // Using window.location.href forces a refresh so the Navbar 
          // picks up the new localStorage data immediately
          window.location.href = role === "owner" 
            ? "/owner" 
            : "/user";
        }, 1500);
      }
    } catch (err) {
      console.error("Login Error:", err.response?.data);
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: err.response?.data?.message || "Invalid credentials or server error",
        confirmButtonColor: "#D97706"
      });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <Loader />;

  return (
    <div className="min-h-screen relative flex items-center justify-center lg:justify-start bg-orange-50 overflow-x-hidden">
      {/* Background Slider */}
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
        <CFormCard className="relative bg-white p-4 sm:p-6 rounded-md shadow-xl border border-[#D97706] w-full max-w-[340px] lg:max-w-[500px] animate-fadeIn">
          <img src="/logos/logo1.png" alt="logo" className="h-16 mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-center mb-4 text-[#D97706]">
            Login – EasyPG <span className="text-black"> Manager</span>
          </h1>

          <div className="flex gap-3 mb-6">
            <CButton
              fullWidth
              className="text-sm"
              variant={role === "user" ? "contained" : "outlined"}
              onClick={() => setRole("user")}
            >
              User
            </CButton>
            <CButton
              fullWidth
              className="text-sm"
              variant={role === "owner" ? "contained" : "outlined"}
              onClick={() => setRole("owner")}
            >
              Owner
            </CButton>
          </div>

          <div className="space-y-4">
            <CInput
              label="Email"
              type="email"
              value={email}
              error={!!errors.email}
              helperText={errors.email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
            />

            <CInput
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              error={!!errors.password}
              helperText={errors.password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: "" });
              }}
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
          </div>

          <div className="mt-6">
            <CButton fullWidth onClick={handleLoginClick} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </CButton>
          </div>

          <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100">
            <CCheckbox
              label="Remember Me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="mb-0"
            />
            <a href="/forgot-password" className="text-sm text-amber-600 hover:underline whitespace-nowrap">
              Forgot Password?
            </a>
          </div>

          <p className="text-center text-sm mt-3 text-gray-600">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-[#D97706] font-bold cursor-pointer hover:underline underline-offset-2"
            >
              Sign Up
            </span>
          </p>
        </CFormCard>
      </div>

      {/* --- CAPTCHA MODAL --- */}
      {showCaptchaModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowCaptchaModal(false)}
          />

          <div className="relative bg-white w-full max-w-[360px] rounded-2xl shadow-2xl p-6 animate-slideUp">
            <button
              onClick={() => setShowCaptchaModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-[#D97706]"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                <ShieldCheck size={28} className="text-[#D97706]" />
              </div>

              <h2 className="text-lg font-bold text-gray-800 mb-1">Security Verification</h2>
              <p className="text-gray-500 text-xs mb-5">Please complete the captcha to continue.</p>

              <div className="scale-[0.85] sm:scale-90 origin-center">
                <ReCAPTCHA
                  sitekey="6LfT_lksAAAAAOanKI3_z06JdciUMm5vg3emlZgL"
                  onChange={handleCaptchaChange}
                />
              </div>

              <p className="mt-5 text-[9px] text-gray-400 uppercase tracking-widest font-semibold flex items-center gap-2">
                <span className="w-6 h-[1px] bg-gray-200"></span>
                Secure Access
                <span className="w-6 h-[1px] bg-gray-200"></span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
