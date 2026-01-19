const mongoose = require('mongoose');

const agreementSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    agreementId: { type: String, required: true },
    // ADD THESE TWO FIELDS
    pgName: { type: String, required: true }, 
    roomNo: { type: String, required: true },
    // ADD THIS FIELD
    tenantName: { type: String, required: true },
    rentAmount: { type: Number, required: true },
    securityDeposit: { type: Number, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    signed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Agreement', agreementSchema);