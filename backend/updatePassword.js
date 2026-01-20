// updatePassword.js [cite: 2026-01-06]
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');

const runUpdate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas...");

    // 1. Generate a fresh hash for 'abcd' [cite: 2026-01-06]
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('abcd', salt);

    // 2. Update the existing user 'tester@gmail.com'
    const updatedUser = await User.findOneAndUpdate(
      { email: 'tester@gmail.com' },
      { password: hashedPassword },
      { new: true }
    );

    if (updatedUser) {
      console.log("✅ Password successfully updated to 'abcd' for tester@gmail.com!");
      console.log("Stored Hash is now:", updatedUser.password);
    } else {
      console.log("❌ Could not find user: tester@gmail.com");
    }

    process.exit();
  } catch (error) {
    console.error("Error updating password:", error);
    process.exit(1);
  }
};

runUpdate();