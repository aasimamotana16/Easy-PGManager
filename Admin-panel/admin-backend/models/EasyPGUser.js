const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Match your EasyPG Manager User model exactly
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Please add a full name"],
  },
  name: { type: String }, // Supporting existing Atlas data that uses "name"
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: [6, "Password must be at least 6 characters"],
  },
  phone: {
    type: String,
  },
  city: { type: String, select: false },
  state: { type: String, select: false },
  address: { type: String, select: false },
  role: {
    type: String,
    required: true,
    enum: ["user", "owner", "admin", "tenant"],
    default: "user",
    lowercase: true,
  },
  profileCompletion: {
    type: Number,
    select: false,
  },
  emergencyContact: {
    contactName: { type: String },
    relationship: { type: String },
    phoneNumber: { type: String },
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  facebook: { type: String, select: false },
  instagram: { type: String, select: false },
  linkedin: { type: String, select: false },
  twitter: { type: String, select: false },
  profilePicture: { type: String, select: false },
  idDocument: {
    status: { type: String, enum: ["Pending", "Uploaded"], select: false },
    fileUrl: { type: String, select: false },
  },
  aadharCard: {
    status: { type: String, enum: ["Pending", "Uploaded"], select: false },
    fileUrl: { type: String, select: false },
  },
  rentalAgreementCopy: {
    status: { type: String, enum: ["Pending", "Uploaded"], select: false },
    fileUrl: { type: String, select: false },
    uploadedAt: { type: Date, select: false },
  },
  assignedPg: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EasyPGPG",
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EasyPGUser",
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Indexes for better performance
userSchema.index({ role: 1 });

module.exports = mongoose.models.EasyPGUser || mongoose.model('EasyPGUser', userSchema);
