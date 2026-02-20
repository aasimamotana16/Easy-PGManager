const mongoose = require('mongoose');

const agreementSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pgId: { type: mongoose.Schema.Types.ObjectId, ref: 'PG' },
    bookingId: { type: String },
    agreementId: { type: String, required: true },
    pgName: { type: String, required: true }, 
    roomNo: { type: String, required: true },
    roomType: { type: String },
    tenantName: { type: String, required: true },
    rentAmount: { type: Number, required: true },
    securityDeposit: { type: Number, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    checkInDate: { type: String },
    checkOutDate: { type: String },
    isLongTerm: { type: Boolean, default: false },
    fileUrl: { type: String },
    ownerSignatureUrl: { type: String },
    signed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Agreement', agreementSchema);
