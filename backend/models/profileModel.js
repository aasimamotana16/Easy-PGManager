const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  // Use ObjectId for better performance and indexing with the User model
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  userRole: { 
    type: String, 
    enum: ['tenant', 'owner'], 
    required: true 
  },
  personalInfo: {
    fullName: { type: String, default: "NOT SET" },
    phone: { type: String, default: "NOT SET" },
    age: { type: String, default: "NOT SET" },
    bloodGroup: { type: String, default: "NOT SET" },
    city: { type: String, default: "NOT SET" },
    state: { type: String, default: "NOT SET" },
    email: { type: String, default: "NOT SET" }
  },
  // Renamed to match the getAcademicProfile controller/API calls
  academicInfo: {
    status: { type: String, default: "NOT SET" },
    qualification: { type: String, default: "NOT SET" },
    company: { type: String, default: "NOT SET" },
    workAddress: { type: String, default: "NOT SET" },
    collegeYear: { type: String, default: "NOT SET" }
  },
  // Renamed to match the getEmergencyProfile controller/API calls
  emergencyContact: {
    guardianName: { type: String, default: "NOT SET" },
    relationship: { type: String, default: "NOT SET" },
    guardianPhone: { type: String, default: "NOT SET" }
  },
  // Renamed to match the getPaymentProfile controller/API calls
  paymentDetails: {
    holder: { type: String, default: "NOT SET" },
    bank: { type: String, default: "NOT SET" },
    ifsc: { type: String, default: "NOT SET" },
    account: { type: String, default: "NOT SET" }
  }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);