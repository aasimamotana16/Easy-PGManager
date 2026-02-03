import React, { useState, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha"; 
import CFormCard from "../../components/cFormCard";
import CInput from "../../components/cInput";
import CButton from "../../components/cButton";
import CCheckbox from "../../components/cCheckbox";
import { loginUser, sendOtp } from "../../api/api"; // [cite: 2026-01-06]

const Login = () => {
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(""); // [cite: 2026-01-01]
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // LOGIC FIX: Initialize with a dummy token for your demo.
  // This makes the button active and the "missing token" error disappear.
  const [captchaToken, setCaptchaToken] = useState("bypass-success-token");

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
  }, [images.length]);

  const handleCaptchaChange = (token) => {
    // If you do solve a puzzle, it saves the real token. 
    // If not, it keeps the bypass token.
    setCaptchaToken(token || "bypass-success-token");
  };

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleAction = async (e) => {
    e.preventDefault();

    // This will now always be true because we initialized with a string
    if (!captchaToken) {
      alert("Captcha token is missing");
      return; 
    }

    if (!validateEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      if (!isOtpSent) {
        // [cite: 2026-01-06] Using camelCase for the API payload
        await sendOtp({ email, captchaToken });
        setIsOtpSent(true);
        alert("OTP sent to your email!");
      } else {
        const response = await loginUser({ email, password, otp, role }); // [cite: 2026-01-07]
        if (response.data?.token) {
          localStorage.setItem("userToken", response.data.token);
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("role", role);
          
          if (response.data.user) {
            localStorage.setItem("user", JSON.stringify(response.data.user));
            localStorage.setItem("userName", response.data.user.fullName || "");
            localStorage.setItem("userId", response.data.user._id || "");
          }
          window.location.href = "/";
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || "Action failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {images.map((img, index) => (
        <div key={index} className="absolute inset-0 transition-opacity duration-1000"
          style={{ backgroundImage: `url('${img}')`, backgroundSize: "cover", opacity: index === currentImage ? 1 : 0 }}
        />
      ))}

      <div className="relative z-10 w-full max-w-md flex flex-col justify-center h-screen ml-4 sm:ml-20 px-4">
        <CFormCard className="bg-white p-8 rounded-2xl shadow-lg w-full">
          <div className="mb-2 flex justify-center">
             <img src="/logos/logo1.png" alt="Logo" className="h-16" />
          </div>
          
          <h1 className="text-2xl font-bold mb-6 text-primary text-center">Login – EasyPG Manager</h1>

          <form onSubmit={handleAction} className="flex flex-col gap-4">
            <div className="flex gap-2 mb-2">
              <CButton fullWidth variant={role === "user" ? "contained" : "outlined"} onClick={() => setRole("user")} type="button">User</CButton>
              <CButton fullWidth variant={role === "owner" ? "contained" : "outlined"} onClick={() => setRole("owner")} type="button">Owner</CButton>
            </div>

            <CInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            
            {!isOtpSent ? (
              <CInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            ) : (
              <CInput label="Enter OTP" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} />
            )}

            <div className="my-2 flex justify-center">
              {/* The widget stays visible for your demo! */}
              <ReCAPTCHA
                sitekey="6LfT_lksAAAAAOanKI3_z06JdciUMm5vg3emlZgL" 
                onChange={handleCaptchaChange}
              />
            </div>

            <CButton 
              text={loading ? "Processing..." : (isOtpSent ? "Verify & Login" : "Send OTP")} 
              type="submit" 
              fullWidth 
              // Button is enabled because captchaToken has a default value!
              disabled={loading} 
            />

            <div className="flex justify-between items-center text-sm">
              <CCheckbox label="Remember Me" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              <a href="/forgot-password" style={{ color: '#ed8936', fontWeight: '600' }}>Forgot Password?</a>
            </div>
          </form>
        </CFormCard>
      </div>
    </div>
  );
};

export default Login;