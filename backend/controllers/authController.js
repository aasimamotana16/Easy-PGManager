const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// --- ADDED: Helper to verify reCAPTCHA ---
const verifyRecaptcha = async (recaptchaToken) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;

  try {
    const response = await fetch(verificationUrl, { method: "POST" });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("reCAPTCHA Verification Error:", error);
    return false;
  }
};

// Temporary in-memory store for OTPs
const otpCache = {};

const setAuthCookie = (res, token) => {
  if (!token) return;
  res.cookie("userToken", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  });
};

// 1. SEND OTP (Updated with reCAPTCHA logic)
exports.sendOtp = async (req, res) => {
  try {
    const { email, recaptchaToken } = req.body; // Expect recaptchaToken from front-end
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    // --- VERIFY RECAPTCHA FIRST ---
    if (!recaptchaToken) {
      return res.status(400).json({ success: false, message: "Captcha token is missing" });
    }

    // Development bypass for testing
    if (recaptchaToken === "development_bypass") {
      console.log(" Development mode: Bypassing reCAPTCHA verification");
    } else {
      const isCaptchaValid = await verifyRecaptcha(recaptchaToken);
      if (!isCaptchaValid) {
        return res.status(400).json({ success: false, message: "Invalid Captcha. Please try again." });
      }
    }
    // -------------------------------

    const finalEmail = email.toLowerCase().trim();
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(`\n--- [DEBUG] OTP for ${finalEmail}: ${generatedOtp} ---\n`);

    otpCache[finalEmail] = {
      otp: generatedOtp,
      expires: Date.now() + 300000,
    };
    
    // Check if email is configured, otherwise return OTP in response for development
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("⚠️ Development mode: Email not configured, returning OTP in response");
      return res.status(200).json({ 
        success: true, 
        message: "OTP generated successfully (development mode)",
        otp: generatedOtp 
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
      
    await transporter.sendMail({
      from: `"EasyPG Manager" <${process.env.EMAIL_USER}>`,
      to: finalEmail,
      subject: "Verification Code for EasyPG Account",
      html: `<h3>Your OTP is: ${generatedOtp}</h3><p>It is valid for 5 minutes.</p>`,
    });

    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("OTP ERROR:", error.message);
    res.status(500).json({ success: false, message: "Error sending OTP" });
  }
};


// 2. REGISTER (Includes phone and verified status)
exports.registerUser = async (req, res) => {
  try {
    const { email, password, fullName, name, role, phone, otp } = req.body;

    // --- PASSWORD VALIDATION ADDED ---
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    }

    const finalEmail = email ? email.toLowerCase().trim() : null;
    const finalName = fullName || name || "New User";
    const finalRole = role ? role.toLowerCase().trim() : "user";

    if (!finalEmail || !password || !otp) {
      console.log("MISSING DATA:", { finalEmail, password, otp });
      return res.status(400).json({ success: false, message: "Email, password, and OTP are required" });
    }

    // VERIFY OTP Logic
    console.log("🔍 DEBUG - Checking OTP for email:", finalEmail);
    
    const cachedData = otpCache[finalEmail];
    if (!cachedData) {
      return res.status(400).json({ success: false, message: "No OTP found. Please request a new OTP." });
    }
    
    if (cachedData.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    
    if (Date.now() > cachedData.expires) {
      return res.status(400).json({ success: false, message: "OTP expired. Please request a new OTP." });
    }

    const existingUser = await User.findOne({ email: finalEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("✅ Password hashed");

    console.log("📝 Attempting to create user with:", { finalName, finalEmail, finalRole, phone: phone || "" });
    const user = await User.create({
      fullName: finalName,
      email: finalEmail,
      password: hashedPassword,
      phone: phone || null,
      role: finalRole,
      isVerified: true
    });
    console.log("✅ USER CREATED SUCCESSFULLY:", user._id, user.email);

    // Generate token for the new user
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    delete otpCache[finalEmail];
    console.log("✅ Sending success response with token");
    setAuthCookie(res, token);
    res.status(201).json({ 
      success: true, 
      message: "Registration successful",
      token,
      user: { id: user._id, fullName: user.fullName, role: user.role }
    });
  } catch (error) {
    console.error("❌ REGISTRATION ERROR:", error.message);
    console.error("Full error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// 3. LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password, role, captchaToken } = req.body;
    
    console.log(`\n🔐 LOGIN ATTEMPT: ${email} (role: ${role})`);

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      console.log(`❌ USER NOT FOUND: ${email}`);
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    console.log(`✅ USER FOUND: ${user.fullName} (registered as ${user.role})`);

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log(`🔑 PASSWORD CHECK: ${passwordMatch ? "✅ MATCH" : "❌ NO MATCH"}`);

    if (!passwordMatch) {
      console.log(`❌ PASSWORD INCORRECT for ${email}`);
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Validate role matches
    const finalRole = role ? role.toLowerCase().trim() : "user";
    if (user.role !== finalRole) {
      console.log(`❌ ROLE MISMATCH: User role is "${user.role}" but trying to login as "${finalRole}"`);
      return res.status(403).json({ success: false, message: `You are registered as a ${user.role}, but trying to login as ${finalRole}` });
    }

    // If this is just a validation check (from frontend), return success for captcha modal
    if (captchaToken === "validation_check") {
      console.log(`✅ CREDENTIALS VALID - Ready for captcha verification`);
      return res.status(200).json({ success: true, message: "Credentials valid", token: null });
    }

    // Verify reCAPTCHA (unless development bypass)
    if (!captchaToken) {
      return res.status(400).json({ success: false, message: "Captcha token is missing" });
    }

    if (captchaToken !== "development_bypass") {
      const isCaptchaValid = await verifyRecaptcha(captchaToken);
      if (!isCaptchaValid) {
        return res.status(400).json({ success: false, message: "Invalid Captcha. Please try again." });
      }
    }

    // All validations passed - generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    console.log(`✅ LOGIN SUCCESS: ${user.fullName} (${user.role}) - ${email}\n`);

    setAuthCookie(res, token);
    res.status(200).json({
      success: true,
      token,
      user: { id: user._id, fullName: user.fullName, role: user.role }
    });
  } catch (error) {
    console.error("❌ LOGIN ERROR:", error.message);
    res.status(500).json({ success: false, message: "Login error" });
  }
};

// 4. FORGOT PASSWORD - Generate OTP and send via email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const finalEmail = email.toLowerCase().trim();

    // Store OTP in cache for 5 minutes
    otpCache[finalEmail] = {
      otp: generatedOtp,
      expires: Date.now() + 300000,
    };

    console.log(`\n✅ FORGOT PASSWORD OTP for ${finalEmail}: ${generatedOtp}\n`);
    console.log(`📱 Send this OTP to user's phone: ${user.phone || "No phone on file"}\n`);

    // Send OTP via email using nodemailer
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: `"EasyPG Manager" <${process.env.EMAIL_USER}>`,
          to: finalEmail,
          subject: "Password Reset OTP - EasyPG Manager",
          html: `
            <h2>Password Reset Request</h2>
            <p>You requested a password reset for your EasyPG Manager account.</p>
            <p style="font-size: 18px; font-weight: bold; margin: 20px 0;">Your OTP is: <span style="color: #D97706; font-size: 24px;">${generatedOtp}</span></p>
            <p>This OTP is valid for 5 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr/>
            <p style="font-size: 12px; color: #999;">EasyPG Manager - Smart PG Management Platform</p>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ 📧 OTP email sent successfully to: ${finalEmail}`);
      } catch (emailError) {
        console.error("❌ EMAIL SEND ERROR:", emailError.message);
        console.log("⚠️ OTP displayed in terminal only due to email configuration issue");
      }
    } else {
      console.log("⚠️ EMAIL_USER or EMAIL_PASS not configured in .env file");
      console.log("To enable email sending, add these to your .env file:");
      console.log("EMAIL_USER=your-gmail@gmail.com");
      console.log("EMAIL_PASS=your-app-password");
    }

    res.status(200).json({ 
      success: true, 
      message: "OTP sent to your registered email address"
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error.message);
    res.status(500).json({ success: false, message: "Error generating OTP" });
  }
};

// 5. VERIFY OTP AND RESET PASSWORD
exports.verifyOtpAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Email, OTP, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const finalEmail = email.toLowerCase().trim();

    // Verify OTP
    console.log("🔍 Verifying OTP for:", finalEmail);
    const cachedData = otpCache[finalEmail];
    
    if (!cachedData) {
      return res.status(400).json({ success: false, message: "No OTP found. Please request a new one." });
    }

    if (cachedData.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (Date.now() > cachedData.expires) {
      return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
    }

    // OTP verified, now reset password
    const user = await User.findOne({ email: finalEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    delete otpCache[finalEmail];
    console.log("✅ PASSWORD RESET SUCCESSFUL for:", finalEmail);

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error.message);
    res.status(500).json({ success: false, message: "Error resetting password" });
  }
};

// 6. OLD RESET PASSWORD (DEPRECATED - kept for backwards compatibility)
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // --- PASSWORD VALIDATION ADDED ---
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });
    res.status(200).json({ success: true, message: "Password updated" });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid token" });
  }
};
