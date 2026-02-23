const mongoose = require("mongoose");

const adminConfigSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "global" },
    pricingRules: {
      allowDepositPerVariant: { type: Boolean, default: true },
      depositModesAllowed: {
        type: [String],
        default: ["fixed", "months_rent"],
        validate: {
          validator: (arr) => Array.isArray(arr) && arr.every((v) => ["fixed", "months_rent"].includes(v)),
          message: "depositModesAllowed contains invalid mode"
        }
      },
      maxDepositMonths: { type: Number, default: 3, min: 0, max: 12 },
      minDepositRequired: { type: Boolean, default: true }
    },
    agreementSettings: {
      templateVersion: { type: String, default: "v1" },
      fixedClauses: { type: [String], default: [] },
      jurisdiction: { type: String, default: "" },
      platformDisclaimer: { type: String, default: "" },
      esignConsentText: { type: String, default: "" }
    },
    updatedByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.models.AdminConfig || mongoose.model("AdminConfig", adminConfigSchema);

