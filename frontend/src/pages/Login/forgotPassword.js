// src/pages/login/forgotPassword.js
import React, { useState } from "react";
import Navbar from "../../components/navbar";
import CFormCard from "../../components/cFormCard";
import CInput from "../../components/cInput";
import CButton from "../../components/cButton";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Forgot password request for:", email);
    // Trigger backend logic here
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-default md:pt-2 lg:pt-0">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-[360px] sm:max-w-[420px] md:max-w-[700px] mx-auto">
          <CFormCard className="p-6 sm:p-8 md:p-10">
            <h1 className="text-center font-bold mb-6 text-2xl sm:text-3xl md:text-4xl text-text-primary">
              Forgot Password
            </h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <CInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <CButton
                type="submit"
                text="Send Reset Link"
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

export default ForgotPassword;