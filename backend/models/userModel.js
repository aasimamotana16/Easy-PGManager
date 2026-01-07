const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please add a full name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
    phoneNumber: {
      type: String,
    },
    // UPDATE THIS SECTION HERE:
    role: {
      type: String,
      required: true,
      enum: ["user", "owner", "admin"], // This ensures ONLY these 3 values are allowed
      default: "user",
      lowercase: true, // This fixes the "Something went wrong" if frontend sends "Owner" instead of "owner"
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("User", userSchema);