const mongoose = require("mongoose");

const fineTransactionSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    tenantRecordId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    pendingPaymentId: { type: mongoose.Schema.Types.ObjectId, ref: "PendingPayment", default: null, index: true },
    pgId: { type: mongoose.Schema.Types.ObjectId, ref: "PG", required: true, index: true },
    dayFineAmount: { type: Number, required: true, min: 0, default: 0 },
    totalFineAmount: { type: Number, required: true, min: 0, default: 0 },
    overdueDays: { type: Number, required: true, min: 0, default: 0 },
    isFinePaused: { type: Boolean, default: false },
    reason: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FineTransaction", fineTransactionSchema);
