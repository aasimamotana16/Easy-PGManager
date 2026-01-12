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

        localStorage.setItem("userName", data.user.fullName);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isLoggedIn", "true");

        if (rememberMe) localStorage.setItem("rememberMe", "true");

        // 🔥 IMPORTANT FIX — notify Navbar
        window.dispatchEvent(new Event("storage"));

        window.location.href = "/";
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background.DEFAULT">
      <section className="relative w-full min-h-screen flex items-center px-4 sm:px-8 lg:px-20 overflow-hidden">
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

        <div className="relative z-10 w-full max-w-xs sm:w-4/5 md:max-w-lg lg:max-w-xl flex flex-col justify-center h-full mx-auto lg:mx-0">
          <CFormCard className="bg-white border border-border rounded-xl shadow-lg p-5 sm:p-8 md:p-10 w-full">
            <div className="mb-1 flex justify-center">
              <img src="/logos/logo1.png" alt="Logo" className="h-16 md:h-20" />
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-primary text-center">
              Login – EasyPG Manager
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex gap-2 mb-4">
                <CButton size="sm" fullWidth variant={role === "user" ? "contained" : "outlined"} onClick={() => setRole("user")}>
                  User
                </CButton>
                <CButton size="sm" fullWidth variant={role === "owner" ? "contained" : "outlined"} onClick={() => setRole("owner")}>
                  Owner
                </CButton>
              </div>

              <CInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <CInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

              <CButton text={loading ? "Logging in..." : "Login"} type="submit" fullWidth disabled={loading} />

              <div className="flex justify-between items-center">
                <CCheckbox label="Remember Me" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                <a href="/forgot-password" className="font-semibold text-primary">Forgot Password?</a>
              </div>
            </form>
          </CFormCard>
        </div>
      </section>
    </div>
  );
};

export default Login;
