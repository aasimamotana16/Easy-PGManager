// src/pages/login/resetPassword.js
import React, { useState } from "react";
import Navbar from "../../components/navbar";
import CFormCard from "../../components/cFormCard";
import CInput from "../../components/cInput";
import CButton from "../../components/cButton";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    console.log("Resetting password to:", password);
    // Trigger backend logic here
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