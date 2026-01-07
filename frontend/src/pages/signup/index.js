import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/navbar";
import CFormCard from "../../components/cFormCard";
import CInput from "../../components/cInput";
import CButton from "../../components/cButton";

import { registerUser } from "../../api/api";

const SignUp = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (!validateEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser({
        role,
        name,
        email,
        password,
      });

      if (response?.data?.success) {
        alert("Sign up successful! Please login.");
        navigate("/login");
      } else {
        alert(response?.data?.message || "Sign up failed.");
      }
    } catch (error) {
      console.error("SignUp Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background.DEFAULT">
      <Navbar />

      {/* Full-screen Background Image */}
      <section
        className="relative w-full h-screen flex items-center justify-start px-8 lg:px-20"
        style={{
          backgroundImage: "url('/images/aboutImages/aboutIMG1.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* SignUp Form Left Side */}
        <div className="flex w-full max-w-lg lg:max-w-xl flex-col justify-center h-full mt-2">
          
          {/* White Card */}
          <CFormCard className="bg-white border border-border rounded-xl shadow-lg p-8 sm:p-10">
            
            {/* Logo */}
            <div className="mb-1  flex justify-center">
              <img
                src="/logos/logo1.png"
                alt="EasyPG Manager Logo"
                className="h-12 sm:h-16 md:h-20 w-auto"
              />
            </div>

            <h1 className="text-2xl sm:text-2xl font-bold mb-5 text-primary text-center">
              Create Your EasyPG Manager Account
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">

              {/* Role Selector */}
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

              {/* Inputs */}
              <CInput
                label="Full Name"
                value={name}
                placeholder="Enter your full name"
                onChange={(e) => setName(e.target.value)}
              />
              <CInput
                label="Email"
                type="email"
                value={email}
                placeholder="Enter your email address"
                onChange={(e) => setEmail(e.target.value)}
              />
              <CInput
                label="Password"
                type="password"
                value={password}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <CInput
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                placeholder="Confirm your password"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <CButton
                type="submit"
                fullWidth
                variant="contained"
                className="mt-2 py-2 text-base rounded-md font-medium"
                disabled={loading}
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </CButton>
            </form>

            {/* Already have account */}
            <p className="text-center mt-4 text-sm text-text-secondary">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="font-semibold text-primary cursor-pointer hover:underline"
              >
                Login
              </span>
            </p>

          </CFormCard>
        </div>
      </section>
    </div>
  );
};

export default SignUp;
