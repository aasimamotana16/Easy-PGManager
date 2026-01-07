const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 1. REGISTER
exports.registerUser = async (req, res) => {
  try {
    const { email, password, fullName, name, role, phoneNumber, phone } = req.body;

    const finalEmail = email ? email.toLowerCase().trim() : null;
    const finalName = fullName || name || "New User";
    const finalRole = role ? role.toLowerCase().trim() : "user";

    if (!finalEmail || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
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
      phoneNumber: phoneNumber || phone || "",
      role: finalRole
    });

    res.status(201).json({ success: true, message: "Registration successful" });
  } catch (error) {
    console.error("REGISTRATION ERROR:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

// 2. LOGIN
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

// 3. FORGOT PASSWORD
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

// 4. RESET PASSWORD
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