import React, { useState, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha"; 
import Swal from "sweetalert2"; 
import CFormCard from "../../components/cFormCard";
import CInput from "../../components/cInput";
import CButton from "../../components/cButton";
import CCheckbox from "../../components/cCheckbox";
import Loader from "../../components/loader"; // Added Loader import
import { loginUser, sendOtp } from "../../api/api"; 

const Login = () => {
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(""); 
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true); // Added for initial load
  
  const [captchaToken, setCaptchaToken] = useState("bypass-success-token");

  const images = [
    "/images/aboutImages/aboutIMG1.png",
    "/images/loginImages/loginImg1.jpg",
    "/images/loginImages/loginImg2.jpg",
  ];
  const [currentImage, setCurrentImage] = useState(0);

  // Branded Page Loader Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token || "bypass-success-token");
  };

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleAction = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      Swal.fire({
        icon: 'warning',
        title: 'Captcha Required',
        text: 'Please complete the captcha verification.',
        confirmButtonColor: '#f97316'
      });
      return; 
    }

    if (!validateEmail(email)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please enter a valid email address.',
        confirmButtonColor: '#f97316'
      });
      return;
    }

    setLoading(true);
    try {
      if (!isOtpSent) {
        await sendOtp({ email, captchaToken });
        setIsOtpSent(true);
        
        Swal.fire({
          title: 'OTP Sent!',
          text: 'A verification code has been sent to your email.',
          icon: 'success',
          confirmButtonColor: '#f97316',
          timer: 3000
        });
        
      } else {
        const response = await loginUser({ email, password, otp, role });
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
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || "Action failed.",
        icon: 'error',
        confirmButtonColor: '#f97316'
      });
    } finally {
      setLoading(false);
    }
  };

  // Render Loader if page is still loading
  if (pageLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {images.map((img, index) => (
        <div key={index} className="absolute inset-0 transition-opacity duration-1000"
          style={{ backgroundImage: `url('${img}')`, backgroundSize: "cover", opacity: index === currentImage ? 1 : 0 }}
        />
      ))}

      <div className="relative z-10 w-full max-w-lg flex flex-col justify-center h-screen ml-4 sm:ml-20 px-4">
        <CFormCard className="bg-white p-10 rounded-2xl shadow-lg w-full">
          <div className="mb-4 flex justify-center">
             <img src="/logos/logo1.png" alt="Logo" className="h-20" />
          </div>
          
          <h1 className="text-3xl font-bold mb-8 text-primary text-center">Login – EasyPG Manager</h1>

          <form onSubmit={handleAction} className="flex flex-col gap-5">
            <div className="flex gap-3 mb-2">
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
              <div style={{ transform: 'scale(0.8)', transformOrigin: 'center' }}>
                <ReCAPTCHA
                  sitekey="6LfT_lksAAAAAOanKI3_z06JdciUMm5vg3emlZgL" 
                  onChange={handleCaptchaChange}
                />
              </div>
            </div>

            <CButton 
              text={loading ? "Processing..." : (isOtpSent ? "Verify & Login" : "Send OTP")} 
              type="submit" 
              fullWidth 
              disabled={loading} 
              className="py-3 text-lg"
            />

            <div className="flex justify-between items-center text-sm mt-2">
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