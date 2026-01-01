import React, { useState } from "react";
// 1. ADD THESE IMPORTS
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../../services/api"; 

import Navbar from "../../components/navbar";
import CFormCard from "../../components/cFormCard";
import CInput from "../../components/cInput";
import CButton from "../../components/cButton";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // 2. INITIALIZE HOOKS
  const { token } = useParams(); 
  const navigate = useNavigate();

  // 3. MAKE THIS FUNCTION ASYNC
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      // 4. CALL THE BACKEND
      const response = await resetPassword(token, { password });
      alert(response.data.message || "Password updated successfully!");
      navigate("/login"); 
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Invalid or expired link. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-default md:pt-2 lg:pt-0">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-[360px] sm:max-w-[420px] md:max-w-[700px] mx-auto">
          <CFormCard className="p-6 sm:p-8 md:p-10">
            <h1 className="text-center font-bold mb-6 text-2xl sm:text-3xl md:text-4xl text-text-primary">
              Reset Password
            </h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <CInput
                label="New Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <CInput
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <CButton
                type="submit"
                text="Reset Password"
                fullWidth
                variant="contained"
                color="primary"
                className="py-3 text-base sm:text-lg md:text-xl font-semibold"
              />
            </form>
          </CFormCard>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;