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

// 1. SEND OTP (Updated with reCAPTCHA logic)
exports.sendOtp = async (req, res) => {
  try {
    const { email, recaptchaToken } = req.body; // Expect recaptchaToken from front-end
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    // --- VERIFY RECAPTCHA FIRST ---
    if (!recaptchaToken) {
      return res.status(400).json({ success: false, message: "Captcha token is missing" });
    }

    const isCaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!isCaptchaValid) {
      return res.status(400).json({ success: false, message: "Invalid Captcha. Please try again." });
    }
    // -------------------------------

    const finalEmail = email.toLowerCase().trim();
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(`\n--- [DEBUG] OTP for ${finalEmail}: ${generatedOtp} ---\n`);

    otpCache[finalEmail] = {
      otp: generatedOtp,
      expires: Date.now() + 300000,
    };

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

    const finalEmail = email ? email.toLowerCase().trim() : null;
    const finalName = fullName || name || "New User";
    const finalRole = role ? role.toLowerCase().trim() : "user";

    if (!finalEmail || !password || !otp) {
      console.log("MISSING DATA:", { finalEmail, password, otp });
      return res.status(400).json({ success: false, message: "Email, password, and OTP are required" });
    }

    // VERIFY OTP Logic
    const cachedData = otpCache[finalEmail];
    if (!cachedData || cachedData.otp !== otp || Date.now() > cachedData.expires) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const existingUser = await User.findOne({ email: finalEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName: finalName,
      email: finalEmail,
      password: hashedPassword,
      phone: phone || "", 
      role: finalRole,
      isVerified: true
    });

    delete otpCache[finalEmail];
    res.status(201).json({ success: true, message: "Registration successful" });
  } catch (error) {
    console.error("REGISTRATION ERROR:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

// 3. LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      token,
      user: { id: user._id, fullName: user.fullName, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login error" });
  }
};

// 4. FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });
    console.log(`\n--- RESET LINK ---\nhttp://localhost:3000/reset-password/${resetToken}\n------------------\n`);

    res.status(200).json({ success: true, message: "Reset link generated in terminal" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error" });
  }
};

// 5. RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });
    res.status(200).json({ success: true, message: "Password updated" });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid token" });
  }
};