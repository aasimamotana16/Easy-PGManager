const mongoose = require("mongoose");

const extensionRequestSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tenantRecordId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    pgId: { type: mongoose.Schema.Types.ObjectId, ref: "PG", required: true, index: true },
    requestedDueDate: { type: Date, required: true },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    reviewNote: { type: String, default: "", trim: true, maxlength: 500 },
    isFinePaused: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExtensionRequest", extensionRequestSchema);
