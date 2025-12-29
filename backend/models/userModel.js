import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: String,
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["tenant", "owner", "admin"],
      default: "tenant"
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);