import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/navbar";
import ImageCarousel1 from "../../components/imageCarousel";

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
    <div className="min-h-screen flex flex-col bg-background-default">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row justify-center items-center px-4 sm:px-6 lg:px-12 xl:px-16 py-4 sm:py-6 gap-6">

        {/* LEFT : SIGNUP FORM */}
        <div className="w-full max-w-[480px] sm:max-w-[600px] md:max-w-[680px] lg:w-1/3 xl:w-5/12 flex flex-col items-center">
          <CFormCard className="pt-4 pb-6 px-6 sm:pt-6 sm:pb-8 sm:px-8 md:pt-8 md:pb-10 md:px-10 shadow-xl rounded-md">

            {/* Logo */}
            <div className="mb-2 flex justify-center">
              <img
                src="/logos/logo1.png"
                alt="EasyPG Manager Logo"
                className="h-12 sm:h-14 md:h-16 w-auto"
              />
            </div>

            <h1 className="text-center font-bold mb-3 text-xl sm:text-2xl text-primary">
              Create Your EasyPG Manager Account
            </h1>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-2.5 sm:gap-3"
            >
              {/* Role Selector */}
              <div className="flex w-full border border-border rounded-md overflow-hidden mb-2">
                <CButton
                  type="button"
                  fullWidth
                  variant={role === "user" ? "contained" : "outlined"}
                  onClick={() => setRole("user")}
                  className="rounded-none py-1"
                >
                  User
                </CButton>

                <CButton
                  type="button"
                  fullWidth
                  variant={role === "owner" ? "contained" : "outlined"}
                  onClick={() => setRole("owner")}
                  className="rounded-none py-1"
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

            <p className="text-center mt-3 text-sm text-text-secondary">
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

        {/* RIGHT : IMAGE */}
        <div className="hidden lg:flex justify-center items-center w-1/2 xl:w-6/12">
          <ImageCarousel1 />
        </div>
      </div>
    </div>
  );
};

export default SignUp;
