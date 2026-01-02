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
    role: {
      type: String,
      default: "user",
    },
  },
  {
    // This automatically creates 'createdAt' and 'updatedAt' in camelCase
    timestamps: true, 
  }
);

module.exports = mongoose.model("User", userSchema);