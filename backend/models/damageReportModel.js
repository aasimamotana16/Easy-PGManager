const mongoose = require("mongoose");

const damageReportSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    tenantRecordId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    pgId: { type: mongoose.Schema.Types.ObjectId, ref: "PG", required: true, index: true },
    leaseAgreementId: { type: mongoose.Schema.Types.ObjectId, ref: "LeaseAgreement", default: null },
    amount: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    adminApproval: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },
    approvedAmount: { type: Number, default: 0, min: 0 },
    isDeductionDisputed: { type: Boolean, default: false },
    adminOverride: { type: Boolean, default: false },
    adminReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    adminReviewedAt: { type: Date, default: null },
    adminNote: { type: String, default: "", trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DamageReport", damageReportSchema);
