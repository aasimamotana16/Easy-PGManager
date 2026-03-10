const mongoose = require("mongoose");

const leaseAgreementSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tenantEmail: { type: String, default: "", trim: true, lowercase: true },
    pgId: { type: mongoose.Schema.Types.ObjectId, ref: "PG", required: true, index: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    agreementCode: { type: String, required: true, unique: true, trim: true },
    monthlyRent: { type: Number, required: true, min: 0 },
    securityDepositAmount: { type: Number, required: true, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ["draft", "active", "terminated", "expired"],
      default: "active",
    },
    termsSnapshot: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeaseAgreement", leaseAgreementSchema);
